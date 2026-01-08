'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Tentando login com:', email);
        const { error } = await signIn(email, password);
        console.log('Resultado login:', error);
        
        if (error) {
          if (error.message === 'Invalid login credentials') {
            setError('Email ou senha incorretos');
          } else if (error.message === 'Email not confirmed') {
            setError('Confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
          } else {
            setError(error.message);
          }
        } else {
          console.log('Login OK, redirecionando...');
          window.location.href = '/';
        }
      } else {
        if (!nome.trim()) {
          setError('Digite seu nome');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, nome);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email já está cadastrado');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Conta criada! Verifique seu email para confirmar, depois faça login.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error('Erro:', err);
      setError('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fundo flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-verde to-roxo flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-verde">Vinci</span>
            <span className="text-roxo-300">Pitch</span>
            <span className="text-slate-400">.AI</span>
          </h1>
          <p className="text-slate-500 mt-2">Sistema de Análise de Startups</p>
        </div>

        {/* Card */}
        <div className="bg-fundo-light border border-slate-700 rounded-xl p-6 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isLogin 
                  ? 'bg-verde text-fundo' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isLogin 
                  ? 'bg-verde text-fundo' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome (só no registro) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-fundo border border-slate-700 rounded-lg px-4 py-2.5 pl-10 text-slate-200 placeholder-slate-500 focus:border-verde focus:outline-none focus:ring-1 focus:ring-verde"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-fundo border border-slate-700 rounded-lg px-4 py-2.5 pl-10 text-slate-200 placeholder-slate-500 focus:border-verde focus:outline-none focus:ring-1 focus:ring-verde"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
                  className="w-full bg-fundo border border-slate-700 rounded-lg px-4 py-2.5 pl-10 pr-10 text-slate-200 placeholder-slate-500 focus:border-verde focus:outline-none focus:ring-1 focus:ring-verde"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Sucesso */}
            {success && (
              <div className="p-3 rounded-lg bg-verde/10 border border-verde/30 text-verde text-sm">
                {success}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-verde hover:bg-verde/90 text-fundo font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          {/* Link alternativo */}
          <p className="text-center text-slate-500 text-sm mt-6">
            {isLogin ? (
              <>
                Não tem conta?{' '}
                <button onClick={() => { setIsLogin(false); setError(''); }} className="text-verde hover:underline">
                  Criar agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button onClick={() => { setIsLogin(true); setError(''); }} className="text-verde hover:underline">
                  Fazer login
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © 2025 VinciPitch.AI - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}