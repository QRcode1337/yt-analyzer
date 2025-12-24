# YouTube Video Analyzer

A Next.js application that analyzes YouTube videos using AI to generate structured breakdowns including Hero's Journey, Emotion Rollercoaster, Money Shots, and more.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Supabase Postgres** (database)
- **Prisma** (ORM)
- **Inngest** (background jobs)
- **OpenAI API** (analysis generation)
- **Vercel** (deployment)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - Supabase Postgres connection string
- `OPENAI_API_KEY` - OpenAI API key
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `INNGEST_EVENT_KEY` - Inngest event key (optional for local dev)
- `INNGEST_SIGNING_KEY` - Inngest signing key

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security

### Secret Rotation

If you've exposed any OAuth client secrets or API keys:

1. **Immediately revoke** the exposed secret in the respective service dashboard
2. **Generate a new secret** and update your `.env` file
3. **Never commit** `.env` files or secrets to version control
4. **Use environment variables** for all sensitive configuration

### Best Practices

- All secrets should be stored in environment variables
- Never commit `.env` files (already in `.gitignore`)
- Use `.env.example` as a template (without actual secrets)
- Rotate secrets immediately if exposed
- Use different secrets for development and production

## Project Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   └── analysis/          # Analysis pages
├── components/            # React components
│   ├── ui/               # Design system primitives
│   └── analysis/        # Analysis tab components
├── lib/                  # Utilities and helpers
│   ├── schemas/         # Zod validation schemas
│   └── prompts/         # OpenAI prompt templates
├── inngest/             # Inngest background functions
└── prisma/              # Prisma schema and migrations
```

## Features

- **YouTube Video Ingestion** - Paste a YouTube URL to fetch metadata
- **Transcript Management** - Upload or paste video transcripts
- **AI-Powered Analysis** - Generate structured breakdowns:
  - Hero's Journey (6 narrative beats)
  - Emotion Rollercoaster (emotional arc analysis)
  - Money Shots (monetization insights)
  - Title Decode (title pattern analysis)
  - Thumbnail X-Ray (thumbnail composition)
  - Content Highlights (key moments)
  - Full Article (complete breakdown)
- **Export Blueprint** - Generate episode outlines for content creation

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app is optimized for Vercel's serverless functions and uses Inngest for background jobs to avoid timeout issues.

