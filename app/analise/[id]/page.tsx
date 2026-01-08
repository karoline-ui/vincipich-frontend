'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink,
  Building2,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Rocket,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, NotaBadge, Skeleton } from '@/components/ui';
import { RadarNotas, StatCard } from '@/components/charts';
import { Empresa, Analise, SETORES_LABELS, ESTAGIOS_LABELS, CRITERIOS_LABELS, CLASSIFICACAO_LABELS } from '@/types';
import api from '@/lib/api';
import { formatCurrency, formatDate, downloadBlob, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AnalisePage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params.id as string;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [processando, setProcessando] = useState(false);
  const [statusAnalise, setStatusAnalise] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [empresaId]);

  const loadData = async () => {
    try {
      const [empresaData, analiseData] = await Promise.all([
        api.obterEmpresa(empresaId),
        api.obterAnaliseEmpresa(empresaId).catch(() => null),
      ]);
      setEmpresa(empresaData);
      setAnalise(analiseData);
      
      // Se tem análise pendente ou processando, iniciar polling
      if (analiseData?.status === 'pendente' || analiseData?.status === 'processando') {
        setProcessando(true);
        setStatusAnalise(analiseData.status);
        startPolling();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar', 'Não foi possível carregar os dados da empresa.');
    } finally {
      setLoading(false);
    }
  };

  // Polling para verificar status da análise
  const startPolling = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const analiseAtual = await api.obterAnaliseEmpresa(empresaId);
        
        if (analiseAtual) {
          setStatusAnalise(analiseAtual.status);
          
          if (analiseAtual.status === 'concluida') {
            setAnalise(analiseAtual);
            setProcessando(false);
            clearInterval(interval);
            toast.success('Análise concluída!', 'A avaliação da IA foi finalizada com sucesso.');
          } else if (analiseAtual.status === 'erro') {
            setProcessando(false);
            clearInterval(interval);
            toast.error('Erro na análise', 'Ocorreu um erro durante o processamento. Tente novamente.');
          }
        }
      } catch (error) {
        console.error('Erro no polling:', error);
      }
    }, 3000); // Verifica a cada 3 segundos

    // Limpa o interval após 5 minutos (segurança)
    setTimeout(() => {
      clearInterval(interval);
      if (processando) {
        setProcessando(false);
        toast.warning('Timeout', 'A análise está demorando mais que o esperado. Verifique novamente em alguns minutos.');
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [empresaId, processando, toast]);

  const handleIniciarAnalise = async () => {
    setProcessando(true);
    setStatusAnalise('iniciando');
    
    try {
      toast.info('Iniciando análise', 'A IA está processando o pitch deck. Isso pode levar até 2 minutos...');
      
      await api.processarAnalise(empresaId);
      setStatusAnalise('processando');
      
      // Inicia polling para verificar conclusão
      startPolling();
      
    } catch (error: any) {
      console.error('Erro ao iniciar análise:', error);
      setProcessando(false);
      setStatusAnalise('');
      
      const errorMsg = error?.response?.data?.detail || 'Verifique se o documento foi enviado corretamente.';
      toast.error('Erro ao iniciar análise', errorMsg);
    }
  };

  const handleExportPdf = async () => {
    try {
      toast.info('Gerando PDF...', 'Aguarde enquanto o relatório é preparado.');
      const blob = await api.exportarEmpresaPdf(empresaId);
      downloadBlob(blob, `analise_${empresa?.nome || 'empresa'}.pdf`);
      toast.success('PDF exportado!', 'O arquivo foi baixado com sucesso.');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro na exportação', 'Não foi possível gerar o PDF.');
    }
  };

  const handleExportDocx = async () => {
    try {
      toast.info('Gerando Word...', 'Aguarde enquanto o documento é preparado.');
      const blob = await api.exportarEmpresaDocx(empresaId);
      downloadBlob(blob, `analise_${empresa?.nome || 'empresa'}.docx`);
      toast.success('Word exportado!', 'O arquivo foi baixado com sucesso.');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro na exportação', 'Não foi possível gerar o documento Word.');
    }
  };

  if (loading) {
    return <AnaliseSkeleton />;
  }

  if (!empresa) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl text-slate-300">Empresa não encontrada</h1>
        <Link href="/empresas">
          <Button variant="outline" className="mt-4">
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  // Prepara notas para o radar (garantindo que são números)
  const notasRadar: Record<string, number> = analise ? {
    sumario_executivo: analise.nota_sumario_executivo || 0,
    proposta_valor: analise.nota_proposta_valor || 0,
    concorrencia: analise.nota_concorrencia || 0,
    mercado_alvo: analise.nota_mercado_alvo || 0,
    canais_distribuicao: analise.nota_canais_distribuicao || 0,
    relacionamento_clientes: analise.nota_relacionamento_clientes || 0,
    fontes_receita: analise.nota_fontes_receita || 0,
    recursos_principais: analise.nota_recursos_principais || 0,
    atividades_chave: analise.nota_atividades_chave || 0,
    parceiros: analise.nota_parceiros || 0,
    estrutura_custos: analise.nota_estrutura_custos || 0,
    referencias_indicacao: analise.nota_referencias_indicacao || 0,
  } : {};

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/empresas">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{empresa.nome}</h1>
              <Badge variant="roxo">
                {SETORES_LABELS[empresa.setor]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
              {empresa.website && (
                <a href={empresa.website} target="_blank" rel="noopener" className="hover:text-verde flex items-center gap-1">
                  <ExternalLink size={14} />
                  Website
                </a>
              )}
              <span>{ESTAGIOS_LABELS[empresa.estagio]}</span>
              {empresa.cidade && <span>{empresa.cidade}, {empresa.estado}</span>}
            </div>
          </div>
        </div>

        {analise && analise.status === 'concluida' && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPdf}>
              <Download size={18} />
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportDocx}>
              <Download size={18} />
              Word
            </Button>
          </div>
        )}
      </div>

      {/* Estado: Sem análise ou processando */}
      {(!analise || analise.status !== 'concluida') && (
        <Card>
          <CardContent className="py-12 text-center">
            {processando ? (
              <>
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-verde border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-verde" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-slate-200 mb-2">
                  IA analisando o pitch...
                </h2>
                <p className="text-slate-400 mb-2">
                  {statusAnalise === 'iniciando' && 'Preparando análise...'}
                  {statusAnalise === 'processando' && 'Avaliando critérios e gerando diagnóstico...'}
                  {statusAnalise === 'pendente' && 'Aguardando processamento...'}
                </p>
                <p className="text-sm text-slate-500">
                  Isso pode levar até 2 minutos. Não feche esta página.
                </p>
                
                {/* Barra de progresso animada */}
                <div className="max-w-md mx-auto mt-6">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-verde to-roxo animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Target size={48} className="mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300 mb-2">
                  Análise não disponível
                </h2>
                <p className="text-slate-500 mb-6">
                  Esta empresa ainda não foi analisada. Clique abaixo para iniciar a avaliação por IA.
                </p>
                <Button 
                  onClick={handleIniciarAnalise}
                  disabled={processando}
                  className="gap-2"
                >
                  <Sparkles size={18} />
                  Iniciar Análise com IA
                </Button>
                <p className="text-xs text-slate-600 mt-4">
                  A IA irá avaliar 12 critérios e gerar um diagnóstico completo
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultado da análise */}
      {analise && analise.status === 'concluida' && (
        <>
          {/* Stats principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Nota Final"
              value={analise.nota_final.toFixed(2)}
              subtitle="de 4.00"
              icon={<Target size={24} />}
              color="verde"
            />
            <StatCard
              title="Potencial"
              value={CLASSIFICACAO_LABELS[analise.classificacao_potencial] || '-'}
              icon={<TrendingUp size={24} />}
              color="blue"
            />
            <StatCard
              title="Risco"
              value={CLASSIFICACAO_LABELS[analise.classificacao_risco] || '-'}
              icon={<AlertTriangle size={24} />}
              color={analise.classificacao_risco === 'alto' || analise.classificacao_risco === 'muito_alto' ? 'red' : 'yellow'}
            />
            <StatCard
              title="Recomendação"
              value={analise.recomendacao_investimento === 'investir' ? 'Investir' : 
                     analise.recomendacao_investimento === 'acompanhar' ? 'Acompanhar' : 'Declinar'}
              icon={analise.recomendacao_investimento === 'investir' ? <CheckCircle size={24} /> : 
                    analise.recomendacao_investimento === 'acompanhar' ? <RefreshCw size={24} /> : <XCircle size={24} />}
              color={analise.recomendacao_investimento === 'investir' ? 'verde' : 
                     analise.recomendacao_investimento === 'acompanhar' ? 'yellow' : 'red'}
            />
          </div>

          {/* Resumo Executivo */}
          {analise.resumo_executivo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={20} />
                  Resumo Executivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {analise.resumo_executivo}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Radar + SWOT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliação por Critério</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarNotas notas={notasRadar} height={350} />
              </CardContent>
            </Card>

            {/* SWOT */}
            <Card>
              <CardHeader>
                <CardTitle>Análise SWOT</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {/* Pontos Fortes */}
                <div className="bg-verde/10 border border-verde/30 rounded-lg p-4">
                  <h4 className="font-semibold text-verde mb-2 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Forças
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {analise.diagnostico?.pontos_fortes?.map((pf: string, i: number) => (
                      <li key={i}>• {pf}</li>
                    ))}
                  </ul>
                </div>

                {/* Pontos Fracos */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <XCircle size={16} />
                    Fraquezas
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {analise.diagnostico?.pontos_fracos?.map((pf: string, i: number) => (
                      <li key={i}>• {pf}</li>
                    ))}
                  </ul>
                </div>

                {/* Oportunidades */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} />
                    Oportunidades
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {analise.diagnostico?.oportunidades?.map((op: string, i: number) => (
                      <li key={i}>• {op}</li>
                    ))}
                  </ul>
                </div>

                {/* Ameaças */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Ameaças
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {analise.diagnostico?.ameacas?.map((am: string, i: number) => (
                      <li key={i}>• {am}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas Detalhadas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas por Critério</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Critério</th>
                      <th className="text-center">Nota</th>
                      <th>Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(CRITERIOS_LABELS).map(([key, label]) => {
                      // Mapeamento dos campos de justificativa (banco usa nomes abreviados)
                      const justificativaMap: Record<string, string> = {
                        sumario_executivo: 'justificativa_sumario',
                        proposta_valor: 'justificativa_proposta',
                        concorrencia: 'justificativa_concorrencia',
                        mercado_alvo: 'justificativa_mercado',
                        canais_distribuicao: 'justificativa_canais',
                        relacionamento_clientes: 'justificativa_relacionamento',
                        fontes_receita: 'justificativa_receita',
                        recursos_principais: 'justificativa_recursos',
                        atividades_chave: 'justificativa_atividades',
                        parceiros: 'justificativa_parceiros',
                        estrutura_custos: 'justificativa_custos',
                        referencias_indicacao: 'justificativa_referencias',
                      };
                      
                      const notaKey = `nota_${key}`;
                      const justKey = justificativaMap[key] || `justificativa_${key}`;
                      const nota = (analise as any)[notaKey] ?? 0;
                      const justificativa = (analise as any)[justKey] ?? '-';

                      return (
                        <tr key={key}>
                          <td className="font-medium text-slate-200">{label}</td>
                          <td className="text-center">
                            <NotaBadge nota={nota} />
                          </td>
                          <td className="text-sm text-slate-400 max-w-md">
                            {justificativa}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recomendações e Próximos Passos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recomendações */}
            {analise.diagnostico?.recomendacoes && analise.diagnostico.recomendacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb size={20} className="text-yellow-400" />
                    Recomendações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analise.diagnostico.recomendacoes.map((rec: string, i: number) => (
                      <li key={i} className="flex gap-3 text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Próximos Passos */}
            {analise.diagnostico?.proximos_passos && analise.diagnostico.proximos_passos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket size={20} className="text-verde" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analise.diagnostico.proximos_passos.map((passo: string, i: number) => (
                      <li key={i} className="flex gap-3 text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-verde/20 text-verde flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        {passo}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Botão para refazer análise */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleIniciarAnalise}
              disabled={processando}
              className="gap-2"
            >
              <RefreshCw size={16} />
              Refazer Análise
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function AnaliseSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-96" />
    </div>
  );
}
