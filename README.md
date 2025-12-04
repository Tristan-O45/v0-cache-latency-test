# Cache Latency Reproduction App

A minimal Next.js app to compare latency between direct external fetches and `unstable_cache` reads under parallel load, with Vercel Observability integration.

## Purpose

This app helps you observe the performances differences between:
1. **Direct fetches** - 70 parallel requests to an external API with no caching
2. **unstable_cache** - 70 parallel requests using Next.js's `unstable_cache` wrapper
bgdhs
## Local Development

\`\`\`bash
# Install dependencies
npm insta

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing Locally

1. Click **"Run no-cache test"** - This makes 70 direct fetch calls
2. Click **"Run unstable_cache test"** - First run will populate cache, second run will use cache
3. Compare the `totalDurationMs` values returned

## Deploy to Vercel

\`\`\`bash
# Deploy using Vercel CLI
vercel

# Or push to GitHub and connect via Vercel dashboard
\`\`\`

## Observability Testing (On Vercel)

After deploying to Vercel:

1. **Initial test run:**
   - Visit your deployed app URL
   - Click **"Run no-cache test"** once
   - Click **"Run unstable_cache test"** once
   - Wait for both to complete

2. **Second test run (to see cache hits):**
   - Click **"Run unstable_cache test"** again
   - Note the faster response time

3. **Check Vercel Observability:**
   - Go to your Vercel project dashboard
   - Navigate to **Observability** → **Functions**
   - Find the function invocations for:
     - `/api/no-cache-burst`
     - `/api/cache-burst`

4. **What to observe:**
   
   **For `/api/no-cache-burst`:**
   - Every invocation shows ~70 external API calls to `httpbin.org`
   - No caching behavior
   - Consistent latency across runs
   
   **For `/api/cache-burst` (first run):**
   - Shows ~70 external API calls to `httpbin.org`
   - Shows Data Cache **writes** (70 entries)
   - Higher latency due to cache population
   
   **For `/api/cache-burst` (subsequent runs):**
   - Shows Data Cache **reads** (70 entries)
   - Minimal or zero external API calls
   - Lower latency due to cache hits

## Project Structure

\`\`\`
cache-latency-repro/
├── app/
│   ├── api/
│   │   ├── no-cache-burst/
│   │   │   └── route.ts          # Direct fetch endpoint
│   │   └── cache-burst/
│   │       └── route.ts           # unstable_cache endpoint
│   ├── layout.tsx
│   └── page.tsx                   # Simple UI with test buttons
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
\`\`\`

## Key Implementation Details

- Both routes use `runtime = 'nodejs'` to ensure they're serverless functions (not Edge)
- Each route processes 70 parallel requests to `https://httpbin.org/delay/0`
- `unstable_cache` is configured with a 1-hour revalidation period
- Console logs include timestamps for cross-referencing with Vercel logs
- No styling or complex UI - this is strictly for backend observability testing

## Expected Results

**Typical latency patterns:**
- **no-cache**: 2000-5000ms (depends on httpbin.org response time × 70 parallel)
- **cache-burst (first run)**: Similar to no-cache + cache write overhead
- **cache-burst (subsequent runs)**: 50-200ms (reading from Data Cache)

**Note:** Actual times vary based on network conditions and Vercel region.

## Troubleshooting

If you don't see cache behavior:
- Ensure you're testing on Vercel (not localhost) for full Data Cache support
- Wait a few minutes for Observability data to appear
- Check that cookies/headers aren't causing cache misses

## Clean Up

To reset the cache:
- Redeploy the app, or
- Wait for the 1-hour revalidation period, or
- Modify the cache key in `route.ts`
