import { supabaseAdmin } from './supabase'
import { Imovel, ImovelInput, CorretorPerfil, Video } from '@/types/imovel'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function rowToImovel(row: Record<string, unknown>): Imovel {
  return {
    id: row.id as string,
    slug: row.slug as string,
    titulo: row.titulo as string,
    subtitulo: row.subtitulo as string | undefined,
    descricao: row.descricao as string,
    tipo: row.tipo as Imovel['tipo'],
    status: row.status as Imovel['status'],
    statusAnuncio: row.status_anuncio as Imovel['statusAnuncio'],
    preco: Number(row.preco),
    precoCondominio: row.preco_condominio ? Number(row.preco_condominio) : undefined,
    precoIPTU: row.preco_iptu ? Number(row.preco_iptu) : undefined,
    areaTotal: Number(row.area_total),
    areaUtil: row.area_util ? Number(row.area_util) : undefined,
    quartos: Number(row.quartos),
    banheiros: Number(row.banheiros),
    vagas: Number(row.vagas),
    suites: row.suites ? Number(row.suites) : undefined,
    andarUnidade: row.andar_unidade ? Number(row.andar_unidade) : undefined,
    totalAndares: row.total_andares ? Number(row.total_andares) : undefined,
    totalUnidades: row.total_unidades ? Number(row.total_unidades) : undefined,
    diferenciais: (row.diferenciais as string[]) ?? [],
    imagens: (row.imagens as Imovel['imagens']) ?? [],
    plantasBaixas: (row.plantas_baixas as Imovel['plantasBaixas']) ?? [],
    videos: (row.videos as Video[]) ?? [],
    endereco: row.endereco as Imovel['endereco'],
    nomeEmpreendimento: row.nome_empreendimento as string | undefined,
    construtora: row.construtora as string | undefined,
    incorporadora: row.incorporadora as string | undefined,
    destaque: Boolean(row.destaque),
    criadoEm: row.criado_em as string,
    atualizadoEm: row.atualizado_em as string,
  }
}

export async function getImoveis(soAtivos = true): Promise<Imovel[]> {
  let query = supabaseAdmin.from('imoveis').select('*').order('criado_em', { ascending: false })
  if (soAtivos) query = query.eq('status_anuncio', 'ativo')
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(rowToImovel)
}

export async function getImovelBySlug(slug: string): Promise<Imovel | null> {
  const { data, error } = await supabaseAdmin
    .from('imoveis')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return rowToImovel(data)
}

export async function getImovelById(id: string): Promise<Imovel | null> {
  const { data, error } = await supabaseAdmin
    .from('imoveis')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return rowToImovel(data)
}

export async function getImoveisDestaque(): Promise<Imovel[]> {
  const { data, error } = await supabaseAdmin
    .from('imoveis')
    .select('*')
    .eq('status_anuncio', 'ativo')
    .eq('destaque', true)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToImovel)
}

export async function createImovel(input: ImovelInput): Promise<Imovel> {
  const slug = slugify(input.titulo) + '-' + Math.random().toString(36).slice(2, 8)
  const now = new Date().toISOString()

  const row = {
    slug,
    titulo: input.titulo,
    subtitulo: input.subtitulo ?? null,
    descricao: input.descricao,
    tipo: input.tipo,
    status: input.status,
    status_anuncio: input.statusAnuncio,
    preco: input.preco,
    preco_condominio: input.precoCondominio ?? null,
    preco_iptu: input.precoIPTU ?? null,
    area_total: input.areaTotal,
    area_util: input.areaUtil ?? null,
    quartos: input.quartos,
    banheiros: input.banheiros,
    vagas: input.vagas,
    suites: input.suites ?? null,
    andar_unidade: input.andarUnidade ?? null,
    total_andares: input.totalAndares ?? null,
    total_unidades: input.totalUnidades ?? null,
    diferenciais: input.diferenciais,
    imagens: input.imagens,
    plantas_baixas: input.plantasBaixas,
    videos: input.videos ?? [],
    endereco: input.endereco,
    nome_empreendimento: input.nomeEmpreendimento ?? null,
    construtora: input.construtora ?? null,
    incorporadora: input.incorporadora ?? null,
    destaque: input.destaque,
    criado_em: now,
    atualizado_em: now,
  }

  const { data, error } = await supabaseAdmin
    .from('imoveis')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return rowToImovel(data)
}

export async function updateImovel(id: string, input: Partial<ImovelInput>): Promise<Imovel | null> {
  const updates: Record<string, unknown> = {
    atualizado_em: new Date().toISOString(),
  }

  if (input.titulo !== undefined) { updates.titulo = input.titulo; updates.slug = slugify(input.titulo) + '-' + id.slice(0, 6) }
  if (input.subtitulo !== undefined) updates.subtitulo = input.subtitulo
  if (input.descricao !== undefined) updates.descricao = input.descricao
  if (input.tipo !== undefined) updates.tipo = input.tipo
  if (input.status !== undefined) updates.status = input.status
  if (input.statusAnuncio !== undefined) updates.status_anuncio = input.statusAnuncio
  if (input.preco !== undefined) updates.preco = input.preco
  if (input.precoCondominio !== undefined) updates.preco_condominio = input.precoCondominio
  if (input.precoIPTU !== undefined) updates.preco_iptu = input.precoIPTU
  if (input.areaTotal !== undefined) updates.area_total = input.areaTotal
  if (input.areaUtil !== undefined) updates.area_util = input.areaUtil
  if (input.quartos !== undefined) updates.quartos = input.quartos
  if (input.banheiros !== undefined) updates.banheiros = input.banheiros
  if (input.vagas !== undefined) updates.vagas = input.vagas
  if (input.suites !== undefined) updates.suites = input.suites
  if (input.andarUnidade !== undefined) updates.andar_unidade = input.andarUnidade
  if (input.totalAndares !== undefined) updates.total_andares = input.totalAndares
  if (input.diferenciais !== undefined) updates.diferenciais = input.diferenciais
  if (input.imagens !== undefined) updates.imagens = input.imagens
  if (input.plantasBaixas !== undefined) updates.plantas_baixas = input.plantasBaixas
  if (input.videos !== undefined) updates.videos = input.videos
  if (input.endereco !== undefined) updates.endereco = input.endereco
  if (input.destaque !== undefined) updates.destaque = input.destaque
  if (input.nomeEmpreendimento !== undefined) updates.nome_empreendimento = input.nomeEmpreendimento
  if (input.construtora !== undefined) updates.construtora = input.construtora

  const { data, error } = await supabaseAdmin
    .from('imoveis')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return rowToImovel(data)
}

export async function getImoveisRelacionados(id: string, tipo: string): Promise<Imovel[]> {
  const { data } = await supabaseAdmin
    .from('imoveis')
    .select('*')
    .eq('status_anuncio', 'ativo')
    .neq('id', id)
    .order('destaque', { ascending: false })
    .limit(12)
  if (!data) return []
  const todos = data.map(rowToImovel)
  const mesmotipo = todos.filter(i => i.tipo === tipo)
  const outros = todos.filter(i => i.tipo !== tipo)
  return [...mesmotipo, ...outros].slice(0, 3)
}

export function fakeViews(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i) | 0
  }
  return 10 + Math.abs(h) % 241
}

export async function deleteImovel(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('imoveis').delete().eq('id', id)
  return !error
}

const CORRETOR_DEFAULT: CorretorPerfil = {
  nome: 'Barone',
  especialidade: 'Especialista Centro SP',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '5511940726116',
  email: 'baroneconsultordevendas@gmail.com',
}

export async function getCorretor(): Promise<CorretorPerfil> {
  try {
    const { data } = await supabaseAdmin.from('corretor_perfil').select('*').eq('id', 1).single()
    if (!data) return CORRETOR_DEFAULT
    return {
      nome: data.nome ?? CORRETOR_DEFAULT.nome,
      creci: data.creci ?? undefined,
      especialidade: data.especialidade ?? CORRETOR_DEFAULT.especialidade,
      bio: data.bio ?? undefined,
      bio2: data.bio2 ?? undefined,
      fotoPerfil: data.foto_perfil_url ?? undefined,
      fotoCapa: data.foto_capa_url ?? undefined,
      whatsapp: data.whatsapp ?? CORRETOR_DEFAULT.whatsapp,
      email: data.email ?? undefined,
    }
  } catch {
    return CORRETOR_DEFAULT
  }
}

export async function updateCorretor(input: Partial<CorretorPerfil>): Promise<void> {
  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (input.nome !== undefined) updates.nome = input.nome
  if (input.creci !== undefined) updates.creci = input.creci || null
  if (input.especialidade !== undefined) updates.especialidade = input.especialidade
  if (input.bio !== undefined) updates.bio = input.bio || null
  if (input.bio2 !== undefined) updates.bio2 = input.bio2 || null
  if (input.fotoPerfil !== undefined) updates.foto_perfil_url = input.fotoPerfil || null
  if (input.fotoCapa !== undefined) updates.foto_capa_url = input.fotoCapa || null
  if (input.whatsapp !== undefined) updates.whatsapp = input.whatsapp
  if (input.email !== undefined) updates.email = input.email || null

  await supabaseAdmin.from('corretor_perfil').upsert({ id: 1, ...updates })
}

export function formatPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}
