'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificacoesProvider } from '@/contexts/NotificacoesContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificacoesProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </NotificacoesProvider>
    </AuthProvider>
  );
}
