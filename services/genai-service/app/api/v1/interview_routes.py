from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import json
from app.core.gemini import generate
from app.prompts.interview_prompts import interview_questions_prompt, roadmap_prompt

router = APIRouter(prefix="/interview", tags=["interview-ai"])


class QuestionsRequest(BaseModel):
    resumeText: str
    jobRole: str
    questionType: Optional[str] = "mixed"
    count: Optional[int] = 10


class RoadmapRequest(BaseModel):
    resumeText: str
    targetRole: str
    timelineWeeks: Optional[int] = 12


def parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")


@router.post("/questions")
async def generate_questions(
    body: QuestionsRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.resumeText or not body.jobRole:
        raise HTTPException(status_code=400, detail="resumeText and jobRole required")

    count = min(body.count or 10, 20)
    prompt = interview_questions_prompt(
        body.resumeText, body.jobRole,
        body.questionType or "mixed", count
    )
    raw = await generate(prompt)
    data = parse_json_response(raw)

    return {"success": True, "data": data}


@router.post("/roadmap")
async def generate_roadmap(
    body: RoadmapRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.resumeText or not body.targetRole:
        raise HTTPException(status_code=400, detail="resumeText and targetRole required")

    prompt = roadmap_prompt(body.resumeText, body.targetRole, body.timelineWeeks or 12)
    raw = await generate(prompt)
    data = parse_json_response(raw)

    return {"success": True, "data": data}
