from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import json
from app.core.gemini import generate
from app.prompts.resume_prompts import (
    resume_feedback_prompt,
    resume_rewrite_prompt,
    keywords_prompt,
)

router = APIRouter(prefix="/resume", tags=["resume-ai"])


class FeedbackRequest(BaseModel):
    resumeText: str
    atsScore: int = 0
    jobRole: Optional[str] = ""


class RewriteRequest(BaseModel):
    sectionName: str
    sectionText: str
    jobRole: Optional[str] = ""


class KeywordsRequest(BaseModel):
    resumeText: str
    jobDescription: str


def parse_json_response(text: str) -> dict:
    """Extract JSON from Gemini response — handles markdown code blocks"""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")


@router.post("/feedback")
async def get_resume_feedback(
    body: FeedbackRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.resumeText or len(body.resumeText) < 50:
        raise HTTPException(status_code=400, detail="Resume text too short")

    prompt = resume_feedback_prompt(body.resumeText, body.atsScore, body.jobRole or "")
    raw = await generate(prompt)
    data = parse_json_response(raw)

    return {"success": True, "data": data}


@router.post("/rewrite")
async def rewrite_section(
    body: RewriteRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.sectionText or len(body.sectionText) < 20:
        raise HTTPException(status_code=400, detail="Section text too short")

    prompt = resume_rewrite_prompt(body.sectionName, body.sectionText, body.jobRole or "")
    rewritten = await generate(prompt)

    return {
        "success": True,
        "data": {
            "sectionName": body.sectionName,
            "original": body.sectionText,
            "rewritten": rewritten,
        }
    }


@router.post("/keywords")
async def analyze_keywords(
    body: KeywordsRequest,
    x_user_id: Optional[str] = Header(None)
):
    prompt = keywords_prompt(body.resumeText, body.jobDescription)
    raw = await generate(prompt)
    data = parse_json_response(raw)

    return {"success": True, "data": data}
