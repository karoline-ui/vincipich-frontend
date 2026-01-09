'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  Trophy,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Loader2,
  Eye,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { Empresa, Setor, SETORES_LABELS, CRITERIOS_LABELS } from '@/types';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface AnaliseResultado {
  empresa_id: string;
  empresa_nome: string;
  setor: Setor;
  status: 'pendente' | 'processando' | 'concluida' | 'erro';
  nota_final?: number;
  nota_final_percentual?: number;
  notas?: Record<string, number>;
  justificativas?: Record<string, string>;
  resumo?: string;
  erro?: string;
}

export default function AnaliseLotePage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState<AnaliseResultado[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
  const toast = useToast();

  // Carregar empresas
  const loadEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listarEmpresas({ limite: 100 });
      setEmpresas(result.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro', 'Não foi possível carregar as empresas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  // Iniciar análise em lote
  const handleAnalisarTodas = async () => {
    if (empresas.length === 0) {
      toast.warning('Sem empresas', 'Cadastre empresas antes de iniciar a análise.');
      return;
    }

    setProcessando(true);
    setProgresso({ atual: 0, total: empresas.length });

    // Inicializa resultados
    const resultadosIniciais: AnaliseResultado[] = empresas.map((e) => ({
      empresa_id: e.id,
      empresa_nome: e.nome,
      setor: e.setor,
      status: 'pendente',
    }));
    setResultados(resultadosIniciais);

    try {
      // Chama endpoint de processamento em lote
      const response = await api.processarLote(empresas.map((e) => e.id));
      
      toast.success('Análise iniciada!', 'A IA está processando todas as empresas.');

      // Polling para verificar status (simulado - ajustar com WebSocket ou polling real)
      let tentativas = 0;
      const maxTentativas = 60; // 5 minutos max
      
      const checkStatus = async () => {
        tentativas++;
        let concluidas = 0;
        const novosResultados: AnaliseResultado[] = [];

        for (const empresa of empresas) {
          try {
            const analise = await api.obterAnaliseEmpresa(empresa.id);
            
            if (analise && analise.status === 'concluida') {
              concluidas++;
              novosResultados.push({
                empresa_id: empresa.id,
                empresa_nome: empresa.nome,
                setor: empresa.setor,
                status: 'concluida',
                nota_final: analise.nota_final,
                nota_final_percentual: analise.nota_final_percentual,
                notas: {
                  sumario_executivo: analise.nota_sumario_executivo,
                  proposta_valor: analise.nota_proposta_valor,
                  concorrencia: analise.nota_concorrencia,
                  mercado_alvo: analise.nota_mercado_alvo,
                  canais_distribuicao: analise.nota_canais_distribuicao,
                  relacionamento_clientes: analise.nota_relacionamento_clientes,
                  fontes_receita: analise.nota_fontes_receita,
                  recursos_principais: analise.nota_recursos_principais,
                  atividades_chave: analise.nota_atividades_chave,
                  parceiros: analise.nota_parceiros,
                  estrutura_custos: analise.nota_estrutura_custos,
                  referencias_indicacao: analise.nota_referencias_indicacao,
                },
             justificativas: {
                sumario_executivo: analise.justificativa_sumario ?? "",
                proposta_valor: analise.justificativa_proposta ?? "",
                concorrencia: analise.justificativa_concorrencia ?? "",
                mercado_alvo: analise.justificativa_mercado ?? "",
                canais_distribuicao: analise.justificativa_canais ?? "",
                relacionamento_clientes: analise.justificativa_relacionamento ?? "",
                fontes_receita: analise.justificativa_receita ?? "",
                recursos_principais: analise.justificativa_recursos ?? "",
                atividades_chave: analise.justificativa_atividades ?? "",
                parceiros: analise.justificativa_parceiros ?? "",
                estrutura_custos: analise.justificativa_custos ?? "",
                referencias_indicacao: analise.justificativa_referencias ?? "",
              },

                resumo: analise.resumo_executivo,
              });
            } else if (analise && analise.status === 'erro') {
              novosResultados.push({
                empresa_id: empresa.id,
                empresa_nome: empresa.nome,
                setor: empresa.setor,
                status: 'erro',
                erro: 'Erro na análise',
              });
            } else {
              novosResultados.push({
                empresa_id: empresa.id,
                empresa_nome: empresa.nome,
                setor: empresa.setor,
                status: 'processando',
              });
            }
          } catch {
            novosResultados.push({
              empresa_id: empresa.id,
              empresa_nome: empresa.nome,
              setor: empresa.setor,
              status: 'pendente',
            });
          }
        }

        setResultados(novosResultados);
        setProgresso({ atual: concluidas, total: empresas.length });

        // Se todas concluídas ou timeout
        if (concluidas >= empresas.length || tentativas >= maxTentativas) {
          setProcessando(false);
          if (concluidas >= empresas.length) {
            toast.success('Análise concluída!', 'Todas as empresas foram analisadas.');
          }
        } else {
          // Continua verificando a cada 5 segundos
          setTimeout(checkStatus, 5000);
        }
      };

      // Inicia polling após 3 segundos
      setTimeout(checkStatus, 3000);

    } catch (error: any) {
      console.error('Erro ao processar lote:', error);
      toast.error('Erro', error?.response?.data?.detail || 'Falha ao iniciar análise em lote.');
      setProcessando(false);
    }
  };

  // Ordenar por nota final (ranking)
  const rankingOrdenado = [...resultados]
    .filter((r) => r.status === 'concluida' && r.nota_final !== undefined)
    .sort((a, b) => (b.nota_final || 0) - (a.nota_final || 0))
    .map((r, idx) => ({ ...r, posicao: idx + 1 }));

  const toggleExpandir = (id: string) => {
    setExpandido(expandido === id ? null : id);
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 3.5) return 'text-green-400';
    if (nota >= 2.5) return 'text-blue-400';
    if (nota >= 1.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getNotaBg = (nota: number) => {
    if (nota >= 3.5) return 'bg-green-500/20 border-green-500/30';
    if (nota >= 2.5) return 'bg-blue-500/20 border-blue-500/30';
    if (nota >= 1.5) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getPosicaoIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="text-yellow-400" size={20} />;
    if (posicao === 2) return <Trophy className="text-slate-400" size={20} />;
    if (posicao === 3) return <Trophy className="text-amber-600" size={20} />;
    return <span className="text-slate-500 font-bold">#{posicao}</span>;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="text-verde" />
            Análise em Lote
          </h1>
          <p className="text-slate-400">
            Analise todas as empresas com IA e gere o ranking completo
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadEmpresas} disabled={loading || processando}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
          <Button
            onClick={handleAnalisarTodas}
            disabled={loading || processando || empresas.length === 0}
          >
            {processando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Play size={18} />
                Analisar Todas ({empresas.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progresso */}
      {processando && (
        <Card className="p-4 border-verde/30 bg-verde/5">
          <div className="flex items-center gap-4">
            <Loader2 className="animate-spin text-verde" size={24} />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Analisando empresas...</span>
                <span className="text-verde">
                  {progresso.atual} / {progresso.total}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-verde transition-all duration-500"
                  style={{
                    width: `${progresso.total > 0 ? (progresso.atual / progresso.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Estatísticas rápidas */}
      {rankingOrdenado.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-verde/20 flex items-center justify-center">
                <Building2 className="text-verde" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{rankingOrdenado.length}</p>
                <p className="text-xs text-slate-500">Empresas Analisadas</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {(
                    rankingOrdenado.reduce((acc, r) => acc + (r.nota_final || 0), 0) /
                    rankingOrdenado.length
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">Média Geral</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {Math.max(...rankingOrdenado.map((r) => r.nota_final || 0)).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">Melhor Nota</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-100 truncate">
                  {rankingOrdenado[0]?.empresa_nome || '-'}
                </p>
                <p className="text-xs text-slate-500">Líder do Ranking</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Ranking / Lista de Resultados */}
      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" />
            Carregando empresas...
          </div>
        </Card>
      ) : empresas.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhuma empresa cadastrada</h3>
          <p className="text-slate-500 mb-4">Cadastre empresas para iniciar a análise em lote.</p>
          <Link href="/empresas">
            <Button>Ir para Empresas</Button>
          </Link>
        </Card>
      ) : rankingOrdenado.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="mx-auto text-verde mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Pronto para análise!</h3>
          <p className="text-slate-500 mb-4">
            {empresas.length} empresas aguardando análise da IA.
          </p>
          <Button onClick={handleAnalisarTodas} disabled={processando}>
            <Play size={18} />
            Iniciar Análise
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            Ranking das Startups
          </h2>

          {rankingOrdenado.map((resultado) => (
            <Card
              key={resultado.empresa_id}
              className={`overflow-hidden transition-all ${
                expandido === resultado.empresa_id ? 'ring-1 ring-verde/50' : ''
              }`}
            >
              {/* Header do Card */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-800/50"
                onClick={() => toggleExpandir(resultado.empresa_id)}
              >
                {/* Posição */}
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                  {getPosicaoIcon(resultado.posicao!)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-200 truncate">
                      {resultado.empresa_nome}
                    </h3>
                    <Badge variant="roxo" className="text-xs">
                      {SETORES_LABELS[resultado.setor] || resultado.setor}
                    </Badge>
                  </div>
                  {resultado.resumo && (
                    <p className="text-sm text-slate-500 truncate mt-1">{resultado.resumo}</p>
                  )}
                </div>

                {/* Nota */}
                <div
                  className={`px-4 py-2 rounded-lg border ${getNotaBg(resultado.nota_final || 0)}`}
                >
                  <div className={`text-2xl font-bold ${getNotaColor(resultado.nota_final || 0)}`}>
                    {resultado.nota_final?.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {resultado.nota_final_percentual?.toFixed(0)}%
                  </div>
                </div>

                {/* Expandir */}
                <div className="text-slate-500">
                  {expandido === resultado.empresa_id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {/* Detalhes Expandidos */}
              {expandido === resultado.empresa_id && resultado.notas && (
                <div className="border-t border-slate-700 p-4 bg-slate-800/30">
                  <h4 className="text-sm font-semibold text-slate-300 mb-4">
                    Notas por Critério (0-4)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(resultado.notas).map(([criterio, nota]) => (
                      <div key={criterio} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400 truncate pr-2">
                            {CRITERIOS_LABELS[criterio] || criterio}
                          </span>
                          <span className={`font-bold flex-shrink-0 ${getNotaColor(nota)}`}>{nota}</span>
                        </div>
                        {resultado.justificativas?.[criterio] && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {resultado.justificativas[criterio]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                    <Link href={`/analise/${resultado.empresa_id}`}>
                      <Button variant="outline" size="sm">
                        <Eye size={16} />
                        Ver Análise Completa
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const blob = await api.exportarEmpresaPdf(resultado.empresa_id);
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `analise-${resultado.empresa_nome}.pdf`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch {
                          toast.error('Erro', 'Não foi possível exportar o PDF.');
                        }
                      }}
                    >
                      <Download size={16} />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Status das pendentes/erro */}
      {resultados.some((r) => r.status === 'pendente' || r.status === 'erro') && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-400">Status das Análises</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resultados
              .filter((r) => r.status !== 'concluida')
              .map((r) => (
                <div
                  key={r.empresa_id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    r.status === 'erro'
                      ? 'bg-red-500/10 text-red-400'
                      : r.status === 'processando'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {r.status === 'erro' && <AlertTriangle size={14} className="flex-shrink-0" />}
                  {r.status === 'processando' && <Loader2 size={14} className="animate-spin flex-shrink-0" />}
                  {r.status === 'pendente' && <Clock size={14} className="flex-shrink-0" />}
                  <span className="truncate">{r.empresa_nome}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
