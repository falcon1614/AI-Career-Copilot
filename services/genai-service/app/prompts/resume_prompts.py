def resume_feedback_prompt(resume_text: str, ats_score: int, job_role: str = "") -> str:
    role_context = f"targeting the role of {job_role}" if job_role else "for general software engineering roles"
    return f"""You are an expert technical resume reviewer and career coach with 10+ years of experience
hiring software engineers at top tech companies.

Analyze this resume {role_context} and provide specific, actionable feedback.

RESUME TEXT:
{resume_text}

ATS SCORE: {ats_score}/100

Provide feedback in this EXACT JSON format (no markdown, pure JSON):
{{
  "overallAssessment": "2-3 sentence overall assessment",
  "strengths": [
    "specific strength 1",
    "specific strength 2",
    "specific strength 3"
  ],
  "criticalIssues": [
    {{
      "issue": "specific problem",
      "impact": "why this hurts your chances",
      "fix": "exactly what to change"
    }}
  ],
  "sectionFeedback": {{
    "summary": "specific feedback on summary section",
    "experience": "specific feedback on experience section",
    "skills": "specific feedback on skills section",
    "projects": "specific feedback on projects section",
    "education": "specific feedback on education section"
  }},
  "quickWins": [
    "action item 1 — can be done in under 10 minutes",
    "action item 2",
    "action item 3"
  ],
  "estimatedImprovementPotential": "X-Y points improvement possible with suggested changes"
}}"""


def resume_rewrite_prompt(section_name: str, section_text: str, job_role: str = "") -> str:
    role_context = f"for a {job_role} role" if job_role else "for software engineering roles"
    return f"""You are an expert resume writer specializing in tech industry resumes.

Rewrite this resume {section_name} section {role_context} to be more impactful.
Make it ATS-optimized, quantified where possible, and compelling.

ORIGINAL {section_name.upper()}:
{section_text}

Rules:
- Keep the same factual information, don't invent achievements
- Add strong action verbs (Built, Engineered, Optimized, Reduced, Increased)
- Quantify with numbers where the original implies scale
- Remove weak phrases like "responsible for" or "helped with"
- Make it scannable with bullet points
- Target 3-5 bullet points for experience, 2-3 sentences for summary

Return ONLY the rewritten text, no explanation or commentary."""


def keywords_prompt(resume_text: str, job_description: str) -> str:
    return f"""You are an ATS optimization expert.

Analyze the gap between this resume and job description.
Identify keywords the resume is missing that would improve ATS matching.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON (no markdown):
{{
  "missingKeywords": ["keyword1", "keyword2"],
  "presentKeywords": ["keyword1", "keyword2"],
  "matchScore": 75,
  "topMissingSkills": [
    {{
      "skill": "skill name",
      "importance": "high/medium/low",
      "context": "where it appears in the job description"
    }}
  ],
  "recommendation": "2-3 sentence recommendation"
}}"""
