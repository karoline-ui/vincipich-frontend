'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { CRITERIOS_LABELS } from '@/types';

// Cores da marca
const VERDE = '#00E676';
const ROXO = '#6B21A8';
const CORES_NOTAS = ['#00E676', '#4ADE80', '#FACC15', '#F97316', '#EF4444'];

// Cores fixas por setor (consistente em todo o app)
export const CORES_POR_SETOR: Record<string, string> = {
  'fintech': '#00E676',      // Verde
  'healthtech': '#38BDF8',   // Azul claro
  'edtech': '#818CF8',       // Roxo
  'retailtech': '#F472B6',   // Rosa
  'logtech': '#FB923C',      // Laranja
  'agrotech': '#A3E635',     // Lima
  'construtech': '#FACC15',  // Amarelo
  'energytech': '#2DD4BF',   // Turquesa
  'hrtech': '#C084FC',       // Violeta
  'legaltech': '#F87171',    // Vermelho claro
  'insurtech': '#4ADE80',    // Verde claro
  'proptech': '#60A5FA',     // Azul
  'govtech': '#A78BFA',      // Lavanda
  'martech': '#FB7185',      // Rosa escuro
  'foodtech': '#34D399',     // Esmeralda
  'traveltech': '#FBBF24',   // Âmbar
  'sporttech': '#F97316',    // Laranja escuro
  'autotech': '#6366F1',     // Indigo
  'cleantech': '#10B981',    // Verde esmeralda
  'biotech': '#EC4899',      // Pink
  'outro': '#94A3B8',        // Cinza
};

// Função para pegar cor do setor
export function getCorSetor(setor: string): string {
  return CORES_POR_SETOR[setor.toLowerCase()] || CORES_POR_SETOR['outro'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// RADAR CHART - Notas por Critério
// ═══════════════════════════════════════════════════════════════════════════════

interface RadarNotasProps {
  notas: Record<string, number>;
  height?: number;
}

export function RadarNotas({ notas, height = 400 }: RadarNotasProps) {
  const data = Object.entries(CRITERIOS_LABELS).map(([key, label]) => ({
    criterio: label,
    nota: notas[key] || 0,
    fullMark: 4,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis 
          dataKey="criterio" 
          tick={{ fill: '#94A3B8', fontSize: 11 }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 4]} 
          tick={{ fill: '#64748B', fontSize: 10 }}
        />
        <Radar
          name="Nota"
          dataKey="nota"
          stroke={VERDE}
          fill={VERDE}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [value.toFixed(2), 'Nota']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAR CHART - Ranking
// ═══════════════════════════════════════════════════════════════════════════════

interface BarRankingProps {
  data: { nome: string; nota: number; setor?: string }[];
  height?: number;
}

export function BarRanking({ data, height }: BarRankingProps) {
  // Altura dinâmica: 35px por item (mais compacto)
  const alturaCalculada = height || Math.max(200, data.length * 35);
  
  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-slate-200 font-medium">{item.nome}</p>
          {item.setor && <p className="text-slate-400 text-xs">{item.setor}</p>}
          <p className="text-verde font-bold">{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={alturaCalculada}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        barSize={14}
        barGap={2}
        barCategoryGap={4}
      >
        <XAxis 
          type="number" 
          domain={[0, 4]} 
          tick={{ fill: '#94A3B8' }}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis 
          type="category" 
          dataKey="nome" 
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          width={95}
          interval={0}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(100, 116, 139, 0.15)' }}
        />
        <Bar dataKey="nota" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.setor ? getCorSetor(entry.setor) : VERDE} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAR CHART COMPARATIVO
// ═══════════════════════════════════════════════════════════════════════════════

interface BarComparativoProps {
  notasA: Record<string, number>;
  notasB: Record<string, number>;
  nomeA: string;
  nomeB: string;
  height?: number;
}

export function BarComparativo({ notasA, notasB, nomeA, nomeB, height = 400 }: BarComparativoProps) {
  const data = Object.entries(CRITERIOS_LABELS).map(([key, label]) => ({
    criterio: label,
    [nomeA]: notasA[key] || 0,
    [nomeB]: notasB[key] || 0,
  }));

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-slate-300 text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.fill }}>
              {entry.name}: <span className="font-bold">{entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <XAxis 
          dataKey="criterio" 
          tick={{ fill: '#94A3B8', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          domain={[0, 4]} 
          tick={{ fill: '#94A3B8' }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(100, 116, 139, 0.15)' }}
        />
        <Legend />
        <Bar dataKey={nomeA} fill={VERDE} radius={[4, 4, 0, 0]} />
        <Bar dataKey={nomeB} fill={ROXO} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PIE CHART - Distribuição por Setor
// ═══════════════════════════════════════════════════════════════════════════════

interface PieSetorProps {
  data: { setor: string; setorKey?: string; total: number }[];
  height?: number;
}

export function PieSetor({ data, height = 300 }: PieSetorProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="setor"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ setor, percent }) => `${setor} (${(percent * 100).toFixed(0)}%)`}
          labelLine={{ stroke: '#64748B' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getCorSetor(entry.setorKey || entry.setor)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  color?: 'verde' | 'roxo' | 'yellow' | 'red' | 'blue';
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'verde' }: StatCardProps) {
  const colors = {
    verde: 'from-verde/20 to-verde/5 border-verde/30',
    roxo: 'from-roxo/20 to-roxo/5 border-roxo/30',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  };

  const iconColors = {
    verde: 'text-verde',
    roxo: 'text-roxo-300',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  };

  return (
    <div className={`card bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p className={`text-sm mt-1 ${trend >= 0 ? 'text-verde' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={iconColors[color]}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}