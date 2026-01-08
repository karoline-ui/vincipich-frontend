'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Trophy, 
  GitCompare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Empresas',
    href: '/empresas',
    icon: Building2,
  },
  {
    title: 'Análise IA',
    href: '/analise-lote',
    icon: Sparkles,
  },
  {
    title: 'Ranking',
    href: '/ranking',
    icon: Trophy,
  },
  {
    title: 'Comparar',
    href: '/comparar',
    icon: GitCompare,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-fundo-light border border-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Sempre fixa */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-fundo-light border-r border-slate-700 flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-verde to-roxo flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">
              <span className="text-verde">Vinci</span>
              <span className="text-roxo-300">Pitch</span>
              <span className="text-slate-400 text-sm">.AI</span>
            </h1>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'sidebar-item',
                  isActive && 'sidebar-item-active'
                )}
              >
                <item.icon size={20} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700">
          <Link href="/configuracoes" className="sidebar-item">
            <Settings size={20} />
            <span>Configurações</span>
          </Link>
        </div>
      </aside>
    </>
  );
}