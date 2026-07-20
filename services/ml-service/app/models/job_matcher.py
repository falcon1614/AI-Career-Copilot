import re
from typing import List, Dict, Tuple
from app.data.skills_data import ROLE_SKILL_MAP, EXPERIENCE_LEVELS

def extract_skills(text: str) -> List[str]:
    """Extract skills mentioned in text."""
    text_lower = text.lower()
    all_skills = set()
    for role_data in ROLE_SKILL_MAP.values():
        for skill_list in role_data.values():
            if isinstance(skill_list, list):
                all_skills.update(skill_list)

    found = []
    for skill in all_skills:
        # Match whole words/phrases
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

def detect_experience_years(text: str) -> int:
    """Estimate years of experience from resume text."""
    text_lower = text.lower()
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*yrs?\s*of\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*experience',
    ]
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            return int(match.group(1))

    # Count internships/jobs
    internship_count = len(re.findall(r'intern|internship', text_lower))
    job_count = len(re.findall(r'\b(engineer|developer|analyst|scientist)\b', text_lower))

    if internship_count >= 1:
        return 1
    return 0

def get_experience_level(years: int) -> str:
    for level, (min_y, max_y) in EXPERIENCE_LEVELS.items():
        if min_y <= years <= max_y:
            return level
    return "fresher"

def match_job(resume_text: str, job_description: str, target_role: str = "") -> Dict:
    """Score how well a resume matches a job description."""
    resume_skills = set(extract_skills(resume_text))
    jd_skills = set(extract_skills(job_description))

    # Skill overlap score
    if jd_skills:
        matched = resume_skills & jd_skills
        skill_match_score = len(matched) / len(jd_skills) * 100
    else:
        matched = resume_skills
        skill_match_score = 50.0

    # Role alignment score
    role_score = 0.0
    best_role = target_role.lower() if target_role else ""
    if not best_role:
        # Auto-detect best role
        best_match_count = 0
        for role, data in ROLE_SKILL_MAP.items():
            role_skills = set(data.get("core", []) + data.get("advanced", []))
            overlap = len(resume_skills & role_skills)
            if overlap > best_match_count:
                best_match_count = overlap
                best_role = role

    if best_role in ROLE_SKILL_MAP:
        role_data = ROLE_SKILL_MAP[best_role]
        core_skills = set(role_data.get("core", []))
        advanced_skills = set(role_data.get("advanced", []))
        core_match = len(resume_skills & core_skills) / max(len(core_skills), 1) * 60
        adv_match = len(resume_skills & advanced_skills) / max(len(advanced_skills), 1) * 40
        role_score = core_match + adv_match

    # Final weighted score
    final_score = int(skill_match_score * 0.6 + role_score * 0.4)
    final_score = max(0, min(100, final_score))

    # Missing skills
    missing_from_jd = list(jd_skills - resume_skills)[:10]
    missing_from_role = []
    if best_role in ROLE_SKILL_MAP:
        core = set(ROLE_SKILL_MAP[best_role].get("core", []))
        missing_from_role = list(core - resume_skills)[:8]

    return {
        "matchScore": final_score,
        "matchedSkills": list(matched)[:15],
        "missingFromJD": missing_from_jd,
        "missingCoreSkills": missing_from_role,
        "resumeSkillCount": len(resume_skills),
        "jdSkillCount": len(jd_skills),
        "detectedRole": best_role,
        "verdict": (
            "Excellent match — apply immediately!" if final_score >= 80 else
            "Good match — worth applying" if final_score >= 65 else
            "Moderate match — upskill before applying" if final_score >= 45 else
            "Low match — significant skill gap exists"
        ),
    }
