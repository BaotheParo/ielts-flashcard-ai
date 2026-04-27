'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { generateFlashcards } from '@/lib/gemini';
import { Flashcard, TopicKey } from '@/types';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import CardDeck from '@/components/flashcard/CardDeck';

const TOPIC_LABELS: Record<TopicKey, string> = {
  mindset: 'Tư duy',
  vocab: 'Từ vựng',
  practice: 'Thực hành',
};

export default function SessionPage({ params }: { params: { topic: string } }) {
  const router = useRouter();
  const { apiKey, startSession, endSession } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const topic = params.topic as TopicKey;
  const topicLabel = TOPIC_LABELS[topic] ?? topic;

  const loadCards = useCallback(async (forceRefresh = false) => {
    if (!apiKey) { router.push('/onboarding'); return; }
    setIsLoading(true);
    setError(null);
    try {
      if (!forceRefresh) {
        const cached = sessionStorage.getItem(`ielts_deck_${topic}`);
        if (cached) {
          const parsed: Flashcard[] = JSON.parse(cached);
          if (parsed.length > 0) {
            setDeck(parsed);
            startSession(topic, parsed);
            setIsLoading(false);
            return;
          }
        }
      }
      const generated = await generateFlashcards(apiKey, topic, 8);
      if (!generated || generated.length === 0) throw new Error('AI không tạo được thẻ nào. Vui lòng thử lại.');
      sessionStorage.setItem(`ielts_deck_${topic}`, JSON.stringify(generated));
      setDeck(generated);
      startSession(topic, generated);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Có lỗi xảy ra khi tạo thẻ.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, topic, router, startSession]);

  useEffect(() => { loadCards(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSessionEnd = useCallback((known: Flashcard[], unknown: Flashcard[]) => {
    endSession();
    // Persist results for summary via sessionStorage
    sessionStorage.setItem('ielts_session_result', JSON.stringify({
      topic,
      known,
      unknown,
      timestamp: new Date().toISOString(),
    }));
    router.push('/summary');
  }, [topic, endSession, router]);

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="relative">
        <Loader2 className="animate-spin text-purple-600" size={52} />
        <span className="absolute inset-0 flex items-center justify-center text-lg">🃏</span>
      </div>
      <p className="text-gray-600 text-lg font-semibold">AI đang tạo flashcard cho bạn</p>
      <span className="flex gap-1">
        {[0,1,2].map(i => (
          <span key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
    </div>
  );

  /* ── Error / Empty State ─────────────────────────────────────────── */
  if (error || deck.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tạo được thẻ</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">{error ?? 'AI không tạo được thẻ nào. Hãy kiểm tra API Key và thử lại.'}</p>
        <div className="space-y-3">
          <button
            onClick={() => loadCards(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            aria-label="Thử lại tạo flashcard"
          >
            <RefreshCw size={16} /> Thử lại
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            aria-label="Về trang chủ"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Session ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div className="flex items-center mb-4 pt-2">
        <button
          onClick={() => router.push('/')}
          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          aria-label="Về trang chủ"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg text-gray-900">{topicLabel}</h1>
        <div className="w-10" />
      </div>

      {/* Card Deck */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <CardDeck
          initialDeck={deck}
          totalInitial={deck.length}
          onSessionEnd={handleSessionEnd}
        />
      </div>
    </div>
  );
}
