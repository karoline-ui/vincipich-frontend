'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CRITERIOS_LABELS } from '@/types';

type Props = {
  notasA: Record<string, number>;
  notasB: Record<string, number>;
  nomeA: string;
  nomeB: string;
  height?: number;
};

type Row = {
  criterioKey: string;
  criterio: string;
  nota_a: number;
  nota_b: number;
  dif: number;
};

function trunc(s: string, max = 18) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export default function BarComparativo({
  notasA,
  notasB,
  nomeA,
  nomeB,
  height = 450,
}: Props) {
  const data: Row[] = Object.keys(CRITERIOS_LABELS).map((key) => {
    const a = Number(notasA?.[key] ?? 0);
    const b = Number(notasB?.[key] ?? 0);
    const dif = a - b;

    return {
      criterioKey: key,
      criterio: CRITERIOS_LABELS[key] ?? key,
      nota_a: a,
      nota_b: b,
      dif,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length < 2) return null;

    const a = payload.find((p: any) => p.dataKey === 'nota_a')?.value ?? 0;
    const b = payload.find((p: any) => p.dataKey === 'nota_b')?.value ?? 0;
    const dif = a - b;

    const winner =
      Math.abs(dif) <= 0.15 ? 'Empate técnico' : dif > 0 ? nomeA : nomeB;

    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-lg">
        <p className="text-slate-200 font-semibold mb-2">{label}</p>

        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-slate-400">{nomeA}</span>
          <span className="font-bold text-verde">{Number(a).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm mt-1">
          <span className="text-slate-400">{nomeB}</span>
          <span className="font-bold text-roxo-300">{Number(b).toFixed(2)}</span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Diferença</span>
            <span
              className={
                Math.abs(dif) <= 0.15
                  ? 'text-slate-400'
                  : dif > 0
                  ? 'text-verde'
                  : 'text-roxo-300'
              }
            >
              {dif > 0 ? '+' : ''}
              {dif.toFixed(2)}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-slate-500">Vencedor: </span>
            <span className="text-slate-300">{winner}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap={18}
          margin={{ top: 12, right: 16, left: 0, bottom: 56 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.18} />

          <XAxis
            dataKey="criterio"
            interval={0}
            height={90}
            tick={(props) => {
              const { x, y, payload } = props;
              const label = String(payload.value ?? '');
              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="end"
                    transform="rotate(-25)"
                    className="fill-slate-300 text-[11px]"
                  >
                    {trunc(label, 18)}
                  </text>
                </g>
              );
            }}
          />

          <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} width={34} />

          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={28}
            wrapperStyle={{ color: '#cbd5e1' }}
          />

          {/* Empresa A (verde) */}
          <Bar
            dataKey="nota_a"
            name={nomeA}
            fill="#00E676"
            radius={[6, 6, 0, 0]}
          />

          {/* Empresa B (roxo) */}
          <Bar
            dataKey="nota_b"
            name={nomeB}
            fill="#7C3AED"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
