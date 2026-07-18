export interface ATSResult {
  score: number;
  breakdown: {
    contactInfo:    { score: number; max: number; feedback: string };
    summary:        { score: number; max: number; feedback: string };
    experience:     { score: number; max: number; feedback: string };
    education:      { score: number; max: number; feedback: string };
    skills:         { score: number; max: number; feedback: string };
    formatting:     { score: number; max: number; feedback: string };
    keywords:       { score: number; max: number; feedback: string };
  };
  missingKeywords: string[];
  suggestions: string[];
}

const TECH_KEYWORDS = [
  'javascript','typescript','python','java','react','node','express',
  'sql','postgresql','mongodb','redis','docker','kubernetes','aws',
  'git','api','rest','graphql','microservices','ci/cd','linux',
  'machine learning','deep learning','tensorflow','pytorch','scikit',
  'html','css','tailwind','next.js','fastapi','flask','spring',
];

export function calculateATS(
  parsedText: string,
  sections: Record<string, string>
): ATSResult {
  const text = parsedText.toLowerCase();
  const suggestions: string[] = [];

  // 1. Contact Info (15 pts)
  const hasEmail    = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(text);
  const hasPhone    = /(\+?\d[\d\s\-().]{7,}\d)/.test(text);
  const hasLinkedIn = text.includes('linkedin');
  const hasGitHub   = text.includes('github');
  let contactScore  = 0;
  if (hasEmail)    contactScore += 5;
  if (hasPhone)    contactScore += 4;
  if (hasLinkedIn) contactScore += 3;
  if (hasGitHub)   contactScore += 3;
  if (!hasEmail)   suggestions.push('Add a professional email address');
  if (!hasPhone)   suggestions.push('Add a phone number');
  if (!hasLinkedIn) suggestions.push('Add your LinkedIn profile URL');
  if (!hasGitHub)  suggestions.push('Add your GitHub profile URL');

  // 2. Summary (10 pts)
  const hasSummary   = !!sections.summary && sections.summary.length > 50;
  const summaryScore = hasSummary ? 10 : 0;
  if (!hasSummary) suggestions.push('Add a professional summary (3-5 sentences)');

  // 3. Experience (25 pts)
  const hasExperience = !!sections.experience && sections.experience.length > 100;
  const hasBullets    = (sections.experience || '').includes('•') ||
                        (sections.experience || '').includes('-') ||
                        (sections.experience || '').includes('*');
  const hasNumbers    = /\d+%|\d+x|\$\d+|\d+ (users|customers|projects|teams|members)/.test(
                          sections.experience || ''
                        );
  let expScore = 0;
  if (hasExperience) expScore += 10;
  if (hasBullets)    expScore += 8;
  if (hasNumbers)    expScore += 7;
  if (!hasExperience) suggestions.push('Add detailed work experience');
  if (!hasBullets)    suggestions.push('Use bullet points in experience section');
  if (!hasNumbers)    suggestions.push('Quantify achievements (e.g. "Reduced load time by 40%")');

  // 4. Education (15 pts)
  const hasEducation = !!sections.education && sections.education.length > 30;
  const hasDegree    = /bachelor|master|b\.?e|b\.?tech|m\.?tech|b\.?sc|m\.?sc|phd|diploma/.test(
                         (sections.education || '').toLowerCase()
                       );
  let eduScore = 0;
  if (hasEducation) eduScore += 8;
  if (hasDegree)    eduScore += 7;
  if (!hasEducation) suggestions.push('Add your educational background');

  // 5. Skills (20 pts)
  const hasSkills     = !!sections.skills && sections.skills.length > 20;
  const skillCount    = TECH_KEYWORDS.filter(k => text.includes(k)).length;
  const skillScore    = Math.min(20, hasSkills ? 8 + skillCount * 2 : skillCount * 2);
  if (!hasSkills)     suggestions.push('Add a dedicated skills section');
  if (skillCount < 5) suggestions.push('List more technical skills relevant to your target role');

  // 6. Formatting (10 pts)
  const wordCount       = parsedText.split(/\s+/).filter(Boolean).length;
  const goodLength      = wordCount >= 300 && wordCount <= 800;
  const hasProperLength = wordCount > 100;
  let fmtScore = 0;
  if (hasProperLength) fmtScore += 5;
  if (goodLength)      fmtScore += 5;
  if (wordCount < 300) suggestions.push('Resume is too short — add more detail (aim for 400-600 words)');
  if (wordCount > 800) suggestions.push('Resume may be too long — consider condensing to 1-2 pages');

  // 7. Keywords (5 pts)
  const foundKeywords  = TECH_KEYWORDS.filter(k => text.includes(k));
  const missingKeywords = TECH_KEYWORDS
    .filter(k => !text.includes(k))
    .slice(0, 8);
  const keywordScore   = Math.min(5, Math.floor(foundKeywords.length / 3));

  const totalScore = Math.min(100,
    contactScore + summaryScore + expScore + eduScore + skillScore + fmtScore + keywordScore
  );

  return {
    score: totalScore,
    breakdown: {
      contactInfo: { score: contactScore,  max: 15, feedback: contactScore  >= 12 ? 'Complete' : 'Missing some contact details' },
      summary:     { score: summaryScore,  max: 10, feedback: hasSummary    ? 'Good summary present' : 'No summary found' },
      experience:  { score: expScore,      max: 25, feedback: expScore      >= 20 ? 'Strong experience section' : 'Experience section needs improvement' },
      education:   { score: eduScore,      max: 15, feedback: hasEducation  ? 'Education present' : 'Add education details' },
      skills:      { score: skillScore,    max: 20, feedback: `Found ${skillCount} technical keywords` },
      formatting:  { score: fmtScore,      max: 10, feedback: `${wordCount} words — ${goodLength ? 'good length' : 'adjust length'}` },
      keywords:    { score: keywordScore,  max: 5,  feedback: `${foundKeywords.length} tech keywords detected` },
    },
    missingKeywords,
    suggestions: suggestions.slice(0, 6),
  };
}
