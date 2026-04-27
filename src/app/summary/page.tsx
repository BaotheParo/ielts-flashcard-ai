'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Flashcard, TopicKey } from '@/types';
import { Home, RotateCcw } from 'lucide-react';

// Lazy import confetti (client only)
const TOPIC_LABELS: Record<TopicKey, string> = {
  mindset: '🧠 Tư duy',
  vocab: '📖 Từ vựng',
  practice: '✍️ Thực hành',
};

interface SessionResult {
  topic: TopicKey;
  known: Flashcard[];
  unknown: Flashcard[];
  timestamp: string;
}

export default function SummaryPage() {
  const router = useRouter();
  const { startSession } = useAppStore();
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('ielts_session_result');
    if (!raw) { router.push('/'); return; }
    const parsed: SessionResult = JSON.parse(raw);
    setResult(parsed);

    // Confetti if > 70%
    const total = parsed.known.length + parsed.unknown.length;
    const pct = total > 0 ? parsed.known.length / total : 0;
    if (pct > 0.7) {
      import('canvas-confetti').then((mod) => {
        mod.default({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      });
    }
  }, [router]);

  if (!result) return null;

  const total = result.known.length + result.unknown.length;
  const knownPct = total > 0 ? Math.round((result.known.length / total) * 100) : 0;
  const xp = 10 + result.known.length * 2;

  const handleReviewUnknown = () => {
    if (result.unknown.length === 0) return;
    sessionStorage.removeItem('ielts_session_result');
    sessionStorage.removeItem(`ielts_deck_${result.topic}`);
    sessionStorage.setItem(`ielts_deck_${result.topic}`, JSON.stringify(result.unknown));
    startSession(result.topic, result.unknown);
    router.push(`/session/${result.topic}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-6" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-5xl mb-3">{knownPct >= 70 ? '🏆' : '📚'}</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Phiên học hoàn tất!</h1>
          <p className="text-gray-500 mt-1">{TOPIC_LABELS[result.topic]}</p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex justify-around mb-6">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-green-500">{result.known.length}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Đã thuộc ✅</p>
            </div>
            <div className="h-12 w-px bg-gray-100 self-center" />
            <div className="text-center">
              <p className="text-4xl font-extrabold text-red-400">{result.unknown.length}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Chưa thuộc 🔁</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-600">Độ chính xác</span>
              <span className="text-purple-600 font-bold">{knownPct}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${knownPct >= 70 ? 'bg-green-500' : 'bg-purple-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${knownPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* XP Badge */}
          <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl py-3">
            <span className="text-xl">⚡</span>
            <span className="text-amber-700 font-bold text-lg">+{xp} XP</span>
            <span className="text-amber-500">🔥</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          {result.unknown.length > 0 && (
            <button
              onClick={handleReviewUnknown}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
              aria-label="Ôn lại những thẻ chưa thuộc"
            >
              <RotateCcw size={18} />
              Ôn lại thẻ sai ({result.unknown.length} thẻ)
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-2xl border border-gray-200 shadow-sm transition-all active:scale-95"
            aria-label="Về trang chủ"
          >
            <Home size={18} />
            Về trang chủ
          </button>
        </motion.div>
      </div>
    </div>
  );
}
