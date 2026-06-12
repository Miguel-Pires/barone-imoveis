export type TipoImovel = 'apartamento' | 'cobertura' | 'studio' | 'loft' | 'penthouse' | 'terreno' | 'loteamento'
export type StatusImovel = 'lancamento' | 'em_construcao' | 'pronto' | 'usado'
export type StatusAnuncio = 'ativo' | 'inativo' | 'vendido'

export interface PlantaBaixa {
  id: string
  titulo: string
  descricao?: string
  tipologia: string // ex: "2 dorms", "3 dorms"
  areaTotal: number
  preco?: number
  imagemUrl: string
  tipo: 'edificio' | 'unidade'
}

export interface Imagem {
  id: string
  url: string
  alt: string
  ordem: number
  destaque?: boolean
}

export interface Video {
  id: string
  titulo?: string
  tipo: 'youtube' | 'vimeo' | 'upload'
  url: string
  embedId?: string
}

export interface Endereco {
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade: string
  estado: string
  cep: string
  latitude?: number
  longitude?: number
}

export interface Imovel {
  id: string
  slug: string
  titulo: string
  subtitulo?: string
  descricao: string
  tipo: TipoImovel
  status: StatusImovel
  statusAnuncio: StatusAnuncio
  preco: number
  precoCondominio?: number
  precoIPTU?: number
  areaTotal: number
  areaUtil?: number
  quartos?: number
  banheiros?: number
  vagas: number
  suites?: number
  andares?: number
  andarUnidade?: number
  totalUnidades?: number
  totalAndares?: number
  diferenciais: string[]
  imagens: Imagem[]
  plantasBaixas: PlantaBaixa[]
  videos: Video[]
  endereco: Endereco
  nomeEmpreendimento?: string
  construtora?: string
  incorporadora?: string
  dataEntrega?: string
  destaque: boolean
  criadoEm: string
  atualizadoEm: string
}

export type ImovelInput = Omit<Imovel, 'id' | 'criadoEm' | 'atualizadoEm'>

export interface CorretorPerfil {
  nome: string
  creci?: string
  especialidade?: string
  bio?: string
  bio2?: string
  fotoPerfil?: string
  fotoCapa?: string
  whatsapp: string
  email?: string
}
