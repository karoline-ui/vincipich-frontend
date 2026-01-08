'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn('btn', variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ═══════════════════════════════════════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn(hover ? 'card-hover' : 'card', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-100', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'verde' | 'roxo' | 'yellow' | 'red' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    verde: 'badge-verde',
    roxo: 'badge-roxo',
    yellow: 'badge-yellow',
    red: 'badge-red',
    gray: 'badge-gray',
  };

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'verde' | 'roxo' | 'yellow' | 'red';
}

export function Progress({ value, max = 100, className, color = 'verde' }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    verde: 'bg-verde',
    roxo: 'bg-roxo-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400',
  };

  return (
    <div className={cn('progress', className)}>
      <div 
        className={cn('progress-bar', colors[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════════════════════════════════════════

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={cn('animate-spin text-verde', sizes[size], className)} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-slate-700 rounded', className)} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTA BADGE
// ═══════════════════════════════════════════════════════════════════════════════

interface NotaBadgeProps {
  nota: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function NotaBadge({ nota, size = 'md', showLabel = false }: NotaBadgeProps) {
  const getStyle = () => {
    if (nota >= 3.5) return 'nota-excelente';
    if (nota >= 2.5) return 'nota-boa';
    if (nota >= 1.5) return 'nota-media';
    if (nota >= 0.5) return 'nota-baixa';
    return 'nota-muito-baixa';
  };

  const getLabel = () => {
    if (nota >= 3.5) return 'Excelente';
    if (nota >= 2.5) return 'Bom';
    if (nota >= 1.5) return 'Regular';
    if (nota >= 0.5) return 'Baixo';
    return 'Crítico';
  };

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(getStyle(), sizes[size])}>
        {nota.toFixed(1)}
      </div>
      {showLabel && (
        <span className="text-sm text-slate-400">{getLabel()}</span>
      )}
    </div>
  );
}
