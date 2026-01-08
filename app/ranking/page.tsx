'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Download, 
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, NotaBadge, Skeleton } from '@/components/ui';
import { BarRanking, StatCard } from '@/components/charts';
import { RankingItem, Setor, EstatisticasSetor, SETORES_LABELS } from '@/types';
import api from '@/lib/api';
import { downloadBlob, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function RankingPage() {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasSetor[]>([]);
  const [setorFiltro, setSetorFiltro] = useState<Setor | ''>('');
  const [total, setTotal] = useState(0);
  const toast = useToast();

  useEffect(() => {
    loadRanking();
  }, [setorFiltro]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      let result;
      if (setorFiltro) {
        result = await api.obterRankingSetor(setorFiltro);
      } else {
        result = await api.obterRankingGeral(50);
      }
      setRanking(result.items);
      setTotal(result.total);

      const stats = await api.obterEstatisticas();
      setEstatisticas(stats);
    } catch (error: any) {
      console.error('Erro ao carregar ranking:', error);
      toast.error('Erro ao carregar ranking', 'Verifique se existem análises concluídas.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportXlsx = async () => {
    try {
      const blob = await api.exportarRankingXlsx(setorFiltro || undefined);
      downloadBlob(blob, `ranking_${setorFiltro || 'geral'}.xlsx`);
      toast.success('Exportado!', 'O arquivo XLSX foi baixado.');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro na exportação', 'Não foi possível gerar o arquivo XLSX.');
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await api.exportarRankingPdf(setorFiltro || undefined);
      downloadBlob(blob, `ranking_${setorFiltro || 'geral'}.pdf`);
      toast.success('Exportado!', 'O arquivo PDF foi baixado.');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro na exportação', 'Não foi possível gerar o arquivo PDF.');
    }
  };

  // Calcula estatísticas gerais
  const statsGerais = {
    media: ranking.length > 0 
      ? ranking.reduce((acc, r) => acc + r.nota_final, 0) / ranking.length 
      : 0,
    melhorNota: ranking.length > 0 ? Math.max(...ranking.map(r => r.nota_final)) : 0,
    piorNota: ranking.length > 0 ? Math.min(...ranking.map(r => r.nota_final)) : 0,
  };

  if (loading) {
    return <RankingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="text-verde" />
            Ranking
          </h1>
          <p className="text-slate-400">
            {setorFiltro 
              ? `${SETORES_LABELS[setorFiltro]} - ${total} empresas`
              : `Geral - ${total} empresas analisadas`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportXlsx}>
            <Download size={18} />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download size={18} />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Analisadas"
          value={total}
          icon={<Trophy size={24} />}
          color="verde"
        />
        <StatCard
          title="Média Geral"
          value={statsGerais.media.toFixed(2)}
          subtitle="de 4.00"
          color="blue"
        />
        <StatCard
          title="Melhor Nota"
          value={statsGerais.melhorNota.toFixed(2)}
          color="verde"
        />
        <StatCard
          title="Menor Nota"
          value={statsGerais.piorNota.toFixed(2)}
          color="red"
        />
      </div>

      {/* Filtro por Setor */}
      <Card className="!p-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <span className="text-sm text-slate-400 whitespace-nowrap">
            <Filter size={16} className="inline mr-1" />
            Filtrar:
          </span>
          <button
            onClick={() => setSetorFiltro('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              !setorFiltro 
                ? 'bg-verde text-fundo' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            Todos
          </button>
          {estatisticas.map((stat) => (
            <button
              key={stat.setor}
              onClick={() => setSetorFiltro(stat.setor)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                setorFiltro === stat.setor 
                  ? 'bg-verde text-fundo' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {SETORES_LABELS[stat.setor]} ({stat.total_empresas})
            </button>
          ))}
        </div>
      </Card>

      {/* Gráfico + Tabela - Layout vertical em telas menores */}
      <div className="grid grid-cols-1 gap-6">
        {/* Gráfico - Largura total em mobile */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <BarRanking 
              data={ranking.slice(0, 10).map(r => ({ nome: r.nome, nota: r.nota_final, setor: r.setor }))}
            />
          </CardContent>
        </Card>

        {/* Tabela - Scrollável */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking Completo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-fundo-lighter">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium w-16">#</th>
                    <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium">Empresa</th>
                    <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium">Setor</th>
                    <th className="text-center px-4 py-3 text-sm text-slate-400 font-medium">Nota</th>
                    <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium">Potencial</th>
                    <th className="text-center px-4 py-3 text-sm text-slate-400 font-medium w-20">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {ranking.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            'font-bold',
                            index === 0 && 'text-yellow-400',
                            index === 1 && 'text-slate-300',
                            index === 2 && 'text-orange-400'
                          )}>
                            {index + 1}
                          </span>
                          {item.variacao !== undefined && (
                            item.variacao > 0 ? (
                              <ArrowUp size={14} className="text-verde" />
                            ) : item.variacao < 0 ? (
                              <ArrowDown size={14} className="text-red-400" />
                            ) : (
                              <Minus size={14} className="text-slate-500" />
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {item.nome}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="roxo">
                          {SETORES_LABELS[item.setor] || item.setor}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <NotaBadge nota={item.nota_final} size="sm" />
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-400 text-sm">
                        {item.classificacao_potencial?.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/analise/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Setor */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {estatisticas.map((stat) => (
              <div 
                key={stat.setor}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
              >
                <p className="text-sm text-slate-400 mb-1 truncate">
                  {SETORES_LABELS[stat.setor]}
                </p>
                <p className="text-2xl font-bold text-slate-100">
                  {stat.media_nota.toFixed(2)}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                  <span>{stat.total_empresas} emp.</span>
                  <span>•</span>
                  <span>Min: {stat.menor_nota.toFixed(1)}</span>
                  <span>•</span>
                  <span>Max: {stat.maior_nota.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>

      <Skeleton className="h-14" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[450px]" />
        <Skeleton className="h-[450px] lg:col-span-2" />
      </div>
    </div>
  );
}