// Single source of truth for the chat API endpoint.
// Set VITE_API_URL in a .env file (or your deploy environment) so this doesn't
// need to be hardcoded/duplicated across components.
//
// After deploying the updated CDK stack, grab the new URL from the `ChatApiUrl`
// stack output (e.g. `cdk deploy` prints it, or `aws cloudformation describe-stacks
// --stack-name MySiteStack --query "Stacks[0].Outputs"`) and put it in .env as:
//   VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/chat
export const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  // Fails loudly in dev rather than silently hitting `undefined`.
  console.error(
    'VITE_API_URL is not set. Create a .env file with VITE_API_URL=<your API Gateway URL>/chat'
  );
}
