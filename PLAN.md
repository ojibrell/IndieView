# PLAN.md — IndieView Complete Build Specification

> This document is the single source of truth for building IndieView.
> Claude Code: read this ENTIRE file before writing any code.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [File Structure](#3-file-structure)
4. [Environment & Security](#4-environment--security)
5. [Supabase Client Setup (CRITICAL)](#5-supabase-client-setup)
6. [Database Schema Reference](#6-database-schema-reference)
7. [TypeScript Types](#7-typescript-types)
8. [Design System](#8-design-system)
9. [Component Specifications](#9-component-specifications)
10. [Page Specifications](#10-page-specifications)
11. [API Route Specifications](#11-api-route-specifications)
12. [Middleware](#12-middleware)
13. [Auth Flow](#13-auth-flow)
14. [Error Handling](#14-error-handling)
15. [Security Checklist](#15-security-checklist)
16. [Deployment](#16-deployment)

---

## 1. PROJECT OVERVIEW

IndieView is a web platform for discovering and hosting in-person independent film screenings. Filmmakers create screening events. Audiences discover and RSVP to events near them.

**This is NOT a streaming platform. This is an event platform.**

### Core User Flow
1. Filmmaker signs up → sets role to "creator"
2. Creator posts a screening event (film title, date, location, capacity)
3. Audience browses events → RSVPs to attend
4. System tracks capacity, prevents overbooking
5. Event happens in real life
6. Repeat

### MVP Scope (what we're building today)
- User auth (email + password)
- User profiles with role (creator / attendee)
- Create event (creators only)
- Browse/search/filter events
- Event detail page
- RSVP system with capacity management
- Dashboard (my events + my RSVPs)
- Profile editing
- Poster image upload

### NOT in MVP (do not build these)
- Stripe/payments (all events are free for now)
- Google Maps embed (just show address text)
- Email reminders/notifications
- Push notifications
- Follow filmmakers
- Event reviews/ratings
- Festival mode
- Geolocation distance filtering
- Social login (Google/GitHub OAuth)

---

## 2. TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | 3.4+ |
| Database | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth | via @supabase/ssr |
| Storage | Supabase Storage | Poster images |
| Deployment | Vercel | Free tier |
| Package Manager | npm | Latest |

### Key Dependencies
```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.5",
    "date-fns": "^3",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18",
    "@types/node": "^20",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "^14"
  }
}
```

**Do NOT install**: shadcn/ui, Radix, Headless UI, or any component library. Build all components from scratch with Tailwind for a unique look.

---

## 3. FILE STRUCTURE

```
indieview/
├── PLAN.md                          ← this file
├── README.md                        ← setup instructions
├── .env.local.example               ← placeholder env vars (committed)
├── .env.local                       ← real env vars (gitignored, user creates)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
├── middleware.ts                     ← auth session refresh + route protection
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                ← browser client (Client Components)
│   │   ├── server.ts                ← server client (Server Components, Actions, Route Handlers)
│   │   └── middleware.ts            ← middleware helper (session refresh)
│   ├── types.ts                     ← all TypeScript types/interfaces
│   ├── utils.ts                     ← helper functions
│   └── constants.ts                 ← app-wide constants (genres, etc.)
│
├── app/
│   ├── layout.tsx                   ← root layout with Navbar + Footer
│   ├── page.tsx                     ← home/landing page
│   ├── loading.tsx                  ← global loading state
│   ├── not-found.tsx                ← 404 page
│   ├── globals.css                  ← Tailwind imports + custom CSS
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx             ← login form
│   │   ├── signup/
│   │   │   └── page.tsx             ← signup form
│   │   └── callback/
│   │       └── route.ts             ← auth callback handler
│   │
│   ├── events/
│   │   ├── page.tsx                 ← browse all events
│   │   ├── create/
│   │   │   └── page.tsx             ← create event form (creators only)
│   │   └── [id]/
│   │       └── page.tsx             ← single event detail
│   │
│   ├── dashboard/
│   │   └── page.tsx                 ← user dashboard (my events + my RSVPs)
│   │
│   ├── profile/
│   │   └── page.tsx                 ← edit profile
│   │
│   └── api/
│       ├── events/
│       │   └── route.ts             ← POST: create event
│       ├── rsvp/
│       │   └── route.ts             ← POST: create RSVP, DELETE: cancel RSVP
│       └── upload/
│           └── route.ts             ← POST: upload poster image
│
└── components/
    ├── Navbar.tsx                    ← top navigation bar
    ├── Footer.tsx                    ← site footer
    ├── EventCard.tsx                 ← event card for browse grid
    ├── EventForm.tsx                 ← create event form (Client Component)
    ├── RSVPButton.tsx                ← RSVP / cancel button (Client Component)
    ├── AuthForm.tsx                  ← shared login/signup form (Client Component)
    ├── EventFilters.tsx              ← filter bar (Client Component)
    ├── DashboardTabs.tsx             ← tabs for dashboard (Client Component)
    ├── ProfileForm.tsx               ← edit profile form (Client Component)
    ├── LoadingSkeleton.tsx           ← skeleton loading cards
    ├── EmptyState.tsx                ← empty state component
    ├── HeroSection.tsx               ← landing page hero
    └── ui/
        ├── Button.tsx               ← reusable button
        ├── Input.tsx                ← reusable input
        ├── Textarea.tsx             ← reusable textarea
        ├── Select.tsx               ← reusable select dropdown
        ├── Badge.tsx                ← small label/tag
        ├── Card.tsx                 ← base card container
        └── Modal.tsx                ← simple modal/dialog
```

---

## 4. ENVIRONMENT & SECURITY

### .env.local.example (this file IS committed to git)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Only used server-side — NEVER expose to client
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### .gitignore (MUST include)
```
node_modules/
.next/
.env
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
.vercel
```

### Security Rules
1. **NEVER hardcode** any API keys, URLs, or secrets in source code
2. **NEVER import** `SUPABASE_SERVICE_ROLE_KEY` in any client component or file that runs in the browser
3. **ALL env vars** go in `.env.local` (gitignored)
4. **`NEXT_PUBLIC_*` vars** are the ONLY ones safe for client-side code
5. **Service role key** is ONLY used in API route handlers (app/api/...) on the server
6. **Always validate** user input on the server before database operations
7. **Always check** auth state on server before protected mutations
8. **File uploads**: validate type (jpg, png, webp only) and size (max 5MB) on BOTH client and server
9. **RLS is enabled** on all database tables — the anon key alone cannot bypass row-level security
10. **Never trust** `supabase.auth.getSession()` on the server — use `supabase.auth.getUser()` instead (it validates the JWT)

### next.config.js Security Headers
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 5. SUPABASE CLIENT SETUP (CRITICAL)

Follow the OFFICIAL Supabase SSR pattern exactly. This is the #1 source of auth bugs if done wrong.

### lib/supabase/client.ts — Browser Client
Used in Client Components (`'use client'` files).

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### lib/supabase/server.ts — Server Client
Used in Server Components, Server Actions, Route Handlers.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

### lib/supabase/middleware.ts — Middleware Helper
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT use getSession() here.
  // Use getUser() — it validates the JWT against Supabase servers.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  const protectedRoutes = ['/events/create', '/dashboard', '/profile']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### middleware.ts (project root)
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 6. DATABASE SCHEMA REFERENCE

The database is ALREADY created in Supabase. Do NOT generate migration files. This is just for reference so you know the table shapes.

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | References auth.users(id) |
| email | TEXT | |
| full_name | TEXT | |
| display_name | TEXT | |
| bio | TEXT | |
| avatar_url | TEXT | |
| role | TEXT | 'creator' or 'attendee', default 'attendee' |
| city | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### events
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| creator_id | UUID (FK) | References profiles(id) |
| title | TEXT | Event title |
| description | TEXT | |
| film_title | TEXT | Name of the film |
| genre | TEXT | Optional |
| poster_url | TEXT | Supabase Storage URL |
| trailer_url | TEXT | YouTube/Vimeo link |
| event_date | TIMESTAMPTZ | Must be in the future |
| location_name | TEXT | e.g., "The Roxie Theater" |
| location_address | TEXT | Full address |
| location_city | TEXT | City name |
| location_lat | DOUBLE PRECISION | Optional |
| location_lng | DOUBLE PRECISION | Optional |
| ticket_type | TEXT | 'free' or 'paid' (MVP: always 'free') |
| ticket_price | DECIMAL(10,2) | Default 0 |
| max_capacity | INTEGER | Min 1, max 1000 |
| current_attendees | INTEGER | Default 0 |
| status | TEXT | 'draft', 'upcoming', 'sold_out', 'past', 'cancelled' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### rsvps
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| event_id | UUID (FK) | References events(id) |
| user_id | UUID (FK) | References profiles(id) |
| status | TEXT | 'confirmed', 'cancelled', 'waitlist' |
| created_at | TIMESTAMPTZ | |
| | | UNIQUE(event_id, user_id) |

### Database Functions Available
- `increment_attendees(event_uuid UUID)` — atomically increments attendee count, sets sold_out if full
- `decrement_attendees(event_uuid UUID)` — atomically decrements attendee count, reverts sold_out
- `handle_new_user()` — trigger that auto-creates profile row when user signs up
- `mark_past_events()` — updates status of past events

### RLS Policies (already enabled)
- Profiles: public read, users can only update/insert their own
- Events: public read, creators can only insert/update/delete their own
- RSVPs: viewable by RSVP owner and event creator, users can only manage their own

---

## 7. TYPESCRIPT TYPES

### lib/types.ts
```typescript
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  role: 'creator' | 'attendee'
  city: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  creator_id: string
  title: string
  description: string | null
  film_title: string
  genre: string | null
  poster_url: string | null
  trailer_url: string | null
  event_date: string
  location_name: string
  location_address: string
  location_city: string
  location_lat: number | null
  location_lng: number | null
  ticket_type: 'free' | 'paid'
  ticket_price: number
  max_capacity: number
  current_attendees: number
  status: 'draft' | 'upcoming' | 'sold_out' | 'past' | 'cancelled'
  created_at: string
  updated_at: string
  // Joined data (optional, from queries)
  creator?: Profile
}

export interface RSVP {
  id: string
  event_id: string
  user_id: string
  status: 'confirmed' | 'cancelled' | 'waitlist'
  created_at: string
  // Joined data
  event?: Event
  user?: Profile
}

export interface CreateEventFormData {
  title: string
  film_title: string
  description: string
  genre: string
  poster_file: File | null
  trailer_url: string
  event_date: string
  event_time: string
  location_name: string
  location_address: string
  location_city: string
  max_capacity: number
}
```

---

## 8. DESIGN SYSTEM

### Aesthetic Direction
**Warm indie cinema.** Think: the warm glow of a projector in a small theater. Cozy, inviting, not cold or techy. Not a tech startup look. More like a beautifully designed film festival program.

### Color Palette (use CSS variables in globals.css)

```css
:root {
  /* Backgrounds */
  --bg-primary: #1C1917;          /* Stone 900 - deep warm dark */
  --bg-secondary: #292524;        /* Stone 800 - slightly lighter */
  --bg-card: #FAF7F2;             /* Warm cream for light cards */
  --bg-card-dark: #3D3631;        /* Dark warm card */
  --bg-elevated: #44403C;         /* Stone 700 - elevated surfaces */

  /* Brand Colors */
  --color-amber: #D4A574;         /* Primary - warm gold/amber */
  --color-amber-light: #E8C9A0;   /* Lighter amber for hover */
  --color-amber-dark: #B8875A;    /* Darker amber for active */
  --color-terracotta: #C17C60;    /* Secondary accent */
  --color-sage: #8B9A7B;          /* Tertiary - muted green */

  /* Text */
  --text-primary: #F5F0E8;        /* Warm off-white on dark */
  --text-secondary: #A8A29E;      /* Stone 400 - muted text */
  --text-on-light: #1C1917;       /* Dark text on light backgrounds */
  --text-on-light-muted: #57534E; /* Stone 600 - muted on light */

  /* Borders */
  --border-subtle: #44403C;       /* Stone 700 */
  --border-light: #E7E0D6;        /* Light card borders */

  /* Status */
  --color-success: #8B9A7B;       /* Sage green */
  --color-warning: #D4A574;       /* Amber */
  --color-error: #C17C60;         /* Terracotta */
}
```

### Typography

Load from Google Fonts in `app/layout.tsx`:
```typescript
import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})
```

Usage:
- **Headings** (h1-h3): `font-display` (Playfair Display), italic for hero titles
- **Body text**: `font-body` (DM Sans)
- **Small text / UI**: `font-body` with appropriate sizing

Font size scale:
- Hero title: `text-5xl md:text-7xl`
- Page title: `text-3xl md:text-4xl`
- Section title: `text-2xl`
- Card title: `text-xl`
- Body: `text-base` (16px)
- Small: `text-sm` (14px)
- Tiny: `text-xs` (12px)

### Spacing
- Use generous spacing: `p-6`, `p-8`, `gap-6`, `gap-8`
- Section padding: `py-16 md:py-24`
- Card padding: `p-6`
- Maximum content width: `max-w-7xl mx-auto`

### Corners & Shadows
- Cards: `rounded-2xl`
- Buttons: `rounded-xl`
- Inputs: `rounded-lg`
- Small elements: `rounded-md`
- Shadows: warm-tinted — use `shadow-lg shadow-stone-900/20` or custom with amber tint

### Transitions & Hover Effects
- All interactive elements: `transition-all duration-200`
- Cards: subtle lift on hover — `hover:-translate-y-1 hover:shadow-xl`
- Buttons: brightness change — `hover:brightness-110`
- Links: underline on hover or color shift

### Film Grain Effect (CSS only, for hero/header areas)
Add to globals.css:
```css
.film-grain {
  position: relative;
}
.film-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}
```

### Icons
Use `lucide-react` for all icons. Import individually:
```typescript
import { Calendar, MapPin, Users, Film, Plus, Search, User, LogOut, ChevronRight } from 'lucide-react'
```

### Responsive Breakpoints (Tailwind defaults)
- Mobile-first: design for `< 640px` first
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 9. COMPONENT SPECIFICATIONS

### Navbar (`components/Navbar.tsx`)
- Server Component that wraps a Client Component for auth state
- Fixed to top, blurred background: `bg-stone-900/80 backdrop-blur-md`
- Logo: "IndieView" in Playfair Display, amber color
- Left: logo + nav links (Home, Browse Events)
- Right (logged out): Sign In / Sign Up buttons
- Right (logged in): Create Event link (if creator), Dashboard, profile dropdown with name + logout
- Mobile: hamburger menu → slide-in drawer or dropdown
- Border bottom: `border-b border-stone-800`

### Footer (`components/Footer.tsx`)
- Simple, minimal
- Dark background matching main bg
- Logo, copyright, maybe a few links
- Top border: `border-t border-stone-800`

### EventCard (`components/EventCard.tsx`)
- Props: `event: Event`
- Cream background card (`bg-[var(--bg-card)]`)
- Poster image (top, 16:9 aspect ratio, fallback if no poster)
- Film title (Playfair, dark text)
- Event date formatted (e.g., "Sat, Mar 15 · 7:30 PM")
- Location city with MapPin icon
- Seats remaining badge (e.g., "12 seats left")
- "Free" badge if free
- Genre badge if present
- Entire card is a link to `/events/[id]`
- Hover: subtle lift + shadow increase

### EventForm (`components/EventForm.tsx`)
- Client Component (`'use client'`)
- Controlled form with useState for each field
- Fields defined in section 10 (Create Event page)
- Client-side validation before submit
- On submit: upload poster first (if provided), then POST to /api/events
- Loading state on submit button
- Error display
- Success → redirect to event page

### RSVPButton (`components/RSVPButton.tsx`)
- Client Component
- Props: `eventId: string`, `initialRsvpStatus: 'none' | 'confirmed'`, `isFull: boolean`, `isPast: boolean`
- States:
  - Not logged in → "Sign in to RSVP" button (links to login)
  - No RSVP + available → "Reserve Your Seat" button (amber, prominent)
  - Already RSVP'd → "You're Going! ✓" with "Cancel" option
  - Full → "Sold Out" (disabled, greyed out)
  - Past → "Event Has Ended" (disabled)
- On click: POST to /api/rsvp or DELETE to /api/rsvp
- Optimistic UI update

### AuthForm (`components/AuthForm.tsx`)
- Client Component
- Props: `mode: 'login' | 'signup'`
- Login: email + password fields
- Signup: full name + email + password + confirm password + role selector (dropdown: Creator / Attendee)
- Password requirements: min 6 characters
- Confirm password must match (signup only)
- Error messages displayed inline
- Loading state on submit
- Links: "Already have an account? Sign in" / "Don't have an account? Sign up"
- On success: redirect to home or to the redirect param in URL

### EventFilters (`components/EventFilters.tsx`)
- Client Component
- Horizontal bar above event grid
- Search input (by title or city)
- Genre dropdown filter
- "Free" toggle/checkbox
- "This Weekend" quick filter
- Updates URL search params (so filters are shareable)
- Debounced search (300ms)

### LoadingSkeleton (`components/LoadingSkeleton.tsx`)
- Animated pulse skeletons matching EventCard shape
- Show 6 skeleton cards in grid while loading

### EmptyState (`components/EmptyState.tsx`)
- Props: `title: string`, `description: string`, `actionLabel?: string`, `actionHref?: string`
- Centered, with an icon, title, description, and optional CTA button

### UI Components (`components/ui/`)

#### Button.tsx
- Props: `variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`, `size: 'sm' | 'md' | 'lg'`, `isLoading?: boolean`, `disabled?: boolean`, + standard button props
- Primary: amber background, dark text
- Secondary: terracotta/stone background
- Outline: border only
- Ghost: no background, hover shows bg
- Loading: spinner + "Loading..." text, disabled
- Sizes: sm (h-9 px-3 text-sm), md (h-11 px-5), lg (h-13 px-8 text-lg)

#### Input.tsx
- Props: standard input props + `label?: string`, `error?: string`
- Styled input with label above
- Dark mode: `bg-stone-800 border-stone-700 text-stone-100`
- Light/cream mode: `bg-white border-stone-300 text-stone-900`
- Focus ring: amber
- Error state: red border + error message below

#### Textarea.tsx
- Same as Input but for textarea
- Resizable vertically

#### Select.tsx
- Styled dropdown select
- Same visual treatment as Input

#### Badge.tsx
- Props: `variant: 'default' | 'free' | 'genre' | 'status'`, + children
- Small rounded pill
- Free: green-ish
- Genre: amber/warm
- Status (sold out, past): appropriate colors

#### Card.tsx
- Simple container with cream bg, rounded corners, shadow, padding
- Props: `variant: 'light' | 'dark'`

---

## 10. PAGE SPECIFICATIONS

### Home Page (`app/page.tsx`) — Server Component

**Hero Section:**
- Full viewport height (100vh or close)
- Dark background with film grain overlay
- Large headline: "Discover indie film screenings near you" (Playfair Display, italic, amber color)
- Subtitle: "Where independent filmmakers host screenings and audiences discover unique film experiences."
- Two CTA buttons: "Browse Events" (primary amber) and "Host a Screening" (outline)
- Subtle gradient from dark to slightly lighter at bottom

**Featured Events Section:**
- Heading: "Upcoming Screenings"
- Grid of up to 6 upcoming events (EventCard components)
- If no events exist yet, show a warm empty state encouraging creators to post
- "View All Events →" link at bottom

**How It Works Section:**
- Three columns (stack on mobile)
- Step 1: "Create" icon + "Filmmakers post their screening events with all the details"
- Step 2: "Discover" icon + "Film lovers browse and find screenings in their city"
- Step 3: "Attend" icon + "Reserve your seat and experience indie cinema live"
- Warm background variation to distinguish from hero

**CTA Section:**
- "Ready to host your screening?"
- "Create Event" button
- Simple, not overwhelming

**Data fetching:**
- Fetch upcoming events from Supabase (server-side)
- `SELECT * FROM events WHERE status = 'upcoming' ORDER BY event_date ASC LIMIT 6`

---

### Browse Events (`app/events/page.tsx`) — Server Component + Client Components

**Layout:**
- Page title: "Browse Screenings"
- EventFilters component (Client Component) at top
- Grid of EventCard components (3 columns on desktop, 2 on tablet, 1 on mobile)
- Loading skeleton while fetching

**Data fetching:**
- Read URL search params for filters
- Build Supabase query:
  - Base: `SELECT *, profiles!creator_id(display_name, avatar_url) FROM events WHERE status IN ('upcoming', 'sold_out')`
  - If genre filter: `AND genre = :genre`
  - If search: `AND (film_title ILIKE :search OR location_city ILIKE :search OR title ILIKE :search)`
  - If free filter: `AND ticket_type = 'free'`
  - If this weekend: `AND event_date >= :friday AND event_date <= :sunday`
  - Order by: `event_date ASC`
- Pagination: start with LIMIT 12, add "Load More" button or paginate

---

### Event Detail (`app/events/[id]/page.tsx`) — Server Component

**Layout:**
- Two-column on desktop (poster left, details right), single column on mobile
- Left: Large poster image (aspect-ratio 2/3, rounded corners, warm shadow)
  - Fallback if no poster: gradient placeholder with film icon
- Right:
  - Film title (large, Playfair Display)
  - Event title underneath (if different from film title)
  - Genre badge
  - Description (full text)
  - **Info cards/rows:**
    - Date & time: Calendar icon + formatted date (e.g., "Saturday, March 15, 2025 at 7:30 PM")
    - Location: MapPin icon + location name + address underneath
    - Capacity: Users icon + "X of Y seats taken" with a visual progress bar
  - Trailer link (if provided): external link to YouTube/Vimeo
  - Creator card: small card showing creator name + avatar
  - RSVPButton component (Client Component)
  - Share button: copies event URL to clipboard

**Data fetching:**
- Fetch event by ID: `SELECT *, profiles!creator_id(*) FROM events WHERE id = :id`
- Fetch user's RSVP status: `SELECT * FROM rsvps WHERE event_id = :id AND user_id = :currentUser`
- If event not found: show 404

**Dynamic metadata:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch event and return title, description, og:image
}
```

---

### Create Event (`app/events/create/page.tsx`) — Protected

**Access:** Redirect to login if not authenticated (handled by middleware). Show message if user role is 'attendee' — "Switch to Creator role in your profile to create events."

**Form fields (all in EventForm component):**
1. Film Title* — text input
2. Event Title* — text input (defaults to "[Film Title] Screening" as placeholder)
3. Description* — textarea (min 20 chars)
4. Genre — select dropdown (Drama, Comedy, Horror, Documentary, Sci-Fi, Animation, Thriller, Experimental, Short Film, Other)
5. Poster Image — file upload (jpg/png/webp, max 5MB)
   - Show image preview after selection
   - Drag and drop zone
6. Trailer URL — text input (optional, validate URL format)
7. Date* — date input (must be today or future)
8. Time* — time input
9. Location Name* — text input (e.g., "The Roxie Theater")
10. Location Address* — text input
11. Location City* — text input
12. Max Capacity* — number input (min 1, max 1000, default 50)
13. Submit button: "Create Screening"

`*` = required

**Validation (client + server):**
- All required fields present
- Description min 20 chars
- Date is in the future
- Capacity 1-1000
- Poster file type check
- Poster file size < 5MB
- Trailer URL is valid URL (if provided)

---

### Dashboard (`app/dashboard/page.tsx`) — Protected

**Layout:**
- Page title: "Dashboard"
- Quick stats (if creator): cards showing total events, total attendees, upcoming events count
- DashboardTabs component (Client Component) with two tabs:

**Tab 1: My Events (show if user role = creator)**
- List of events created by user
- Each row/card shows: film title, date, status badge, "X/Y seats", edit link
- Sort by most recent first
- If no events: empty state with "Create Your First Screening" CTA

**Tab 2: My RSVPs**
- List of events user has RSVP'd to
- Each row/card shows: film title, date, location, status badge, cancel RSVP button
- Sort: upcoming first, then past
- If no RSVPs: empty state with "Browse Screenings" CTA

**Data fetching:**
- My events: `SELECT * FROM events WHERE creator_id = :userId ORDER BY event_date DESC`
- My RSVPs: `SELECT *, events(*) FROM rsvps WHERE user_id = :userId AND status = 'confirmed' ORDER BY events.event_date DESC`

---

### Login (`app/auth/login/page.tsx`)

- Centered card on dark background
- "Welcome Back" heading (Playfair)
- AuthForm component in 'login' mode
- Email + password fields
- "Sign In" button
- Link to signup page
- Read `redirect` search param — redirect there after login

---

### Signup (`app/auth/signup/page.tsx`)

- Same layout as login
- "Join IndieView" heading
- AuthForm component in 'signup' mode
- Full name + email + password + confirm password + role dropdown
- "Create Account" button
- Link to login page

---

### Profile (`app/profile/page.tsx`) — Protected

- Page title: "Your Profile"
- ProfileForm component (Client Component)
- Fields: display name, bio, city, role (dropdown), avatar upload
- "Save Changes" button
- Fetch current profile on load
- On submit: update profile in Supabase

---

### Auth Callback (`app/auth/callback/route.ts`)
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
```

---

## 11. API ROUTE SPECIFICATIONS

### POST /api/events (`app/api/events/route.ts`)

**Request body:** FormData or JSON with event fields

**Server-side logic:**
1. Get authenticated user via `supabase.auth.getUser()` — reject if not authenticated
2. Fetch user profile — reject if role !== 'creator'
3. Validate all required fields (title, film_title, description, event_date, location fields, max_capacity)
4. Validate event_date is in the future
5. Validate max_capacity is 1-1000
6. Sanitize text inputs (trim whitespace)
7. If poster_url provided, validate it's a valid Supabase storage URL
8. Insert into events table with creator_id = user.id, status = 'upcoming', ticket_type = 'free'
9. Return the created event or redirect URL

**Response:** `{ success: true, event: Event }` or `{ error: string }`

---

### POST /api/rsvp (`app/api/rsvp/route.ts`)

**Request body:** `{ event_id: string }`

**Server-side logic:**
1. Get authenticated user — reject if not auth'd
2. Validate event_id exists
3. Fetch the event — reject if status !== 'upcoming'
4. Check if user already has a confirmed RSVP — reject if duplicate
5. Check if current_attendees < max_capacity — reject if full
6. Insert RSVP with status = 'confirmed'
7. Call `increment_attendees(event_id)` Supabase function
8. Return success

**Response:** `{ success: true, rsvp: RSVP }` or `{ error: string }`

---

### DELETE /api/rsvp (`app/api/rsvp/route.ts`)

**Request body:** `{ event_id: string }`

**Server-side logic:**
1. Get authenticated user
2. Find the user's confirmed RSVP for this event
3. Delete the RSVP (or update status to 'cancelled')
4. Call `decrement_attendees(event_id)` Supabase function
5. Return success

**Response:** `{ success: true }` or `{ error: string }`

---

### POST /api/upload (`app/api/upload/route.ts`)

**Request body:** FormData with `file` field

**Server-side logic:**
1. Get authenticated user
2. Extract file from FormData
3. Validate file type: only `image/jpeg`, `image/png`, `image/webp`
4. Validate file size: max 5MB (5 * 1024 * 1024 bytes)
5. Generate unique filename: `{user_id}/{uuid}.{extension}`
6. Upload to Supabase Storage bucket `posters`
7. Get public URL
8. Return URL

**Response:** `{ url: string }` or `{ error: string }`

---

## 12. MIDDLEWARE

Already specified in section 5. Key behaviors:
1. Runs on every route (except static files/images)
2. Refreshes Supabase auth session (prevents stale tokens)
3. Redirects unauthenticated users from protected routes to /auth/login
4. Passes redirect param so user returns after login

Protected routes:
- `/events/create`
- `/dashboard`
- `/profile`

---

## 13. AUTH FLOW

### Signup Flow
1. User fills out signup form (name, email, password, role)
2. Client calls `supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })`
3. Supabase creates auth.users row
4. Database trigger `handle_new_user()` auto-creates profiles row
5. Supabase sends confirmation email (if email confirmation is enabled)
6. User is redirected to home page (or shown "check your email" message)

### Login Flow
1. User fills out login form (email, password)
2. Client calls `supabase.auth.signInWithPassword({ email, password })`
3. On success: session cookie set automatically by @supabase/ssr
4. Redirect to home or previous page (via redirect param)

### Logout Flow
1. User clicks logout
2. Client calls `supabase.auth.signOut()`
3. Redirect to home page

### Session Refresh
- Middleware calls `supabase.auth.getUser()` on every request
- This validates and refreshes the JWT if needed
- Updated tokens stored in cookies

---

## 14. ERROR HANDLING

### Global Error Handling
- `app/not-found.tsx` — custom 404 page (warm design, link back to home)
- `app/loading.tsx` — global loading skeleton
- `app/error.tsx` — global error boundary (friendly error message, retry button)

### Form Error Handling
- Display errors inline below the relevant field
- Use red/terracotta color for error text
- Clear errors when user starts typing in the errored field

### API Error Handling
- All API routes return consistent JSON: `{ success: boolean, data?: any, error?: string }`
- Use proper HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)
- Never expose internal errors to client — use generic messages like "Something went wrong"
- Log actual errors server-side with console.error

### Network Error Handling
- Show toast or inline error for network failures
- Allow retry on failure

---

## 15. SECURITY CHECKLIST

- [ ] .env.local in .gitignore
- [ ] No hardcoded API keys anywhere in source
- [ ] Service role key only used in server-side code
- [ ] supabase.auth.getUser() used instead of getSession() for server validation
- [ ] RLS enabled on all tables (it is — just don't bypass it)
- [ ] File upload: type validation (jpg/png/webp only)
- [ ] File upload: size validation (max 5MB)
- [ ] All form inputs validated server-side (not just client-side)
- [ ] Protected routes redirect if not authenticated
- [ ] RSVP prevents double-booking (UNIQUE constraint + check before insert)
- [ ] RSVP prevents overbooking (check current_attendees < max_capacity)
- [ ] No sensitive data in client-side JavaScript bundle
- [ ] Security headers set in next.config.js
- [ ] Image domains restricted in next.config.js

---

## 16. DEPLOYMENT

### Deploy to Vercel
1. Push code to GitHub
2. Go to vercel.com → Import repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy
5. Update Supabase Auth → URL Configuration:
   - Site URL: your Vercel URL
   - Redirect URLs: add your Vercel URL

### Post-Deploy Verification
1. Can sign up with email
2. Can log in
3. Can update profile to creator
4. Can create an event with poster
5. Can browse events
6. Can RSVP to an event
7. Can see event in dashboard
8. Can cancel RSVP
9. Protected routes redirect properly
10. 404 page works for invalid URLs
