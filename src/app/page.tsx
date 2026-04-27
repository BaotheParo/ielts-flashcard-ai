'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Brain, BookOpen, PenTool, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import SettingsModal from '@/components/ui/SettingsModal';

const TOPICS = [
  { key: 'mindset' as const,  icon: Brain,    emoji: '🧠', label: 'Tư duy',    description: 'Chiến thuật & Ngữ pháp', color: 'from-purple-500 to-indigo-600', total: 30 },
  { key: 'vocab'   as const,  icon: BookOpen, emoji: '📖', label: 'Từ vựng',   description: 'Cụm từ & Cấu trúc',      color: 'from-emerald-500 to-teal-600',  total: 40 },
  { key: 'practice' as const, icon: PenTool,  emoji: '✍️', label: 'Thực hành', description: 'Câu Overview & Phân tích', color: 'from-orange-500 to-rose-600',   total: 30 },
];

export default function HomePage() {
  const router = useRouter();
  const apiKey  = useAppStore((s) => s.apiKey);
  const progress = useAppStore((s) => s.progress);
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (isMounted && !apiKey) router.push('/onboarding');
  }, [isMounted, apiKey, router]);

  if (!isMounted || !apiKey) return null;

  const totalGoal  = 100;
  const pct = Math.min(100, Math.round((progress.totalCardsStudied / totalGoal) * 100));

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="w-full max-w-sm space-y-5 pt-4">

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">IELTS Task 1</h1>
              <p className="text-gray-500 text-sm">AI Flashcard Luyện thi</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              aria-label="Mở cài đặt"
            >
              <Settings size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Progress + Streak */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tiến độ tổng thể</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {progress.totalCardsStudied}
                  <span className="text-base text-gray-400 font-normal"> / {totalGoal} thẻ</span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white px-3 py-2 rounded-2xl flex flex-col items-center shadow-sm">
                <span className="text-lg leading-none">🔥</span>
                <span className="text-xs font-bold">{progress.streak} ngày</span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-right text-xs text-gray-400 mt-1">{pct}%</p>
          </motion.div>

          {/* Topic Cards */}
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3">Chọn chủ đề ôn tập</h2>
            <div className="grid grid-cols-2 gap-3">
              {TOPICS.slice(0, 2).map((topic, i) => {
                const stat = progress.topicStats[topic.key];
                return (
                  <motion.button
                    key={topic.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => router.push(`/session/${topic.key}`)}
                    className={`bg-gradient-to-br ${topic.color} text-white p-4 rounded-2xl shadow-md flex flex-col justify-between h-36 active:scale-95 transition-transform text-left`}
                    aria-label={`Học chủ đề ${topic.label}`}
                  >
                    <div>
                      <div className="bg-white/25 w-10 h-10 rounded-xl flex items-center justify-center mb-2">
                        <topic.icon size={20} />
                      </div>
                      <h3 className="font-bold text-base leading-tight">{topic.label}</h3>
                      <p className="text-white/75 text-xs">{topic.description}</p>
                    </div>
                    <p className="text-sm font-bold opacity-90">{stat.known}/{topic.total}</p>
                  </motion.button>
                );
              })}

              {/* Practice — full width */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                onClick={() => router.push('/session/practice')}
                className={`col-span-2 bg-gradient-to-br ${TOPICS[2].color} text-white p-4 rounded-2xl shadow-md flex items-center gap-4 active:scale-95 transition-transform text-left`}
                aria-label="Học chủ đề Thực hành"
              >
                <div className="bg-white/25 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PenTool size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{TOPICS[2].label}</h3>
                  <p className="text-white/75 text-xs">{TOPICS[2].description}</p>
                </div>
                <span className="font-bold text-sm opacity-90">
                  {progress.topicStats.practice.known}/{TOPICS[2].total}
                </span>
              </motion.button>
            </div>
          </div>

        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
