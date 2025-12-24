import type {
  HeroJourney,
  EmotionDecoder,
  TitleDecode,
  ThumbnailXRay,
  MoneyShots,
  ContentHighlights,
  FullArticle,
  Overview,
} from '@/lib/schemas/analysis-schemas'

interface VideoMetadata {
  title: string
  channel: string
  duration: number // seconds
  thumbnailUrl?: string | null
  viewCount?: number | null
  likeCount?: number | null
  commentCount?: number | null
}

interface PromptContext {
  video: VideoMetadata
  transcript: string
  transcriptExcerpt?: string // relevant excerpt for this section
}

const SYSTEM_INSTRUCTION = `You are an expert video content analyst. Analyze the provided video content and return ONLY valid JSON matching the specified schema. Do not include any markdown formatting, code blocks, or explanatory text. Return pure JSON only.`

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function getHeroJourneyPrompt(context: PromptContext): string {
  const { video, transcript } = context
  const duration = formatDuration(video.duration)

  return `${SYSTEM_INSTRUCTION}

Analyze the video's narrative structure using the Hero's Journey framework. Identify exactly 6 distinct beats that map to the story arc.

Video Metadata:
- Title: ${video.title}
- Channel: ${video.channel}
- Duration: ${duration}
- Views: ${video.viewCount?.toLocaleString() || 'N/A'}

Transcript:
${transcript.substring(0, 8000)}

Return JSON matching this schema:
{
  "beats": [
    {
      "number": 1,
      "title": "The Setup",
      "subtitle": "optional subtitle",
      "description": "Brief description of this beat",
      "timeRange": { "start": "00:00", "end": "00:40" },
      "bullets": ["key point 1", "key point 2"],
      "icon": "emoji or icon identifier"
    }
    // ... 5 more beats
  ],
  "summary": "optional overall summary"
}

Ensure:
- Exactly 6 beats
- Time ranges are in MM:SS format
- Beats follow a narrative arc (Setup → Conflict → Resolution)
- Each beat has a clear purpose in the story`
}

export function getEmotionDecoderPrompt(context: PromptContext): string {
  const { video, transcript } = context

  return `${SYSTEM_INSTRUCTION}

Analyze the emotional journey of the video. Identify the core emotional shift and key emotional pillars/moments.

Video Metadata:
- Title: ${video.title}
- Channel: ${video.channel}
- Duration: ${formatDuration(video.duration)}

Transcript:
${transcript.substring(0, 8000)}

Return JSON matching this schema:
{
  "coreShift": {
    "from": "Starting emotion (e.g., Cynical Detachment)",
    "to": "Ending emotion (e.g., Empowered Warmth)"
  },
  "description": "Brief description of the emotional arc",
  "pillars": [
    {
      "title": "Emotion name (e.g., CYNICISM, SHOCK, HOPE)",
      "description": "Description of this emotional moment",
      "timeRange": { "start": "00:00", "end": "00:30" },
      "icon": "emoji"
    }
    // ... more pillars
  ]
}

Focus on:
- Clear emotional progression
- Key moments that shift emotion
- How emotions serve the narrative`
}

export function getTitleDecodePrompt(context: PromptContext): string {
  const { video } = context

  return `${SYSTEM_INSTRUCTION}

Analyze the video title's structure, pattern, and SEO potential.

Video Title: "${video.title}"
Channel: ${video.channel}
Views: ${video.viewCount?.toLocaleString() || 'N/A'}

Return JSON matching this schema:
{
  "corePattern": "Pattern description (e.g., Subject + Metaphorical Solution)",
  "formula": "Template formula (e.g., {Complex_Subject} is the {Shortcut_Metaphor} to {Universal_Problem})",
  "explanation": "Why this title works",
  "keywords": ["keyword1", "keyword2"],
  "remixes": ["Example variation 1", "Example variation 2"],
  "seoScore": 90,
  "seoAnalysis": "Detailed SEO analysis",
  "badge": "High Impact" or "Information-complementary" or null
}

Analyze:
- Title structure and pattern
- SEO keyword usage
- Clickability factors
- Remix potential`
}

export function getThumbnailXRayPrompt(context: PromptContext): string {
  const { video } = context

  return `${SYSTEM_INSTRUCTION}

Analyze the video thumbnail's composition, elements, and promise.

Video: ${video.title}
Channel: ${video.channel}
Thumbnail URL: ${video.thumbnailUrl || 'Not provided'}

Return JSON matching this schema:
{
  "composition": "Composition style (e.g., Surreal Avatar + Complexity Background)",
  "description": "What the thumbnail shows and promises",
  "elements": ["element1", "element2", "element3"],
  "promise": "What the thumbnail promises to deliver",
  "emotionalImpact": "Emotional response it triggers",
  "improvements": ["suggestion1", "suggestion2"],
  "badge": "Information-complementary" or null,
  "layout": "Centered" or other,
  "hasText": false
}

Focus on:
- Visual composition
- Information hierarchy
- Emotional appeal
- Click-through potential`
}

export function getMoneyShotsPrompt(context: PromptContext): string {
  const { video, transcript } = context
  const duration = formatDuration(video.duration)

  return `${SYSTEM_INSTRUCTION}

Analyze monetization potential, ad breakpoints, and sponsor appeal.

Video Metadata:
- Title: ${video.title}
- Channel: ${video.channel}
- Duration: ${duration}
- Views: ${video.viewCount?.toLocaleString() || 'N/A'}
- Likes: ${video.likeCount?.toLocaleString() || 'N/A'}

Transcript:
${transcript.substring(0, 6000)}

Return JSON matching this schema:
{
  "estimatedRevenue": {
    "amount": 6378,
    "currency": "USD",
    "description": "Based on Education CPM"
  },
  "cpm": {
    "range": { "min": 4, "max": 12 },
    "category": "Education",
    "description": "CPM analysis"
  },
  "breakpoints": [
    {
      "timestamp": "03:55",
      "type": "Case Study Shift",
      "quote": "Optional quote from transcript",
      "description": "Natural breakpoint description"
    }
  ],
  "placements": [
    {
      "timestamp": "12:58",
      "content": "Product/Book mention",
      "description": "Natural integration point",
      "insight": "Why this works",
      "tag": "RECOMMENDATION SCENE" or "SOLUTION SCENE"
    }
  ],
  "sponsorMagnetism": {
    "audienceSignals": ["signal1", "signal2"],
    "authorityCredentials": ["credential1"],
    "verticalDepth": ["depth indicator"]
  },
  "longTermValue": {
    "evergreenLeverage": "Topic longevity",
    "seriesPotential": "Series expansion potential",
    "quotableInsight": "Shareable quote"
  },
  "revenueProjections": [
    {
      "type": "60-SECOND MENTION",
      "range": { "min": 11725, "max": 35176 },
      "description": "Based on $0.01 - $0.03 per view"
    }
  ]
}

Calculate:
- Estimated ad revenue based on views and category CPM
- Natural breakpoints for mid-roll ads
- Product placement opportunities
- Sponsor appeal factors`
}

export function getContentHighlightsPrompt(context: PromptContext): string {
  const { video, transcript } = context

  return `${SYSTEM_INSTRUCTION}

Identify key moments, quotes, and highlights from the video.

Video: ${video.title}
Channel: ${video.channel}

Transcript:
${transcript.substring(0, 8000)}

Return JSON matching this schema:
{
  "highlights": [
    {
      "timestamp": "05:30",
      "title": "Key moment title",
      "description": "What happens here",
      "type": "Key Moment" or "Quote" or other
    }
    // ... more highlights
  ]
}

Focus on:
- Memorable quotes
- Key insights
- Pivotal moments
- Shareable content`
}

export function getFullArticlePrompt(context: PromptContext): string {
  const { video, transcript } = context

  return `${SYSTEM_INSTRUCTION}

Generate a comprehensive article-style breakdown of the video in markdown format.

Video: ${video.title}
Channel: ${video.channel}

Transcript:
${transcript.substring(0, 10000)}

Return JSON matching this schema:
{
  "markdown": "# Full Article\\n\\nComplete markdown article...",
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content in markdown"
    }
  ]
}

Create:
- Comprehensive analysis
- Well-structured markdown
- Multiple sections
- Actionable insights`
}

export function getOverviewPrompt(context: PromptContext): string {
  const { video, transcript } = context

  return `${SYSTEM_INSTRUCTION}

Generate an overview combining Title Decode, Thumbnail X-Ray, and Hero's Journey summary.

Video: ${video.title}
Channel: ${video.channel}
Thumbnail URL: ${video.thumbnailUrl || 'N/A'}

Transcript:
${transcript.substring(0, 6000)}

Return JSON matching this EXACT schema:
{
  "titleDecode": {
    "corePattern": "Pattern description (e.g., Subject + Metaphorical Solution)",
    "formula": "Template formula (e.g., {Complex_Subject} is the {Shortcut_Metaphor})",
    "explanation": "Why this title works",
    "keywords": ["keyword1", "keyword2"],
    "remixes": ["Example variation 1", "Example variation 2"],
    "seoScore": 85,
    "seoAnalysis": "Detailed SEO analysis",
    "badge": "High Impact"
  },
  "thumbnailXRay": {
    "composition": "Composition description (e.g., Centered Subject + Bold Text)",
    "description": "Detailed description of thumbnail",
    "elements": ["element1", "element2", "element3"],
    "promise": "What the thumbnail promises to viewers",
    "emotionalImpact": "Emotional response triggered",
    "improvements": ["improvement1", "improvement2"],
    "badge": "Information-complementary",
    "layout": "Centered",
    "hasText": true
  },
  "herosJourneySummary": {
    "keyPhrase": "Key phrase from the narrative journey",
    "timeMarker": "00:00 - ${formatDuration(video.duration)}",
    "beats": ["Beat 1 title", "Beat 2 title", "Beat 3 title", "Beat 4 title", "Beat 5 title", "Beat 6 title"]
  }
}

IMPORTANT:
- Provide ALL fields with real values (no placeholders or comments)
- seoScore must be a number between 0-100
- beats array must have exactly 6 strings
- All optional fields should be included with real content
- If thumbnail URL is not available, make educated guesses based on the video title and content`
}

