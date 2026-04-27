'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Flashcard } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FlashCardProps {
  card: Flashcard;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function FlashCard({ card, onSwipe }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitX, setExitX] = useState<number | string>(0);
  const [exitRotate, setExitRotate] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const x = useMotionValue(0);
  // Map x to opacity (0 to 1 as x moves away from 0)
  const rightOpacity = useTransform(x, [0, 150], [0, 1]);
  const leftOpacity = useTransform(x, [0, -150], [0, 1]);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 80) {
      triggerSwipe('right');
    } else if (info.offset.x < -80) {
      triggerSwipe('left');
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    setIsExiting(true);
    setExitX(direction === 'right' ? 500 : -500);
    setExitRotate(direction === 'right' ? 20 : -20);
    setTimeout(() => onSwipe(direction), 300);
  };

  return (
    <motion.div
      className="absolute w-full h-[65vh] max-w-sm cursor-pointer"
      style={{ perspective: 1200, x: isExiting ? exitX : x, rotate: isExiting ? exitRotate : rotate, opacity: isExiting ? 0 : 1 }}
      drag={isFlipped && !isExiting ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={() => !isFlipped && setIsFlipped(true)}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ 
        rotateY: { type: 'spring', stiffness: 200, damping: 20 },
        x: isExiting ? { duration: 0.3 } : { type: 'spring', stiffness: 300, damping: 20 },
        opacity: { duration: 0.3 }
      }}
      whileTap={{ scale: isFlipped ? 1.05 : 0.98 }}
    >
      {/* FRONT FACE */}
      <motion.div 
        className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col p-6"
        style={{ backfaceVisibility: 'hidden', rotateY: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {card.subTopic || card.topic}
          </span>
          <span className={`text-xs font-bold uppercase ${card.difficulty === 'hard' ? 'text-red-500' : card.difficulty === 'medium' ? 'text-orange-500' : 'text-green-500'}`}>
            {card.difficulty}
          </span>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <h2 className="text-xl font-bold text-gray-900 text-center leading-snug">
            {card.question}
          </h2>
        </div>
        
        <div className="text-center pt-6 text-gray-400 text-sm flex items-center justify-center gap-2">
          <span className="animate-bounce">👆</span> Nhấn để xem đáp án
        </div>
      </motion.div>

      {/* BACK FACE */}
      <motion.div 
        className="absolute inset-0 bg-orange-50 rounded-3xl shadow-2xl border border-orange-100 flex flex-col p-6 overflow-hidden"
        style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
      >
        {/* Swipe Indicators */}
        <motion.div 
          className="absolute top-6 right-6 font-bold text-green-500 text-xl z-10"
          style={{ opacity: rightOpacity }}
        >
          ĐÃ THUỘC ✅
        </motion.div>
        <motion.div 
          className="absolute top-6 left-6 font-bold text-red-500 text-xl z-10"
          style={{ opacity: leftOpacity }}
        >
          🔁 CHƯA THUỘC
        </motion.div>

        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h3 className="text-green-600 font-bold mb-2 flex items-center gap-2">
              <span>✅</span> Đáp án
            </h3>
            <p className="text-lg font-bold text-gray-900">
              {card.answer}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-amber-600 font-bold mb-2 flex items-center gap-2">
              <span>💡</span> Giải thích
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {card.explanation}
            </p>
          </div>
        </div>

        {/* Manual Buttons */}
        <div className="flex justify-between pt-4 mt-4 border-t border-orange-200/50">
          <button 
            onClick={(e) => { e.stopPropagation(); triggerSwipe('left'); }}
            className="flex items-center gap-1 text-red-500 font-semibold py-2 px-4 rounded-xl hover:bg-red-50 transition-colors"
          >
            <ArrowLeft size={16} /> Chưa thuộc
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); triggerSwipe('right'); }}
            className="flex items-center gap-1 text-green-600 font-semibold py-2 px-4 rounded-xl hover:bg-green-50 transition-colors"
          >
            Thuộc <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
