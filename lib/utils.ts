import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes Tailwind de forma inteligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata número como moeda BRL
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formata número grande (K, M, B)
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Formata percentual
 */
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(1)}%`;
}

/**
 * Formata nota (0-4) para exibição
 */
export function formatNota(nota: number | undefined | null): string {
  if (nota === undefined || nota === null) return '-';
  return nota.toFixed(2);
}

/**
 * Retorna cor baseada na nota
 */
export function getNotaColor(nota: number): string {
  if (nota >= 3.5) return 'text-verde-500';
  if (nota >= 2.5) return 'text-green-400';
  if (nota >= 1.5) return 'text-yellow-400';
  if (nota >= 0.5) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Retorna cor de fundo baseada na nota
 */
export function getNotaBgColor(nota: number): string {
  if (nota >= 3.5) return 'bg-verde-500/20';
  if (nota >= 2.5) return 'bg-green-400/20';
  if (nota >= 1.5) return 'bg-yellow-400/20';
  if (nota >= 0.5) return 'bg-orange-400/20';
  return 'bg-red-400/20';
}

/**
 * Retorna cor para classificação de risco
 */
export function getRiscoColor(risco: string): string {
  const colors: Record<string, string> = {
    muito_baixo: 'text-verde-500',
    baixo: 'text-green-400',
    medio: 'text-yellow-400',
    alto: 'text-orange-400',
    muito_alto: 'text-red-400',
  };
  return colors[risco] || 'text-gray-400';
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Trunca texto com reticências
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Download de blob como arquivo
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Gera cor única baseada em string (para avatares)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Extrai iniciais do nome
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
