from typing import Dict, List
from app.data.skills_data import ROLE_SKILL_MAP, TRENDING_SKILLS_2025
from app.models.job_matcher import extract_skills

def analyze_skill_gap(resume_text: str, target_role: str) -> Dict:
    """Detailed skill gap analysis for a target role."""
    role_key = target_role.lower().strip()

    # Find closest matching role
    if role_key not in ROLE_SKILL_MAP:
        for key in ROLE_SKILL_MAP:
            if any(word in role_key for word in key.split()):
                role_key = key
                break
        else:
            role_key = "software engineer"

    role_data = ROLE_SKILL_MAP[role_key]
    resume_skills = set(extract_skills(resume_text))

    core_skills = set(role_data.get("core", []))
    advanced_skills = set(role_data.get("advanced", []))
    nice_to_have = set(role_data.get("nice_to_have", []))

    # Categorize gaps
    missing_core = list(core_skills - resume_skills)
    missing_advanced = list(advanced_skills - resume_skills)
    missing_nice = list(nice_to_have - resume_skills)

    have_core = list(core_skills & resume_skills)
    have_advanced = list(advanced_skills & resume_skills)

    core_completion = len(have_core) / max(len(core_skills), 1) * 100
    advanced_completion = len(have_advanced) / max(len(advanced_skills), 1) * 100
    overall_readiness = int(core_completion * 0.7 + advanced_completion * 0.3)

    # Learning time estimates (weeks)
    def estimate_weeks(skills: List[str]) -> int:
        return len(skills) * 2  # avg 2 weeks per skill

    # Priority roadmap
    roadmap = []
    for skill in missing_core[:5]:
        roadmap.append({
            "skill": skill,
            "priority": "critical",
            "estimatedWeeks": 2,
            "resources": get_resources(skill),
        })
    for skill in missing_advanced[:4]:
        roadmap.append({
            "skill": skill,
            "priority": "important",
            "estimatedWeeks": 3,
            "resources": get_resources(skill),
        })
    for skill in missing_nice[:3]:
        roadmap.append({
            "skill": skill,
            "priority": "optional",
            "estimatedWeeks": 2,
            "resources": get_resources(skill),
        })

    # Trending skills intersection
    all_trending = (
        TRENDING_SKILLS_2025["hottest"] +
        TRENDING_SKILLS_2025["growing"]
    )
    trending_you_have = [s for s in all_trending if s in resume_skills]
    trending_missing = [s for s in role_data.get("advanced", []) if s in all_trending and s not in resume_skills]

    return {
        "targetRole": role_key,
        "overallReadiness": overall_readiness,
        "coreCompletion": round(core_completion, 1),
        "advancedCompletion": round(advanced_completion, 1),
        "haveCore": have_core,
        "haveAdvanced": have_advanced,
        "missingCore": missing_core,
        "missingAdvanced": missing_advanced,
        "missingNiceToHave": missing_nice[:5],
        "trendingSkillsYouHave": trending_you_have,
        "trendingSkillsMissing": trending_missing[:5],
        "learningRoadmap": roadmap,
        "estimatedWeeksToReady": estimate_weeks(missing_core) + estimate_weeks(missing_advanced[:3]),
        "verdict": (
            "Job-ready now!" if overall_readiness >= 85 else
            f"Almost ready — focus on {missing_core[0] if missing_core else 'advanced skills'}" if overall_readiness >= 65 else
            f"Need {estimate_weeks(missing_core)} weeks to bridge core skill gap" if overall_readiness >= 40 else
            "Significant preparation needed — start with core skills"
        ),
    }

def get_resources(skill: str) -> List[Dict]:
    resources_map = {
        "python": [{"title": "Python for Everybody", "platform": "Coursera", "free": True}],
        "react": [{"title": "React Official Tutorial", "platform": "react.dev", "free": True}],
        "node.js": [{"title": "Node.js Tutorial", "platform": "nodejs.org", "free": True}],
        "docker": [{"title": "Docker Get Started", "platform": "docker.com", "free": True}],
        "kubernetes": [{"title": "Kubernetes Basics", "platform": "kubernetes.io", "free": True}],
        "aws": [{"title": "AWS Free Tier", "platform": "aws.amazon.com", "free": True}],
        "machine learning": [{"title": "ML Course", "platform": "Coursera (Andrew Ng)", "free": False}],
        "postgresql": [{"title": "PostgreSQL Tutorial", "platform": "postgresqltutorial.com", "free": True}],
        "system design": [{"title": "System Design Primer", "platform": "GitHub", "free": True}],
        "typescript": [{"title": "TypeScript Handbook", "platform": "typescriptlang.org", "free": True}],
    }
    return resources_map.get(skill, [{"title": f"Learn {skill}", "platform": "YouTube / Udemy", "free": False}])
