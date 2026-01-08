'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface Notificacao {
  id: string;
  tipo: 'analise_concluida' | 'ranking_atualizado' | 'nova_empresa' | 'erro';
  titulo: string;
  mensagem: string;
  lida: boolean;
  empresa_id?: string;
  analise_id?: string;
  created_at: string;
}

interface NotificacoesContextType {
  notificacoes: Notificacao[];
  naoLidas: number;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  adicionarNotificacao: (notif: Omit<Notificacao, 'id' | 'created_at' | 'lida'>) => void;
}

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Escuta análises concluídas em tempo real
    const channel = supabase
      .channel('analises-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analises',
        },
        async (payload) => {
          // Quando análise muda para concluida
          if (payload.new.status === 'concluida' && payload.old?.status !== 'concluida') {
            // Busca nome da empresa
            const { data: empresa } = await supabase
              .from('empresas')
              .select('nome')
              .eq('id', payload.new.empresa_id)
              .single();

            const novaNotif: Notificacao = {
              id: crypto.randomUUID(),
              tipo: 'analise_concluida',
              titulo: 'Análise Concluída! ✨',
              mensagem: `A análise de "${empresa?.nome || 'empresa'}" foi finalizada com nota ${(payload.new.nota_final || 0).toFixed(2)}.`,
              lida: false,
              empresa_id: payload.new.empresa_id,
              analise_id: payload.new.id,
              created_at: new Date().toISOString()
            };

            setNotificacoes(prev => [novaNotif, ...prev.slice(0, 19)]); // Mantém só 20
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev =>
      prev.map(n => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const adicionarNotificacao = (notif: Omit<Notificacao, 'id' | 'created_at' | 'lida'>) => {
    const novaNotif: Notificacao = {
      ...notif,
      id: crypto.randomUUID(),
      lida: false,
      created_at: new Date().toISOString()
    };
    setNotificacoes(prev => [novaNotif, ...prev.slice(0, 19)]);
  };

  return (
    <NotificacoesContext.Provider value={{ 
      notificacoes, 
      naoLidas, 
      marcarComoLida, 
      marcarTodasComoLidas,
      adicionarNotificacao 
    }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  const context = useContext(NotificacoesContext);
  if (context === undefined) {
    throw new Error('useNotificacoes must be used within a NotificacoesProvider');
  }
  return context;
}
