"""
Unit tests for my_site/my_site_stack.py, using aws_cdk.assertions to check the
synthesized CloudFormation.

Prerequisites to run this suite (same as `cdk deploy` itself needs):
  - my-site-ui/dist must exist (run `npm run build` in my-site-ui first) — CDK needs
    this path to exist at synth time for the app-code BucketDeployment asset.
  - my-site-ui/public/greek-reader and my-site-ui/public/scriptures must exist (they
    do, as committed static reference data).

Known cost, not mocked away: the chat Lambda's asset uses a custom local-bundling
hook that runs a real `pip install` against PyPI on every synth. That's a deliberate
trade-off to keep this suite testing the *actual* bundling behavior rather than a
stand-in for it — acceptable today since the dependency list is small and fast to
install.

route53.HostedZone.from_lookup performs a context lookup that needs real AWS
credentials and a cached/looked-up account by default. It's patched out below so this
suite runs anywhere, with no AWS credentials required.
"""

import os
from unittest import mock

import pytest
import aws_cdk as cdk
from aws_cdk import aws_route53 as route53
from aws_cdk.assertions import Match, Template

from my_site.my_site_stack import MySiteStack

# Tests run from the repo root's `tests/unit/` — my_site_stack.py resolves its own
# relative asset paths (./my-site-ui/dist, ./lambda/portfolio_chat, etc.) relative to
# the current working directory at synth time, so pytest must be invoked from the
# repo root (e.g. `pytest` or `python -m pytest`), not from inside tests/unit.


def _fake_hosted_zone_lookup(scope, id, *, domain_name, **kwargs):
    """Stands in for HostedZone.from_lookup without making any AWS API call."""
    return route53.HostedZone.from_hosted_zone_attributes(
        scope, id, hosted_zone_id="Z1EXAMPLE00000", zone_name=domain_name
    )


@pytest.fixture(scope="module")
def template():
    with mock.patch(
        "aws_cdk.aws_route53.HostedZone.from_lookup",
        side_effect=_fake_hosted_zone_lookup,
    ):
        app = cdk.App()
        stack = MySiteStack(
            app,
            "TestMySiteStack",
            env=cdk.Environment(account="123456789012", region="us-east-2"),
        )
        yield Template.from_stack(stack)


class TestSiteBucket:
    def test_blocks_all_public_access(self, template):
        template.has_resource_properties(
            "AWS::S3::Bucket",
            {
                "PublicAccessBlockConfiguration": {
                    "BlockPublicAcls": True,
                    "BlockPublicPolicy": True,
                    "IgnorePublicAcls": True,
                    "RestrictPublicBuckets": True,
                }
            },
        )

    def test_bucket_policy_is_scoped_to_this_distribution_not_wildcard_principal(
        self, template
    ):
        policies = template.find_resources("AWS::S3::BucketPolicy")
        assert len(policies) >= 1
        for policy in policies.values():
            statements = policy["Properties"]["PolicyDocument"]["Statement"]
            for statement in statements:
                if statement.get("Effect") == "Allow":
                    # CloudFront's OAC principal is a service principal, not "*".
                    assert statement["Principal"] != "*"


class TestCloudFront:
    def test_distribution_covers_root_and_www_domains(self, template):
        template.has_resource_properties(
            "AWS::CloudFront::Distribution",
            {
                "DistributionConfig": Match.object_like(
                    {"Aliases": Match.array_with(
                        ["getconnexus.org", "www.getconnexus.org"]
                    )}
                )
            },
        )

    def test_404_and_403_both_map_to_index_html(self, template):
        template.has_resource_properties(
            "AWS::CloudFront::Distribution",
            {
                "DistributionConfig": Match.object_like(
                    {
                        "CustomErrorResponses": Match.array_with(
                            [
                                Match.object_like(
                                    {
                                        "ErrorCode": 404,
                                        "ResponseCode": 200,
                                        "ResponsePagePath": "/index.html",
                                    }
                                ),
                                Match.object_like(
                                    {
                                        "ErrorCode": 403,
                                        "ResponseCode": 200,
                                        "ResponsePagePath": "/index.html",
                                    }
                                ),
                            ]
                        )
                    }
                )
            },
        )


class TestChatApi:
    def test_cors_restricted_to_production_domains_only(self, template):
        template.has_resource_properties(
            "AWS::ApiGatewayV2::Api",
            {
                "CorsConfiguration": Match.object_like(
                    {
                        "AllowOrigins": Match.array_with(
                            [
                                "https://getconnexus.org",
                                "https://www.getconnexus.org",
                            ]
                        )
                    }
                )
            },
        )
        api = template.find_resources("AWS::ApiGatewayV2::Api")
        (props,) = [r["Properties"] for r in api.values()]
        allow_origins = props["CorsConfiguration"]["AllowOrigins"]
        assert "*" not in allow_origins

    def test_throttling_configured_on_default_stage(self, template):
        template.has_resource_properties(
            "AWS::ApiGatewayV2::Stage",
            {
                "DefaultRouteSettings": {
                    "ThrottlingBurstLimit": 10,
                    "ThrottlingRateLimit": 5,
                }
            },
        )

    def test_has_single_post_chat_route(self, template):
        template.has_resource_properties(
            "AWS::ApiGatewayV2::Route", {"RouteKey": "POST /chat"}
        )


class TestChatLambda:
    def test_runtime_timeout_and_memory(self, template):
        template.has_resource_properties(
            "AWS::Lambda::Function",
            Match.object_like(
                {
                    "Runtime": "python3.13",
                    "Timeout": 30,
                    "MemorySize": 256,
                }
            ),
        )

    def test_reserved_concurrency_caps_simultaneous_executions(self, template):
        template.has_resource_properties(
            "AWS::Lambda::Function",
            Match.object_like({"ReservedConcurrentExecutions": 5}),
        )

    def test_iam_grants_read_on_the_one_secret_only_not_wildcard(self, template):
        policies = template.find_resources("AWS::IAM::Policy")
        secret_read_statements = []
        for policy in policies.values():
            for statement in policy["Properties"]["PolicyDocument"]["Statement"]:
                actions = statement.get("Action", [])
                actions = [actions] if isinstance(actions, str) else actions
                if "secretsmanager:GetSecretValue" in actions:
                    secret_read_statements.append(statement)

        assert len(secret_read_statements) == 1, (
            "Expected exactly one IAM statement granting GetSecretValue"
        )
        resource = secret_read_statements[0]["Resource"]
        # Should reference the specific secret (a Ref/Fn::Join intrinsic), never "*".
        assert resource != "*"


class TestStaticDataDeployments:
    """Regression tests for the Greek Reader / BoM deploy split — these guard the
    2026-09-10 change that took the large static reference data out of the routine
    app-code deploy path."""

    def test_greek_reader_data_deploys_to_its_own_prefix(self, template):
        template.has_resource_properties(
            "Custom::CDKBucketDeployment",
            Match.object_like({"DestinationBucketKeyPrefix": "greek-reader"}),
        )

    def test_scriptures_data_deploys_to_its_own_prefix(self, template):
        template.has_resource_properties(
            "Custom::CDKBucketDeployment",
            Match.object_like({"DestinationBucketKeyPrefix": "scriptures"}),
        )

    def test_three_separate_bucket_deployments_exist(self, template):
        # DeployWebsite (app code, no prefix) + DeployGreekReaderData + DeployScripturesData
        deployments = template.find_resources("Custom::CDKBucketDeployment")
        assert len(deployments) == 3

    def test_app_code_deployment_does_not_prune(self, template):
        deployments = template.find_resources("Custom::CDKBucketDeployment")
        # DeployWebsite is the one with no DestinationBucketKeyPrefix.
        app_code_deployments = [
            props
            for props in (r["Properties"] for r in deployments.values())
            if "DestinationBucketKeyPrefix" not in props
        ]
        assert len(app_code_deployments) == 1
        assert app_code_deployments[0].get("Prune") is False

    def test_data_deployments_still_prune_within_their_own_prefix(self, template):
        deployments = template.find_resources("Custom::CDKBucketDeployment")
        prefixed_deployments = [
            props
            for props in (r["Properties"] for r in deployments.values())
            if "DestinationBucketKeyPrefix" in props
        ]
        assert len(prefixed_deployments) == 2
        for props in prefixed_deployments:
            assert props.get("Prune") is not False

    def test_greek_reader_and_scriptures_use_distinct_source_assets(self, template):
        """An identical hash makes CDK treat two entirely different
        directories as the *same* asset, which would deploy the wrong content to one
        of the two prefixes. Their source object keys must always differ."""
        deployments = template.find_resources("Custom::CDKBucketDeployment")
        prefixed = {
            props["DestinationBucketKeyPrefix"]: props.get("SourceObjectKeys")
            for props in (r["Properties"] for r in deployments.values())
            if "DestinationBucketKeyPrefix" in props
        }
        assert prefixed["greek-reader"] != prefixed["scriptures"]
