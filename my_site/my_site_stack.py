from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    RemovalPolicy,
    CfnOutput,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_certificatemanager as acm
)
from constructs import Construct

class MySiteStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        site_bucket = s3.Bucket(self, "SiteBucket",
            website_index_document="index.html",
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
            sources=[s3deploy.Source.asset("./site_contents/build")],
            destination_bucket=site_bucket
        )

        # certificate = acm.Certificate.from_certificate_arn(
        #     self, "SiteCert", "arn:aws:acm:us-east-1:919183601782:certificate/2fb7359f-e8d6-469a-9e5e-079b92507da7"
        # )

        distribution = cloudfront.Distribution(self, "SiteDistribution",
            default_root_object="index.html",
            certificate=certificate,
            domain_names=["getconnexus.org"],
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            )
        )

        CfnOutput(self, "WebsiteURL", value=site_bucket.bucket_website_url)

