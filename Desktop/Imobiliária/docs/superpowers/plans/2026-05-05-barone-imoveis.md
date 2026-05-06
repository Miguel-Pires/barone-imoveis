# Barone Imóveis — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete real estate lead-generation platform with public property listing/detail pages and a cookie-protected admin panel, deployed to Vercel.

**Architecture:** Next.js 14 App Router with two route groups — `(public)` for the customer-facing site and `(admin)` for CRUD. Admin routes protected by middleware checking `admin_secret` httpOnly cookie. All data in Supabase. ISR (revalidate=60) on all public pages.

**Tech Stack:** Next.js 14.2 · TypeScript · `@supabase/ssr` · TailwindCSS · Zod · Vercel

---

## File Map

| File | Responsibility |
|------|----------------|
| `app/(public)/layout.tsx` | Font, WhatsApp float, Meta Pixel, GA |
| `app/(public)/page.tsx` | Listing: SSR+ISR, client-side filters |
| `app/(public)/imovel/[slug]/page.tsx` | Detail: ISR, generateMetadata, Schema.org |
| `app/(admin)/layout.tsx` | Admin sidebar nav |
| `app/(admin)/dashboard/page.tsx` | Stats: properties + leads count |
| `app/(admin)/imoveis/page.tsx` | Property table |
| `app/(admin)/imoveis/novo/page.tsx` | Create |
| `app/(admin)/imoveis/[id]/editar/page.tsx` | Edit |
| `app/login/page.tsx` | Admin login (POST to /api/admin/auth) |
| `app/api/admin/auth/route.ts` | Set httpOnly cookie |
| `app/api/leads/route.ts` | Validate + insert lead |
| `app/api/properties/[slug]/view/route.ts` | Increment views_count |
| `middleware.ts` | Block admin routes without cookie |
| `components/WhatsAppButton.tsx` | Floating CTA |
| `components/ui/Button.tsx` | Variant: primary/secondary/ghost |
| `components/ui/Input.tsx` | Label + error state |
| `components/ui/Badge.tsx` | Status badge |
| `components/public/PropertyCard.tsx` | Listing card |
| `components/public/PropertyFilters.tsx` | Filter bar (client) |
| `components/public/PropertyHero.tsx` | Hero + microcopy + social proof |
| `components/public/PropertyGallery.tsx` | CSS carousel |
| `components/public/PropertyQuickInfo.tsx` | Icon grid |
| `components/public/PropertyFeatures.tsx` | Differentials list |
| `components/public/PropertyAmenities.tsx` | Amenities grid |
| `components/public/PropertyFloorplans.tsx` | Floorplans + download |
| `components/public/PropertyMap.tsx` | Google Maps iframe + open link |
| `components/public/LeadForm.tsx` | Sticky mobile form |
| `components/admin/PropertyForm.tsx` | Full create/edit form |
| `components/admin/ImageUpload.tsx` | Multi-upload to Supabase Storage |
| `components/admin/DynamicList.tsx` | Add/remove text items |
| `lib/supabase/client.ts` | Browser client |
| `lib/supabase/server.ts` | Server client (cookies) |
| `lib/utils.ts` | cn, formatPrice, generateSlug, formatPhone |
| `lib/tracking.ts` | trackEvent: fbq + gtag wrapper |
| `lib/schemas.ts` | Zod schemas |
| `types/property.ts` | TypeScript interfaces |
| `services/properties.ts` | getProperties, getPropertyBySlug |
| `services/leads.ts` | insertLead |
| `services/admin.ts` | CRUD for properties |
| `supabase/migrations/001_schema.sql` | All tables |
| `supabase/migrations/002_seed.sql` | Mock data |
| `.env.local.example` | Env template |
| `next.config.js` | Image domains |
| `tailwind.config.ts` | Custom theme |

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json` (via CLI)
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Scaffold Next.js app**

```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Answer prompts: Yes to TypeScript, Yes to ESLint, Yes to Tailwind, Yes to App Router, No to src/ directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr zod
npm install -D @types/node
```

- [ ] **Step 3: Write next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
```

- [ ] **Step 4: Write tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          900: '#0f172a',
        },
        whatsapp: '#25D366',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 5: Write .env.local.example**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_SECRET=choose-a-strong-secret
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_ID=
```

- [ ] **Step 6: Delete boilerplate**

```bash
rm -f app/page.tsx app/globals.css app/layout.tsx
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: project init — Next.js 14, Supabase, Tailwind"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `types/property.ts`

- [ ] **Step 1: Write types/property.ts**

```ts
export interface PropertyImage {
  id: string
  property_id: string
  url: string
  order: number
}

export interface PropertyFloorplan {
  id: string
  property_id: string
  url: string
  label: string
}

export interface PropertyFeature {
  id: string
  property_id: string
  name: string
}

export interface PropertyAmenity {
  id: string
  property_id: string
  name: string
}

export interface PropertyStatus {
  id: string
  property_id: string
  stage: string
  date: string
}

export interface Property {
  id: string
  slug: string
  title: string
  description: string
  neighborhood: string
  city: string
  state: string
  price: number | null
  bedrooms_min: number
  bedrooms_max: number
  bathrooms: number
  area_min: number
  area_max: number
  parking: number
  latitude: number | null
  longitude: number | null
  is_launch: boolean
  urgency_text: string | null
  views_count: number
  created_at: string
  property_images?: PropertyImage[]
  property_floorplans?: PropertyFloorplan[]
  property_features?: PropertyFeature[]
  property_amenities?: PropertyAmenity[]
  property_status?: PropertyStatus[]
}

export interface Lead {
  id?: string
  property_id: string
  name?: string
  phone: string
  interest: string
  created_at?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add types/
git commit -m "feat: TypeScript property types"
```

---

### Task 3: Database Schema

**Files:**
- Create: `supabase/migrations/001_schema.sql`

- [ ] **Step 1: Write 001_schema.sql**

```sql
-- properties
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  neighborhood text,
  city text,
  state text,
  price numeric,
  bedrooms_min integer default 1,
  bedrooms_max integer default 1,
  bathrooms integer default 1,
  area_min numeric,
  area_max numeric,
  parking integer default 0,
  latitude numeric,
  longitude numeric,
  is_launch boolean default false,
  urgency_text text,
  views_count integer default 0,
  created_at timestamptz default now()
);

-- property_images
create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  url text not null,
  "order" integer default 0
);

-- property_floorplans
create table if not exists property_floorplans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  url text not null,
  label text default 'Planta'
);

-- leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
  name text,
  phone text not null,
  interest text,
  created_at timestamptz default now()
);

-- property_features
create table if not exists property_features (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text not null
);

-- property_amenities
create table if not exists property_amenities (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text not null
);

-- property_status
create table if not exists property_status (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  stage text not null,
  date text
);

-- RLS: allow public reads on properties and related tables
alter table properties enable row level security;
alter table property_images enable row level security;
alter table property_floorplans enable row level security;
alter table property_features enable row level security;
alter table property_amenities enable row level security;
alter table property_status enable row level security;
alter table leads enable row level security;

create policy "Public read properties" on properties for select using (true);
create policy "Public read images" on property_images for select using (true);
create policy "Public read floorplans" on property_floorplans for select using (true);
create policy "Public read features" on property_features for select using (true);
create policy "Public read amenities" on property_amenities for select using (true);
create policy "Public read status" on property_status for select using (true);

-- leads: allow inserts from anon
create policy "Public insert leads" on leads for insert with check (true);

-- service_role bypasses RLS for admin writes (handled by server-side admin operations)
```

- [ ] **Step 2: Run migration in Supabase dashboard**

Open Supabase project → SQL Editor → paste contents of `001_schema.sql` → Run.

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: database schema migrations"
```

---

### Task 4: Core Libraries

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/utils.ts`
- Create: `lib/tracking.ts`
- Create: `lib/schemas.ts`
- Create: `__tests__/utils.test.ts`

- [ ] **Step 1: Write lib/supabase/client.ts**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Write lib/supabase/server.ts**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
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
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Write lib/utils.ts**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Install clsx + tailwind-merge: npm install clsx tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'Sob consulta'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price)
}

export function generateSlug(...parts: string[]): string {
  return parts
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return value
}
```

- [ ] **Step 4: Install clsx + tailwind-merge**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 5: Write __tests__/utils.test.ts**

```ts
import { formatPrice, generateSlug, formatPhone } from '@/lib/utils'

describe('formatPrice', () => {
  it('returns "Sob consulta" for null', () => {
    expect(formatPrice(null)).toBe('Sob consulta')
  })
  it('formats BRL currency', () => {
    expect(formatPrice(350000)).toBe('R$ 350.000')
  })
})

describe('generateSlug', () => {
  it('generates URL-safe slug from multiple parts', () => {
    expect(generateSlug('Vibra Rio Bonito', 'Rio Bonito', 'São Paulo', 'SP'))
      .toBe('vibra-rio-bonito-rio-bonito-sao-paulo-sp')
  })
  it('strips accents', () => {
    expect(generateSlug('Imóvel Único')).toBe('imovel-unico')
  })
})

describe('formatPhone', () => {
  it('formats 11-digit mobile phone', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })
  it('handles partial input', () => {
    expect(formatPhone('11')).toBe('11')
    expect(formatPhone('119')).toBe('(11) 9')
  })
})
```

- [ ] **Step 6: Set up Jest**

```bash
npm install -D jest jest-environment-jsdom @types/jest ts-jest
```

Add to `package.json`:

```json
"jest": {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1"
  }
},
"scripts": {
  "test": "jest"
}
```

- [ ] **Step 7: Run tests**

```bash
npm test -- --testPathPattern=utils
```

Expected: 5 passing tests.

- [ ] **Step 8: Write lib/tracking.ts**

```ts
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

type TrackingEvent = 'view_property' | 'click_whatsapp' | 'submit_lead'

interface EventData {
  property_id?: string
  title?: string
  slug?: string
  source?: string
  interest?: string
}

export function trackEvent(name: TrackingEvent, data: EventData = {}) {
  if (typeof window === 'undefined') return

  if (window.fbq) {
    window.fbq('track', name, data)
  }

  if (window.gtag) {
    window.gtag('event', name, data)
  }
}
```

- [ ] **Step 9: Write lib/schemas.ts**

```ts
import { z } from 'zod'

export const leadSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().optional(),
  phone: z
    .string()
    .min(14, 'Telefone inválido')
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  interest: z.string().min(1, 'Selecione um interesse'),
})

export type LeadInput = z.infer<typeof leadSchema>

export const propertySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  price: z.number().nullable(),
  bedrooms_min: z.number().int().min(0),
  bedrooms_max: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area_min: z.number().min(0),
  area_max: z.number().min(0),
  parking: z.number().int().min(0),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  is_launch: z.boolean().default(false),
  urgency_text: z.string().nullable(),
})

export type PropertyInput = z.infer<typeof propertySchema>
```

- [ ] **Step 10: Commit**

```bash
git add lib/ __tests__/
git commit -m "feat: core libs — supabase clients, utils, tracking, schemas"
```

---

### Task 5: Services Layer

**Files:**
- Create: `services/properties.ts`
- Create: `services/leads.ts`
- Create: `services/admin.ts`

- [ ] **Step 1: Write services/properties.ts**

```ts
import { createClient } from '@/lib/supabase/server'
import { Property } from '@/types/property'

export interface PropertyFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  const supabase = createClient()

  let query = supabase
    .from('properties')
    .select(
      'id, slug, title, neighborhood, city, state, price, bedrooms_min, bedrooms_max, area_min, area_max, is_launch, views_count, property_images(url, "order")'
    )
    .order('created_at', { ascending: false })

  if (filters.city) query = query.ilike('city', filters.city)
  if (filters.minPrice != null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice != null) query = query.lte('price', filters.maxPrice)
  if (filters.bedrooms != null) query = query.lte('bedrooms_min', filters.bedrooms).gte('bedrooms_max', filters.bedrooms)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Property[]
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(
      `*, property_images(id, url, "order"), property_floorplans(id, url, label), property_features(id, name), property_amenities(id, name), property_status(id, stage, date)`
    )
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as unknown as Property
}

export async function getUniqueCities(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('properties')
    .select('city')
    .not('city', 'is', null)
  return [...new Set((data ?? []).map((r) => r.city as string).filter(Boolean))]
}
```

- [ ] **Step 2: Write services/leads.ts**

```ts
import { createClient } from '@/lib/supabase/server'
import { Lead } from '@/types/property'

export async function insertLead(
  lead: Omit<Lead, 'id' | 'created_at'>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('leads').insert(lead)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 3: Write services/admin.ts**

```ts
import { createClient } from '@/lib/supabase/server'
import { PropertyInput } from '@/lib/schemas'

export async function getAllProperties() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('id, slug, title, city, price, is_launch, created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPropertyById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_images(*), property_floorplans(*), property_features(*), property_amenities(*)`)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createProperty(input: PropertyInput): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .insert(input)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id
}

export async function updateProperty(id: string, input: Partial<PropertyInput>) {
  const supabase = createClient()
  const { error } = await supabase
    .from('properties')
    .update(input)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProperty(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function upsertFeatures(propertyId: string, names: string[]) {
  const supabase = createClient()
  await supabase.from('property_features').delete().eq('property_id', propertyId)
  if (names.length === 0) return
  await supabase.from('property_features').insert(
    names.map((name) => ({ property_id: propertyId, name }))
  )
}

export async function upsertAmenities(propertyId: string, names: string[]) {
  const supabase = createClient()
  await supabase.from('property_amenities').delete().eq('property_id', propertyId)
  if (names.length === 0) return
  await supabase.from('property_amenities').insert(
    names.map((name) => ({ property_id: propertyId, name }))
  )
}

export async function getDashboardStats() {
  const supabase = createClient()
  const [{ count: propCount }, { data: recentLeads }] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase
      .from('leads')
      .select('id, name, phone, interest, created_at, property_id')
      .order('created_at', { ascending: false })
      .limit(10),
  ])
  return { propertyCount: propCount ?? 0, recentLeads: recentLeads ?? [] }
}
```

- [ ] **Step 4: Commit**

```bash
git add services/
git commit -m "feat: services layer — properties, leads, admin"
```

---

### Task 6: API Routes

**Files:**
- Create: `app/api/admin/auth/route.ts`
- Create: `app/api/leads/route.ts`
- Create: `app/api/properties/[slug]/view/route.ts`

- [ ] **Step 1: Write app/api/admin/auth/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { secret } = await req.json()

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_secret', secret, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}
```

- [ ] **Step 2: Write app/api/leads/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/schemas'
import { insertLead } from '@/services/leads'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = leadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    await insertLead(parsed.data)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Write app/api/properties/[slug]/view/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()
  await supabase.rpc('increment_views', { prop_slug: params.slug })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Add increment_views RPC to Supabase**

In Supabase SQL Editor, run:

```sql
create or replace function increment_views(prop_slug text)
returns void language sql as $$
  update properties set views_count = views_count + 1 where slug = prop_slug;
$$;
```

- [ ] **Step 5: Commit**

```bash
git add app/api/
git commit -m "feat: API routes — auth, leads, view counter"
```

---

### Task 7: Middleware + Admin Login

**Files:**
- Create: `middleware.ts`
- Create: `app/login/page.tsx`

- [ ] **Step 1: Write middleware.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PATHS = ['/dashboard', '/imoveis']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminPath = ADMIN_PATHS.some((p) => path.startsWith(p))
  const isAdminApi =
    path.startsWith('/api/admin') && !path.startsWith('/api/admin/auth')

  if (!isAdminPath && !isAdminApi) return NextResponse.next()

  const cookieSecret = request.cookies.get('admin_secret')?.value
  const headerSecret = request.headers.get('x-admin-secret')

  if (
    cookieSecret !== process.env.ADMIN_SECRET &&
    headerSecret !== process.env.ADMIN_SECRET
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/imoveis/:path*', '/api/admin/:path*'],
}
```

- [ ] **Step 2: Write app/login/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Senha incorreta.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-zinc-900 mb-6">
          Barone Admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Senha de acesso"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts app/login/
git commit -m "feat: admin middleware + login page"
```

---

### Task 8: Base UI Components + Global Styles

**Files:**
- Create: `app/globals.css`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/Badge.tsx`

- [ ] **Step 1: Write app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply text-zinc-900 bg-white;
  }
}
```

- [ ] **Step 2: Write components/ui/Button.tsx**

```tsx
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-700',
  secondary: 'bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50',
  ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
  whatsapp: 'bg-whatsapp text-white hover:bg-green-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
```

- [ ] **Step 3: Write components/ui/Input.tsx**

```tsx
import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'px-4 py-2.5 rounded-xl border text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition',
          error ? 'border-red-400 focus:ring-red-400' : 'border-zinc-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)

Input.displayName = 'Input'
```

- [ ] **Step 4: Write components/ui/Badge.tsx**

```tsx
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'launch' | 'sold'
  className?: string
}

const variants = {
  default: 'bg-zinc-100 text-zinc-700',
  launch: 'bg-amber-100 text-amber-800',
  sold: 'bg-red-100 text-red-700',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/ui/
git commit -m "feat: base UI components — Button, Input, Badge"
```

---

### Task 9: WhatsApp Button + Public Layout + Tracking

**Files:**
- Create: `components/WhatsAppButton.tsx`
- Create: `app/(public)/layout.tsx`

- [ ] **Step 1: Write components/WhatsAppButton.tsx**

```tsx
'use client'

import { trackEvent } from '@/lib/tracking'

interface WhatsAppButtonProps {
  number: string
  message?: string
  propertyId?: string
}

export function WhatsAppButton({ number, message, propertyId }: WhatsAppButtonProps) {
  const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`

  function handleClick() {
    trackEvent('click_whatsapp', {
      property_id: propertyId,
      source: 'floating',
    })
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-whatsapp text-white shadow-lg hover:scale-110 transition-transform"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.525 5.857L.057 23.077a.75.75 0 0 0 .92.92l5.22-1.468A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.704 9.704 0 0 1-4.951-1.354l-.355-.212-3.682 1.034 1.034-3.682-.212-.355A9.705 9.705 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
      </svg>
    </a>
  )
}
```

- [ ] **Step 2: Write app/(public)/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import '@/app/globals.css'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Barone Imóveis',
  description: 'Os melhores imóveis em São Paulo.',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>
        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
        )}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        {children}
        <WhatsAppButton number={waNumber} />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Install Geist font**

```bash
npm install geist
```

- [ ] **Step 4: Commit**

```bash
git add components/WhatsAppButton.tsx app/\(public\)/layout.tsx
git commit -m "feat: public layout — WhatsApp button, Meta Pixel, GA"
```

---

### Task 10: Property Listing Page

**Files:**
- Create: `components/public/PropertyCard.tsx`
- Create: `components/public/PropertyFilters.tsx`
- Create: `app/(public)/page.tsx`

- [ ] **Step 1: Write components/public/PropertyCard.tsx**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage = property.property_images?.[0]?.url

  const bedroomsLabel =
    property.bedrooms_min === property.bedrooms_max
      ? `${property.bedrooms_min} quarto${property.bedrooms_min !== 1 ? 's' : ''}`
      : `${property.bedrooms_min}–${property.bedrooms_max} quartos`

  const areaLabel =
    property.area_min === property.area_max
      ? `${property.area_min} m²`
      : `${property.area_min}–${property.area_max} m²`

  return (
    <Link href={`/imovel/${property.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
              Sem foto
            </div>
          )}
          {property.is_launch && (
            <div className="absolute top-3 left-3">
              <Badge variant="launch">Lançamento</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 text-base leading-snug line-clamp-2 mb-1">
            {property.title}
          </h3>
          <p className="text-sm text-zinc-500 mb-3">
            {property.neighborhood && `${property.neighborhood}, `}
            {property.city} – {property.state}
          </p>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
            <span>{bedroomsLabel}</span>
            <span>·</span>
            <span>{areaLabel}</span>
          </div>
          <p className="font-semibold text-zinc-900 text-base">
            {formatPrice(property.price)}
          </p>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Write components/public/PropertyFilters.tsx**

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface PropertyFiltersProps {
  cities: string[]
}

export function PropertyFilters({ cities }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-3">
      <select
        defaultValue={searchParams.get('city') ?? ''}
        onChange={(e) => updateFilter('city', e.target.value)}
        className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <option value="">Todas as cidades</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('bedrooms') ?? ''}
        onChange={(e) => updateFilter('bedrooms', e.target.value)}
        className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <option value="">Quartos</option>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n}+ quartos
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('maxPrice') ?? ''}
        onChange={(e) => updateFilter('maxPrice', e.target.value)}
        className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <option value="">Preço máximo</option>
        <option value="300000">Até R$ 300.000</option>
        <option value="500000">Até R$ 500.000</option>
        <option value="800000">Até R$ 800.000</option>
        <option value="1200000">Até R$ 1.200.000</option>
      </select>
    </div>
  )
}
```

- [ ] **Step 3: Write app/(public)/page.tsx**

```tsx
import { Suspense } from 'react'
import { getProperties, getUniqueCities } from '@/services/properties'
import { PropertyCard } from '@/components/public/PropertyCard'
import { PropertyFilters } from '@/components/public/PropertyFilters'

export const revalidate = 60

interface PageProps {
  searchParams: { city?: string; maxPrice?: string; bedrooms?: string }
}

export default async function HomePage({ searchParams }: PageProps) {
  const [properties, cities] = await Promise.all([
    getProperties({
      city: searchParams.city,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined,
    }),
    getUniqueCities(),
  ])

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-100 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-semibold text-zinc-900 text-lg tracking-tight">
            Barone Imóveis
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Encontre seu imóvel ideal
          </h1>
          <p className="text-zinc-500">
            {properties.length} imóve{properties.length !== 1 ? 'is' : 'l'} disponíve{properties.length !== 1 ? 'is' : 'l'}
          </p>
        </div>

        <div className="mb-8">
          <Suspense>
            <PropertyFilters cities={cities} />
          </Suspense>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            Nenhum imóvel encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/public/PropertyCard.tsx components/public/PropertyFilters.tsx app/\(public\)/page.tsx
git commit -m "feat: property listing page with filters"
```

---

### Task 11: Property Hero + Gallery

**Files:**
- Create: `components/public/PropertyHero.tsx`
- Create: `components/public/PropertyGallery.tsx`

- [ ] **Step 1: Write components/public/PropertyHero.tsx**

```tsx
'use client'

import { Property } from '@/types/property'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { trackEvent } from '@/lib/tracking'

interface PropertyHeroProps {
  property: Property
  whatsappNumber: string
  leadsCount: number
}

export function PropertyHero({ property, whatsappNumber, leadsCount }: PropertyHeroProps) {
  const socialProofCount = Math.max(leadsCount + property.views_count, 47)
  const waMessage = `Olá, tenho interesse no imóvel ${property.title}`
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`

  function handleWhatsApp() {
    trackEvent('click_whatsapp', {
      property_id: property.id,
      source: 'hero',
    })
  }

  const bedroomsLabel =
    property.bedrooms_min === property.bedrooms_max
      ? `${property.bedrooms_min} quarto${property.bedrooms_min !== 1 ? 's' : ''}`
      : `${property.bedrooms_min} e ${property.bedrooms_max} quartos`

  const areaLabel =
    property.area_min === property.area_max
      ? `${property.area_min} m²`
      : `${property.area_min} e ${property.area_max} m²`

  return (
    <section className="bg-white border-b border-zinc-100 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {property.is_launch && <Badge variant="launch">Lançamento</Badge>}
          <Badge>{property.city} – {property.state}</Badge>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 leading-tight mb-2">
          {property.title}
        </h1>

        <p className="text-zinc-500 mb-4">
          {property.neighborhood && `${property.neighborhood}, `}
          {property.city} – {property.state}
        </p>

        <p className="text-sm text-zinc-500 mb-6">
          {bedroomsLabel} · {areaLabel}
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            +{socialProofCount} pessoas demonstraram interesse
          </div>
          {property.urgency_text && (
            <span className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              {property.urgency_text}
            </span>
          )}
        </div>

        <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={handleWhatsApp}>
          <Button variant="whatsapp" size="lg" className="w-full sm:w-auto">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.525 5.857L.057 23.077a.75.75 0 0 0 .92.92l5.22-1.468A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.704 9.704 0 0 1-4.951-1.354l-.355-.212-3.682 1.034 1.034-3.682-.212-.355A9.705 9.705 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
            </svg>
            Tenho interesse
          </Button>
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write components/public/PropertyGallery.tsx**

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PropertyImage } from '@/types/property'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0)
  const sorted = [...images].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) return null

  function prev() {
    setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))
  }

  function next() {
    setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))
  }

  return (
    <section className="bg-zinc-900">
      <div className="relative max-w-5xl mx-auto">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={sorted[current].url}
            alt={`${title} — foto ${current + 1}`}
            fill
            className="object-cover"
            priority={current === 0}
            sizes="(max-width: 1024px) 100vw, 1024px"
          />

          {sorted.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
              >
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
            {current + 1} / {sorted.length}
          </div>
        </div>

        {sorted.length > 1 && (
          <div className="flex gap-1.5 p-3 overflow-x-auto bg-zinc-900">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 relative w-16 h-12 rounded overflow-hidden border-2 transition ${
                  i === current ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <Image src={img.url} alt={`Miniatura ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/public/PropertyHero.tsx components/public/PropertyGallery.tsx
git commit -m "feat: property hero + gallery carousel"
```

---

### Task 12: Property Detail Sections

**Files:**
- Create: `components/public/PropertyQuickInfo.tsx`
- Create: `components/public/PropertyFeatures.tsx`
- Create: `components/public/PropertyAmenities.tsx`

- [ ] **Step 1: Write components/public/PropertyQuickInfo.tsx**

```tsx
import { Property } from '@/types/property'

interface QuickInfoProps {
  property: Property
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-zinc-50 rounded-2xl text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold text-zinc-900">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  )
}

export function PropertyQuickInfo({ property }: QuickInfoProps) {
  const bedroomsValue =
    property.bedrooms_min === property.bedrooms_max
      ? String(property.bedrooms_min)
      : `${property.bedrooms_min}–${property.bedrooms_max}`

  const areaValue =
    property.area_min === property.area_max
      ? `${property.area_min} m²`
      : `${property.area_min}–${property.area_max} m²`

  return (
    <section className="px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Informações</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoItem icon="🛏" label="Quartos" value={bedroomsValue} />
          <InfoItem icon="📐" label="Área" value={areaValue} />
          <InfoItem icon="🚿" label="Banheiros" value={String(property.bathrooms)} />
          <InfoItem
            icon="🚗"
            label="Vagas"
            value={property.parking === 0 ? 'Sem vaga' : `até ${property.parking}`}
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write components/public/PropertyFeatures.tsx**

```tsx
import { PropertyFeature } from '@/types/property'

interface PropertyFeaturesProps {
  features: PropertyFeature[]
}

export function PropertyFeatures({ features }: PropertyFeaturesProps) {
  if (features.length === 0) return null

  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Diferenciais</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <li key={f.id} className="flex items-center gap-3 text-zinc-700 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 flex-shrink-0" />
              {f.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write components/public/PropertyAmenities.tsx**

```tsx
import { PropertyAmenity } from '@/types/property'

interface PropertyAmenitiesProps {
  amenities: PropertyAmenity[]
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  if (amenities.length === 0) return null

  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Amenidades</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {amenities.map((a) => (
            <div
              key={a.id}
              className="px-4 py-3 bg-zinc-50 rounded-xl text-sm text-zinc-700 text-center"
            >
              {a.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/public/PropertyQuickInfo.tsx components/public/PropertyFeatures.tsx components/public/PropertyAmenities.tsx
git commit -m "feat: property quick info, features, amenities sections"
```

---

### Task 13: Map + Floorplans

**Files:**
- Create: `components/public/PropertyMap.tsx`
- Create: `components/public/PropertyFloorplans.tsx`

- [ ] **Step 1: Write components/public/PropertyMap.tsx**

```tsx
interface PropertyMapProps {
  latitude: number
  longitude: number
  title: string
}

export function PropertyMap({ latitude, longitude, title }: PropertyMapProps) {
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&output=embed&z=15`

  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Localização</h2>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition"
          >
            Abrir no Google Maps ↗
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden border border-zinc-100 aspect-[16/9]">
          <iframe
            src={embedUrl}
            title={`Localização de ${title}`}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write components/public/PropertyFloorplans.tsx**

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PropertyFloorplan } from '@/types/property'

interface PropertyFloorplansProps {
  floorplans: PropertyFloorplan[]
}

export function PropertyFloorplans({ floorplans }: PropertyFloorplansProps) {
  const [active, setActive] = useState(0)

  if (floorplans.length === 0) return null

  const current = floorplans[active]

  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Plantas</h2>

        {floorplans.length > 1 && (
          <div className="flex gap-2 mb-4">
            {floorplans.map((fp, i) => (
              <button
                key={fp.id}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-xl text-sm transition ${
                  i === active
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {fp.label}
              </button>
            ))}
          </div>
        )}

        <div className="relative aspect-[4/3] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100">
          <Image
            src={current.url}
            alt={current.label}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 800px"
          />
        </div>

        <div className="mt-4">
          <a
            href={current.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition"
          >
            ↓ Baixar planta — {current.label}
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/public/PropertyMap.tsx components/public/PropertyFloorplans.tsx
git commit -m "feat: property map + floorplans with download"
```

---

### Task 14: Lead Form (Sticky Mobile)

**Files:**
- Create: `components/public/LeadForm.tsx`

- [ ] **Step 1: Write components/public/LeadForm.tsx**

```tsx
'use client'

import { useState } from 'react'
import { formatPhone } from '@/lib/utils'
import { trackEvent } from '@/lib/tracking'
import { Button } from '@/components/ui/Button'

interface LeadFormProps {
  propertyId: string
  propertyTitle: string
  whatsappNumber: string
}

export function LeadForm({ propertyId, propertyTitle, whatsappNumber }: LeadFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [interest, setInterest] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (phone.length < 14) {
      setError('Telefone inválido. Ex: (11) 99999-9999')
      return
    }
    setError('')
    setLoading(true)

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId, name: name || undefined, phone, interest }),
    })

    setLoading(false)

    if (res.ok) {
      trackEvent('submit_lead', { property_id: propertyId, interest })
      setSubmitted(true)

      const waMsg = `Olá, me chamo ${name || 'visitante'} e tenho interesse no imóvel ${propertyTitle}`
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`
      setTimeout(() => window.open(waUrl, '_blank'), 600)
    } else {
      setError('Erro ao enviar. Tente novamente.')
    }
  }

  if (submitted) {
    return (
      <>
        {/* Inline (desktop) */}
        <section className="hidden md:block px-4 py-10 border-t border-zinc-100">
          <div className="max-w-4xl mx-auto text-center py-8">
            <p className="text-2xl mb-2">✓</p>
            <p className="font-semibold text-zinc-900">Recebemos seu contato!</p>
            <p className="text-sm text-zinc-500 mt-1">Em breve entraremos em contato.</p>
          </div>
        </section>

        {/* Sticky (mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-4 py-3 text-center">
          <p className="text-sm font-medium text-zinc-900">✓ Contato enviado!</p>
        </div>
      </>
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Seu nome (opcional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      <input
        type="tel"
        placeholder="Telefone (obrigatório)"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        required
      />
      <select
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
        required
      >
        <option value="">Qual é seu interesse?</option>
        <option value="comprar">Quero comprar</option>
        <option value="investir">Quero investir</option>
        <option value="alugar">Quero alugar</option>
        <option value="informacoes">Só quero informações</option>
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Enviando…' : 'Quero ser contactado'}
      </Button>
    </form>
  )

  return (
    <>
      {/* Inline section for desktop */}
      <section className="hidden md:block px-4 py-10 border-t border-zinc-100 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Fale com um especialista</h2>
          <p className="text-sm text-zinc-500 mb-6">Preencha abaixo e entraremos em contato rapidamente.</p>
          <div className="max-w-md">{formContent}</div>
        </div>
      </section>

      {/* Sticky bottom bar for mobile */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-4 pt-3 pb-4 shadow-lg">
        <p className="text-sm font-semibold text-zinc-900 mb-2">Tenho interesse neste imóvel</p>
        {formContent}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/public/LeadForm.tsx
git commit -m "feat: sticky mobile lead form"
```

---

### Task 15: Property Detail Page Assembly

**Files:**
- Create: `app/(public)/imovel/[slug]/page.tsx`

- [ ] **Step 1: Write app/(public)/imovel/[slug]/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPropertyBySlug } from '@/services/properties'
import { createClient } from '@/lib/supabase/server'
import { PropertyHero } from '@/components/public/PropertyHero'
import { PropertyGallery } from '@/components/public/PropertyGallery'
import { PropertyQuickInfo } from '@/components/public/PropertyQuickInfo'
import { PropertyFeatures } from '@/components/public/PropertyFeatures'
import { PropertyAmenities } from '@/components/public/PropertyAmenities'
import { PropertyFloorplans } from '@/components/public/PropertyFloorplans'
import { PropertyMap } from '@/components/public/PropertyMap'
import { LeadForm } from '@/components/public/LeadForm'
import { ViewTracker } from '@/components/public/ViewTracker'

export const revalidate = 60

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug)
  if (!property) return {}

  const bedroomsLabel =
    property.bedrooms_min === property.bedrooms_max
      ? `${property.bedrooms_min} quartos`
      : `${property.bedrooms_min} e ${property.bedrooms_max} quartos`

  return {
    title: `${property.title} | ${bedroomsLabel} em ${property.neighborhood ?? property.city}`,
    description: `${property.title} — ${bedroomsLabel}, ${property.area_min}–${property.area_max} m², ${property.city}–${property.state}. ${property.description?.slice(0, 120) ?? 'Conheça este imóvel e fale conosco.'}`,
    openGraph: {
      title: property.title,
      images: property.property_images?.[0]?.url
        ? [property.property_images[0].url]
        : [],
    },
  }
}

async function getLeadsCount(propertyId: string): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId)
  return count ?? 0
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const [property, leadsCount] = await Promise.all([
    getPropertyBySlug(params.slug),
    (async () => {
      const p = await getPropertyBySlug(params.slug)
      return p ? getLeadsCount(p.id) : 0
    })(),
  ])

  if (!property) notFound()

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `https://baroneimoveis.com/imovel/${property.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: 'BR',
    },
    ...(property.price && {
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'BRL',
      },
    }),
    ...(property.property_images?.length && {
      image: property.property_images.map((i) => i.url),
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <ViewTracker slug={params.slug} propertyId={property.id} />

      <main className="min-h-screen bg-white pb-48 md:pb-0">
        <PropertyHero
          property={property}
          whatsappNumber={waNumber}
          leadsCount={leadsCount}
        />

        {property.property_images && property.property_images.length > 0 && (
          <PropertyGallery images={property.property_images} title={property.title} />
        )}

        <PropertyQuickInfo property={property} />

        {property.description && (
          <section className="px-4 py-10 border-t border-zinc-100">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Descrição</h2>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </section>
        )}

        <PropertyFeatures features={property.property_features ?? []} />
        <PropertyAmenities amenities={property.property_amenities ?? []} />

        {property.property_floorplans && property.property_floorplans.length > 0 && (
          <PropertyFloorplans floorplans={property.property_floorplans} />
        )}

        {property.latitude && property.longitude && (
          <PropertyMap
            latitude={property.latitude}
            longitude={property.longitude}
            title={property.title}
          />
        )}

        <LeadForm
          propertyId={property.id}
          propertyTitle={property.title}
          whatsappNumber={waNumber}
        />
      </main>
    </>
  )
}
```

- [ ] **Step 2: Write components/public/ViewTracker.tsx**

```tsx
'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/tracking'

interface ViewTrackerProps {
  slug: string
  propertyId: string
}

export function ViewTracker({ slug, propertyId }: ViewTrackerProps) {
  useEffect(() => {
    trackEvent('view_property', { property_id: propertyId, slug })
    fetch(`/api/properties/${slug}/view`, { method: 'POST' })
  }, [slug, propertyId])

  return null
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/imovel/ components/public/ViewTracker.tsx
git commit -m "feat: property detail page — ISR, SEO, Schema.org, view tracking"
```

---

### Task 16: Admin Layout + Dashboard

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/dashboard/page.tsx`

- [ ] **Step 1: Write app/(admin)/layout.tsx**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { GeistSans } from 'geist/font/sans'
import '@/app/globals.css'

export const metadata: Metadata = { title: 'Barone Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body className="bg-zinc-50">
        <div className="min-h-screen flex">
          <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col py-6 px-4 fixed h-full">
            <span className="font-bold text-zinc-900 text-base mb-8 px-2">
              Barone Admin
            </span>
            <nav className="flex flex-col gap-1">
              <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition">
                Dashboard
              </Link>
              <Link href="/imoveis" className="px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition">
                Imóveis
              </Link>
            </nav>
          </aside>
          <main className="ml-56 flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Write app/(admin)/dashboard/page.tsx**

```tsx
import Link from 'next/link'
import { getDashboardStats } from '@/services/admin'

export default async function DashboardPage() {
  const { propertyCount, recentLeads } = await getDashboardStats()

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <p className="text-3xl font-bold text-zinc-900">{propertyCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Imóveis</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <p className="text-3xl font-bold text-zinc-900">{recentLeads.length}</p>
          <p className="text-sm text-zinc-500 mt-1">Leads recentes</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Últimos leads</h2>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {recentLeads.length === 0 ? (
          <p className="text-sm text-zinc-400 p-5">Nenhum lead ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Nome</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Telefone</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Interesse</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead: any) => (
                <tr key={lead.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-5 py-3 text-zinc-900">{lead.name || '—'}</td>
                  <td className="px-5 py-3 text-zinc-900">{lead.phone}</td>
                  <td className="px-5 py-3 text-zinc-600">{lead.interest}</td>
                  <td className="px-5 py-3 text-zinc-400">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/
git commit -m "feat: admin layout + dashboard"
```

---

### Task 17: Admin Form Components

**Files:**
- Create: `components/admin/DynamicList.tsx`
- Create: `components/admin/ImageUpload.tsx`
- Create: `components/admin/PropertyForm.tsx`

- [ ] **Step 1: Write components/admin/DynamicList.tsx**

```tsx
'use client'

import { useState } from 'react'

interface DynamicListProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
}

export function DynamicList({ label, items, onChange }: DynamicListProps) {
  const [draft, setDraft] = useState('')

  function add() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setDraft('')
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <p className="text-sm font-medium text-zinc-700 mb-2">{label}</p>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={`Adicionar ${label.toLowerCase()}…`}
          className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-700 transition"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full text-sm text-zinc-700"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-zinc-400 hover:text-zinc-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write components/admin/ImageUpload.tsx**

```tsx
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  bucket: 'property-images' | 'property-floorplans'
  propertyId: string
  existingUrls?: string[]
  label?: string
}

export function ImageUpload({
  bucket,
  propertyId,
  existingUrls = [],
  label = 'Imagens',
}: ImageUploadProps) {
  const [urls, setUrls] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
    }

    setUrls((prev) => [...prev, ...newUrls])
    setUploading(false)
  }

  function removeUrl(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url))
  }

  return (
    <div>
      <p className="text-sm font-medium text-zinc-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-3 mb-3">
        {urls.map((url) => (
          <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200">
            <Image src={url} alt="upload" fill className="object-cover" sizes="96px" />
            <button
              type="button"
              onClick={() => removeUrl(url)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center text-2xl text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition disabled:opacity-50"
        >
          {uploading ? '…' : '+'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {/* Pass URLs as hidden inputs so the form can read them */}
      {urls.map((url, i) => (
        <input key={i} type="hidden" name={`${bucket}-url-${i}`} value={url} />
      ))}
      <input type="hidden" name={`${bucket}-count`} value={urls.length} />
    </div>
  )
}
```

- [ ] **Step 3: Write components/admin/PropertyForm.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DynamicList } from '@/components/admin/DynamicList'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { generateSlug } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { upsertFeatures, upsertAmenities } from '@/services/admin'

interface PropertyFormProps {
  mode: 'create' | 'edit'
  propertyId?: string
  defaultValues?: Record<string, any>
}

export function PropertyForm({ mode, propertyId, defaultValues = {} }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [features, setFeatures] = useState<string[]>(
    defaultValues.property_features?.map((f: any) => f.name) ?? []
  )
  const [amenities, setAmenities] = useState<string[]>(
    defaultValues.property_amenities?.map((a: any) => a.name) ?? []
  )
  const [title, setTitle] = useState(defaultValues.title ?? '')

  const id = propertyId ?? 'new'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const payload = {
      title: form.get('title') as string,
      slug: form.get('slug') as string,
      description: form.get('description') as string,
      neighborhood: form.get('neighborhood') as string,
      city: form.get('city') as string,
      state: form.get('state') as string,
      price: form.get('price') ? Number(form.get('price')) : null,
      bedrooms_min: Number(form.get('bedrooms_min')),
      bedrooms_max: Number(form.get('bedrooms_max')),
      bathrooms: Number(form.get('bathrooms')),
      area_min: Number(form.get('area_min')),
      area_max: Number(form.get('area_max')),
      parking: Number(form.get('parking')),
      latitude: form.get('latitude') ? Number(form.get('latitude')) : null,
      longitude: form.get('longitude') ? Number(form.get('longitude')) : null,
      is_launch: form.get('is_launch') === 'on',
      urgency_text: (form.get('urgency_text') as string) || null,
    }

    let finalId = propertyId

    if (mode === 'create') {
      const { data, error: err } = await supabase
        .from('properties')
        .insert(payload)
        .select('id')
        .single()
      if (err) { setError(err.message); setLoading(false); return }
      finalId = data.id
    } else {
      const { error: err } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', propertyId!)
      if (err) { setError(err.message); setLoading(false); return }
    }

    // Upsert features + amenities
    const imgCount = Number(form.get('property-images-count') ?? 0)
    const fpCount = Number(form.get('property-floorplans-count') ?? 0)

    if (finalId) {
      await Promise.all([
        upsertFeatures(finalId, features),
        upsertAmenities(finalId, amenities),
        // Insert images
        (async () => {
          await supabase.from('property_images').delete().eq('property_id', finalId!)
          const imgs = Array.from({ length: imgCount }, (_, i) =>
            form.get(`property-images-url-${i}`) as string
          ).filter(Boolean)
          if (imgs.length > 0) {
            await supabase.from('property_images').insert(
              imgs.map((url, order) => ({ property_id: finalId!, url, order }))
            )
          }
        })(),
        // Insert floorplans
        (async () => {
          await supabase.from('property_floorplans').delete().eq('property_id', finalId!)
          const fps = Array.from({ length: fpCount }, (_, i) =>
            form.get(`property-floorplans-url-${i}`) as string
          ).filter(Boolean)
          if (fps.length > 0) {
            await supabase.from('property_floorplans').insert(
              fps.map((url) => ({ property_id: finalId!, url, label: 'Planta' }))
            )
          }
        })(),
      ])
    }

    router.push('/imoveis')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input
            label="Título *"
            name="title"
            required
            defaultValue={defaultValues.title}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
            }}
          />
        </div>

        <div className="col-span-2">
          <Input
            label="Slug *"
            name="slug"
            required
            defaultValue={defaultValues.slug ?? generateSlug(title)}
            placeholder="vibra-rio-bonito-sao-paulo-sp"
          />
        </div>

        <Input label="Bairro" name="neighborhood" defaultValue={defaultValues.neighborhood} />
        <Input label="Cidade" name="city" defaultValue={defaultValues.city} />
        <Input label="Estado (UF)" name="state" defaultValue={defaultValues.state} maxLength={2} />
        <Input label="Preço (R$, vazio = sob consulta)" name="price" type="number" defaultValue={defaultValues.price ?? ''} />

        <Input label="Quartos mín." name="bedrooms_min" type="number" min={0} defaultValue={defaultValues.bedrooms_min ?? 1} required />
        <Input label="Quartos máx." name="bedrooms_max" type="number" min={0} defaultValue={defaultValues.bedrooms_max ?? 1} required />
        <Input label="Área mín. (m²)" name="area_min" type="number" min={0} defaultValue={defaultValues.area_min ?? ''} required />
        <Input label="Área máx. (m²)" name="area_max" type="number" min={0} defaultValue={defaultValues.area_max ?? ''} required />
        <Input label="Banheiros" name="bathrooms" type="number" min={0} defaultValue={defaultValues.bathrooms ?? 1} required />
        <Input label="Vagas" name="parking" type="number" min={0} defaultValue={defaultValues.parking ?? 0} required />

        <Input label="Latitude" name="latitude" type="number" step="any" defaultValue={defaultValues.latitude ?? ''} />
        <Input label="Longitude" name="longitude" type="number" step="any" defaultValue={defaultValues.longitude ?? ''} />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700 block mb-1">Descrição</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={defaultValues.description}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700 block mb-1">Microcopy de urgência</label>
        <input
          name="urgency_text"
          type="text"
          defaultValue={defaultValues.urgency_text ?? ''}
          placeholder="Ex: Últimas unidades disponíveis"
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
        <input type="checkbox" name="is_launch" defaultChecked={defaultValues.is_launch} className="rounded" />
        Lançamento
      </label>

      <DynamicList label="Diferenciais" items={features} onChange={setFeatures} />
      <DynamicList label="Amenidades" items={amenities} onChange={setAmenities} />

      <ImageUpload
        bucket="property-images"
        propertyId={id}
        existingUrls={defaultValues.property_images?.map((i: any) => i.url) ?? []}
        label="Fotos do imóvel"
      />

      <ImageUpload
        bucket="property-floorplans"
        propertyId={id}
        existingUrls={defaultValues.property_floorplans?.map((i: any) => i.url) ?? []}
        label="Plantas baixas"
      />

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? 'Salvando…' : mode === 'create' ? 'Criar imóvel' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/admin/
git commit -m "feat: admin form components — DynamicList, ImageUpload, PropertyForm"
```

---

### Task 18: Admin CRUD Pages

**Files:**
- Create: `app/(admin)/imoveis/page.tsx`
- Create: `app/(admin)/imoveis/novo/page.tsx`
- Create: `app/(admin)/imoveis/[id]/editar/page.tsx`

- [ ] **Step 1: Write app/(admin)/imoveis/page.tsx**

```tsx
import Link from 'next/link'
import { getAllProperties } from '@/services/admin'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Imóveis</h1>
        <Link
          href="/imoveis/novo"
          className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-700 transition"
        >
          + Novo imóvel
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100">
            <tr>
              <th className="text-left px-5 py-3 text-zinc-500 font-medium">Título</th>
              <th className="text-left px-5 py-3 text-zinc-500 font-medium">Cidade</th>
              <th className="text-left px-5 py-3 text-zinc-500 font-medium">Preço</th>
              <th className="text-left px-5 py-3 text-zinc-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className="px-5 py-3 text-zinc-900 font-medium">{p.title}</td>
                <td className="px-5 py-3 text-zinc-500">{p.city}</td>
                <td className="px-5 py-3 text-zinc-500">{formatPrice(p.price)}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/imoveis/${p.id}/editar`}
                      className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2"
                    >
                      Editar
                    </Link>
                    <DeleteButton propertyId={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && (
          <p className="text-sm text-zinc-400 p-5">Nenhum imóvel cadastrado.</p>
        )}
      </div>
    </div>
  )
}

function DeleteButton({ propertyId }: { propertyId: string }) {
  async function deleteAction() {
    'use server'
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    await supabase.from('properties').delete().eq('id', propertyId)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/imoveis')
  }

  return (
    <form action={deleteAction}>
      <button type="submit" className="text-red-400 hover:text-red-600 underline underline-offset-2">
        Excluir
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Write app/(admin)/imoveis/novo/page.tsx**

```tsx
import { PropertyForm } from '@/components/admin/PropertyForm'

export default function NewPropertyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Novo imóvel</h1>
      <PropertyForm mode="create" />
    </div>
  )
}
```

- [ ] **Step 3: Write app/(admin)/imoveis/[id]/editar/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import { getPropertyById } from '@/services/admin'
import { PropertyForm } from '@/components/admin/PropertyForm'

interface PageProps {
  params: { id: string }
}

export default async function EditPropertyPage({ params }: PageProps) {
  const property = await getPropertyById(params.id)
  if (!property) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Editar: {property.title}</h1>
      <PropertyForm mode="edit" propertyId={property.id} defaultValues={property} />
    </div>
  )
}
```

- [ ] **Step 4: Create Supabase Storage buckets**

In Supabase dashboard → Storage → New bucket:
- Name: `property-images`, Public: ✓
- Name: `property-floorplans`, Public: ✓

- [ ] **Step 5: Commit**

```bash
git add app/\(admin\)/imoveis/
git commit -m "feat: admin CRUD pages — list, create, edit"
```

---

### Task 19: Mock Data Seed

**Files:**
- Create: `supabase/migrations/002_seed.sql`

- [ ] **Step 1: Write 002_seed.sql**

```sql
-- Seed: Vibra Rio Bonito
do $$
declare
  prop_id uuid := gen_random_uuid();
begin

insert into properties (
  id, slug, title, description,
  neighborhood, city, state,
  price,
  bedrooms_min, bedrooms_max,
  bathrooms, area_min, area_max,
  parking, is_launch,
  urgency_text,
  latitude, longitude
) values (
  prop_id,
  'vibra-rio-bonito-rio-bonito-sao-paulo-sp',
  'Vibra Rio Bonito',
  'O Vibra Rio Bonito é um empreendimento residencial moderno localizado no bairro Rio Bonito, em São Paulo. Com apartamentos de 1 e 2 dormitórios, oferece praticidade e conforto para quem busca qualidade de vida na cidade. Acabamentos de alto padrão, área de lazer completa e localização privilegiada próxima ao metrô.',
  'Rio Bonito', 'São Paulo', 'SP',
  null,
  1, 2,
  1, 34, 41,
  1, true,
  'Últimas unidades disponíveis',
  -23.5505, -46.6333
);

-- Images (using public placeholder images)
insert into property_images (property_id, url, "order") values
  (prop_id, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', 0),
  (prop_id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', 1),
  (prop_id, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80', 2),
  (prop_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80', 3);

-- Floorplans
insert into property_floorplans (property_id, url, label) values
  (prop_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', '1 Dormitório — 34 m²'),
  (prop_id, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d38?w=800&q=80', '2 Dormitórios — 41 m²');

-- Amenities
insert into property_amenities (property_id, name) values
  (prop_id, 'Portaria 24h'),
  (prop_id, 'Piscina'),
  (prop_id, 'Academia'),
  (prop_id, 'Salão de Festas'),
  (prop_id, 'Playground'),
  (prop_id, 'Espaço Gourmet'),
  (prop_id, 'Bicicletário'),
  (prop_id, 'Pet Place');

-- Features (differentials)
insert into property_features (property_id, name) values
  (prop_id, 'Varanda em todos os apartamentos'),
  (prop_id, 'Acabamento premium'),
  (prop_id, 'Área de lazer completa'),
  (prop_id, 'Próximo ao metrô'),
  (prop_id, 'Infraestrutura para ar-condicionado'),
  (prop_id, 'Elevador'),
  (prop_id, 'Gerador de energia'),
  (prop_id, 'Espaço coworking');

-- Status
insert into property_status (property_id, stage, date) values
  (prop_id, 'Lançamento', '2025-01'),
  (prop_id, 'Obras iniciadas', '2025-06'),
  (prop_id, 'Entrega prevista', '2027-12');

end $$;
```

- [ ] **Step 2: Run seed in Supabase SQL Editor**

Open Supabase project → SQL Editor → paste contents of `002_seed.sql` → Run.

Expected: No error. Query should complete.

- [ ] **Step 3: Verify data in Supabase Table Editor**

Open Table Editor → `properties` → confirm 1 row with slug `vibra-rio-bonito-rio-bonito-sao-paulo-sp`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/002_seed.sql
git commit -m "feat: mock data seed — Vibra Rio Bonito"
```

---

### Task 20: Deploy Configuration

**Files:**
- Create: `.env.local` (from example, NOT committed)
- Create: `vercel.json` (optional, for subdomain routing)

- [ ] **Step 1: Copy .env.local.example to .env.local**

```bash
cp .env.local.example .env.local
```

Fill in real values in `.env.local` (not committed).

- [ ] **Step 2: Add .env.local to .gitignore**

Verify `.gitignore` already contains `.env.local` (Next.js scaffold adds this). If not:

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 3: Write vercel.json (subdomain routing)**

```json
{
  "rewrites": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "admin.baroneimoveis.com" }],
      "destination": "/:path*"
    }
  ]
}
```

Note: The admin subdomain routing is handled by DNS (CNAME to Vercel) + middleware. No special rewrite needed unless the admin routes need to be isolated. The middleware already protects `/dashboard` and `/imoveis` routes.

- [ ] **Step 4: Final build check**

```bash
npm run build
```

Expected: Successful build. Note any TypeScript errors and fix before deploy.

- [ ] **Step 5: Commit**

```bash
git add vercel.json .gitignore
git commit -m "chore: deploy configuration"
```

---

### Task 21: Final Integration Check

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify public listing page**

Open `http://localhost:3000` — should show Vibra Rio Bonito card.

- [ ] **Step 3: Verify property detail page**

Open `http://localhost:3000/imovel/vibra-rio-bonito-rio-bonito-sao-paulo-sp` — confirm all sections render: hero, gallery, quick info, features, amenities, map, lead form.

- [ ] **Step 4: Verify admin login**

Open `http://localhost:3000/login` → enter value from `ADMIN_SECRET` in `.env.local` → should redirect to `/dashboard`.

- [ ] **Step 5: Verify admin CRUD**

Navigate to `/imoveis` → click "+ Novo imóvel" → fill form → create → verify appears in list.

- [ ] **Step 6: Verify lead form**

On property detail page, fill phone + interest → submit → check `leads` table in Supabase dashboard.

- [ ] **Step 7: Verify WhatsApp button**

Click floating WhatsApp button → confirm correct URL opens in new tab with correct number.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: final integration verified"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|-------------|------|
| Listagem com filtros | Task 10 |
| Página detalhe — hero, galeria, info, diferenciais, amenidades, plantas, mapa | Tasks 11–15 |
| Formulário sticky mobile | Task 14 |
| WhatsApp flutuante global | Task 9 |
| SEO (generateMetadata + Schema.org) | Task 15 |
| ISR revalidate=60 | Tasks 10, 15 |
| Tracking (Pixel, GA, eventos) | Tasks 9, 15 + trackEvent calls |
| Microcopy urgency + prova social dinâmica | Task 11 |
| Slug com localização | Task 19 (seed), Task 5 (generateSlug) |
| Admin CRUD + upload | Tasks 17–18 |
| Admin auth cookie-only | Tasks 6–7 |
| Mapa iframe + botão abrir | Task 13 |
| Mock data Vibra Rio Bonito | Task 19 |
| Deploy ready | Task 20 |
| Supabase schema | Task 3 |
