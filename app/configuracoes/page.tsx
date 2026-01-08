'use client';

import { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Palette,
  Database,
  Save,
  Loader2,
  Server,
  Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

export default function ConfiguracoesPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  
  // Configurações de notificação (local)
  const [notifAnalise, setNotifAnalise] = useState(true);
  const [notifSom, setNotifSom] = useState(false);
  
  // Info do sistema
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurado';

  const handleSalvarNotificacoes = () => {
    setLoading(true);
    // Salva no localStorage
    localStorage.setItem('vincipitch_notif_analise', String(notifAnalise));
    localStorage.setItem('vincipitch_notif_som', String(notifSom));
    
    setTimeout(() => {
      setLoading(false);
      toast.success('Configurações salvas!', 'Suas preferências foram atualizadas.');
    }, 500);
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'sistema', label: 'Sistema', icon: Database },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="text-verde" />
          Configurações
        </h1>
        <p className="text-slate-400">
          Gerencie as preferências do sistema
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="!p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-verde/20 text-verde'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </Card>
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          {/* Geral */}
          {activeTab === 'geral' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} className="text-verde" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-slate-200">Tema</p>
                  <p className="text-sm text-slate-500 mt-1">
                    O sistema utiliza o tema escuro por padrão para melhor visualização dos dados.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <div className="px-4 py-2 rounded-lg bg-verde/20 border border-verde text-verde text-sm font-medium">
                      Escuro (Ativo)
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-500 text-sm cursor-not-allowed">
                      Claro (Em breve)
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-slate-200">Idioma</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Idioma do sistema e das análises geradas pela IA.
                  </p>
                  <div className="mt-3">
                    <select className="select max-w-xs" disabled>
                      <option>Português (Brasil)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notificações */}
          {activeTab === 'notificacoes' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} className="text-verde" />
                  Preferências de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm">
                  Escolha quais notificações você deseja receber
                </p>

                {/* Toggle de análise */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-200">Análises concluídas</p>
                    <p className="text-sm text-slate-500">Notificar quando a IA terminar uma análise</p>
                  </div>
                  <button
                    onClick={() => setNotifAnalise(!notifAnalise)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifAnalise ? 'bg-verde' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notifAnalise ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Toggle de som */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-200">Som de notificação</p>
                    <p className="text-sm text-slate-500">Tocar som quando receber notificação</p>
                  </div>
                  <button
                    onClick={() => setNotifSom(!notifSom)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifSom ? 'bg-verde' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notifSom ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSalvarNotificacoes} disabled={loading}>
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sistema */}
          {activeTab === 'sistema' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} className="text-verde" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server size={16} className="text-verde" />
                    <p className="font-medium text-slate-200">API Backend</p>
                  </div>
                  <p className="text-sm text-slate-400 font-mono break-all">
                    {apiUrl}
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-verde" />
                    <p className="font-medium text-slate-200">Supabase</p>
                  </div>
                  <p className="text-sm text-slate-400 font-mono break-all">
                    {supabaseUrl}
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-slate-200">Versão</p>
                  <p className="text-sm text-slate-500 mt-1">
                    VinciPitch.AI v1.0.0
                  </p>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="font-medium text-yellow-400">Limpar Cache</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Remove dados temporários armazenados no navegador.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      localStorage.clear();
                      toast.success('Cache limpo!', 'Dados temporários removidos.');
                    }}
                  >
                    Limpar Cache Local
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
