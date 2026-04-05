# PRD: Draw It! — Kids Drawing Game App

**Version:** 1.0
**Date:** April 5, 2026
**Author:** Tara McCann

---

## Overview

Draw It! is a level-based web game that teaches kids (and adults of all ages) how to draw. Players are shown a reference picture and asked to recreate it on a canvas using simple drawing tools. When done, AI reviews their drawing and gives warm, encouraging feedback along with a star rating and optional improvement tips.

The app supports solo play and same-device pass-and-play multiplayer for up to 4 players.

---

## Problem

Kids want to learn how to draw but often get discouraged when their drawings don't look "right." There's no fun, game-like way to practice drawing that gives real feedback without being harsh.

---

## Goal

Make learning to draw fun, encouraging, and accessible — for kids and adults of all ages — through a progressive level-based game with AI-powered, child-friendly feedback.

---

## Branding

- **App Name:** Draw It!
- **Logo:** A paintbrush icon surrounded by small illustrations of a cat, headphones, and a car
- **Vibe:** Bright, playful, colorful — fun for kids, but not babyish

---

## Game Rules

Shown at the start of every game session:

1. **No cheating!** Don't look at a photo — use your brain and your skills.
2. **No passing!** If it's hard, that's the point. You have to try your best — no switching to someone else.
3. **Be confident!** Your drawing doesn't have to be perfect. Believe in yourself!

---

## Core Gameplay Loop

1. Player is shown a **reference picture** and the prompt: *"Draw this!"*
2. Player **draws on the canvas** using the drawing tools
3. Player taps **"Done"**
4. **AI reviews the drawing** and compares it to the reference image
5. **AI delivers feedback:**
   - A fun, encouraging message (e.g., *"Wow, your cat is so cute! You nailed the ears!"*)
   - **1–3 stars** based on how close the drawing is
   - **1–2 specific, friendly tips** if there's room to improve (e.g., *"Try making the body a little rounder!"*)
6. Player advances to the **next level** or chooses to **retry**

---

## Level System

- Levels are **progressively harder** — simple shapes and objects early on, more complex drawings later
- **Difficulty tags:** Easy / Medium / Hard
- Level categories inspired by logo: animals (cats), everyday objects, vehicles, and more
- Level progress is **saved per user account**
- Levels unlock sequentially — complete a level to unlock the next

---

## Drawing Canvas

The canvas is the heart of the app. Tools available:

| Tool | Description |
|------|-------------|
| Pencil/Pen | Freehand drawing |
| Color Picker | Choose drawing color from a palette |
| Eraser | Fix mistakes |
| Fill / Paint Bucket | Tap to fill a closed area with color |
| Undo / Clear | Nice-to-have for kids who want a fresh start |

---

## AI Feedback

- **Technology:** OpenAI GPT-4o (vision)
- Canvas drawing is exported as a PNG and sent to GPT-4o alongside the level prompt/description
- GPT-4o returns: star rating (1–3), an encouraging message, and an optional improvement tip
- **Tone:** Warm, playful, age-appropriate — suitable for all ages
- Feedback is **never harsh** — always celebrates effort first

---

## Multiplayer (Pass-and-Play)

- Up to **4 players** on the same device
- Players enter their names/nicknames at the start of the session
- Players take turns drawing
- Stars are **tallied per player** throughout the session
- At the end: a fun **winner screen** with star totals

---

## Accounts & Auth

- **Accounts required** to play (to save level progress and star history)
- Auth powered by **Supabase** (existing project)
- Profile stores:
  - Display name
  - Avatar (optional)
  - Level progress
  - Total stars earned

---

## Pages / Screens

| Screen | Description |
|--------|-------------|
| Landing / Home | App intro, logo, Play Solo / Play Multiplayer CTAs |
| Auth | Login / Sign Up via Supabase |
| Rules Screen | 3 rules shown before each game session starts |
| Level Select | Grid of levels — locked/unlocked, star ratings shown |
| Drawing Screen | Reference image + canvas + tools + Done button |
| AI Review Screen | Stars, encouraging message, tips, Next Level / Try Again |
| Multiplayer Setup | Enter player names (up to 4), pick mode, start |
| Multiplayer Results | Final star tally per player, winner announcement |
| Profile | Display name, total stars, level badges, progress stats |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Auth + DB | Supabase (shared with Lumira Studio) |
| AI | OpenAI GPT-4o (vision) |
| Canvas | HTML5 Canvas |
| Hosting | Netlify (auto-deploy from GitHub `main`) |
| Domain | TBD — custom domain to be added after launch |

---

## Out of Scope (v1)

- Online multiplayer (remote play)
- Video drawing tutorials
- Parent dashboard / parental controls
- Global leaderboards
- In-app purchases

---

## Success Metrics

- Kids complete at least 3 levels per session
- Low retry rate on Easy levels (drawing instructions are clear)
- Positive qualitative feedback on the AI encouragement tone
- Sessions played in multiplayer mode (pass-and-play engagement)

---

## Open Questions

- What drawing style should reference images use? (Line art? Cartoon? Illustrated?)
- Should there be a time limit per drawing, or totally open-ended?
- Should the app have sound effects / music?
