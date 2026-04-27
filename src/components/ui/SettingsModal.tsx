'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { saveApiKey } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiKey, setApiKey, resetProgress } = useAppStore();
  const router = useRouter();

  const [newKey, setNewKey] = useState(apiKey ?? '');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveKey = () => {
    if (!newKey.startsWith('AIza') || newKey.length !== 39) {
      setKeyError('Key không hợp lệ. Phải bắt đầu bằng "AIza" và dài 39 ký tự.');
      return;
    }
    setKeyError('');
    setApiKey(newKey);
    saveApiKey(newKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleResetProgress = () => {
    resetProgress();
    // clear session caches
    ['mindset', 'vocab', 'practice'].forEach(t =>
      sessionStorage.removeItem(`ielts_deck_${t}`)
    );
    sessionStorage.removeItem('ielts_session_result');
    setShowConfirm(false);
    onClose();
    router.push('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 max-w-sm mx-auto"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">⚙️ Cài đặt</h2>
              <button onClick={onClose} aria-label="Đóng cài đặt" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* API Key section */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Key size={14} className="text-purple-500" /> Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={newKey}
                  onChange={(e) => { setNewKey(e.target.value); setKeyError(''); setKeySaved(false); }}
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="AIzaSy..."
                  aria-label="Nhập Gemini API Key"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  aria-label={showKey ? 'Ẩn API Key' : 'Hiện API Key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {keyError && <p className="text-red-500 text-xs mt-1">{keyError}</p>}
              {keySaved && <p className="text-green-500 text-xs mt-1">✅ Đã lưu!</p>}
              <button
                onClick={handleSaveKey}
                className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                aria-label="Lưu API Key mới"
              >
                Cập nhật Key
              </button>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Reset Progress */}
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl transition-colors"
                aria-label="Xoá toàn bộ tiến độ học"
              >
                <Trash2 size={16} /> Xoá toàn bộ tiến độ
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3"
              >
                <div className="flex gap-2 text-red-600">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Tất cả tiến độ sẽ bị xoá vĩnh viễn. Bạn chắc chắn?</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-semibold"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleResetProgress}
                    className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold"
                  >
                    Xoá
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
