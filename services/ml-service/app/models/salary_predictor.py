from typing import Dict, List
from app.data.skills_data import ROLE_SKILL_MAP, EXPERIENCE_LEVELS
from app.models.job_matcher import extract_skills, detect_experience_years, get_experience_level

# Skill premium multipliers (skills that boost salary)
SKILL_PREMIUMS = {
    "machine learning": 1.25,
    "deep learning": 1.30,
    "kubernetes": 1.20,
    "aws": 1.15,
    "system design": 1.20,
    "golang": 1.18,
    "rust": 1.20,
    "kafka": 1.15,
    "microservices": 1.12,
    "tensorflow": 1.20,
    "pytorch": 1.22,
    "spark": 1.18,
    "mlops": 1.25,
    "llm": 1.35,
    "rag": 1.30,
    "graphql": 1.08,
    "typescript": 1.08,
    "next.js": 1.08,
    "docker": 1.08,
    "ci/cd": 1.08,
    "terraform": 1.15,
}

def predict_salary(resume_text: str, target_role: str = "", location: str = "bangalore") -> Dict:
    """Predict salary range based on skills and experience."""
    resume_skills = set(extract_skills(resume_text))
    years = detect_experience_years(resume_text)
    exp_level = get_experience_level(years)

    # Find best matching role
    role_key = target_role.lower().strip()
    if role_key not in ROLE_SKILL_MAP:
        # Auto-detect
        best_match = "software engineer"
        best_count = 0
        for role, data in ROLE_SKILL_MAP.items():
            role_skills = set(data.get("core", []) + data.get("advanced", []))
            count = len(resume_skills & role_skills)
            if count > best_count:
                best_count = count
                best_match = role
        role_key = best_match

    # Base salary from role + experience
    salary_data = ROLE_SKILL_MAP.get(role_key, {}).get("avg_salary_lpa", {})
    base_salary = salary_data.get(exp_level, 8)

    # Apply skill premiums
    premium_multiplier = 1.0
    premium_skills_found = []
    for skill in resume_skills:
        if skill in SKILL_PREMIUMS:
            premium_multiplier = max(premium_multiplier, SKILL_PREMIUMS[skill])
            premium_skills_found.append(skill)

    # Location multiplier
    location_multipliers = {
        "bangalore": 1.0,
        "mumbai": 0.95,
        "delhi": 0.90,
        "hyderabad": 0.92,
        "pune": 0.88,
        "chennai": 0.85,
        "remote": 1.05,
        "usa": 8.0,
        "uk": 5.0,
        "singapore": 4.0,
        "dubai": 3.5,
    }
    loc_key = location.lower().strip()
    loc_multiplier = location_multipliers.get(loc_key, 1.0)

    # Skill count bonus
    skill_count_bonus = min(1.2, 1.0 + (len(resume_skills) - 5) * 0.01)

    # Calculate range
    adjusted = base_salary * premium_multiplier * skill_count_bonus
    min_salary = round(adjusted * 0.85 * loc_multiplier, 1)
    max_salary = round(adjusted * 1.20 * loc_multiplier, 1)
    expected = round(adjusted * loc_multiplier, 1)

    # Currency
    currency = "LPA" if loc_multiplier <= 1.1 else "LPA (equivalent)"
    if loc_key == "usa":
        currency = "USD/year (in thousands)"

    return {
        "predictedRole": role_key,
        "experienceLevel": exp_level,
        "yearsDetected": years,
        "location": location,
        "salaryRange": {
            "min": min_salary,
            "expected": expected,
            "max": max_salary,
            "currency": currency,
        },
        "premiumSkillsFound": premium_skills_found[:5],
        "totalSkillsDetected": len(resume_skills),
        "skillsDetected": list(resume_skills)[:10],
        "salaryBoostTips": [
            f"Add {s} to boost salary by {int((SKILL_PREMIUMS[s]-1)*100)}%" 
            for s in list(SKILL_PREMIUMS.keys())[:3] if s not in resume_skills
        ][:3],
        "marketInsight": (
            f"Senior {role_key}s with your skills earn ₹{max_salary}+ LPA in {location}"
            if exp_level in ["mid", "senior", "lead"] else
            f"Entry-level {role_key}s typically start at ₹{min_salary} LPA in {location}"
        ),
    }
