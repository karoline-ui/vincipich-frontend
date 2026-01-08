'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Loader2,
  Check,
  Mail,
  Building2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ConfiguracoesPage() {
  const { user, supabase } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');
  
  // Dados do perfil
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('');
  
  // Notificações
  const [notifAnalise, setNotifAnalise] = useState(true);
  const [notifRanking, setNotifRanking] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  useEffect(() => {
    if (user) {
      loadPerfil();
    }
  }, [user]);

  const loadPerfil = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (data) {
        setNome(data.nome || '');
        setEmpresa(data.empresa || '');
        setCargo(data.cargo || '');
        setNotifAnalise(data.notif_analise ?? true);
        setNotifRanking(data.notif_ranking ?? true);
        setNotifEmail(data.notif_email ?? false);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleSalvarPerfil = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .upsert({
          id: user?.id,
          email: user?.email,
          nome,
          empresa,
          cargo,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Perfil salvo!', 'Suas informações foram atualizadas.');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarNotificacoes = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          notif_analise: notifAnalise,
          notif_ranking: notifRanking,
          notif_email: notifEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Notificações salvas!', 'Suas preferências foram atualizadas.');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro', 'Não foi possível salvar as preferências.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
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
          Gerencie suas preferências e informações
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
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-verde" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input pl-10 bg-slate-800/50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">O email não pode ser alterado</p>
                </div>

                <div>
                  <label className="label">Nome completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="text"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        placeholder="Nome da empresa"
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Cargo</label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Seu cargo"
                      className="input"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSalvarPerfil} disabled={loading}>
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Salvar Alterações
                  </Button>
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
                    <p className="text-sm text-slate-500">Receber notificação quando a IA terminar uma análise</p>
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

                {/* Toggle de ranking */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-200">Atualizações no ranking</p>
                    <p className="text-sm text-slate-500">Receber notificação quando o ranking mudar</p>
                  </div>
                  <button
                    onClick={() => setNotifRanking(!notifRanking)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifRanking ? 'bg-verde' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notifRanking ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Toggle de email */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-200">Notificações por email</p>
                    <p className="text-sm text-slate-500">Receber resumo semanal por email</p>
                  </div>
                  <button
                    onClick={() => setNotifEmail(!notifEmail)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifEmail ? 'bg-verde' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notifEmail ? 'translate-x-6' : 'translate-x-0.5'
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

          {/* Segurança */}
          {activeTab === 'seguranca' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} className="text-verde" />
                  Segurança da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-slate-200">Alterar senha</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Para alterar sua senha, clique no botão abaixo. Você receberá um email com instruções.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={async () => {
                      if (user?.email) {
                        await supabase.auth.resetPasswordForEmail(user.email);
                        toast.success('Email enviado!', 'Verifique sua caixa de entrada.');
                      }
                    }}
                  >
                    Enviar email de redefinição
                  </Button>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="font-medium text-red-400">Excluir conta</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Excluir minha conta
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
