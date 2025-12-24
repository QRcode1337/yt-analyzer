---
name: HitClone Video Analyzer Build
overview: "Build a Next.js 14 video analysis tool that clones the HitClone UX: ingest YouTube videos, analyze transcripts with AI, and render tabbed breakdowns (Hero's Journey, Emotion, Money Shots, etc.) using a design system of pill tabs, soft cards, and badges."
todos:
  - id: security-setup
    content: Create .env.example, .gitignore, and README with security guidelines. Audit for exposed secrets.
    status: completed
  - id: design-primitives
    content: "Build UI primitives: PillTabs, Card, BadgePill, StatPill, ScoreBar, SectionHeader matching screenshot styles."
    status: completed
  - id: database-schema
    content: Create Prisma schema with Video, Transcript, Analysis, AnalysisSection models. Set up Supabase connection.
    status: completed
  - id: youtube-ingest
    content: "Implement /api/videos/ingest endpoint: extract YouTube ID, fetch metadata, store Video, create Analysis."
    status: completed
    dependencies:
      - database-schema
  - id: transcript-input
    content: Add transcript paste/upload UI and API endpoint. Store transcript and block analysis until present.
    status: completed
    dependencies:
      - database-schema
  - id: inngest-setup
    content: Configure Inngest for background analysis jobs. Create function to generate sections and update status.
    status: completed
    dependencies:
      - database-schema
      - transcript-input
  - id: analysis-schemas
    content: Define Zod schemas for all 8 section types matching HitClone structure (Hero Journey, Emotion, Money Shots, etc.).
    status: completed
  - id: analysis-prompts
    content: Create OpenAI prompt templates for each section type with strict JSON-only instructions and retry logic.
    status: completed
    dependencies:
      - analysis-schemas
  - id: tab-rendering
    content: Build all 8 tab components using design primitives, rendering validated JSON into card layouts matching screenshots.
    status: completed
    dependencies:
      - design-primitives
      - analysis-schemas
  - id: export-blueprint
    content: Implement /api/analysis/[id]/export endpoint generating Strangest Times episode outline in markdown.
    status: completed
    dependencies:
      - tab-rendering
---

# Build HitClone-like Video Analysis Tool

Build a Next.js 14 app that replicates the HitClone video analysis UX shown in the screenshots. The app will ingest YouTube videos, analyze transcripts with OpenAI, and render structured breakdowns across multiple tabs.

## Architecture Overview

```javascript
User → Paste YouTube URL → Fetch Metadata → Add Transcript → 
Run Analysis (Inngest) → Render Tabbed Breakdown → Export Blueprint
```

**Tech Stack:**

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for styling
- Supabase Postgres (database)
- Prisma (ORM)
- Inngest (background jobs)
- OpenAI API (analysis generation)
- Vercel (deployment)

## Phase 0: Security & Setup

**Files to create:**

- `.env.example` - Template with all required env vars
- `.gitignore` - Ensure `.env*` is ignored
- `README.md` - Setup instructions + secret rotation steps

**Environment variables:**

- `DATABASE_URL` - Supabase Postgres connection string
- `OPENAI_API_KEY` - OpenAI API key
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `INNGEST_EVENT_KEY` - Inngest event key (optional for local dev)
- `INNGEST_SIGNING_KEY` - Inngest signing key

**Acceptance:** No secrets in repo, `.env.example` documents all required vars.

## Phase 1: Design System Primitives

**Files to create:**

- `components/ui/PillTabs.tsx` - Tab navigation (inactive: light gray, active: near-black)
- `components/ui/Card.tsx` - Soft cards with large radius, hairline borders, whitespace
- `components/ui/BadgePill.tsx` - Colored pills ("High Impact", "Information-complementary")
- `components/ui/StatPill.tsx` - Stats display (views, likes, comments, runtime)
- `components/ui/ScoreBar.tsx` - Progress bar (e.g., "SEO Potential 90/100")
- `components/ui/SectionHeader.tsx` - Small caps label + large title

**Styling approach:**

- Match screenshot spacing: generous padding, centered max-width layout
- Pill tabs: `rounded-full`, inactive `bg-gray-100 text-gray-700`, active `bg-gray-900 text-white`
- Cards: `rounded-2xl`, `border border-gray-200`, large padding
- Typography: Match screenshot hierarchy (small caps labels, bold titles)

**Acceptance:** Static page renders matching screenshot layout and spacing.

## Phase 2: Database Schema

**File:** `prisma/schema.prisma`**Models:**

```prisma
model Video {
  id          String   @id @default(cuid())
  youtubeId   String   @unique
  title       String
  channel     String
  thumbnailUrl String?
  duration    Int      // seconds
  viewCount   Int?
  likeCount   Int?
  commentCount Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  transcript  Transcript?
  analyses    Analysis[]
}

model Transcript {
  id        String   @id @default(cuid())
  videoId   String   @unique
  video     Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  source    String   // "manual" | "youtube" | "upload"
  text      String   @db.Text
  createdAt DateTime @default(now())
}

model Analysis {
  id        String   @id @default(cuid())
  videoId   String
  video     Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  status    AnalysisStatus @default(PENDING)
  error     String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  sections  AnalysisSection[]
}

enum AnalysisStatus {
  PENDING
  RUNNING
  DONE
  FAILED
}

model AnalysisSection {
  id         String      @id @default(cuid())
  analysisId String
  analysis   Analysis    @relation(fields: [analysisId], references: [id], onDelete: Cascade)
  type       SectionType
  json       Json        // Validated Zod output
  markdown   String?     @db.Text // Optional formatted text
  createdAt  DateTime    @default(now())
  
  @@index([analysisId, type])
}

enum SectionType {
  OVERVIEW
  HEROS_JOURNEY
  EMOTION_ROLLERCOASTER
  MONEY_SHOTS
  TITLE_DECODE
  THUMBNAIL_XRAY
  CONTENT_HIGHLIGHTS
  FULL_ARTICLE
}
```

**Files to create:**

- `prisma/seed.ts` - Optional seed script for testing
- `lib/prisma.ts` - Prisma client singleton

**Acceptance:** `npx prisma migrate dev` works, connection to Supabase verified.

## Phase 3: YouTube Ingestion

**File:** `app/api/videos/ingest/route.ts`**Flow:**

1. Extract YouTube ID from URL (handle various formats: `youtube.com/watch?v=`, `youtu.be/`, etc.)
2. Fetch metadata via YouTube Data API v3 (`snippet`, `contentDetails`, `statistics`)
3. Upsert `Video` record
4. Create `Analysis` with `PENDING` status
5. Return `{ videoId, analysisId }`

**Dependencies:**

- `googleapis` package for YouTube API
- URL parsing utility: `lib/utils/youtube.ts`

**Acceptance:** POST to `/api/videos/ingest` with YouTube URL returns IDs and navigates to analysis page.

## Phase 4: Transcript Input

**Files:**

- `app/api/videos/[videoId]/transcript/route.ts` - POST endpoint
- `components/TranscriptInput.tsx` - Paste/upload UI

**Features:**

- Textarea for manual paste
- File upload (`.txt`, `.srt`, `.vtt`)
- Store in `Transcript` table
- Block analysis until transcript exists

**Acceptance:** Transcript saved, UI shows status, analysis button enabled when transcript exists.

## Phase 5: Background Analysis with Inngest

**Files:**

- `inngest/functions/analyze-video.ts` - Inngest function
- `app/api/analysis/[id]/run/route.ts` - Trigger endpoint
- `app/api/inngest/route.ts` - Inngest webhook handler

**Flow:**

1. User clicks "Run Analysis"
2. POST `/api/analysis/[id]/run `updates status to `RUNNING` and triggers Inngest event
3. Inngest function:

- Fetches video + transcript
- Generates each section via OpenAI (with retries on schema failure)
- Validates with Zod schemas
- Saves `AnalysisSection` records
- Updates `Analysis` status to `DONE`

**Dependencies:**

- `inngest` package
- OpenAI SDK
- Zod schemas (Phase 6)

**Acceptance:** No Vercel timeout errors, analysis progresses through statuses, sections saved.

## Phase 6: Analysis Section Schemas & Prompts

**Files:**

- `lib/schemas/analysis-schemas.ts` - Zod schemas for each section
- `lib/prompts/section-prompts.ts` - OpenAI prompt templates

**Schemas to define:**

- `HeroJourneySchema` - 6 beats with title, subtitle, timeRange, bullets
- `EmotionDecoderSchema` - coreShift, pillars array
- `TitleDecodeSchema` - corePattern, formula, remixes, seoScore
- `ThumbnailXRaySchema` - elements, composition, promise, improvements
- `MoneyShotsSchema` - cpmRange, revenueProjection, breakpoints array
- `ContentHighlightsSchema` - key moments array
- `FullArticleSchema` - markdown content

**Prompt strategy:**

- Include video metadata (title, channel, duration, stats)
- Include relevant transcript excerpts
- Strict "JSON only" system instructions
- One retry on schema validation failure

**Acceptance:** LLM outputs validate against schemas, or retry with schema fix instructions.

## Phase 7: Tab Rendering

**Files:**

- `app/analysis/[id]/page.tsx` - Main analysis page with tabs
- `components/analysis/OverviewTab.tsx`
- `components/analysis/HerosJourneyTab.tsx`
- `components/analysis/EmotionTab.tsx`
- `components/analysis/MoneyShotsTab.tsx`
- `components/analysis/TitleDecodeTab.tsx`
- `components/analysis/ThumbnailXRayTab.tsx`
- `components/analysis/ContentHighlightsTab.tsx`
- `components/analysis/FullArticleTab.tsx`

**Tab structure (from screenshots):**

- **Overview:** Two large cards (Title Decode + Thumbnail X-Ray) + Hero's Journey summary strip
- **Hero's Journey:** 6-card grid with icons, titles, time ranges, bullets
- **Emotion Rollercoaster:** Large title + subtitle + "Core Emotion Shift" banner + 3 cards (Cynicism, Shock, Hope)
- **Money Shots:** Projected revenue card + CPM badges + placement timestamps
- **Title Decode:** Core pattern + formula + example remixes + SEO score bar
- **Thumbnail X-Ray:** Elements breakdown + composition + promise description
- **Content Highlights:** Key moments list
- **Full Article:** Formatted markdown

**Acceptance:** Analysis page matches screenshot layout, spacing, and typography.

## Phase 8: Export Blueprint

**File:** `app/api/analysis/[id]/export/route.ts`**Output format (Markdown):**

- Hook script (0-30s)
- Beat map (6 beats from Hero's Journey)
- Title options (A/B test variants from Title Decode)
- Thumbnail concept prompts (from Thumbnail X-Ray)
- CTA + pinned comment suggestions
- Tone: "curious, eerie, skeptical, funny" (Strangest Times style)

**Acceptance:** One click produces recording-ready outline in markdown.

## Implementation Order

1. **Phase 0** - Security setup
2. **Phase 1** - Design primitives (build once, reuse everywhere)
3. **Phase 2** - Database schema
4. **Phase 3** - YouTube ingestion
5. **Phase 4** - Transcript input
6. **Phase 5** - Inngest setup
7. **Phase 6** - Schemas & prompts
8. **Phase 7** - Tab rendering (using primitives from Phase 1)
9. **Phase 8** - Export feature

## Key Design Principles