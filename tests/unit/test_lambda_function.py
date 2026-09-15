"""
Unit tests for lambda/portfolio_chat/lambda_function.py

These are pure unit tests: the OpenAI client and Secrets Manager are mocked with
unittest.mock, not moto. Nothing here makes a real network call.
"""

import json
import os
import sys
from unittest import mock

import pytest
from botocore.exceptions import ClientError

# lambda_function.py isn't an installable package — it's a Lambda handler file that
# lives outside any Python package structure. Add its directory to sys.path so it can
# be imported directly, matching how the Lambda runtime itself would load it.
LAMBDA_SRC = os.path.join(
    os.path.dirname(__file__), "..", "..", "lambda", "portfolio_chat"
)
sys.path.insert(0, os.path.abspath(LAMBDA_SRC))

import lambda_function  # noqa: E402


def make_event(body: dict) -> dict:
    return {"body": json.dumps(body)}


def make_fake_completion(reply_text: str):
    """Builds a fake object shaped like OpenAI's ChatCompletion response."""
    message = mock.Mock()
    message.content = reply_text
    choice = mock.Mock()
    choice.message = message
    completion = mock.Mock()
    completion.choices = [choice]
    return completion


@pytest.fixture
def patch_get_secret():
    """Stubs lambda_function.get_secret() for handler-level tests. Not used by
    TestGetSecret below, which tests get_secret() itself against a mocked boto3
    client instead."""
    with mock.patch.object(
        lambda_function, "get_secret", return_value="sk-fake-test-key"
    ) as m:
        yield m


@pytest.fixture
def patch_openai():
    with mock.patch.object(lambda_function, "OpenAI") as MockOpenAI:
        client_instance = mock.Mock()
        MockOpenAI.return_value = client_instance
        yield client_instance


class TestWarmup:
    def test_warmup_returns_early_without_calling_openai_or_secrets(
        self, patch_openai, patch_get_secret
    ):
        response = lambda_function.lambda_handler(make_event({"warmup": True}), None)

        assert response["statusCode"] == 200
        assert json.loads(response["body"]) == {"status": "warm"}
        patch_get_secret.assert_not_called()
        patch_openai.chat.completions.create.assert_not_called()


class TestChatHappyPath:
    def test_successful_chat_returns_reply(self, patch_openai, patch_get_secret):
        patch_openai.chat.completions.create.return_value = make_fake_completion(
            "  Noah has 2+ years of experience.  "
        )

        response = lambda_function.lambda_handler(
            make_event({"message": "What's Noah's experience?"}), None
        )

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        # Reply is stripped of surrounding whitespace by the handler.
        assert body["reply"] == "Noah has 2+ years of experience."

    def test_response_has_json_content_type_header(self, patch_openai, patch_get_secret):
        patch_openai.chat.completions.create.return_value = make_fake_completion("hi")

        response = lambda_function.lambda_handler(
            make_event({"message": "hi"}), None
        )

        assert response["headers"]["Content-Type"] == "application/json"

    def test_system_prompt_and_user_message_are_both_sent(self, patch_openai, patch_get_secret):
        patch_openai.chat.completions.create.return_value = make_fake_completion("ok")

        lambda_function.lambda_handler(make_event({"message": "hello there"}), None)

        _, kwargs = patch_openai.chat.completions.create.call_args
        roles = [m["role"] for m in kwargs["messages"]]
        assert roles == ["system", "user"]
        assert kwargs["messages"][1]["content"] == "hello there"
        assert kwargs["max_tokens"] == 400


class TestInputValidation:
    def test_message_longer_than_2000_chars_is_truncated(self, patch_openai, patch_get_secret):
        patch_openai.chat.completions.create.return_value = make_fake_completion("ok")
        long_message = "a" * 3000

        lambda_function.lambda_handler(make_event({"message": long_message}), None)

        _, kwargs = patch_openai.chat.completions.create.call_args
        sent_message = kwargs["messages"][1]["content"]
        assert len(sent_message) == 2000

    def test_non_string_message_is_treated_as_empty(self, patch_openai, patch_get_secret):
        patch_openai.chat.completions.create.return_value = make_fake_completion("ok")

        lambda_function.lambda_handler(make_event({"message": 12345}), None)

        _, kwargs = patch_openai.chat.completions.create.call_args
        assert kwargs["messages"][1]["content"] == ""

    def test_missing_message_key_is_treated_as_empty(self, patch_openai, patch_get_secret):
        patch_openai.chat.completions.create.return_value = make_fake_completion("ok")

        lambda_function.lambda_handler(make_event({}), None)

        _, kwargs = patch_openai.chat.completions.create.call_args
        assert kwargs["messages"][1]["content"] == ""


class TestErrorHandling:
    def test_secrets_manager_error_returns_500(self, patch_get_secret, patch_openai):
        patch_get_secret.side_effect = ClientError(
            {"Error": {"Code": "ResourceNotFoundException", "Message": "nope"}},
            "GetSecretValue",
        )

        response = lambda_function.lambda_handler(
            make_event({"message": "hi"}), None
        )

        assert response["statusCode"] == 500
        assert "error" in json.loads(response["body"])

    def test_openai_error_returns_500(self, patch_openai, patch_get_secret):
        patch_openai.chat.completions.create.side_effect = RuntimeError(
            "OpenAI is down"
        )

        response = lambda_function.lambda_handler(
            make_event({"message": "hi"}), None
        )

        assert response["statusCode"] == 500

    def test_malformed_json_body_returns_500(self):
        response = lambda_function.lambda_handler({"body": "{not valid json"}, None)

        assert response["statusCode"] == 500


class TestGetSecret:
    """Isolated tests for get_secret() itself, mocking boto3 directly rather than the
    module-level get_secret wrapper used everywhere else."""

    def test_parses_openai_key_from_secret_json(self):
        fake_client = mock.Mock()
        fake_client.get_secret_value.return_value = {
            "SecretString": json.dumps({"OPENAI_API_KEY": "sk-real-looking-key"})
        }

        with mock.patch("boto3.client", return_value=fake_client) as mock_boto_client:
            result = lambda_function.get_secret()

        assert result == "sk-real-looking-key"
        mock_boto_client.assert_called_once_with(
            "secretsmanager", region_name="us-east-2"
        )
        fake_client.get_secret_value.assert_called_once_with(
            SecretId="portfolio_app/api_key"
        )

    def test_reraises_client_error(self):
        fake_client = mock.Mock()
        fake_client.get_secret_value.side_effect = ClientError(
            {"Error": {"Code": "AccessDeniedException", "Message": "nope"}},
            "GetSecretValue",
        )

        with mock.patch("boto3.client", return_value=fake_client):
            with pytest.raises(ClientError):
                lambda_function.get_secret()
