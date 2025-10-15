from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    RemovalPolicy,
    CfnOutput,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_certificatemanager as acm,
    aws_route53 as route53,
    aws_route53_targets as targets
)
from constructs import Construct

class MySiteStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        site_bucket = s3.Bucket(self, "SiteBucket",
            website_index_document="index.html",
            website_error_document="index.html",
            public_read_access=True,
            block_public_access=s3.BlockPublicAccess(
                block_public_policy=False, 
                ignore_public_acls=False, 
                restrict_public_buckets=False, 
                block_public_acls=False),
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        s3deploy.BucketDeployment(self, "DeployWebsite",
            sources=[s3deploy.Source.asset("./my-site-ui/dist")],
            destination_bucket=site_bucket
        )

        certificate = acm.Certificate.from_certificate_arn(
            self, "SiteCert", "arn:aws:acm:us-east-1:919183601782:certificate/78166b8c-f865-4656-b784-10390270dc90"
        )

        # Replace with your hosted zone name
        zone = route53.HostedZone.from_lookup(
            self, "Zone", domain_name="getconnexus.org"
        )

        distribution = cloudfront.Distribution(
            self,
            "SiteDistribution",
            default_root_object="index.html",
            certificate=certificate,
            domain_names=["getconnexus.org", "www.getconnexus.org"],
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html", 
                )
            ],
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

        CfnOutput(self, "WebsiteURL", value=site_bucket.bucket_website_url)

