import { Flashcard, TopicKey } from '@/types';
import { KNOWLEDGE_BASE } from './knowledge-base';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export class GeminiError extends Error {
  constructor(
    public code: 'INVALID_KEY' | 'RATE_LIMIT' | 'PARSE_ERROR' | 'NETWORK_ERROR',
    message: string
  ) { 
    super(message); 
    this.name = 'GeminiError';
  }
}

function buildSystemPrompt(topic: TopicKey, count: number): string {
  let specificInstructions = '';
  if (topic === 'mindset') {
    specificInstructions = `Generate ${count} flashcard objects testing the student's MINDSET and STRATEGIC THINKING. Focus on: tense identification, paragraph grouping strategy, overview writing, time identification.`;
  } else if (topic === 'vocab') {
    specificInstructions = `Generate EXACTLY ${count} vocabulary/grammar flashcards strictly from the material. Test vocabulary groups: Location prepositions, Change verbs (passive forms), Comparison structures, Spatial connectors.`;
  } else {
    specificInstructions = `Generate ${count} practice flashcards. Test applied skills: overview writing, strategy choice, sentence evaluation.`;
  }

  return `You are an IELTS Writing Task 1 exam coach. ONLY use the knowledge source below.
Generate EXACTLY ${count} flashcards in a valid JSON array format.

## KNOWLEDGE SOURCE:
${KNOWLEDGE_BASE}

## TASK:
${specificInstructions}

## OUTPUT FORMAT:
Return ONLY a JSON array. Each object must have:
{
  "id": "string",
  "topic": "${topic}",
  "subTopic": "string",
  "question": "string",
  "answer": "string",
  "explanation": "string",
  "difficulty": "easy"|"medium"|"hard",
  "taskType": "floor_plan"|"map_change"|"diagram_comparison"|"process"
}`;
}

export async function generateFlashcards(
  apiKey: string,
  topic: TopicKey,
  count: number = 8
): Promise<Flashcard[]> {
  const systemPrompt = buildSystemPrompt(topic, count);
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        // Bỏ hoàn toàn response_mime_type để tránh lỗi 400
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const serverMessage = errorData.error?.message || response.statusText;
      throw new GeminiError('INVALID_KEY', `Lỗi API (${response.status}): ${serverMessage}`);
    }

    const data = await response.json();
    let rawText = data.candidates[0].content.parts[0].text;
    
    // Tự động bóc tách JSON từ văn bản trả về (phòng trường hợp AI trả về kèm Markdown)
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        rawText = jsonMatch[0];
      }
      const parsed = JSON.parse(rawText) as Flashcard[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      throw new GeminiError('PARSE_ERROR', 'AI trả về định dạng dữ liệu không hợp lệ.');
    }
  } catch (err: unknown) {
    if (err instanceof GeminiError) throw err;
    throw new GeminiError('NETWORK_ERROR', (err as Error).message || 'Lỗi kết nối mạng.');
  }
}
