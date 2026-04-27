import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'IELTS Task 1 Flashcards – AI Luyện thi',
  description: 'AI-powered IELTS Writing Task 1 flashcard app. Luyện tư duy, từ vựng và kỹ năng viết với Gemini AI.',
  themeColor: '#7C3AED',
  other: { 'mobile-web-app-capable': 'yes', 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body className="font-sans antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
