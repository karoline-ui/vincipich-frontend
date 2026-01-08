'use client';

import { useEffect, useState } from 'react';
import { 
  GitCompare, 
  ArrowRight,
  Trophy,
  Minus,
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, NotaBadge, Skeleton } from '@/components/ui';
import { BarComparativo, StatCard } from '@/components/charts';
import { Empresa, Comparacao, SETORES_LABELS, CRITERIOS_LABELS } from '@/types';
import api from '@/lib/api';
import { cn, downloadBlob } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function CompararPage() {
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaA, setEmpresaA] = useState<string>('');
  const [empresaB, setEmpresaB] = useState<string>('');
  const [comparacao, setComparacao] = useState<Comparacao | null>(null);
  const [comparando, setComparando] = useState(false);
  const [exportando, setExportando] = useState<'pdf' | 'docx' | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const result = await api.listarEmpresas({ limite: 100 });
      setEmpresas(result.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar', 'Não foi possível carregar a lista de empresas.');
    } finally {
      setLoading(false);
    }
  };

  const handleComparar = async () => {
    if (!empresaA || !empresaB) {
      toast.warning('Selecione as empresas', 'Escolha duas empresas para comparar.');
      return;
    }

    if (empresaA === empresaB) {
      toast.warning('Empresas iguais', 'Selecione duas empresas diferentes para comparar.');
      return;
    }

    setComparando(true);
    try {
      const result = await api.compararEmpresas(empresaA, empresaB);
      setComparacao(result);
      toast.success('Comparação concluída!', 'Veja os resultados abaixo.');
    } catch (error: any) {
      console.error('Erro ao comparar:', error);
      const errorMsg = error?.response?.data?.detail || 'Verifique se ambas possuem análise concluída.';
      toast.error('Erro ao comparar', errorMsg);
    } finally {
      setComparando(false);
    }
  };

  // Exportar comparação
  const handleExportPdf = async () => {
    if (!comparacao) return;
    setExportando('pdf');
    try {
      const blob = await api.exportarComparacaoPdf(empresaA, empresaB);
      const nomeA = comparacao.empresa_a?.nome || 'EmpresaA';
      const nomeB = comparacao.empresa_b?.nome || 'EmpresaB';
      downloadBlob(blob, `comparacao_${nomeA}_vs_${nomeB}.pdf`);
      toast.success('PDF exportado!', 'O arquivo foi baixado.');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro', 'Não foi possível exportar o PDF.');
    } finally {
      setExportando(null);
    }
  };

  const handleExportDocx = async () => {
    if (!comparacao) return;
    setExportando('docx');
    try {
      const blob = await api.exportarComparacaoDocx(empresaA, empresaB);
      const nomeA = comparacao.empresa_a?.nome || 'EmpresaA';
      const nomeB = comparacao.empresa_b?.nome || 'EmpresaB';
      downloadBlob(blob, `comparacao_${nomeA}_vs_${nomeB}.docx`);
      toast.success('DOCX exportado!', 'O arquivo foi baixado.');
    } catch (error) {
      console.error('Erro ao exportar DOCX:', error);
      toast.error('Erro', 'Não foi possível exportar o DOCX.');
    } finally {
      setExportando(null);
    }
  };

  // Prepara dados para o gráfico
  const notasA: Record<string, number> = {};
  const notasB: Record<string, number> = {};

  if (comparacao) {
    Object.keys(CRITERIOS_LABELS).forEach(key => {
      const comp = comparacao.comparativo?.[key];
      if (comp) {
        notasA[key] = comp.nota_a || 0;
        notasB[key] = comp.nota_b || 0;
      }
    });
  }

  if (loading) {
    return <CompareSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <GitCompare className="text-verde" />
            Comparar Empresas
          </h1>
          <p className="text-slate-400">
            Compare duas startups lado a lado
          </p>
        </div>
        
        {/* Botões de exportação */}
        {comparacao && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportPdf}
              disabled={exportando !== null}
            >
              {exportando === 'pdf' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportDocx}
              disabled={exportando !== null}
            >
              {exportando === 'docx' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileText size={18} />
              )}
              Word
            </Button>
          </div>
        )}
      </div>

      {/* Seleção de empresas */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Empresa A */}
            <div className="flex-1 w-full">
              <label className="label">Empresa A</label>
              <select
                value={empresaA}
                onChange={(e) => setEmpresaA(e.target.value)}
                className="select"
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id} disabled={emp.id === empresaB}>
                    {emp.nome} - {SETORES_LABELS[emp.setor]}
                  </option>
                ))}
              </select>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-fundo border border-slate-700">
              <span className="text-xl font-bold text-slate-500">VS</span>
            </div>

            {/* Empresa B */}
            <div className="flex-1 w-full">
              <label className="label">Empresa B</label>
              <select
                value={empresaB}
                onChange={(e) => setEmpresaB(e.target.value)}
                className="select"
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id} disabled={emp.id === empresaA}>
                    {emp.nome} - {SETORES_LABELS[emp.setor]}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão */}
            <Button 
              onClick={handleComparar}
              loading={comparando}
              disabled={!empresaA || !empresaB}
              className="md:mt-6"
            >
              Comparar
              <ArrowRight size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da comparação */}
      {comparacao && (
        <>
          {/* Vencedor com troféu */}
          <Card className="bg-gradient-to-r from-verde/10 to-roxo/10 border-verde/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="text-yellow-400" size={32} />
                <div className="text-center">
                  <p className="text-sm text-slate-400">Vencedor</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {comparacao.vencedor_id 
                      ? (comparacao.vencedor_id === empresaA 
                          ? comparacao.empresa_a?.nome 
                          : comparacao.empresa_b?.nome)
                      : 'Empate Técnico'
                    }
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Margem: {(comparacao.margem_diferenca || 0).toFixed(2)} pontos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title={comparacao.empresa_a?.nome || 'Empresa A'}
              value={(Object.values(notasA).reduce((a, b) => a + b, 0) / 12).toFixed(2)}
              subtitle="Média geral"
              color="verde"
            />
            <StatCard
              title="Vitórias A"
              value={comparacao.vitorias_a || 0}
              subtitle="de 12 critérios"
              color="verde"
            />
            <StatCard
              title="Vitórias B"
              value={comparacao.vitorias_b || 0}
              subtitle="de 12 critérios"
              color="roxo"
            />
            <StatCard
              title={comparacao.empresa_b?.nome || 'Empresa B'}
              value={(Object.values(notasB).reduce((a, b) => a + b, 0) / 12).toFixed(2)}
              subtitle="Média geral"
              color="roxo"
            />
          </div>

          {/* Gráfico Comparativo */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo por Critério</CardTitle>
            </CardHeader>
            <CardContent>
              <BarComparativo
                notasA={notasA}
                notasB={notasB}
                nomeA={comparacao.empresa_a?.nome || 'Empresa A'}
                nomeB={comparacao.empresa_b?.nome || 'Empresa B'}
                height={450}
              />
            </CardContent>
          </Card>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Critério</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Critério</th>
                      <th className="text-center text-verde">{comparacao.empresa_a?.nome || 'Empresa A'}</th>
                      <th className="text-center">Diferença</th>
                      <th className="text-center text-roxo-300">{comparacao.empresa_b?.nome || 'Empresa B'}</th>
                      <th className="text-center">Vencedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(CRITERIOS_LABELS).map(([key, label]) => {
                      const comp = comparacao.comparativo?.[key];
                      if (!comp) return null;

                      return (
                        <tr key={key}>
                          <td className="font-medium text-slate-200">{label}</td>
                          <td className="text-center">
                            <NotaBadge nota={comp.nota_a || 0} size="sm" />
                          </td>
                          <td className="text-center">
                            <span className={cn(
                              'font-medium',
                              (comp.diferenca || 0) > 0 ? 'text-verde' : (comp.diferenca || 0) < 0 ? 'text-red-400' : 'text-slate-500'
                            )}>
                              {(comp.diferenca || 0) > 0 ? '+' : ''}{(comp.diferenca || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="text-center">
                            <NotaBadge nota={comp.nota_b || 0} size="sm" />
                          </td>
                          <td className="text-center">
                            {comp.vencedor === 'A' ? (
                              <Badge variant="verde">{comparacao.empresa_a?.nome || 'A'}</Badge>
                            ) : comp.vencedor === 'B' ? (
                              <Badge variant="roxo">{comparacao.empresa_b?.nome || 'B'}</Badge>
                            ) : (
                              <Minus size={16} className="mx-auto text-slate-500" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Justificativa IA */}
          {comparacao.justificativa_ia && (
            <Card>
              <CardHeader>
                <CardTitle>Análise da IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {comparacao.justificativa_ia}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Mensagem quando não há comparação */}
      {!comparacao && !comparando && empresas.length > 0 && (
        <Card className="py-12">
          <div className="text-center text-slate-400">
            <GitCompare size={48} className="mx-auto mb-4 opacity-50" />
            <p>Selecione duas empresas acima para iniciar a comparação</p>
            <p className="text-sm mt-2 text-slate-500">
              As empresas precisam ter análise da IA concluída
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function CompareSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Skeleton className="h-32" />
    </div>
  );
}
