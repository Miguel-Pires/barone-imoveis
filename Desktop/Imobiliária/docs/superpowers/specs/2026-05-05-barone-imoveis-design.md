# Barone Imóveis — Design Spec

**Data:** 2026-05-05  
**Status:** Aprovado  
**Objetivo:** Plataforma imobiliária focada em geração de leads diretos (WhatsApp + formulário), com painel admin separado.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router, SSR) |
| Banco de dados | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Estilo | TailwindCSS |
| Deploy | Vercel |

---

## Arquitetura

### Domínios

- **Público:** `baroneimoveis.com` — listagem + detalhe de imóveis
- **Admin:** `admin.baroneimoveis.com` — CRUD completo

### Proteção Admin

Middleware Next.js verifica cookie `admin_secret` ou query param `?secret=`. Se não bater com `process.env.ADMIN_SECRET`, retorna 403. Sem login, sem JWT, sem sessions.

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_SECRET=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_ID=
```

---

## Estrutura de Arquivos

```
/app
  /(public)
    page.tsx                          # Listagem de imóveis
    /imovel/[slug]/page.tsx           # Detalhe do imóvel
  /(admin)
    /dashboard/page.tsx               # Visão geral
    /imoveis/page.tsx                 # Lista de imóveis
    /imoveis/novo/page.tsx            # Criar imóvel
    /imoveis/[id]/editar/page.tsx     # Editar imóvel

/components
  /ui                                 # Componentes base (Button, Card, Input, etc.)
  /public                             # PropertyCard, PropertyGallery, LeadForm, etc.
  /admin                              # AdminTable, ImageUpload, etc.
  WhatsAppButton.tsx                  # Botão flutuante global

/lib
  supabase.ts                         # Cliente Supabase
  utils.ts                            # Helpers

/services
  properties.ts                       # Queries de imóveis
  leads.ts                            # Insert de leads

/styles
  globals.css
```

---

## Banco de Dados

### Tabelas Existentes (usar como estão)

- `properties` — dados principais
- `property_images` — galeria de fotos
- `property_floorplans` — plantas baixas
- `leads` — captação de contatos

### Tabelas Novas

```sql
create table property_features (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text
);

create table property_amenities (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text
);

create table property_status (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  stage text,
  date text
);
```

### Schema esperado de `properties`

```sql
id uuid
slug text unique
title text
description text
neighborhood text
city text
state text
price numeric (null = "Sob consulta")
bedrooms_min integer
bedrooms_max integer
bathrooms integer
area_min numeric
area_max numeric
parking integer
latitude numeric
longitude numeric
is_launch boolean
created_at timestamptz
```

### Schema esperado de `leads`

```sql
id uuid
property_id uuid references properties(id)
name text
phone text
interest text
created_at timestamptz
```

---

## Páginas Públicas

### `/` — Listagem

- SSR
- Cards: imagem principal, título, bairro + cidade, preço ou "Sob consulta", quartos, m²
- Filtros client-side: cidade · preço (range) · quartos
- SEO: metadata estático

### `/imovel/[slug]` — Detalhe

Ordem obrigatória das seções:

1. **Hero** — título, localização, badge de status, tipologia, prova social fake ("+700 pessoas visualizaram"), botão WhatsApp primário
2. **Galeria** — carrossel responsivo com `next/image`
3. **Informações Rápidas** — grid de ícones: quartos, m², vagas, banheiros
4. **Descrição** — texto descritivo do imóvel
5. **Diferenciais** — lista dinâmica de `property_features`
6. **Amenidades** — grid dinâmico de `property_amenities`
7. **Plantas** — galeria de imagens de `property_floorplans` + botão download por planta
8. **Localização** — iframe Google Maps embed via `lat/lng` (sem API key, URL pública)
9. **Formulário de Lead** — campos: nome, telefone, interesse → INSERT em `leads`

**SEO dinâmico:** `generateMetadata` com title + description + Schema.org `RealEstateListing`

---

## WhatsApp (Global)

Botão flutuante fixo no canto inferior direito em todas as páginas públicas.

```
URL: https://wa.me/{WHATSAPP_NUMBER}?text=Olá, tenho interesse no imóvel {titulo}
```

Em páginas sem contexto de imóvel, mensagem genérica.

---

## Tracking

- **Meta Pixel:** via `<Script>` no layout, ID via `NEXT_PUBLIC_META_PIXEL_ID`
- **Google Analytics:** via `@next/third-parties/google` ou `<Script>`, ID via `NEXT_PUBLIC_GA_ID`
- Ambos opcionais — se vars não definidas, não carregam

---

## Design

- **Estilo:** Clean, Apple + Loft — muito espaço branco, tipografia moderna
- **Fontes:** Inter ou Geist (disponível no Next.js 14)
- **Paleta:** Tons neutros (branco, cinza escuro) + cor de acento para CTAs (ex: verde WhatsApp ou azul profundo)
- **Mobile-first:** layout responsivo em todas as páginas
- **CTAs:** alto contraste, sempre visíveis, com ícone do WhatsApp
- **Imagens:** todas com `next/image` + `lazy` loading + `priority` apenas no hero

---

## Admin

### Acesso

Middleware verifica `ADMIN_SECRET`. Sem autenticação complexa.

### Features

- `/dashboard` — cards com total de imóveis e leads recentes
- `/imoveis` — tabela com todos os imóveis, links para editar/excluir
- `/imoveis/novo` — formulário completo de criação
- `/imoveis/[id]/editar` — formulário de edição com dados preenchidos

### Formulário de Imóvel (criar/editar)

Campos: título, slug, descrição, bairro, cidade, estado, preço, quartos, banheiros, área min/max, vagas, lat, lng, is_launch

Upload de imagens → Supabase Storage → insert em `property_images`  
Upload de plantas → Supabase Storage → insert em `property_floorplans`  
Diferenciais → inputs dinâmicos → insert em `property_features`  
Amenidades → inputs dinâmicos → insert em `property_amenities`

---

## Dado Mock — Vibra Rio Bonito

Seed SQL ou insert via admin:

```
título: "Vibra Rio Bonito"
slug: "vibra-rio-bonito"
bairro: "Rio Bonito"
cidade: "São Paulo"
estado: "SP"
quartos: [1, 2]
área: 34–41 m²
banheiros: 1
vagas: 1
is_launch: true
status: "Lançamento"
```

Amenidades: Portaria 24h, Piscina, Academia, Salão de Festas, Playground  
Diferenciais: Varanda, Acabamento Premium, Área de Lazer Completa, Próximo ao Metrô

---

## Performance

- `next/image` com `lazy` em todos os cards e galeria
- `priority` apenas na imagem hero
- SSR nas páginas principais (`/` e `/imovel/[slug]`)
- Filtros da listagem client-side para evitar re-render do servidor

---

## Restrições

- Sem login de usuário
- Sem área de cliente
- Sem libs desnecessárias
- Sem feature flags ou compatibilidade retroativa
