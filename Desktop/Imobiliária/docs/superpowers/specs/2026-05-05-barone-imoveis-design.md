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

Middleware Next.js verifica **cookie `admin_secret`** ou **header `x-admin-secret`**. Query param (`?secret=`) removido em produção — expõe o secret em logs de servidor e analytics. Se não bater com `process.env.ADMIN_SECRET`, retorna 403. Sem login, sem JWT, sem sessions.

Login inicial: POST `/api/admin/auth` com body `{ secret }` → seta cookie `admin_secret` (httpOnly, sameSite=strict, secure em produção).

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
urgency_text text (null = não exibe microcopy)
views_count integer default 0
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

- SSR + ISR (`revalidate = 60`)
- Cards: imagem principal, título, bairro + cidade, preço ou "Sob consulta", quartos, m²
- Filtros client-side: cidade · preço (range) · quartos
- SEO: metadata estático

### `/imovel/[slug]` — Detalhe

- ISR com `revalidate = 60` — dados frescos sem rebuild completo

**Slug otimizado para SEO:**  
Formato: `{titulo-kebab}-{bairro}-{cidade}-{estado}`  
Exemplo: `vibra-rio-bonito-rio-bonito-sao-paulo-sp`

Ordem obrigatória das seções:

1. **Hero**
   - Título, localização, badge de status, tipologia
   - **Microcopy de escassez:** ex. "Últimas unidades disponíveis" (configurável por imóvel via campo `urgency_text`)
   - **Prova social dinâmica:** contador baseado em leads + views do imóvel, ex. "+{n} pessoas demonstraram interesse" — cálculo server-side, fallback para valor fixo se sem dados
   - Botão WhatsApp primário
2. **Galeria** — carrossel responsivo com `next/image`
3. **Informações Rápidas** — grid de ícones: quartos, m², vagas, banheiros
4. **Descrição** — texto descritivo do imóvel
5. **Diferenciais** — lista dinâmica de `property_features`
6. **Amenidades** — grid dinâmico de `property_amenities`
7. **Plantas** — galeria de imagens de `property_floorplans` + botão download por planta
8. **Localização** — iframe Google Maps embed via `lat/lng` (sem API key, URL pública) + botão "Abrir no Google Maps" (link externo com coordenadas)
9. **Formulário de Lead (sticky mobile)**
   - Fixo no bottom em mobile, inline no desktop
   - Campos: nome (opcional) · telefone (obrigatório) · interesse (select)
   - Validação client-side: telefone com máscara BR
   - → INSERT em `leads`
   - Após submit: mensagem de sucesso + disparo automático de WhatsApp pré-preenchido

**SEO dinâmico:**
- `generateMetadata`: title = `{Título} | {Quartos} quartos em {Bairro}, {Cidade}` — otimizado para busca com localização
- description focada em conversão: destaca diferencial principal + CTA implícito
- Schema.org `RealEstateListing` completo (nome, descrição, endereço, preço, imagens)

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

### Eventos Customizados

| Evento | Quando dispara | Dados enviados |
|--------|---------------|----------------|
| `view_property` | Montagem da página `/imovel/[slug]` | `property_id`, `title`, `slug` |
| `click_whatsapp` | Click no botão WhatsApp (flutuante ou hero) | `property_id`, `source` (hero/floating) |
| `submit_lead` | Submit do formulário de lead com sucesso | `property_id`, `interest` |

Disparados via helper `trackEvent(name, data)` que chama `fbq('track')` e `gtag('event')` simultaneamente. Se nenhum está carregado, no-op silencioso.

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
- SSR + ISR (`revalidate = 60`) nas páginas principais (`/` e `/imovel/[slug]`)
- Filtros da listagem client-side para evitar re-render do servidor

---

## Restrições

- Sem login de usuário
- Sem área de cliente
- Sem libs desnecessárias
- Sem feature flags ou compatibilidade retroativa
