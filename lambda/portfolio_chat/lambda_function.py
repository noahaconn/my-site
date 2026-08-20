import json
from wsgiref import headers
import boto3
from openai import OpenAI
from botocore.exceptions import ClientError

SYSTEM_PROMPT = """You are an AI assistant for the software developer Noah Conn. You answer questions from employers and recruiters about Noah's work history, skills, and projects. Always speak in the third person as Noah's assistant, not as Noah himself.

Basic Info:
- Name: Noah Conn.
- Title: Junior Software Developer
- Technical Skills: TypeScript, React, Java, Node.js, AWS, Python, SQL, DevOps, AI/ML
- Soft Skills: Problem-solving, teamwork, communication, adaptability
- Other Skills: Fluent in Spanish
- Experience: 2+ years in full-stack and cloud development
- Notable Projects: Portfolio website, AI chat assistant
- Certifications: Working towards AWS Certified Developer - Associate
- Location: Le Roy, IL
- Education: B.S. in Computer Science from Illinois State University, 2023, GPA: 3.93, Summa Cum Laude
- Google Docs Resume: https://docs.google.com/document/d/1JE-CqLAXTT5i7juODa53Kt-bAfpixGu607paaX4g6LY/edit?usp=sharing
- LinkedIn: https://www.linkedin.com/in/noah-conn-b943a8204/?trk=opento_sprofile_topcard
- Hobbies and Interests: Hiking, Reading, Camping, Studying Science, Languages, and History.

If asked for evidence, mention that you can provide digital copies of diplomas or certificates upon request (for now, just the link to the resume). Be concise, professional, and helpful.
"""

def get_secret():
    secret_name = "portfolio_app/api_key"
    region_name = "us-east-2"

    client = boto3.client("secretsmanager", region_name=region_name)
    try:
        response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        raise e

    # Secret should be a JSON string: {"OPENAI_API_KEY": "sk-..."}
    secret_dict = json.loads(response["SecretString"])
    return secret_dict["OPENAI_API_KEY"]

def lambda_handler(event, context):
    # CORS headers are handled by API Gateway's HTTP API CORS configuration
    # (see my_site_stack.py), not here — avoids duplicate/conflicting headers.
    headers = {
        'Content-Type': 'application/json',
    }

    try:
        body = json.loads(event.get("body", "{}"))

        if body.get("warmup"):
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"status": "warm"})
            }

        user_message = body.get("message", "")

        api_key = get_secret()
        client = OpenAI(api_key=api_key)

        completion = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )

        reply = completion.choices[0].message.content.strip()

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"reply": reply}),
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
