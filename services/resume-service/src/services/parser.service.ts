import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

export interface ParsedResume {
  rawText: string;
  sections: {
    contact?: string;
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
    projects?: string;
    certifications?: string;
  };
  wordCount: number;
}

export async function parseFile(
  filePath: string,
  mimeType: string
): Promise<ParsedResume> {
  let rawText = '';

  if (mimeType === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    rawText = data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value;
  } else {
    throw new Error('UNSUPPORTED_FILE_TYPE');
  }

  rawText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const sections = extractSections(rawText);

  return {
    rawText,
    sections,
    wordCount: rawText.split(/\s+/).filter(Boolean).length,
  };
}

function extractSections(text: string): ParsedResume['sections'] {
  const lower = text.toLowerCase();
  const lines = text.split('\n');
  const sections: ParsedResume['sections'] = {};

  const sectionHeaders: Record<keyof ParsedResume['sections'], string[]> = {
    contact:        ['contact', 'personal info', 'personal details'],
    summary:        ['summary', 'objective', 'profile', 'about'],
    experience:     ['experience', 'work experience', 'employment', 'work history', 'professional experience'],
    education:      ['education', 'academic', 'qualification'],
    skills:         ['skills', 'technical skills', 'core competencies', 'technologies'],
    projects:       ['projects', 'personal projects', 'academic projects'],
    certifications: ['certifications', 'certificates', 'awards', 'achievements'],
  };

  // Find section boundaries
  const boundaries: { key: keyof ParsedResume['sections']; lineIndex: number }[] = [];

  lines.forEach((line, i) => {
    const l = line.toLowerCase().trim();
    for (const [key, headers] of Object.entries(sectionHeaders)) {
      if (headers.some(h => l.includes(h)) && line.trim().length < 50) {
        boundaries.push({ key: key as keyof ParsedResume['sections'], lineIndex: i });
      }
    }
  });

  boundaries.sort((a, b) => a.lineIndex - b.lineIndex);

  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].lineIndex + 1;
    const end = boundaries[i + 1]?.lineIndex ?? lines.length;
    sections[boundaries[i].key] = lines.slice(start, end).join('\n').trim();
  }

  // First few lines are usually contact info
  if (!sections.contact && boundaries[0]?.lineIndex > 3) {
    sections.contact = lines.slice(0, Math.min(5, boundaries[0]?.lineIndex ?? 5)).join('\n').trim();
  }

  return sections;
}
