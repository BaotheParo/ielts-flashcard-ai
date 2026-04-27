import { Flashcard, TopicKey } from '@/types';
import { KNOWLEDGE_BASE } from './knowledge-base';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
  let example = '';

  if (topic === 'mindset') {
    specificInstructions = `Generate ${count} flashcard objects testing the student's MINDSET and STRATEGIC THINKING.
Focus on: tense identification, paragraph grouping strategy, overview writing, time identification.`;
    example = `{
  "id": "mindset_001",
  "topic": "mindset",
  "subTopic": "theater_plan",
  "question": "Khi bản đồ mô tả thay đổi giữa năm 2010 và 2012, bạn BẮT BUỘC dùng thì gì?",
  "answer": "Quá khứ đơn bị động (Past Simple Passive): was built, was relocated, was demolished.",
  "explanation": "Vì cả hai năm 2010 và 2012 đều nằm trong quá khứ, toàn bộ hành động xảy ra và kết thúc trong quá khứ. Dùng thì Hiện tại hoàn thành sẽ sai vì không có kết nối đến hiện tại.",
  "difficulty": "medium",
  "taskType": "map_change"
}`;
  } else if (topic === 'vocab') {
    specificInstructions = `Generate EXACTLY ${count} vocabulary/grammar flashcards strictly from the material.
Test vocabulary groups: Location prepositions, Change verbs (passive forms), Comparison structures, Spatial connectors, Size/measurement phrases.
Card types: fill_in_blank, translation, usage, error_spot.`;
    example = `{
  "id": "vocab_001",
  "topic": "vocab",
  "subTopic": "beachfront_map",
  "cardType": "fill_in_blank",
  "question": "The old playground ___ ___ ___ make way for a new car park. (3 words, passive)",
  "answer": "has been demolished",
  "explanation": "Dùng Present Perfect Passive vì sự thay đổi xảy ra từ quá khứ và kéo dài đến hiện tại (1950 → now). Công thức: has/have + been + V3.",
  "difficulty": "medium",
  "taskType": "map_change"
}`;
  } else {
    specificInstructions = `Generate ${count} higher-order practice flashcards.
Test APPLIED SKILLS: writing overview sentences, choosing correct grouping strategy, identifying which tense rule applies to a described scenario, and evaluating sample sentences.
Card types: overview_writing, strategy_choice, sentence_evaluation, template_application.`;
    example = `{
  "id": "practice_001",
  "topic": "practice",
  "subTopic": "city_1950",
  "cardType": "overview_writing",
  "question": "Bản đồ so sánh một thành phố năm 1950 và hiện tại. Hãy viết CÂU OVERVIEW hoàn chỉnh (2 câu).",
  "answer": "Overall, it is clear that the city underwent a massive expansion, accommodating a tenfold increase in its population. Additionally, the most noticeable developments are the creation of a large lake and the significant growth of both the business and residential districts.",
  "explanation": "Câu Overview cần: (1) Nhận xét tổng quan về thay đổi lớn nhất. (2) Liệt kê 2-3 thay đổi nổi bật nhất mà KHÔNG đi vào chi tiết số liệu.",
  "difficulty": "hard",
  "taskType": "map_change"
}`;
  }

  return `You are an IELTS Writing Task 1 exam coach. Your ONLY knowledge source is the study material below.
You must generate EXACTLY ${count} flashcards in valid JSON array format.

## KNOWLEDGE SOURCE (DO NOT ADD INFORMATION FROM OUTSIDE THIS):
${KNOWLEDGE_BASE}

## TASK:
${specificInstructions}

## REQUIRED JSON FORMAT (return ONLY this, no markdown, no explanation):
[
  {
    "id": "unique_string_id",
    "topic": "${topic}",
    "subTopic": "name_of_task_e.g._beachfront_map",
    "cardType": "optional_type_based_on_topic",
    "question": "The question to ask the student (in Vietnamese or English)",
    "answer": "The correct short answer",
    "explanation": "A 2-3 sentence explanation WHY this answer is correct, citing the specific rule from the material",
    "difficulty": "easy" | "medium" | "hard",
    "taskType": "floor_plan" | "map_change" | "diagram_comparison" | "process"
  }
]

## EXAMPLE CARD:
${example}`;
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 403) {
        throw new GeminiError('INVALID_KEY', 'API Key không hợp lệ hoặc không có quyền truy cập.');
      }
      if (response.status === 429) {
        throw new GeminiError('RATE_LIMIT', 'Vượt quá giới hạn gọi API. Vui lòng thử lại sau.');
      }
      throw new GeminiError('NETWORK_ERROR', `Lỗi kết nối: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    try {
      const parsed = JSON.parse(rawText) as Flashcard[];
      if (!Array.isArray(parsed)) throw new Error('Not an array');
      return parsed;
    } catch {
      throw new GeminiError('PARSE_ERROR', 'AI trả về định dạng dữ liệu không hợp lệ.');
    }
  } catch (err: unknown) {
    if (err instanceof GeminiError) throw err;
    throw new GeminiError('NETWORK_ERROR', (err as Error).message || 'Lỗi kết nối mạng.');
  }
}
