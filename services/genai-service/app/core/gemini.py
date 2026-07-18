import os
from google import genai
from google.genai import types

client = None

def get_client():
    global client
    if client is None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        client = genai.Client(api_key=api_key)
    return client

async def generate(prompt: str) -> str:
    # Try models in order — fall back if one is rate limited
    models = ["gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"]
    last_error = None
    for model_name in models:
        try:
            c = get_client()
            response = c.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                )
            )
            print(f"[gemini] Used model: {model_name}")
            return response.text.strip()
        except Exception as e:
            print(f"[gemini] {model_name} failed: {str(e)[:100]}")
            last_error = e
            continue
    raise Exception(f"All models failed. Last error: {str(last_error)}")
