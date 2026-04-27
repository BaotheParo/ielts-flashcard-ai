import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TopicKey, Flashcard, ProgressStore } from '@/types';

interface AppState {
  apiKey: string | null;
  progress: ProgressStore;

  currentTopic: TopicKey | null;
  currentDeck: Flashcard[];
  sessionResults: { known: Flashcard[]; unknown: Flashcard[] };
  isLoading: boolean;
  error: string | null;

  setApiKey: (key: string) => void;
  startSession: (topic: TopicKey, deck: Flashcard[]) => void;
  endSession: () => void;
  resetProgress: () => void;
}

const defaultProgress: ProgressStore = {
  totalCardsStudied: 0,
  streak: 0,
  lastStudiedDate: '',
  topicStats: {
    mindset: { known: 0, unknown: 0, lastSession: null },
    vocab: { known: 0, unknown: 0, lastSession: null },
    practice: { known: 0, unknown: 0, lastSession: null },
  },
};

function computeStreak(prev: ProgressStore): number {
  if (!prev.lastStudiedDate) return 1;
  const last = new Date(prev.lastStudiedDate);
  const today = new Date();
  const diffDays = Math.floor((today.setHours(0,0,0,0) - last.setHours(0,0,0,0)) / 86_400_000);
  if (diffDays === 0) return prev.streak;            // same day → no change
  if (diffDays === 1) return prev.streak + 1;        // yesterday → increment
  return 1;                                           // gap → reset
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      apiKey: null,
      progress: defaultProgress,

      currentTopic: null,
      currentDeck: [],
      sessionResults: { known: [], unknown: [] },
      isLoading: false,
      error: null,

      setApiKey: (key) => set({ apiKey: key }),

      startSession: (topic, deck) => set({
        currentTopic: topic,
        currentDeck: deck,
        sessionResults: { known: [], unknown: [] },
        isLoading: false,
        error: null,
      }),

      endSession: () => set((state) => {
        if (!state.currentTopic) return state;
        const topic = state.currentTopic;
        const { known, unknown } = state.sessionResults;

        const newProgress: ProgressStore = {
          ...state.progress,
          totalCardsStudied: state.progress.totalCardsStudied + known.length,
          streak: computeStreak(state.progress),
          lastStudiedDate: new Date().toISOString(),
          topicStats: {
            ...state.progress.topicStats,
            [topic]: {
              known: state.progress.topicStats[topic].known + known.length,
              unknown: state.progress.topicStats[topic].unknown + unknown.length,
              lastSession: new Date().toISOString(),
            },
          },
        };

        return {
          progress: newProgress,
          currentTopic: null,
          currentDeck: [],
          sessionResults: { known: [], unknown: [] },
        };
      }),

      resetProgress: () => set({ progress: defaultProgress }),
    }),
    {
      name: 'ielts_w1_storage',
      partialize: (state) => ({ apiKey: state.apiKey, progress: state.progress }),
    }
  )
);
