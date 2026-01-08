'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Trophy, 
  TrendingUp, 
  FileText,
  ArrowRight,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, NotaBadge, Skeleton } from '@/components/ui';
import { StatCard, BarRanking, PieSetor } from '@/components/charts';
import { RankingItem, EstatisticasSetor, SETORES_LABELS } from '@/types';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasAnalisadas: 0,
    mediaGeral: 0,
    topSetor: '',
  });
  const [topEmpresas, setTopEmpresas] = useState<RankingItem[]>([]);
  const [estatisticasSetores, setEstatisticasSetores] = useState<EstatisticasSetor[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Carrega ranking
      const ranking = await api.obterRankingGeral(10);
      setTopEmpresas(ranking.items);
      
      // Carrega estatísticas
      const estatisticas = await api.obterEstatisticas();
      setEstatisticasSetores(estatisticas);

      // Calcula stats gerais
      const totalEmpresas = estatisticas.reduce((acc, s) => acc + s.total_empresas, 0);
      const mediaGeral = estatisticas.reduce((acc, s) => acc + s.media_nota * s.total_empresas, 0) / totalEmpresas || 0;
      const topSetor = estatisticas.sort((a, b) => b.media_nota - a.media_nota)[0]?.setor || '';

      setStats({
        totalEmpresas,
        empresasAnalisadas: ranking.total,
        mediaGeral,
        topSetor,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400">Visão geral das análises de startups</p>
        </div>
        <Link href="/empresas">
          <Button>
            Nova Empresa
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Empresas"
          value={stats.totalEmpresas}
          icon={<Building2 size={24} />}
          color="verde"
        />
        <StatCard
          title="Análises Concluídas"
          value={stats.empresasAnalisadas}
          icon={<FileText size={24} />}
          color="roxo"
        />
        <StatCard
          title="Média Geral"
          value={stats.mediaGeral.toFixed(2)}
          subtitle="de 4.00"
          icon={<Target size={24} />}
          color="blue"
        />
        <StatCard
          title="Top Setor"
          value={SETORES_LABELS[stats.topSetor as keyof typeof SETORES_LABELS] || '-'}
          icon={<Trophy size={24} />}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-verde" size={20} />
              Top 10 Startups
            </CardTitle>
            <Link href="/ranking">
              <Button variant="ghost" size="sm">
                Ver tudo
                <ArrowRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topEmpresas.length > 0 ? (
              <BarRanking 
                data={topEmpresas.map(e => ({ nome: e.nome, nota: e.nota_final, setor: e.setor }))}
              />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-slate-500">
                Nenhuma análise concluída
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Setor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-roxo-300" size={20} />
              Distribuição por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estatisticasSetores.length > 0 ? (
              <PieSetor 
                data={estatisticasSetores.map(s => ({
                  setor: SETORES_LABELS[s.setor] || s.setor,
                  setorKey: s.setor,
                  total: s.total_empresas,
                }))}
                height={350}
              />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-slate-500">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-verde" size={20} />
            Últimas Análises
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium w-12">#</th>
                  <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium">Empresa</th>
                  <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium">Setor</th>
                  <th className="text-center px-4 py-3 text-sm text-slate-400 font-medium">Nota</th>
                  <th className="text-left px-4 py-3 text-sm text-slate-400 font-medium">Potencial</th>
                  <th className="text-center px-4 py-3 text-sm text-slate-400 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {topEmpresas.slice(0, 5).map((empresa, index) => (
                  <tr key={empresa.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{empresa.nome}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300">
                        {SETORES_LABELS[empresa.setor] || empresa.setor}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <NotaBadge nota={empresa.nota_final} size="sm" />
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-400 text-sm">
                      {empresa.classificacao_potencial?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/analise/${empresa.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight size={14} />
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
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}