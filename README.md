# 🃏 IELTS Writing Task 1 – AI Flashcard App

A **mobile-first, client-side only** progressive web app that generates interactive AI-powered flashcards for IELTS Writing Task 1, powered by Google Gemini AI. Zero backend, zero database.

---

## ✨ Features

- 🧠 **AI-generated flashcards** for 3 topics: Tư duy, Từ vựng, Thực hành
- 🎴 **3D flip animation** (tap to reveal answer)
- 👆 **Swipe gestures** (right = known, left = review again)
- 🔥 **Streak tracking** and XP rewards
- 🎉 **Confetti** celebration when score > 70%
- 📱 **Mobile-first** design (iPhone SE & Android ready)
- 💾 **No backend** — all state in `localStorage`

---

## 🚀 Setup

### 1. Install dependencies

```bash
cd ielts-flashcard
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Getting a Free Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the key (starts with `AIza...`, 39 characters)
5. Paste it into the app's Onboarding screen

> **Free tier**: Gemini 1.5 Flash has a generous free quota — no credit card needed.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home screen
│   ├── onboarding/page.tsx   # API Key setup
│   ├── session/[topic]/      # Flashcard session
│   └── summary/page.tsx      # Session results
├── components/
│   ├── flashcard/
│   │   ├── FlashCard.tsx     # Flip + swipe animation
│   │   └── CardDeck.tsx      # Queue manager
│   └── ui/
│       └── SettingsModal.tsx # Bottom sheet settings
├── lib/
│   ├── gemini.ts             # Gemini API client
│   ├── knowledge-base.ts     # IELTS study material
│   └── storage.ts            # localStorage helpers
├── store/
│   └── useAppStore.ts        # Zustand global state
└── types/
    └── index.ts              # Shared TypeScript types
```

---

## 📸 Screenshots

| Home Screen | Flashcard Session | Summary |
|-------------|------------------|---------|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| State | Zustand v4 + localStorage |
| AI | Google Gemini 1.5 Flash |
| Icons | Lucide React |
| Font | Inter (Google Fonts) |
