from typing import Dict, List
from app.data.skills_data import COMPANY_PROFILES, ROLE_SKILL_MAP
from app.models.job_matcher import extract_skills, detect_experience_years, get_experience_level

def match_companies(resume_text: str, target_role: str = "", top_n: int = 5) -> Dict:
    """Find best-fit companies for a candidate's profile."""
    resume_skills = set(extract_skills(resume_text))
    years = detect_experience_years(resume_text)
    exp_level = get_experience_level(years)

    scored_companies = []

    for company in COMPANY_PROFILES:
        required = set(company["required_skills"])

        # Skill match
        matched = resume_skills & required
        skill_score = len(matched) / max(len(required), 1) * 100

        # Experience fit
        difficulty = company["difficulty"]
        exp_penalty = 0
        if difficulty == "very_hard" and exp_level in ["fresher", "junior"]:
            exp_penalty = 20
        elif difficulty == "hard" and exp_level == "fresher":
            exp_penalty = 15

        # Role fit
        role_fit = 0
        for role in company["typical_roles"]:
            if target_role.lower() in role or role in target_role.lower():
                role_fit = 15
                break
            # Partial match
            if any(word in role for word in target_role.lower().split()):
                role_fit = 8

        final_score = int(max(0, skill_score * 0.7 + role_fit + 10 - exp_penalty))
        final_score = min(98, final_score)

        scored_companies.append({
            "name": company["name"],
            "type": company["type"],
            "size": company["size"],
            "matchScore": final_score,
            "matchedSkills": list(matched)[:6],
            "missingSkills": list(required - resume_skills)[:4],
            "difficulty": difficulty,
            "interviewRounds": company["interview_rounds"],
            "culture": company["culture"],
            "typicalRoles": company["typical_roles"],
            "fitVerdict": (
                "Strong fit — apply now!" if final_score >= 75 else
                "Good fit — prepare well" if final_score >= 55 else
                "Reachable — upskill first" if final_score >= 35 else
                "Stretch goal"
            ),
        })

    scored_companies.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "experienceLevel": exp_level,
        "yearsDetected": years,
        "totalSkills": len(resume_skills),
        "topCompanies": scored_companies[:top_n],
        "allCompanies": scored_companies,
        "summary": f"Found {sum(1 for c in scored_companies if c['matchScore'] >= 60)} strong matches out of {len(COMPANY_PROFILES)} companies",
    }
