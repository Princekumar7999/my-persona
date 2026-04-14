Prince Kumar — AI Persona (Chat + Scheduling)
A small Next.js app that exposes an LLM-driven chat persona (Prince Kumar) with integrated scheduling via Cal.com. The app:

Lets users chat with a persona grounded in knowledge.md and GitHub README context.
Checks availability (Cal.com) and books slots through server-side "tools".
Returns human-friendly availability and booking confirmations (no raw JSON in the UI).
Includes resilience for downstream AI and provider errors (retry/backoff and friendly fallbacks).
Uses simple file-based persistence for development (data).

Features
Interactive GenZ-styled chat UI (React + Next.js App Router).
Server-side "tools" exposed to the LLM:
fetchGithubRepo — prefetch README & metadata for grounding answers.
checkAvailability — query Cal.com slots and return human-readable results.
bookCall — create Cal.com bookings with pre-book availability re-check.
Pending-booking flow: when assistant asks for name/email we persist the chosen slot; when user subsequently supplies their name/email we auto-book.
Graceful handling when the LLM (Gemini) is overloaded — returns a friendly message and the UI shows an inline notice.
Small webhook endpoint to record Cal.com webhooks (dev only).

Quick architecture 
User → Browser (app/page.tsx)
→ POST /api/chat (app/api/chat/route.ts)
→ server adds system prompt + tools
→ calls LLM (generateText via Google Gemini)
→ LLM may call server tools (checkAvailability / bookCall)
→ Server proxies to Cal.com (slots / bookings)
→ Server formats responses, persists bookings, returns human-readable reply
Browser renders assistant text and special notices (e.g., Gemini busy).

Prerequisites
Node.js 18+ (match your production host)
npm (or yarn/pnpm)
Cal.com account and API key (for bookings)
Google Generative AI API key (if you use the Gemini model)
Optional: GitHub token for fetching private/ratelimited repo metadata
Never commit secrets. This repo ignores .env*. Use your host's environment settings for production.

Environment variables

GOOGLE_GENERATIVE_AI_API_KEY=... # Google GenAI API key (Gemini)
CAL_API_KEY=... # Cal.com API key
API_API_KEY=... # (optional) other API key
DEFAULT_EVENT_TYPE_ID=5339335 # event type used for bookings (optional; set to your event type)
DEFAULT_TIMEZONE=Asia/Kolkata # default timezone for attendees (optional)
GITHUB_TOKEN=... # optional, used for GitHub README prefetch (increase rate limits)

Install & run (local)
# install
npm install

# run dev server
npm run dev

# visit
http://localhost:3000

Notes:

If Cal.com responds with a 400 such as “User either already has booking at this time or is not available”, the server surfaces that as a concise plain-text error.
The UI prefers humanReadable strings produced by the server for availability results.


Important files
page.tsx — React chat UI (renders messages, formats availability & bookings, inline Gemini busy notice).
route.ts — main server API:
builds system prompt and tools object
calls generateText
handles tool outputs and booking persistence
pending-booking auto-book flow and availability re-checks
route.ts — Cal.com webhook receiver (dev-only).
data/bookings.json, pending_booking.json, data/cal_webhooks.json — development persistence (gitignored).

Handling Gemini/API downtime (what we did)
The app previously surfaced unhandled exceptions as HTTP 500 when Gemini returned 503s (high demand).
We added a try/catch around the LLM call and now return a friendly plain-text message:
"The AI service is temporarily unavailable. Please try again in a few moments."

The client detects this text and shows an inline yellow notice:
"This response indicates the Gemini API is currently experiencing high traffic. Please try again after some time."

Recommended longer-term: exponential backoff with jitter, circuit breaker, and a cached fallback model or templated replies for critical flows.

Deployment notes
Deploy to Vercel/Netlify/Render and set env vars in your host's dashboard (never push .env.local to Git).
Ensure your deployment pipeline builds from the repository and branch you expect (we pushed changes to main in the demo).
If deployment serves an older UI:
Confirm branch/commit used by the host
Clear build cache / redeploy
Check deployment logs for runtime errors (missing env variables or external API timeouts)
Security & operational notes
Do not commit .env.local or other secret files. Rotate keys immediately if leaked.
In production, move from file-based persistence to a database (Postgres, DynamoDB, etc.).
Implement webhook signature verification to ensure received webhooks are authentic.
Add idempotency keys for booking requests to avoid double-booking when retrying.


Troubleshooting
Local 500 on /api/chat — check server logs. If caused by Gemini 503, you'll see:
The route now returns a friendly message; redeploy picks up the change.
Booking 400 from Cal.com — provider says attendee or host not available. Re-check event type id, timezone, and attendee existing bookings.
Files not appearing on deployment — ensure you pushed the correct branch and that .gitignore matches intent.
Next steps / improvements (suggested)
Replace dev persistence with a transactional DB and TTL for pending bookings.
Add webhook verification and queue processing for booking webhooks.
Add a one-click booking UI to reduce race windows.
Add instrumentation/metrics for AI 5xx rates and booking failures.
Add unit/integration tests for the booking flow and tool handlers.

Contributing
Open PRs against main (or a feature branch). Don't include secrets.
If you add features that require env vars, update this README's env section and add a sample .env.example (do not include values).
License
MIT © Prince Kumar


