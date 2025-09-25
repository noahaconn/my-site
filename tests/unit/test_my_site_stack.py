import aws_cdk as core
import aws_cdk.assertions as assertions

from my_site.my_site_stack import MySiteStack

# example tests. To run these tests, uncomment this file along with the example
# resource in my_site/my_site_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = MySiteStack(app, "my-site")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
