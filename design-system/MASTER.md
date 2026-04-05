# Draw It! — Design System

Source: Stitch design, "Draw It! Home Screen - Rainbow Edition"
Screenshot saved at: `stitch-home-screenshot.png`

---

## Brand

- **App name:** Draw It!
- **Tagline:** Let's Create
- **Logo file:** `public/logo.png` — paintbrush with rainbow paint splash (pink, yellow, blue)
- **Logo usage:** Use the PNG logo. Do not recreate with icons.
- **Vibe:** Sketchbook energy — playful, colorful, creative, all ages

### Logo Colors (extracted from logo.png)
| Color | Hex | Element |
|-------|-----|---------|
| Sky blue | `#4BBFE8` | Brush handle, paint splash |
| Hot pink | `#F2397B` | Paint splash, bristles |
| Golden yellow | `#F5B830` | Ferrule (metal band), paint drops |
| Deep pink | `#D4246A` | Shadow tones in pink paint |
| Light blue | `#7ED4F0` | Highlight on brush handle |

These colors inform the brand palette — use them for accents, gradients, and highlights throughout the app.

---

## Colors

All colors are defined as Tailwind custom tokens.

### Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#bb0056` | Brand color, logo, active states, CTAs |
| `secondary` | `#7c5800` | Secondary text, accents |
| `secondary-fixed-dim` | `#ffba20` | Golden yellow — gradient pair with primary |
| `tertiary` | `#006688` | Teal — Play With Friends button, icons |
| `background` | `#faf9f8` | Page background |
| `surface` | `#faf9f8` | Card/surface background |
| `surface-container-lowest` | `#ffffff` | White cards |
| `surface-container` | `#eeeeed` | Dividers, nav hover |
| `surface-container-high` | `#e9e8e7` | Gallery thumbnails |
| `on-surface` | `#1a1c1c` | Primary text |
| `on-surface-variant` | `#474747` | Secondary/muted text |
| `outline` | `#777777` | Borders |
| `primary-container` | `#ffd9e0` | Light pink backgrounds |
| `secondary-container` | `#ffdea8` | Light amber backgrounds |
| `tertiary-container` | `#c2e8ff` | Light teal backgrounds |
| `error` | `#ba1a1a` | Error states |

### Gradients

| Name | Value | Used On |
|------|-------|---------|
| Brand gradient | `from-[#bb0056] to-[#ffba20]` | Logo text, active nav pill |
| Solo gradient | `from-primary via-[#d946ef] to-[#8b5cf6]` | Play Solo button border |
| Friends gradient | `from-[#006688] via-[#06b6d4] to-[#10b981]` | Play With Friends button border |

---

## Typography

**Single font family throughout:** Plus Jakarta Sans

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
```

| Role | Class | Weight |
|------|-------|--------|
| App name / logo | `text-3xl font-black font-headline tracking-tight` | 900 |
| Hero heading | `text-4xl md:text-5xl font-black font-headline leading-tight tracking-tight` | 900 |
| Section heading | `text-2xl font-extrabold font-headline` | 800 |
| Button label | `text-2xl font-black font-headline` | 900 |
| Body copy | `text-lg leading-relaxed` | 400 |
| Nav label | `text-[10px] font-bold uppercase tracking-widest` | 700 |

**Tailwind config:**
```js
fontFamily: {
  headline: ["Plus Jakarta Sans"],
  body: ["Plus Jakarta Sans"],
  label: ["Plus Jakarta Sans"],
}
```

---

## Border Radius

```js
borderRadius: {
  DEFAULT: "1rem",   // 16px — standard cards
  lg: "2rem",        // 32px — larger cards
  xl: "3rem",        // 48px — bottom nav, modal sheets
  full: "9999px",    // pills, avatar, nav active indicator
}
```

---

## Background

### Sketchbook Dot Grid
Applied to `<body>` — gives the paper/sketchbook feel:

```css
.sketchbook-bg {
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 32px 32px;
}
```

Background color: `#faf9f8` (off-white, not pure white)

---

## Icons

**Library:** Material Symbols Outlined (Google)
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

For filled icons: `style="font-variation-settings: 'FILL' 1;"`

**Icons used in design:**
| Icon | Usage |
|------|-------|
| `brush` (filled) | Logo / app icon |
| `person` (filled) | Play Solo button |
| `group` (filled) | Play With Friends button |
| `pets` | Decorative doodle (cat paw) |
| `directions_car` | Decorative doodle |
| `headphones` | Decorative accent |
| `home` | Bottom nav |
| `palette` | Bottom nav — Gallery |
| `shopping_bag` | Bottom nav — Store |

---

## Layout

- **Max content width:** `max-w-5xl mx-auto`
- **Horizontal padding:** `px-6`
- **Top spacing (fixed header):** `pt-24`
- **Bottom spacing (fixed nav):** `pb-32`
- **Section spacing:** `space-y-12`

### Fixed Header
```
position: fixed, top-0, w-full, z-50
bg: bg-[#faf9f8]/80 backdrop-blur-xl
shadow: shadow-[0_4px_40px_rgba(26,28,28,0.04)]
```

### Fixed Bottom Nav
```
position: fixed, bottom-0, w-full, z-50
bg: bg-[#ffffff]/80 backdrop-blur-2xl
shadow: shadow-[0_-10px_40px_rgba(26,28,28,0.04)]
border-radius: rounded-t-[3rem]
padding: pb-6 pt-2
```

---

## Components

### Action Button (large CTA)
Gradient border card with hover-fill effect:
```html
<button class="relative group h-64 rounded-xl overflow-hidden active:scale-95 transition-all duration-300">
  <div class="absolute inset-0 bg-gradient-to-br from-[...] to-[...] p-1">
    <div class="w-full h-full bg-surface-container-lowest rounded-[2.8rem] flex flex-col items-center justify-center gap-4 transition-colors group-hover:bg-transparent">
      <!-- icon + label, both get group-hover:text-white -->
    </div>
  </div>
</button>
```

### Hero Card
White card with subtle gradient overlay + rotating image:
- `rounded-xl p-8 shadow-sm`
- Image starts `rotate-2`, on group hover `rotate-0`, `transition-transform duration-500`

### Gallery Grid (Bento)
2-col mobile, 4-col desktop with alternating vertical offset:
- Even items: `translate-y-4` for staggered bento effect
- Items: `aspect-square rounded-lg overflow-hidden`
- Hover: `hover:shadow-md transition-shadow`

### Bottom Nav Active State
Active item is elevated and pill-shaped:
```
bg-gradient-to-br from-[#bb0056] to-[#ffba20]
text-white rounded-full p-3 shadow-lg
scale-110 -translate-y-2
```

### Avatar
```
w-10 h-10 rounded-full
bg-secondary-container
border-2 border-primary
overflow-hidden
```

---

## Motion & Interactions

| Element | Interaction | Effect |
|---------|-------------|--------|
| CTA buttons | Press | `active:scale-95 transition-all duration-300` |
| Hero image | Group hover | `rotate-2` → `rotate-0`, `duration-500` |
| Gallery items | Hover | `shadow-sm` → `shadow-md` |
| Nav links | Press | `active:scale-90 transition-transform duration-300` |
| Header/nav | Scroll | Frosted glass via `backdrop-blur` |
| Button fill | Hover | White interior fades to transparent, text → white |

---

## Screens Defined

| Screen | Stitch ID |
|--------|-----------|
| Home Screen — Rainbow Edition | `f452d57bda1543f58ea821ed8ec70082` |

---

## Tailwind Config (full)

```js
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#f1f0f0",
        "surface-container-high": "#e9e8e7",
        "on-error-container": "#93000a",
        "surface-variant": "#e3e2e1",
        "primary": "#bb0056",
        "error-container": "#ffdad6",
        "secondary-fixed-dim": "#ffba20",
        "on-primary-fixed-variant": "#8f0040",
        "surface-container-lowest": "#ffffff",
        "primary-fixed-dim": "#ffb1c2",
        "on-secondary": "#ffffff",
        "tertiary-fixed": "#c2e8ff",
        "outline-variant": "#c6c6c6",
        "background": "#faf9f8",
        "outline": "#777777",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        "on-tertiary-container": "#004d67",
        "on-primary-fixed": "#3f0018",
        "secondary-fixed": "#ffdea8",
        "primary-container": "#ffd9e0",
        "tertiary-fixed-dim": "#75d1ff",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#474747",
        "on-secondary-container": "#5e4200",
        "on-primary-container": "#8f0040",
        "surface-bright": "#faf9f8",
        "on-tertiary-fixed": "#001e2b",
        "tertiary": "#006688",
        "on-secondary-fixed": "#271900",
        "on-primary": "#ffffff",
        "error": "#ba1a1a",
        "inverse-surface": "#2f3130",
        "primary-fixed": "#ffd9e0",
        "secondary": "#7c5800",
        "tertiary-container": "#c2e8ff",
        "surface-container": "#eeeeed",
        "surface-container-low": "#f4f3f2",
        "secondary-container": "#ffdea8",
        "surface-container-highest": "#e3e2e1",
        "on-tertiary-fixed-variant": "#004d67",
        "surface": "#faf9f8",
        "on-background": "#1a1c1c",
        "on-secondary-fixed-variant": "#5e4200",
        "surface-tint": "#bb0056",
        "surface-dim": "#dadad9",
        "inverse-primary": "#ffb1c2"
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans"],
        body: ["Plus Jakarta Sans"],
        label: ["Plus Jakarta Sans"]
      }
    }
  }
}
```
