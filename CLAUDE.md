# CLAUDE.md — Draw It!

## Project Overview
Draw It! is a level-based kids drawing game that teaches how to draw. Players are shown a reference image, draw it on a canvas, and receive AI-powered feedback with star ratings and encouragement.

## Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Auth + DB:** Supabase (existing project `ijusthxxbsjwetoijhrm`)
- **AI:** OpenAI GPT-4o (vision — reviews canvas drawings)
- **Canvas:** HTML5 Canvas (or Fabric.js if complexity requires)
- **Hosting:** Netlify — auto-deploy from GitHub `main` branch

## Deployment
- **Deploy via `git push` only** — never `netlify deploy --prod` (causes CDN chunk hash mismatches)
- GitHub repo: `taramccann83/draw-it`
- Netlify auto-deploys on push to `main`

## Project Structure
```
draw-it/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login / signup
│   ├── (game)/           # Level select, drawing screen, review screen
│   ├── multiplayer/      # Multiplayer setup and results
│   ├── profile/          # User profile + stats
│   └── layout.tsx
├── components/           # Shared UI components
│   ├── canvas/           # Drawing canvas + tools
│   ├── game/             # Level cards, star ratings, feedback
│   └── ui/               # Buttons, modals, etc.
├── lib/
│   ├── supabase/         # Supabase client + helpers
│   ├── openai/           # GPT-4o drawing review logic
│   └── levels/           # Level data and config
├── public/
│   └── reference-images/ # Reference drawings per level
└── design-system/        # Design tokens and MASTER.md
```

## Supabase
- Project ref: `tpdotqfespbqispwcwus` (shared with Lumira Studio)
- Connection: `aws-0-us-east-1.pooler.supabase.com:6543`
- SSL required
- `schema.sql` is a reference file — must manually apply migrations to live DB
- Supabase REST API silently ignores writes to nonexistent columns — always verify columns exist when debugging save issues

## Key Tables (planned)
- `profiles` — display name, avatar, total stars
- `level_progress` — user_id, level_id, stars_earned, completed_at
- `game_sessions` — multiplayer session state

## AI Drawing Review
- Canvas is exported as a PNG (base64) and sent to OpenAI GPT-4o (vision)
- Prompt includes: level name, reference image description, kid's drawing image
- GPT-4o responds with: `{ stars: 1|2|3, message: string, tip: string | null }`
- Tone: warm, encouraging, age-appropriate for all ages

## Level System
- Levels defined in `lib/levels/index.ts`
- Each level has: id, title, difficulty (easy/medium/hard), reference image path, description for AI prompt
- Levels unlock sequentially; progress saved per user in Supabase

## Multiplayer (Pass-and-Play)
- Up to 4 players, same device
- Player names set at session start
- Stars tallied per round; winner shown at end

## Game Rules (shown at start)
1. No cheating — don't look at a photo
2. No passing — you have to try your best, don't hand it off
3. Be confident — your drawing doesn't have to be perfect

## Working With This Project
- Tara is not a developer — keep explanations clear and non-technical
- Give terminal commands one at a time
- Always check for existing components/patterns before creating new ones
- Mobile-first design — this is primarily a touch/phone experience
