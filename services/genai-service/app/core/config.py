import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME     = "gemini-2.0-flash"
MAX_TOKENS     = 2048
TEMPERATURE    = 0.7

if not GEMINI_API_KEY:
    print("[WARNING] GEMINI_API_KEY not set — AI features will fail")
