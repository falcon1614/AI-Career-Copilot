def interview_questions_prompt(
    resume_text: str,
    job_role: str,
    question_type: str = "mixed",
    count: int = 10
) -> str:
    type_instructions = {
        "technical": "Focus on technical/coding questions about their stack",
        "behavioral": "Focus on behavioral/STAR format questions",
        "hr": "Focus on HR, culture fit, and career goal questions",
        "mixed": "Mix of technical (40%), behavioral (40%), and HR (20%)"
    }
    instruction = type_instructions.get(question_type, type_instructions["mixed"])

    return f"""You are an expert technical interviewer at a top tech company.

Generate {count} interview questions for a candidate applying for {job_role}.
{instruction}

CANDIDATE RESUME SUMMARY:
{resume_text[:2000]}

Return ONLY valid JSON (no markdown):
{{
  "questions": [
    {{
      "id": 1,
      "question": "the interview question",
      "type": "technical/behavioral/hr",
      "difficulty": "easy/medium/hard",
      "topic": "what area this tests",
      "hint": "what a good answer should include",
      "followUp": "natural follow-up question"
    }}
  ],
  "focusAreas": ["area1", "area2"],
  "preparationTips": ["tip1", "tip2", "tip3"]
}}"""


def roadmap_prompt(resume_text: str, target_role: str, timeline_weeks: int = 12) -> str:
    return f"""You are a senior engineering mentor and career coach.

Create a personalized {timeline_weeks}-week learning roadmap for this candidate
to become job-ready for: {target_role}

CURRENT SKILLS (from resume):
{resume_text[:1500]}

Return ONLY valid JSON (no markdown):
{{
  "targetRole": "{target_role}",
  "currentLevel": "junior/mid/senior assessment",
  "readinessScore": 65,
  "gapAnalysis": "2-3 sentences on key gaps",
  "weeks": [
    {{
      "weekRange": "Week 1-2",
      "theme": "theme name",
      "goals": ["goal1", "goal2"],
      "topics": ["topic1", "topic2", "topic3"],
      "resources": [
        {{
          "title": "resource name",
          "type": "course/book/practice",
          "url": "url or platform name",
          "hours": 5
        }}
      ],
      "milestone": "what you should be able to do by end of this phase",
      "projects": ["mini project to build this week"]
    }}
  ],
  "totalHours": 120,
  "keyMilestones": ["milestone1", "milestone2", "milestone3"]
}}"""
