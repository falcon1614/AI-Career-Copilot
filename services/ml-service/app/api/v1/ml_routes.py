from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.models.job_matcher import match_job
from app.models.skill_gap import analyze_skill_gap
from app.models.salary_predictor import predict_salary
from app.models.company_matcher import match_companies
from app.data.skills_data import TRENDING_SKILLS_2025, ROLE_SKILL_MAP

router = APIRouter(prefix="/ml", tags=["ml"])


class JobMatchRequest(BaseModel):
    resumeText: str
    jobDescription: str
    targetRole: Optional[str] = ""


class SkillGapRequest(BaseModel):
    resumeText: str
    targetRole: str


class SalaryRequest(BaseModel):
    resumeText: str
    targetRole: Optional[str] = ""
    location: Optional[str] = "bangalore"


class CompanyMatchRequest(BaseModel):
    resumeText: str
    targetRole: Optional[str] = ""
    topN: Optional[int] = 5


@router.post("/job-match")
async def job_match(
    body: JobMatchRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.resumeText or len(body.resumeText) < 30:
        raise HTTPException(status_code=400, detail="Resume text too short")
    if not body.jobDescription or len(body.jobDescription) < 20:
        raise HTTPException(status_code=400, detail="Job description too short")

    result = match_job(body.resumeText, body.jobDescription, body.targetRole or "")
    return {"success": True, "data": result}


@router.post("/skill-gap")
async def skill_gap(
    body: SkillGapRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.resumeText or len(body.resumeText) < 30:
        raise HTTPException(status_code=400, detail="Resume text too short")
    if not body.targetRole:
        raise HTTPException(status_code=400, detail="targetRole is required")

    result = analyze_skill_gap(body.resumeText, body.targetRole)
    return {"success": True, "data": result}


@router.post("/salary-predict")
async def salary_predict(
    body: SalaryRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.resumeText or len(body.resumeText) < 30:
        raise HTTPException(status_code=400, detail="Resume text too short")

    result = predict_salary(body.resumeText, body.targetRole or "", body.location or "bangalore")
    return {"success": True, "data": result}


@router.post("/companies")
async def company_match(
    body: CompanyMatchRequest,
    x_user_id: Optional[str] = Header(None)
):
    if not body.resumeText or len(body.resumeText) < 30:
        raise HTTPException(status_code=400, detail="Resume text too short")

    result = match_companies(body.resumeText, body.targetRole or "", body.topN or 5)
    return {"success": True, "data": result}


@router.get("/market-insights")
async def market_insights(x_user_id: Optional[str] = Header(None)):
    return {
        "success": True,
        "data": {
            "trendingSkills": TRENDING_SKILLS_2025,
            "topRoles": list(ROLE_SKILL_MAP.keys()),
            "marketSummary": {
                "hottestSkill2025": "AI/ML & LLMs",
                "fastestGrowingRole": "ML Engineer",
                "avgSalaryGrowthYoY": "18%",
                "remoteOpportunities": "35% of tech jobs are remote",
                "topHiringCities": ["Bangalore", "Hyderabad", "Pune", "Delhi NCR", "Mumbai"],
            },
            "salaryBenchmarks": {
                role: data.get("avg_salary_lpa", {})
                for role, data in ROLE_SKILL_MAP.items()
            },
        }
    }
