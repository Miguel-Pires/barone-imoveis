<div align="center">

<img src="docs/assets/hero.png" width="100%" alt="Imóveis Barone — Plataforma imobiliária de alto padrão"/>

<br/>
<br/>

<h1>Imóveis Barone</h1>

<p>Plataforma imobiliária de alto padrão no centro de São Paulo.<br/>
Acesse em <a href="https://www.imoveisbarone.com"><strong>imoveisbarone.com</strong></a></p>

<p>
  <a href="https://www.imoveisbarone.com">
    <img src="https://img.shields.io/badge/Site_em_produção-imoveisbarone.com-c9a96e?style=flat-square&logo=vercel&logoColor=white"/>
  </a>
  <img src="https://img.shields.io/badge/Status-Produção-22c55e?style=flat-square"/>
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
</p>

</div>

---

## Sobre o projeto

Imóveis Barone é uma plataforma imobiliária full stack para imóveis de alto padrão nos bairros mais valorizados do centro de São Paulo: Higienópolis, Moema, Vila Mariana e redondezas.

O site atende compradores reais com navegação de imóveis, captura de leads e um painel administrativo completo para gestão de listagens — tudo rodando em domínio próprio com tráfego real.

---

## Funcionalidades

**Para visitantes**
- Listagem de imóveis com galeria de imagens e valores em BRL
- Categorização por tipo (lançamento, apartamento, casa) e bairro
- Integração com WhatsApp para contato direto com o corretor
- Formulário de contato com armazenamento de leads no banco de dados

**Para o administrador**
- Painel protegido com autenticação para gestão de imóveis
- Upload e gerenciamento de imagens via Supabase Storage
- CRUD completo de listagens
- Caixa de entrada de leads

**Técnico**
- Renderização server-side para SEO — páginas indexáveis pelo Google
- Geração de sitemap automático
- Layout responsivo mobile-first

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 — App Router, SSR, Server Actions |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Storage | Supabase Storage |
| Deploy | Vercel — domínio próprio |

---

## Screenshots

<img src="docs/assets/full.png" width="100%" alt="Imóveis Barone — Página completa"/>

---

## Rodando localmente

```bash
git clone https://github.com/Miguel-Pires/imobiliaria
cd imobiliaria
npm install
cp .env.example .env.local
# Preencha as credenciais do Supabase
npm run dev
```

**Variáveis de ambiente necessárias:**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (public)/          # Páginas para visitantes
│   │   ├── imoveis/       # Listagem + [slug] detalhe
│   │   └── contato/
│   ├── admin/             # Painel administrativo protegido
│   └── api/               # Route handlers
├── components/
│   ├── ui/                # Componentes base reutilizáveis
│   └── imoveis/           # Componentes específicos de listagem
└── lib/
    └── supabase/          # Queries e cliente do banco
```

---

<div align="center">
  <sub>Desenvolvido por <a href="https://github.com/Miguel-Pires">Miguel Pires</a></sub>
</div>
