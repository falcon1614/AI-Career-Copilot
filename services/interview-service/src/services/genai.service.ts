import axios from 'axios';

const GENAI_URL = process.env.GENAI_SERVICE_URL || 'http://genai-service:8001';

export async function generateQuestions(
  resumeText: string,
  jobRole: string,
  questionType: string,
  count: number
): Promise<any[]> {
  try {
    const { data } = await axios.post(`${GENAI_URL}/api/interview/questions`, {
      resumeText,
      jobRole,
      questionType,
      count,
    }, { timeout: 60000 });
    return data.data.questions || [];
  } catch (err: any) {
    console.error('[genai] Questions generation failed:', err.message);
    // Return fallback questions if AI is unavailable
    return generateFallbackQuestions(jobRole, questionType, count);
  }
}

export async function generateAnswerFeedback(
  question: string,
  answer: string,
  jobRole: string
): Promise<{ feedback: string; score: number }> {
  try {
    const { data } = await axios.post(`${GENAI_URL}/api/interview/feedback`, {
      question,
      answer,
      jobRole,
    }, { timeout: 30000 });
    return data.data;
  } catch {
    // Fallback scoring if AI unavailable
    const wordCount = answer.trim().split(/\s+/).length;
    const score = Math.min(100, Math.max(30, wordCount * 2));
    return {
      feedback: `Answer received. Word count: ${wordCount}. For best results, provide specific examples and quantified outcomes.`,
      score,
    };
  }
}

function generateFallbackQuestions(jobRole: string, type: string, count: number): any[] {
  const technical = [
    { question: `What is your experience with the core technologies required for ${jobRole}?`, type: 'technical', difficulty: 'medium', topic: 'Experience', hint: 'Mention specific projects and technologies you have used.' },
    { question: 'Explain the difference between SQL and NoSQL databases and when you would use each.', type: 'technical', difficulty: 'medium', topic: 'Databases', hint: 'Focus on use cases, scalability, and data structure differences.' },
    { question: 'How do you approach debugging a production issue?', type: 'technical', difficulty: 'medium', topic: 'Problem Solving', hint: 'Describe a systematic approach: logs, monitoring, isolation, fix, prevention.' },
    { question: 'What is your experience with version control and CI/CD pipelines?', type: 'technical', difficulty: 'easy', topic: 'DevOps', hint: 'Mention Git workflows, branching strategies, and deployment automation.' },
    { question: 'How do you ensure code quality in your projects?', type: 'technical', difficulty: 'medium', topic: 'Best Practices', hint: 'Discuss testing, code review, linting, documentation.' },
  ];
  const behavioral = [
    { question: 'Tell me about a time you faced a significant technical challenge. How did you resolve it?', type: 'behavioral', difficulty: 'medium', topic: 'Problem Solving', hint: 'Use the STAR method: Situation, Task, Action, Result.' },
    { question: 'Describe a situation where you had to work with a difficult team member.', type: 'behavioral', difficulty: 'medium', topic: 'Teamwork', hint: 'Focus on communication and finding common ground.' },
    { question: 'Tell me about a project you are most proud of and why.', type: 'behavioral', difficulty: 'easy', topic: 'Achievement', hint: 'Highlight your specific contribution and the impact.' },
    { question: 'How do you prioritize tasks when you have multiple deadlines?', type: 'behavioral', difficulty: 'easy', topic: 'Time Management', hint: 'Discuss frameworks like Eisenhower matrix or MoSCoW.' },
    { question: 'Describe a time you received critical feedback. How did you respond?', type: 'behavioral', difficulty: 'medium', topic: 'Growth Mindset', hint: 'Show self-awareness and willingness to improve.' },
  ];
  const hr = [
    { question: `Why are you interested in the ${jobRole} position?`, type: 'hr', difficulty: 'easy', topic: 'Motivation', hint: 'Connect your skills and career goals to this specific role.' },
    { question: 'Where do you see yourself in 5 years?', type: 'hr', difficulty: 'easy', topic: 'Career Goals', hint: 'Show ambition while being realistic and relevant to the role.' },
    { question: 'What is your greatest professional strength?', type: 'hr', difficulty: 'easy', topic: 'Self Assessment', hint: 'Pick one strength with a concrete example.' },
    { question: 'What is your expected salary range for this position?', type: 'hr', difficulty: 'medium', topic: 'Compensation', hint: 'Research market rates and give a range based on your experience.' },
    { question: 'Do you have any questions for us?', type: 'hr', difficulty: 'easy', topic: 'Engagement', hint: 'Always have 2-3 thoughtful questions prepared.' },
  ];

  let pool: any[] = [];
  if (type === 'technical') pool = technical;
  else if (type === 'behavioral') pool = behavioral;
  else if (type === 'hr') pool = hr;
  else pool = [...technical, ...behavioral, ...hr];

  return pool.slice(0, count).map((q, i) => ({ ...q, id: i + 1, followUp: 'Can you elaborate on that?' }));
}
