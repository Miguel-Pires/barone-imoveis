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

-- RLS
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
create policy "Public insert leads" on leads for insert with check (true);

-- increment_views RPC
create or replace function increment_views(prop_slug text)
returns void language sql as $$
  update properties set views_count = views_count + 1 where slug = prop_slug;
$$;
