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


class FeedbackRequest(BaseModel):
    question: str
    answer: str
    jobRole: str


@router.post("/feedback")
async def generate_answer_feedback(
    body: FeedbackRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.question or not body.answer:
        raise HTTPException(status_code=400, detail="question and answer required")

    prompt = f"""You are an expert technical interviewer evaluating a candidate's answer.

Job Role: {body.jobRole}
Interview Question: {body.question}
Candidate's Answer: {body.answer}

Evaluate the answer and respond ONLY with valid JSON (no markdown):
{{
  "feedback": "2-3 sentences of specific, constructive feedback on the answer",
  "score": 75,
  "strengths": ["what was good about the answer"],
  "improvements": ["what could be better"],
  "sampleAnswer": "A brief example of what a strong answer looks like"
}}

Score from 0-100 based on: relevance (30%), depth (30%), clarity (20%), examples (20%)."""

    raw = await generate(prompt)
    data = parse_json_response(raw)
    return {"success": True, "data": data}
