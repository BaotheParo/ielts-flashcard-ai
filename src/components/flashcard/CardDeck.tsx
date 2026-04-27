'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flashcard } from '@/types';
import FlashCard from './FlashCard';

interface CardDeckProps {
  initialDeck: Flashcard[];
  totalInitial: number;
  onSessionEnd: (known: Flashcard[], unknown: Flashcard[]) => void;
}

export default function CardDeck({ initialDeck, totalInitial, onSessionEnd }: CardDeckProps) {
  const [deck, setDeck] = useState<Flashcard[]>(initialDeck);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [knownCards, setKnownCards] = useState<Flashcard[]>([]);
  const [unknownCards, setUnknownCards] = useState<Flashcard[]>([]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    setDeck((prev) => {
      if (prev.length === 0) return prev;
      const [top, ...rest] = prev;

      if (direction === 'right') {
        if (knownIds.has(top.id)) {
          // Already swiped right once → truly known
          const newKnown = [...knownCards, top];
          const newUnknown = [...unknownCards];
          if (rest.length === 0) {
            setTimeout(() => onSessionEnd(newKnown, newUnknown), 300);
          }
          setKnownCards(newKnown);
          return rest;
        } else {
          // First time right → mark as known candidate, remove from deck
          setKnownIds((ids) => new Set(Array.from(ids).concat(top.id)));
          const newKnown = [...knownCards, top];
          const newUnknown = [...unknownCards];
          if (rest.length === 0) {
            setTimeout(() => onSessionEnd(newKnown, newUnknown), 300);
          }
          setKnownCards(newKnown);
          return rest;
        }
      } else {
        // Swipe left → re-queue at end
        const newUnknown = [...unknownCards, top];
        setUnknownCards(newUnknown);
        return [...rest, top];
      }
    });
  }, [knownIds, knownCards, unknownCards, onSessionEnd]);

  const progress = totalInitial - deck.length;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Progress indicator */}
      <div className="flex items-center justify-between w-full max-w-sm mb-4 px-1">
        <span className="text-sm font-medium text-gray-500">
          Thẻ {Math.min(progress + 1, totalInitial)}/{totalInitial}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalInitial, 8) }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                i < progress ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm h-[65vh] flex items-center justify-center">
        {deck.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-gray-500 text-lg font-medium">Đang tổng kết...</p>
          </motion.div>
        ) : (
          <>
            {/* Card behind (second card) */}
            {deck.length > 1 && (
              <motion.div
                className="absolute w-full max-w-sm h-[65vh] rounded-3xl bg-white shadow-lg border border-gray-100"
                animate={{ scale: 0.95, y: 12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ zIndex: 0 }}
              />
            )}

            {/* Top card */}
            <AnimatePresence mode="wait">
              <div key={deck[0]?.id} style={{ zIndex: 1, position: 'absolute', width: '100%', maxWidth: '24rem' }}>
                <FlashCard card={deck[0]} onSwipe={handleSwipe} />
              </div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Hint text */}
      {deck.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          Vuốt phải = Đã thuộc &nbsp;·&nbsp; Vuốt trái = Chưa thuộc
        </p>
      )}
    </div>
  );
}
