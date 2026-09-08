import os
import shutil
import subprocess
import sys

import jsii
from aws_cdk import (
    Duration,
    Size,
    Stack,
    BundlingOptions,
    ILocalBundling,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    RemovalPolicy,
    CfnOutput,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_certificatemanager as acm,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_lambda as _lambda,
    aws_apigatewayv2 as apigwv2,
    aws_apigatewayv2_integrations as apigwv2_integrations,
    aws_secretsmanager as secretsmanager,
)
from constructs import Construct


@jsii.implements(ILocalBundling)
class _PipLocalBundling:
    """Packages the Lambda's dependencies using a plain local `pip install`
    that targets Lambda's exact runtime platform (manylinux2014_x86_64,
    CPython 3.13), pulling pre-built wheels straight from PyPI.
    """

    def __init__(self, source_dir: str):
        self.source_dir = source_dir

    def try_bundle(self, output_dir: str, *args, **kwargs) -> bool:
        requirements = os.path.join(self.source_dir, "requirements.txt")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install",
                "-r", requirements,
                "--platform", "manylinux2014_x86_64",
                "--implementation", "cp",
                "--python-version", "3.13",
                "--only-binary=:all:",
                "--target", output_dir,
            ])
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

        for item in os.listdir(self.source_dir):
            if item == "requirements.txt":
                continue
            src = os.path.join(self.source_dir, item)
            dst = os.path.join(output_dir, item)
            if os.path.isdir(src):
                shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                shutil.copy2(src, dst)

        return True


class MySiteStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        site_bucket = s3.Bucket(self, "SiteBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        certificate = acm.Certificate.from_certificate_arn(
            self, "SiteCert", "arn:aws:acm:us-east-1:919183601782:certificate/78166b8c-f865-4656-b784-10390270dc90"
        )

        distribution = cloudfront.Distribution(
            self,
            "SiteDistribution",
            default_root_object="index.html",
            certificate=certificate,
            domain_names=["getconnexus.org", "www.getconnexus.org"],
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
            ],
        )

        s3deploy.BucketDeployment(self, "DeployWebsite",
            sources=[s3deploy.Source.asset("./my-site-ui/dist")],
            destination_bucket=site_bucket,
            distribution=distribution,
            distribution_paths=["/*"],
            memory_limit=3008,
            ephemeral_storage_size=Size.mebibytes(2048),
        )

        # Replace with your hosted zone name
        zone = route53.HostedZone.from_lookup(
            self, "Zone", domain_name="getconnexus.org"
        )

        route53.ARecord(
            self,
            "AliasRecordRoot",
            zone=zone,
            record_name="getconnexus.org",
            target=route53.RecordTarget.from_alias(targets.CloudFrontTarget(distribution)),
        )

        route53.ARecord(
            self,
            "AliasRecordWWW",
            zone=zone,
            record_name="www.getconnexus.org",
            target=route53.RecordTarget.from_alias(targets.CloudFrontTarget(distribution)),
        )

        openai_secret = secretsmanager.Secret.from_secret_name_v2(
            self, "OpenAiSecret", "portfolio_app/api_key"
        )

        lambda_source_dir = os.path.join(os.path.dirname(__file__), "..", "lambda", "portfolio_chat")

        chat_lambda = _lambda.Function(
            self, "PortfolioChatFunction",
            runtime=_lambda.Runtime.PYTHON_3_13,
            handler="lambda_function.lambda_handler",
            code=_lambda.Code.from_asset(
                "./lambda/portfolio_chat",
                bundling=BundlingOptions(
                    # Tried first, runs on your machine with no Docker/VM involved.
                    local=_PipLocalBundling(os.path.abspath(lambda_source_dir)),
                    # Only used if local bundling above returns False.
                    image=_lambda.Runtime.PYTHON_3_13.bundling_image,
                    command=[
                        "bash", "-c",
                        "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
                    ],
                ),
            ),
            timeout=Duration.seconds(30),
            memory_size=256,
            # Hard ceiling on simultaneous executions, independent of API Gateway
            reserved_concurrent_executions=5,
        )

        # Least-privilege: only allow reading this one secret, not all of Secrets Manager
        openai_secret.grant_read(chat_lambda)

        http_api = apigwv2.HttpApi(
            self, "ChatApi",
            cors_preflight=apigwv2.CorsPreflightOptions(
                allow_origins=["https://getconnexus.org", "https://www.getconnexus.org"],
                allow_methods=[apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.OPTIONS],
                allow_headers=["Content-Type"],
            ),
        )

        http_api.add_routes(
            path="/chat",
            methods=[apigwv2.HttpMethod.POST],
            integration=apigwv2_integrations.HttpLambdaIntegration(
                "ChatIntegration", chat_lambda
            ),
        )

        # Rate limiting
        cfn_default_stage = http_api.default_stage.node.default_child
        cfn_default_stage.default_route_settings = apigwv2.CfnStage.RouteSettingsProperty(
            throttling_burst_limit=10,
            throttling_rate_limit=5,
        )

        CfnOutput(self, "ChatApiUrl", value=f"{http_api.api_endpoint}/chat")

        CfnOutput(self, "SiteURL", value="https://getconnexus.org")
        CfnOutput(self, "CloudFrontDomain", value=distribution.domain_name)

