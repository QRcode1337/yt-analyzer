# 🚀 Vercel Deployment Guide

## Prerequisites Checklist

- [x] Vercel CLI installed (v41.6.0)
- [x] Tests passing (50/50)
- [x] vercel.json configured
- [ ] Environment variables ready
- [ ] Database migrations applied
- [ ] Supabase project set up

---

## 📋 Required Environment Variables

You need these environment variables before deploying:

### Database (Supabase)
```bash
DATABASE_URL="postgresql://..."           # Supabase pooled connection
DIRECT_DATABASE_URL="postgresql://..."    # Supabase direct connection
NEXT_PUBLIC_SUPABASE_URL="https://..."    # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."    # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY="eyJ..."        # Service role key (secret!)
```

### External APIs
```bash
OPENAI_API_KEY="sk-..."                   # OpenAI API key
YOUTUBE_API_KEY="AIza..."                 # YouTube Data API v3 key
```

### Inngest (Background Jobs)
```bash
INNGEST_EVENT_KEY="..."                   # Inngest event key (optional for dev)
INNGEST_SIGNING_KEY="signkey-..."         # Inngest signing key
```

---

## 🔧 Step 1: Prepare Environment Variables

### Option A: Use the Helper Script
```bash
# Create .env.production file
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

### Option B: Manual Setup
Create a `.env.production` file with all required variables.

---

## 🚀 Step 2: Deploy to Vercel

### First-Time Deployment

```bash
# Login to Vercel (if not already)
vercel login

# Link project to Vercel (creates new project)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account/team]
# - Link to existing project? No
# - Project name? yt-analyzer
# - Directory? ./
# - Override settings? No

# This creates a preview deployment
```

### Set Environment Variables

```bash
# Option 1: Via CLI (recommended for secrets)
vercel env add DATABASE_URL production
vercel env add DIRECT_DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add YOUTUBE_API_KEY production
vercel env add INNGEST_EVENT_KEY production
vercel env add INNGEST_SIGNING_KEY production

# Option 2: Via Vercel Dashboard
# 1. Go to: https://vercel.com/dashboard
# 2. Select your project
# 3. Go to Settings > Environment Variables
# 4. Add each variable for "Production" environment
```

### Deploy to Production

```bash
# Deploy to production
vercel --prod

# Your app will be live at:
# https://yt-analyzer.vercel.app (or your custom domain)
```

---

## 🗄️ Step 3: Run Database Migrations

After first deployment, run migrations on production database:

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## 🔍 Step 4: Verify Deployment

### Check Deployment Status
```bash
# List deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

### Test Your Deployment
1. Visit your deployment URL
2. Try ingesting a YouTube video
3. Check if analysis runs successfully
4. Verify all 8 analysis sections generate

### Monitor Performance
- Check Vercel Analytics: https://vercel.com/analytics
- Monitor function logs: https://vercel.com/logs
- Check error tracking (if Sentry is set up)

---

## 🔄 Subsequent Deployments

After initial setup, deploying is easy:

```bash
# Make changes to your code
git add .
git commit -m "feat: add new feature"
git push

# Deploy to production
vercel --prod

# Or just push to main branch (auto-deploys if connected to Git)
```

---

## 🌐 Custom Domain Setup (Optional)

### Add Custom Domain
```bash
# Add domain via CLI
vercel domains add yourdomain.com

# Or via dashboard:
# 1. Project Settings > Domains
# 2. Add domain
# 3. Configure DNS records as shown
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs
vercel logs [deployment-url] --follow

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Prisma client not generated
```

### Fix: Redeploy
```bash
# Force rebuild
vercel --prod --force
```

### Database Connection Issues
```bash
# Verify DATABASE_URL is set correctly
# Check Supabase connection pooling is enabled
# Ensure IP allowlist includes Vercel IPs (or set to 0.0.0.0/0)
```

### Inngest Not Working
```bash
# Register your production deployment with Inngest
# 1. Go to Inngest dashboard
# 2. Add app
# 3. Set endpoint: https://your-app.vercel.app/api/inngest
# 4. Add signing key to Vercel env vars
```

---

## 📊 Deployment Checklist

- [ ] All tests passing locally (`npm run test:run`)
- [ ] Environment variables configured in Vercel
- [ ] Database migrations applied to production DB
- [ ] Supabase project configured and accessible
- [ ] YouTube API key has sufficient quota
- [ ] OpenAI API key has billing enabled
- [ ] Inngest configured (if using background jobs)
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled in Vercel dashboard
- [ ] Error monitoring set up (optional)

---

## 🎯 Post-Deployment

### Monitor Your App
- **Vercel Analytics**: Track performance metrics
- **Function Logs**: Monitor API routes and background jobs
- **Error Tracking**: Set up Sentry for production errors

### Optimize Performance
- Check Lighthouse scores
- Monitor Core Web Vitals
- Review function execution times
- Optimize cold starts

### Set Up Alerts
- Configure deployment notifications
- Set up error alerts
- Monitor API quota usage (YouTube, OpenAI)

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** (already in .gitignore)
2. **Use different API keys** for production vs development
3. **Enable rate limiting** on Vercel
4. **Monitor API usage** to prevent unexpected costs
5. **Rotate secrets** periodically (every 90 days)
6. **Review Vercel security settings** regularly

---

## 💰 Cost Estimation

### Vercel
- **Hobby Plan**: Free (generous limits)
- **Pro Plan**: $20/month (if you need more)

### External Services
- **Supabase**: Free tier available ($0-25/month)
- **OpenAI**: Pay-per-use (~$0.01-0.03 per analysis)
- **YouTube API**: Free (10,000 quota/day)
- **Inngest**: Free tier available

**Estimated monthly cost**: $0-50 depending on usage

---

## 📞 Support

- **Vercel Support**: https://vercel.com/support
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Ready to deploy?** Follow the steps above and your app will be live in minutes! 🚀
