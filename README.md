# CareerForge - AI-Powered Career Intelligence

CareerForge analyzes your resume against job descriptions with surgical precision — detecting skill gaps, optimizing your CV, and building a personalized learning roadmap. It cross-references your GitHub profile to validate technical claims and provide integrity-based assessments using the latest Google Gemini AI.

## ✨ Features

- **Smart CV Analysis** - Auto-detects Fresher vs Experienced level and scores your resume against target roles.
- **GitHub Validation** - Analyzes your repositories for testing maturity, DevOps practices, and architectural complexity to verify technical claims.
- **Precision Matching** - Compares your skills with JD requirements and identifies critical gaps.
- **Technical Integrity Audit** - Validates your technical footprint using real repository evidence.
- **Growth Roadmap** - Generates a 3-phase personalized learning plan with curated resources.
- **Local-First** - Performs all analysis on-the-fly with no database required (uses LocalStorage for persistence).

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (using npm)
- **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### 1. Clone and Install

```bash
git clone git@github.com:PriyanshuSingh44/career-compass-ai.git
cd career-compass-ai
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Google Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to start your first analysis.

## 📁 Project Structure

```
career-compass-ai/
├── src/                  # Source code
│   ├── components/       # UI components (shadcn/ui & custom)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Gemini service & utility functions
│   ├── pages/            # Application routes/screens
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles & Tailwind directives
├── public/               # Static assets (images, icons, etc.)
├── .gitignore            # Files to be ignored by Git
├── components.json       # shadcn/ui configuration
├── package.json          # Project dependencies & scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── vitest.config.ts      # Testing configuration
```

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **AI Engine:** Google Gemini 2.0 Flash
- **Styling:** Tailwind CSS, Framer Motion (Animations)
- **Components:** shadcn/ui
- **PDF Processing:** pdfjs-dist
- **State Management:** React Query, LocalStorage

## 🔧 Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | ✅ | Your Google Gemini API key |
| `VITE_GITHUB_TOKEN` | ❌ | GitHub PAT (increases rate limits from 60 to 5000/hr) |

## 🧪 Development

### Building for Production

```bash
npm run build
```
The production-ready files will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

---

**Built with ❤️ for Career Growth**
