// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 VINCIPITCH.AI - TIPOS TYPESCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export type Setor = 
  | 'agritech'
  | 'biotech'
  | 'construtech'
  | 'cosmetica_natural'
  | 'cybersecurity'
  | 'edtech'
  | 'fintech'
  | 'foodtech'
  | 'greentech'
  | 'healthtech'
  | 'insurtech'
  | 'legaltech'
  | 'martech'
  | 'proptech'
  | 'retailtech'
  | 'outro';

export type StatusAnalise = 'pendente' | 'processando' | 'concluida' | 'erro' | 'revisao';

export type ClassificacaoRisco = 'muito_baixo' | 'baixo' | 'medio' | 'alto' | 'muito_alto';

export type EstagioStartup = 
  | 'ideacao'
  | 'validacao'
  | 'mvp'
  | 'product_market_fit'
  | 'escala'
  | 'expansao'
  | 'maduro';

// ═══════════════════════════════════════════════════════════════════════════════
// EMPRESA
// ═══════════════════════════════════════════════════════════════════════════════

export interface Empresa {
  id: string;
  nome: string;
  nome_fantasia?: string;
  cnpj?: string;
  website?: string;
  linkedin?: string;
  setor: Setor;
  subsetor?: string;
  estagio: EstagioStartup;
  cidade?: string;
  estado?: string;
  pais?: string;
  ano_fundacao?: number;
  numero_funcionarios?: number;
  faturamento_anual?: number;
  faturamento_mensal?: number;
  mrr?: number;
  arr?: number;
  valuation?: number;
  runway_meses?: number;
  capital_levantado?: number;
  rodada_atual?: string;
  investidores?: string[];
  numero_clientes?: number;
  numero_usuarios?: number;
  cac?: number;
  ltv?: number;
  churn_rate?: number;
  nps_score?: number;
  tags?: string[];
  descricao_curta?: string;
  created_at: string;
  updated_at: string;
}

export interface EmpresaCreate {
  nome: string;
  setor: Setor;
  nome_fantasia?: string;
  cnpj?: string;
  website?: string;
  linkedin?: string;
  subsetor?: string;
  estagio?: EstagioStartup;
  cidade?: string;
  estado?: string;
  descricao_curta?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANÁLISE
// ═══════════════════════════════════════════════════════════════════════════════

export interface Analise {
  id: string;
  empresa_id: string;
  documento_id?: string;
  
  // Notas (0-4)
  nota_sumario_executivo: number;
  nota_proposta_valor: number;
  nota_concorrencia: number;
  nota_mercado_alvo: number;
  nota_canais_distribuicao: number;
  nota_relacionamento_clientes: number;
  nota_fontes_receita: number;
  nota_recursos_principais: number;
  nota_atividades_chave: number;
  nota_parceiros: number;
  nota_estrutura_custos: number;
  nota_referencias_indicacao: number;
  nota_final: number;
  nota_final_percentual: number;
  
  // Justificativas
  justificativa_sumario?: string;
  justificativa_proposta?: string;
  justificativa_concorrencia?: string;
  justificativa_mercado?: string;
  justificativa_canais?: string;
  justificativa_relacionamento?: string;
  justificativa_receita?: string;
  justificativa_recursos?: string;
  justificativa_atividades?: string;
  justificativa_parceiros?: string;
  justificativa_custos?: string;
  justificativa_referencias?: string;
  
  // Diagnóstico
  diagnostico: Diagnostico;
  resumo_executivo?: string;
  
  // Classificações
  classificacao_potencial: ClassificacaoRisco;
  classificacao_risco: ClassificacaoRisco;
  recomendacao_investimento?: string;
  posicao_ranking_geral?: number;
  posicao_ranking_setor?: number;
  
  status: StatusAnalise;
  created_at: string;
  updated_at: string;
}

export interface Diagnostico {
  pontos_fortes: string[];
  pontos_fracos: string[];
  oportunidades: string[];
  ameacas: string[];
  recomendacoes: string[];
  proximos_passos: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// RANKING
// ═══════════════════════════════════════════════════════════════════════════════

export interface RankingItem {
  posicao?: number;
  id: string;
  nome: string;
  setor: Setor;
  estagio?: EstagioStartup;
  nota_final: number;
  nota_final_percentual?: number;
  classificacao_potencial?: string;
  classificacao_risco?: string;
  variacao?: number;
  faturamento_anual?: number;
  resumo?: string;
}

export interface RankingResponse {
  tipo: 'geral' | 'setor' | 'customizado';
  setor?: Setor | string;
  items: RankingItem[];
  total: number;
  estatisticas?: EstatisticasRanking;
}

export interface EstatisticasRanking {
  media: number;
  mediana: number;
  desvio_padrao: number;
}

export interface EstatisticasSetor {
  setor: Setor;
  total_empresas: number;
  media_nota: number;
  menor_nota: number;
  maior_nota: number;
  desvio_padrao: number;
  media_faturamento?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

export interface Comparacao {
  id: string;
  empresa_a_id: string;
  empresa_b_id: string;
  empresa_a?: Empresa;
  empresa_b?: Empresa;
  vencedor_id?: string;
  margem_diferenca?: number;
  comparativo: Record<string, ComparativoCriterio>;
  vitorias_a?: number;
  vitorias_b?: number;
  justificativa_ia?: string;
  created_at?: string;
}

export interface ComparativoCriterio {
  nota_a: number;
  nota_b: number;
  diferenca: number;
  vencedor?: 'A' | 'B';
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════════

export interface Documento {
  id: string;
  empresa_id: string;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_bytes: number;
  storage_path: string;
  processado: boolean;
  qualidade_extracao?: number;
  numero_paginas?: number;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILTROS
// ═══════════════════════════════════════════════════════════════════════════════

export interface FiltrosRanking {
  setores?: Setor[];
  estagios?: EstagioStartup[];
  nota_minima?: number;
  nota_maxima?: number;
  faturamento_minimo?: number;
  faturamento_maximo?: number;
  classificacao_potencial?: ClassificacaoRisco[];
  classificacao_risco?: ClassificacaoRisco[];
  ordenar_por?: string;
  direcao?: 'asc' | 'desc';
  limite?: number;
  offset?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export const SETORES_LABELS: Record<Setor, string> = {
  agritech: 'AgriTech',
  biotech: 'BioTech',
  construtech: 'ConsTech',
  cosmetica_natural: 'Cosmética Natural',
  cybersecurity: 'CyberSecurity',
  edtech: 'EdTech',
  fintech: 'FinTech',
  foodtech: 'FoodTech',
  greentech: 'GreenTech',
  healthtech: 'HealthTech',
  insurtech: 'InsurTech',
  legaltech: 'LegalTech',
  martech: 'MarTech',
  proptech: 'PropTech',
  retailtech: 'RetailTech',
  outro: 'Outro',
};

export const ESTAGIOS_LABELS: Record<EstagioStartup, string> = {
  ideacao: 'Ideação',
  validacao: 'Validação',
  mvp: 'MVP',
  product_market_fit: 'Product-Market Fit',
  escala: 'Escala',
  expansao: 'Expansão',
  maduro: 'Maduro',
};

export const CRITERIOS_LABELS: Record<string, string> = {
  sumario_executivo: 'Sumário Executivo',
  proposta_valor: 'Proposta de Valor',
  concorrencia: 'Concorrência',
  mercado_alvo: 'Mercado Alvo',
  canais_distribuicao: 'Canais de Distribuição',
  relacionamento_clientes: 'Relacionamento',
  fontes_receita: 'Fontes de Receita',
  recursos_principais: 'Recursos Principais',
  atividades_chave: 'Atividades-Chave',
  parceiros: 'Parceiros',
  estrutura_custos: 'Estrutura de Custos',
  referencias_indicacao: 'Referências',
};

export const CLASSIFICACAO_LABELS: Record<ClassificacaoRisco, string> = {
  muito_baixo: 'Muito Baixo',
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  muito_alto: 'Muito Alto',
};