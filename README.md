# CareerForge - AI-Powered Career Intelligence

CareerForge analyzes your resume against job descriptions with surgical precision — detecting skill gaps, optimizing your CV, and building a personalized learning roadmap. It cross-references your GitHub profile to validate technical claims and provide integrity-based assessments.

## ✨ Features

- **Smart CV Analysis** - Auto-detects Fresher vs Experienced and scores your resume against the target role
- **Precision Matching** - Compares your skills with JD requirements and cross-references GitHub activity
- **Technical Integrity Audit** - Validates your technical claims using real GitHub repository evidence
- **Growth Roadmap** - Generates a phased learning plan with curated resources to close skill gaps
- **GitHub Validation** - Analyzes your repositories for testing maturity, DevOps practices, and architectural complexity

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier works)
- Lovable AI account (for AI gateway access)
- (Optional) GitHub Personal Access Token for higher rate limits

### 1. Clone and Install

```bash
cd career-compass-ai
npm install
# or if you have bun
bun install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# AI Configuration
LOVABLE_API_KEY=your-lovable-api-key

# Optional: GitHub Token (increases rate limit from 60 to 5000 req/hour)
GITHUB_TOKEN=ghp_your_github_token

# Optional: Custom AI Model
AI_MODEL=google/gemini-3-flash-preview
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migrations:

```bash
# Option A: Use Supabase CLI
supabase db push

# Option B: Copy-paste from supabase/migrations/*.sql files
```

The migrations create:
- `user_analyses` table with RLS policies
- Indexes for performance
- Proper security policies

### 4. Deploy Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy analyze-career-profile
```

### 5. Run Development Server

```bash
npm run dev
# or
bun run dev
```

Visit `http://localhost:5173` (or the port shown in terminal).

## 📁 Project Structure

```
career-compass-ai/
├── src/
│   ├── components/       # React components (ui/, ResumeUpload, etc.)
│   ├── pages/            # Route pages (Index, Dashboard, Results, Auth)
│   ├── hooks/            # Custom hooks (useAuth, use-toast)
│   ├── integrations/     # Supabase client
│   ├── types/            # TypeScript types
│   └── lib/              # Utility functions
├── supabase/
│   ├── functions/        # Edge functions (analyze-career-profile)
│   └── migrations/       # Database migrations
├── .env.example          # Environment variables template
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon/public key |
| `LOVABLE_API_KEY` | ✅ | Lovable AI gateway API key |
| `GITHUB_TOKEN` | ❌ | GitHub PAT (increases rate limits) |
| `AI_MODEL` | ❌ | AI model to use (default: gemini-3-flash) |

### Getting Your Keys

**Supabase:**
1. Go to your project settings → API
2. Copy the `URL` and `anon public` key

**Lovable AI:**
1. Visit your Lovable workspace
2. Go to Settings → AI Configuration
3. Generate/copy your API key

**GitHub Token (Optional):**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Copy and add to `.env`

## 📊 Database Schema

The app uses a single table `user_analyses`:

```sql
CREATE TABLE user_analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  resume_text TEXT,
  jd_text TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  analysis_result JSONB,
  created_at TIMESTAMP
);
```

Row Level Security (RLS) ensures users can only access their own data.

## 🧪 Testing

```bash
npm run test
# or
bun run test
```

## 🏗️ Building for Production

```bash
npm run build
# or
bun run build
```

Output will be in the `dist/` directory.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** shadcn/ui, Tailwind CSS, Framer Motion
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **AI:** Lovable AI Gateway (Gemini, Claude, etc.)
- **State:** React Query (@tanstack/react-query)
- **Forms:** React Hook Form + Zod validation

## 📝 API Endpoints

### Edge Function: `analyze-career-profile`

**Input:**
```json
{
  "resumeText": "string",
  "jobDescription": "string (optional)",
  "githubUrl": "string (optional)",
  "linkedinUrl": "string (optional)"
}
```

**Output:**
```json
{
  "analysis": {
    "classification": "Fresher|Experienced",
    "resume_score": 0-100,
    "summary": "string",
    "critical_gaps": [...],
    "verified_github_skills": [...],
    "technical_footprint": [...],
    "technical_validation": {...},
    "cv_refinement_suggestions": [...],
    "detailed_roadmap": {...}
  }
}
```

## 🐛 Troubleshooting

**PDF parsing not working:**
- Make sure `pdfjs-dist` is installed: `npm install pdfjs-dist`
- Check browser console for worker loading errors

**GitHub rate limit errors:**
- Add a `GITHUB_TOKEN` to your `.env` file
- Without a token, you're limited to 60 requests/hour

**Edge function returns 400:**
- Check that `LOVABLE_API_KEY` is set in Supabase secrets
- Run: `supabase secrets set LOVABLE_API_KEY=your_key`

**Auth not working:**
- Verify your Supabase URL and anon key are correct
- Check that RLS policies are enabled

## 📄 License

This project is private. All rights reserved.

## 🤝 Contributing

This is a personal project. For questions or issues, contact the maintainer.

---

**Built with ❤️ using Lovable**
