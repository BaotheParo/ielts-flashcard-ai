export type TopicKey = 'mindset' | 'vocab' | 'practice';

export interface Flashcard {
  id: string;
  topic: TopicKey;
  subTopic: string;
  cardType?: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  taskType: string;
  easeFactor?: number;
  interval?: number;
  nextReview?: string;
}

export interface TopicStat {
  known: number;
  unknown: number;
  lastSession: string | null;
}

export interface ProgressStore {
  totalCardsStudied: number;
  streak: number;
  lastStudiedDate: string;
  topicStats: {
    mindset: TopicStat;
    vocab: TopicStat;
    practice: TopicStat;
  };
}

export interface SessionResult {
  topic: TopicKey;
  totalCards: number;
  knownCards: Flashcard[];
  unknownCards: Flashcard[];
  duration: number;
  timestamp: string;
}
