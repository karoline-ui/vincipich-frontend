// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 VINCIPITCH.AI - CLIENTE DA API (SINGLE SOURCE OF TRUTH)
// ═══════════════════════════════════════════════════════════════════════════════

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Empresa,
  EmpresaCreate,
  Analise,
  RankingResponse,
  EstatisticasSetor,
  Comparacao,
  Documento,
  FiltrosRanking,
  Setor
} from '@/types';

// Garante /api/v1 SEMPRE (mesmo se a env vier sem)
function normalizeBaseUrl(raw?: string) {
  const fallback = 'https://vincipich-ai-897373535500.southamerica-east1.run.app';
  const base = (raw?.trim() || fallback).replace(/\/+$/, ''); // remove trailing /
  // se já tem /api/v1 (ou /api/v1/), mantém
  if (/\/api\/v1$/i.test(base)) return base;
  return `${base}/api/v1`;
}

const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  total?: number;
  limit?: number;
  offset?: number;
  detail?: string; // fastapi errors às vezes
};

function unwrap<T>(payload: any): T {
  // se vier no formato {success, data}, devolve data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  // senão devolve o próprio payload
  return payload as T;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    });

    // Log útil pra debugar (sem quebrar prod)
    this.client.interceptors.response.use(
      (res: AxiosResponse) => res,
      (err) => {
        // eslint-disable-next-line no-console
        console.error('[API ERROR]', {
          url: err?.config?.baseURL + err?.config?.url,
          method: err?.config?.method,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        return Promise.reject(err);
      }
    );
  }

  // EMPRESAS
  async listarEmpresas(params?: {
    setor?: Setor;
    busca?: string;
    limite?: number;
    offset?: number;
  }): Promise<{ data: Empresa[]; total: number; limit?: number; offset?: number }> {
    const response = await this.client.get('/empresas', { params });

    // pode vir envelope: {success, data, total, limit, offset}
    const payload = response.data as ApiEnvelope<Empresa[]>;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return {
        data: (payload.data || []) as Empresa[],
        total: (payload.total || 0) as number,
        limit: payload.limit,
        offset: payload.offset,
      };
    }

    // fallback: se o backend retornar direto
    return { data: unwrap<Empresa[]>(response.data) || [], total: 0 };
  }

  async obterEmpresa(id: string): Promise<Empresa> {
    const response = await this.client.get(`/empresas/${id}`);
    return unwrap<Empresa>(response.data);
  }

  async criarEmpresa(data: EmpresaCreate): Promise<Empresa> {
    const response = await this.client.post('/empresas', data);
    return unwrap<Empresa>(response.data);
  }

  async atualizarEmpresa(id: string, data: Partial<Empresa>): Promise<Empresa> {
    const response = await this.client.put(`/empresas/${id}`, data);
    return unwrap<Empresa>(response.data);
  }

  async deletarEmpresa(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete(`/empresas/${id}`);
    return unwrap<{ success: boolean; message: string }>(response.data);
  }

  // DOCUMENTOS
  async uploadDocumento(empresaId: string, arquivo: File): Promise<Documento> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('processar', 'true');

    const response = await this.client.post(
      `/empresas/${empresaId}/documentos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrap<Documento>(response.data);
  }

  async listarDocumentos(empresaId: string): Promise<Documento[]> {
    const response = await this.client.get(`/empresas/${empresaId}/documentos`);
    return unwrap<Documento[]>(response.data) || [];
  }

  async deletarDocumento(empresaId: string, documentoId: string): Promise<void> {
    await this.client.delete(`/empresas/${empresaId}/documentos/${documentoId}`);
  }

  // ANÁLISES
  async processarAnalise(empresaId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/analises/processar/${empresaId}`);
    return unwrap<{ success: boolean; message: string }>(response.data);
  }

  async processarLote(empresaIds: string[]): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await this.client.post('/analises/processar-lote', empresaIds);
    return unwrap<{ success: boolean; message: string; data?: any }>(response.data);
  }

  async obterAnalise(id: string): Promise<Analise> {
    const response = await this.client.get(`/analises/${id}`);
    return unwrap<Analise>(response.data);
  }

  async obterAnaliseEmpresa(empresaId: string): Promise<Analise> {
    const response = await this.client.get(`/empresas/${empresaId}/analise`);
    return unwrap<Analise>(response.data);
  }

  async obterGraficoRadar(analiseId: string): Promise<Blob> {
    const response = await this.client.get(`/analises/${analiseId}/grafico-radar`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // RANKINGS
  async obterRankingGeral(limite = 50, offset = 0): Promise<RankingResponse> {
    const response = await this.client.get('/rankings/geral', { params: { limite, offset } });
    return unwrap<RankingResponse>(response.data);
  }

  async obterRankingSetor(setor: Setor, limite = 50): Promise<RankingResponse> {
    const response = await this.client.get(`/rankings/setor/${setor}`, { params: { limite } });
    return unwrap<RankingResponse>(response.data);
  }

  async obterEstatisticas(): Promise<EstatisticasSetor[]> {
    const response = await this.client.get('/rankings/estatisticas');
    return unwrap<EstatisticasSetor[]>(response.data) || [];
  }

  async filtrarRanking(filtros: FiltrosRanking): Promise<RankingResponse> {
    const response = await this.client.post('/rankings/filtrar', filtros);
    return unwrap<RankingResponse>(response.data);
  }

  async compararEmpresas(empresaAId: string, empresaBId: string): Promise<Comparacao> {
    const response = await this.client.post('/rankings/comparar', {
      empresa_a_id: empresaAId,
      empresa_b_id: empresaBId,
    });
    return unwrap<Comparacao>(response.data);
  }

  async obterGraficoComparativo(empresaAId: string, empresaBId: string): Promise<Blob> {
    const response = await this.client.get(
      `/rankings/comparar/${empresaAId}/${empresaBId}/grafico`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async obterGraficoBarras(setor?: Setor, limite = 15): Promise<Blob> {
    const response = await this.client.get('/rankings/grafico-barras', {
      params: { setor, limite },
      responseType: 'blob',
    });
    return response.data;
  }

  // EXPORTAÇÕES
  async exportarEmpresaPdf(empresaId: string): Promise<Blob> {
    const response = await this.client.post(`/exportacoes/empresa/${empresaId}/pdf`, null, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportarEmpresaDocx(empresaId: string): Promise<Blob> {
    const response = await this.client.post(`/exportacoes/empresa/${empresaId}/docx`, null, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportarComparacaoPdf(empresaAId: string, empresaBId: string): Promise<Blob> {
    const response = await this.client.post(`/exportacoes/comparacao/${empresaAId}/${empresaBId}/pdf`, null, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportarComparacaoDocx(empresaAId: string, empresaBId: string): Promise<Blob> {
    const response = await this.client.post(`/exportacoes/comparacao/${empresaAId}/${empresaBId}/docx`, null, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportarRankingXlsx(setor?: Setor, limite = 100): Promise<Blob> {
    const response = await this.client.post('/exportacoes/ranking/xlsx', null, {
      params: { setor, limite },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportarRankingPdf(setor?: Setor, limite = 50): Promise<Blob> {
    const response = await this.client.post('/exportacoes/ranking/pdf', null, {
      params: { setor, limite },
      responseType: 'blob',
    });
    return response.data;
  }

  // HELPERS
  async listarSetores(): Promise<Setor[]> {
    const response = await this.client.get('/empresas/setores/lista');
    return unwrap<Setor[]>(response.data) || [];
  }
}

export const api = new ApiClient();
export default api;
