// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 VINCIPITCH.AI - CLIENTE DA API (SINGLE SOURCE OF TRUTH)
// ═══════════════════════════════════════════════════════════════════════════════

import axios, { AxiosInstance } from 'axios';
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // EMPRESAS
  async listarEmpresas(params?: {
    setor?: Setor;
    busca?: string;
    limite?: number;
    offset?: number;
  }): Promise<{ data: Empresa[]; total: number; limit?: number; offset?: number }> {
    const response = await this.client.get('/empresas', { params });
    // backend retorna PaginatedResponse: { success, data, total, limit, offset }
    return response.data;
  }

  async obterEmpresa(id: string): Promise<Empresa> {
    const response = await this.client.get(`/empresas/${id}`);
    return response.data;
  }

  async criarEmpresa(data: EmpresaCreate): Promise<Empresa> {
    const response = await this.client.post('/empresas', data);
    return response.data;
  }

  async atualizarEmpresa(id: string, data: Partial<Empresa>): Promise<Empresa> {
    const response = await this.client.put(`/empresas/${id}`, data);
    return response.data;
  }

  async deletarEmpresa(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete(`/empresas/${id}`);
    return response.data;
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
    return response.data;
  }

  async listarDocumentos(empresaId: string): Promise<Documento[]> {
    const response = await this.client.get(`/empresas/${empresaId}/documentos`);
    return response.data;
  }

  async deletarDocumento(empresaId: string, documentoId: string): Promise<void> {
    await this.client.delete(`/empresas/${empresaId}/documentos/${documentoId}`);
  }

  // ANÁLISES
  async processarAnalise(empresaId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/analises/processar/${empresaId}`);
    return response.data;
  }

  async processarLote(empresaIds: string[]): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await this.client.post('/analises/processar-lote', empresaIds);
    return response.data;
  }

  async obterAnalise(id: string): Promise<Analise> {
    const response = await this.client.get(`/analises/${id}`);
    return response.data;
  }

  async obterAnaliseEmpresa(empresaId: string): Promise<Analise> {
    const response = await this.client.get(`/empresas/${empresaId}/analise`);
    return response.data;
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
    return response.data;
  }

  async obterRankingSetor(setor: Setor, limite = 50): Promise<RankingResponse> {
    const response = await this.client.get(`/rankings/setor/${setor}`, { params: { limite } });
    return response.data;
  }

  async obterEstatisticas(): Promise<EstatisticasSetor[]> {
    const response = await this.client.get('/rankings/estatisticas');
    return response.data;
  }

  async filtrarRanking(filtros: FiltrosRanking): Promise<RankingResponse> {
    const response = await this.client.post('/rankings/filtrar', filtros);
    return response.data;
  }

  async compararEmpresas(empresaAId: string, empresaBId: string): Promise<Comparacao> {
    const response = await this.client.post('/rankings/comparar', {
      empresa_a_id: empresaAId,
      empresa_b_id: empresaBId,
    });
    return response.data;
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
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
