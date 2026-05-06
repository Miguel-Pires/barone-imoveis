-- Tabela principal de imóveis
-- Execute este SQL no Supabase > SQL Editor

create table if not exists imoveis (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  subtitulo text,
  descricao text not null,
  tipo text not null check (tipo in ('apartamento','cobertura','studio','loft','penthouse')),
  status text not null check (status in ('lancamento','em_construcao','pronto','usado')),
  status_anuncio text not null default 'ativo' check (status_anuncio in ('ativo','inativo','vendido')),
  preco numeric not null,
  preco_condominio numeric,
  preco_iptu numeric,
  area_total numeric not null,
  area_util numeric,
  quartos integer not null,
  banheiros integer not null,
  vagas integer not null default 0,
  suites integer default 0,
  andar_unidade integer,
  total_andares integer,
  total_unidades integer,
  diferenciais text[] default '{}',
  imagens jsonb default '[]',
  plantas_baixas jsonb default '[]',
  endereco jsonb not null,
  nome_empreendimento text,
  construtora text,
  incorporadora text,
  destaque boolean default false,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Índices
create index if not exists idx_imoveis_status_anuncio on imoveis(status_anuncio);
create index if not exists idx_imoveis_destaque on imoveis(destaque);
create index if not exists idx_imoveis_slug on imoveis(slug);

-- Trigger para atualizar atualizado_em automaticamente
create or replace function update_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_imoveis_updated
  before update on imoveis
  for each row execute function update_atualizado_em();

-- Storage bucket para fotos (execute no Supabase > Storage)
-- Criar bucket "imoveis" com acesso público

-- RLS: Leitura pública, escrita apenas autenticada via service_role
alter table imoveis enable row level security;

create policy "Leitura pública de imóveis ativos"
  on imoveis for select
  using (status_anuncio = 'ativo');

create policy "Admin pode tudo via service_role"
  on imoveis for all
  using (auth.role() = 'service_role');
