'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Settings, 
  LogOut, 
  ChevronDown,
  CheckCheck,
  Sparkles,
  Trophy,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes, Notificacao } from '@/contexts/NotificacoesContext';

// Helper para formatar tempo
function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

export default function Header() {
  const { user, signOut } = useAuth();
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } = useNotificacoes();
  const router = useRouter();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Fecha menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotificacoes(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getNotifIcon = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'analise_concluida':
        return <Sparkles size={16} className="text-verde" />;
      case 'ranking_atualizado':
        return <Trophy size={16} className="text-yellow-400" />;
      case 'nova_empresa':
        return <Building2 size={16} className="text-blue-400" />;
      case 'erro':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <Bell size={16} className="text-slate-400" />;
    }
  };

  const handleNotifClick = (notif: Notificacao) => {
    marcarComoLida(notif.id);
    setShowNotificacoes(false);
    
    if (notif.empresa_id && notif.tipo === 'analise_concluida') {
      router.push(`/analise/${notif.empresa_id}`);
    } else if (notif.tipo === 'ranking_atualizado') {
      router.push('/ranking');
    }
  };

  // Pega nome do usuário
  const userName = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-fundo-light border-b border-slate-700 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Espaço para mobile menu */}
      <div className="lg:hidden w-10" />
      
      {/* Título da página (opcional) */}
      <div className="flex-1" />

      {/* Ações */}
      <div className="flex items-center gap-2">
        {/* Notificações */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotificacoes(!showNotificacoes)}
            className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Bell size={20} className="text-slate-400" />
            {naoLidas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-verde text-fundo text-xs font-bold rounded-full flex items-center justify-center">
                {naoLidas > 9 ? '9+' : naoLidas}
              </span>
            )}
          </button>

          {/* Dropdown de notificações */}
          {showNotificacoes && (
            <div className="absolute right-0 mt-2 w-80 bg-fundo-light border border-slate-700 rounded-xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <h3 className="font-semibold text-slate-200">Notificações</h3>
                {naoLidas > 0 && (
                  <button
                    onClick={marcarTodasComoLidas}
                    className="text-xs text-verde hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-80 overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  notificacoes.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full p-4 flex gap-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-700/50 ${
                        !notif.lida ? 'bg-verde/5' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotifIcon(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.lida ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                          {notif.titulo}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {notif.mensagem}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatDistanceToNow(notif.created_at)}
                        </p>
                      </div>
                      {!notif.lida && (
                        <div className="w-2 h-2 rounded-full bg-verde flex-shrink-0 mt-1.5" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-verde to-roxo flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{userInitial}</span>
            </div>
            <span className="hidden md:block text-sm text-slate-300 max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown size={16} className={`text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-fundo-light border border-slate-700 rounded-xl shadow-xl overflow-hidden">
              {/* Info do usuário */}
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="font-medium text-slate-200 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  href="/configuracoes"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Settings size={18} />
                  <span>Configurações</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
