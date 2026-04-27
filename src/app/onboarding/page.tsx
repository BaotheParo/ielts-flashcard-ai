'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { saveApiKey } from '@/lib/storage';

export default function OnboardingPage() {
  const [key, setKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setApiKey = useAppStore((state) => state.setApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!key.startsWith('AIza') || key.length !== 39) {
      setError('Key không hợp lệ. Phải bắt đầu bằng "AIza" và dài 39 ký tự.');
      return;
    }

    setApiKey(key);
    saveApiKey(key);
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Luyện IELTS Task 1 cùng AI</h1>
          <p className="text-gray-500 mt-2 text-sm">Vui lòng nhập Gemini API Key để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                placeholder="AIzaSy..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            Lưu & Bắt đầu
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 text-sm hover:underline font-medium"
          >
            Lấy API Key miễn phí &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
