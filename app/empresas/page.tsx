'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Upload,
  Building2,
  FileText,
  Eye,
  Play,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Card, Button, Badge, EmptyState, Skeleton } from '@/components/ui';
import Portal from '@/components/ui/Portal';
import { Empresa, Setor, SETORES_LABELS, ESTAGIOS_LABELS } from '@/types';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function EmpresasPage() {
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [total, setTotal] = useState(0);

  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [setorFiltro, setSetorFiltro] = useState<Setor | ''>('');

  const [showModal, setShowModal] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [deleteEmpresa, setDeleteEmpresa] = useState<Empresa | null>(null);

  const toast = useToast();
  const router = useRouter();

  const loadEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const params: { busca?: string; setor?: Setor } = {};
      if (busca) params.busca = busca;
      if (setorFiltro) params.setor = setorFiltro;

      const result = await api.listarEmpresas(params);
      setEmpresas(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas', 'Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [busca, setorFiltro, toast]);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusca(buscaInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [buscaInput]);

  const handleProcessar = async (empresaId: string) => {
    try {
      await api.processarAnalise(empresaId);
      toast.success('Análise iniciada!', 'Redirecionando para acompanhar...');
      // Redireciona para a página de análise
      router.push(`/analise/${empresaId}`);
    } catch (error) {
      console.error('Erro ao processar:', error);
      toast.error('Erro ao iniciar análise', 'Tente novamente mais tarde.');
    }
  };

  const handleSalvarEdicao = async (payload: {
    id: string;
    nome: string;
    setor: Setor;
    website?: string;
    descricao_curta?: string;
  }) => {
    try {
      // 1) Tenta usar método do seu lib/api, se existir
      if (typeof (api as any).atualizarEmpresa === 'function') {
        await (api as any).atualizarEmpresa(payload.id, {
          nome: payload.nome,
          setor: payload.setor,
          website: payload.website,
          descricao_curta: payload.descricao_curta,
        });
      } else {
        // 2) Fallback: chamada direta (ajuste a rota se seu backend for diferente)
        const res = await fetch(`/api/empresas/${payload.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: payload.nome,
            setor: payload.setor,
            website: payload.website,
            descricao_curta: payload.descricao_curta,
          }),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(txt || 'Falha ao atualizar empresa.');
        }
      }

      setEditEmpresa(null);
      await loadEmpresas();
      toast.success('Empresa atualizada!', 'As informações foram salvas com sucesso.');
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error);
      const msg = error?.response?.data?.detail || error?.message || 'Tente novamente.';
      toast.error('Erro ao atualizar empresa', msg);
    }
  };

  const handleConfirmarExclusao = async (empresaId: string) => {
    try {
      // 1) Tenta usar método do seu lib/api, se existir
      if (typeof (api as any).deletarEmpresa === 'function') {
        await (api as any).deletarEmpresa(empresaId);
      } else {
        // 2) Fallback: chamada direta (ajuste a rota se seu backend for diferente)
        const res = await fetch(`/api/empresas/${empresaId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(txt || 'Falha ao excluir empresa.');
        }
      }

      setDeleteEmpresa(null);
      await loadEmpresas();
      toast.success('Empresa excluída!', 'A empresa foi removida com sucesso.');
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      const msg = error?.response?.data?.detail || error?.message || 'Tente novamente.';
      toast.error('Erro ao excluir empresa', msg);
    }
  };

  const setoresOptions = useMemo(
    () => Object.entries(SETORES_LABELS).map(([key, label]) => ({ key, label })),
    []
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Empresas</h1>
          <p className="text-slate-400">{total} empresas cadastradas</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nova Empresa
        </Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value as Setor | '')}
            className="select md:w-48"
          >
            <option value="">Todos os setores</option>
            {setoresOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <TableSkeleton />
      ) : empresas.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Building2 size={32} />}
            title="Nenhuma empresa encontrada"
            description="Adicione sua primeira empresa para começar a análise"
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus size={18} />
                Adicionar Empresa
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Setor</th>
                <th>Estágio</th>
                <th>Faturamento</th>
                <th>Análise</th>
                <th>Criado em</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-verde/20 to-roxo/20 flex items-center justify-center">
                        <Building2 size={18} className="text-verde" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{empresa.nome}</p>
                        {empresa.website && (
                          <p className="text-xs text-slate-500">{empresa.website}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <Badge variant="roxo">
                      {SETORES_LABELS[empresa.setor] || (empresa.setor as any)}
                    </Badge>
                  </td>

                  <td className="text-slate-400">
                    {ESTAGIOS_LABELS[empresa.estagio] || (empresa.estagio as any)}
                  </td>

                  <td className="text-slate-300">{formatCurrency(empresa.faturamento_anual)}</td>

                  <td>
                    <Badge variant="gray">Pendente</Badge>
                  </td>

                  <td className="text-slate-500 text-sm">{formatDate(empresa.created_at)}</td>

                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/analise/${empresa.id}`}>
                        <Button variant="ghost" size="sm" title="Ver análise">
                          <Eye size={16} />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Processar análise"
                        onClick={() => handleProcessar(empresa.id)}
                      >
                        <Play size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Editar empresa"
                        onClick={() => setEditEmpresa(empresa)}
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Excluir empresa"
                        onClick={() => setDeleteEmpresa(empresa)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar */}
      {showModal && (
        <NovaEmpresaModal
          onClose={() => setShowModal(false)}
          onSuccess={(mensagem) => {
            setShowModal(false);
            loadEmpresas();
            toast.success('Empresa criada!', mensagem || 'A empresa foi cadastrada com sucesso.');
          }}
          onError={(mensagem) => {
            toast.error('Erro ao criar empresa', mensagem);
          }}
        />
      )}

      {/* Modal editar */}
      {editEmpresa && (
        <EditarEmpresaModal
          empresa={editEmpresa}
          onClose={() => setEditEmpresa(null)}
          onSave={handleSalvarEdicao}
        />
      )}

      {/* Confirmação excluir */}
      {deleteEmpresa && (
        <ConfirmDeleteModal
          empresaNome={deleteEmpresa.nome}
          onClose={() => setDeleteEmpresa(null)}
          onConfirm={() => handleConfirmarExclusao(deleteEmpresa.id)}
        />
      )}
    </div>
  );
}

interface NovaEmpresaModalProps {
  onClose: () => void;
  onSuccess: (mensagem?: string) => void;
  onError: (mensagem: string) => void;
}

function NovaEmpresaModal({ onClose, onSuccess, onError }: NovaEmpresaModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    setor: '' as Setor | '',
    website: '',
    descricao_curta: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArquivo(file);
    } else if (file) {
      onError('Formato inválido. Por favor, selecione um arquivo PDF.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArquivo(file);
    } else if (file) {
      onError('Formato inválido. Por favor, selecione um arquivo PDF.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.setor) return;

    setLoading(true);
    try {
      setUploadProgress('Criando empresa...');
      const empresa = await api.criarEmpresa({
        nome: form.nome,
        setor: form.setor as Setor,
        website: form.website || undefined,
        descricao_curta: form.descricao_curta || undefined,
      });

      if (arquivo && empresa.id) {
        setUploadProgress('Enviando documento PDF...');
        await api.uploadDocumento(empresa.id, arquivo);
        onSuccess('Empresa e documento criados com sucesso!');
      } else {
        onSuccess('Empresa cadastrada com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      const msg = error?.response?.data?.detail || 'Verifique os dados e tente novamente.';
      onError(msg);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60">
        <div className="flex min-h-full items-center justify-center p-4" onClick={onClose}>
          <div
            className="relative bg-[#1E293B] border border-slate-700 rounded-xl w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Nova Empresa</h2>
              <p className="text-sm text-slate-400 mt-1">
                Cadastre a empresa e envie o documento para análise
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nome da Empresa *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input"
                  placeholder="Ex: TechStartup Brasil"
                  required
                />
              </div>

              <div>
                <label className="label">Setor *</label>
                <select
                  value={form.setor}
                  onChange={(e) => setForm({ ...form, setor: e.target.value as Setor })}
                  className="select"
                  required
                >
                  <option value="">Selecione o setor</option>
                  {Object.entries(SETORES_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="input"
                  placeholder="https://exemplo.com"
                />
              </div>

              <div>
                <label className="label">Descrição</label>
                <textarea
                  value={form.descricao_curta}
                  onChange={(e) => setForm({ ...form, descricao_curta: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Breve descrição da empresa..."
                />
              </div>

              <div>
                <label className="label">
                  <FileText size={16} className="inline mr-1" />
                  Documento para Análise (PDF)
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? 'border-verde bg-verde/10'
                      : arquivo
                      ? 'border-verde/50 bg-verde/5'
                      : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {arquivo ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto bg-verde/20 rounded-lg flex items-center justify-center">
                        <FileText size={24} className="text-verde" />
                      </div>
                      <p className="text-slate-200 font-medium">{arquivo.name}</p>
                      <p className="text-slate-400 text-sm">{formatFileSize(arquivo.size)}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setArquivo(null);
                        }}
                        className="text-red-400 text-sm hover:text-red-300 transition-colors"
                      >
                        Remover arquivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto bg-slate-700 rounded-lg flex items-center justify-center">
                        <Upload size={24} className="text-slate-400" />
                      </div>
                      <p className="text-slate-300">
                        <span className="text-verde font-medium">Clique para selecionar</span> ou
                        arraste o arquivo
                      </p>
                      <p className="text-slate-500 text-sm">
                        PDF com pitch deck, business model canvas ou dados da empresa
                      </p>
                      <p className="text-slate-600 text-xs">Máximo 50MB</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  💡 O documento será usado pela IA para analisar os 12 critérios da startup
                </p>
              </div>

              {uploadProgress && (
                <div className="bg-verde/10 border border-verde/30 rounded-lg p-3 text-center">
                  <p className="text-verde text-sm">{uploadProgress}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  {arquivo ? 'Criar e Enviar' : 'Criar Empresa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function EditarEmpresaModal({
  empresa,
  onClose,
  onSave,
}: {
  empresa: Empresa;
  onClose: () => void;
  onSave: (payload: {
    id: string;
    nome: string;
    setor: Setor;
    website?: string;
    descricao_curta?: string;
  }) => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [documento, setDocumento] = useState<any>(null);
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const toast = useToast();
  
  const [form, setForm] = useState({
    nome: empresa.nome || '',
    setor: (empresa.setor || '') as Setor | '',
    website: empresa.website || '',
    descricao_curta: (empresa as any).descricao_curta || '',
  });

  // Carregar documento atual
  useEffect(() => {
    const loadDocumento = async () => {
      try {
        const docs = await api.listarDocumentos(empresa.id);
        if (docs && docs.length > 0) {
          setDocumento(docs[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar documento:', error);
      } finally {
        setLoadingDoc(false);
      }
    };
    loadDocumento();
  }, [empresa.id]);

  const canSave = !!form.nome && !!form.setor;

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setNovoArquivo(file);
    } else if (file) {
      toast.error('Formato inválido', 'Por favor, selecione um arquivo PDF.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setNovoArquivo(file);
    } else if (file) {
      toast.error('Formato inválido', 'Por favor, selecione um arquivo PDF.');
    }
  };

  // Excluir documento atual
  const handleDeleteDocumento = async () => {
    if (!documento) return;
    
    setUploadingDoc(true);
    try {
      await api.deletarDocumento(empresa.id, documento.id);
      setDocumento(null);
      toast.success('Documento excluído!', 'O documento foi removido.');
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro', 'Não foi possível excluir o documento.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Upload novo documento
  const handleUploadNovo = async () => {
    if (!novoArquivo) return;
    
    setUploadingDoc(true);
    try {
      // Se já existe documento, excluir primeiro
      if (documento) {
        await api.deletarDocumento(empresa.id, documento.id);
      }
      
      // Upload do novo
      const novoDoc = await api.uploadDocumento(empresa.id, novoArquivo);
      setDocumento(novoDoc);
      setNovoArquivo(null);
      toast.success('Documento enviado!', 'O novo documento foi salvo.');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro', 'Não foi possível fazer o upload.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      await onSave({
        id: empresa.id,
        nome: form.nome,
        setor: form.setor as Setor,
        website: form.website || undefined,
        descricao_curta: form.descricao_curta || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60">
        <div className="flex min-h-full items-center justify-center p-4" onClick={onClose}>
          <div
            className="relative bg-[#1E293B] border border-slate-700 rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#1E293B] p-6 border-b border-slate-700 z-10">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Pencil size={18} />
                Editar Empresa
              </h2>
              <p className="text-sm text-slate-400 mt-1">Atualize os dados e o documento da empresa</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="label">Nome da Empresa *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input"
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              {/* Setor */}
              <div>
                <label className="label">Setor *</label>
                <select
                  value={form.setor}
                  onChange={(e) => setForm({ ...form, setor: e.target.value as Setor })}
                  className="select"
                  required
                >
                  <option value="">Selecione o setor</option>
                  {Object.entries(SETORES_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Website */}
              <div>
                <label className="label">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="input"
                  placeholder="https://exemplo.com"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="label">Descrição</label>
                <textarea
                  value={form.descricao_curta}
                  onChange={(e) => setForm({ ...form, descricao_curta: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Breve descrição..."
                />
              </div>

              {/* Seção de Documento */}
              <div className="border-t border-slate-700 pt-4 mt-4">
                <label className="label flex items-center gap-2">
                  <FileText size={14} />
                  Documento Pitch (PDF)
                </label>

                {/* Documento Atual */}
                {loadingDoc ? (
                  <div className="flex items-center gap-2 text-slate-400 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    Carregando documento...
                  </div>
                ) : documento ? (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="text-verde" size={20} />
                      <div>
                        <p className="text-slate-200 text-sm font-medium truncate max-w-[200px]">
                          {documento.nome_arquivo}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(documento.tamanho_bytes)} • {documento.processado ? '✓ Processado' : '⏳ Pendente'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={handleDeleteDocumento}
                      disabled={uploadingDoc}
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-dashed border-slate-600 text-center mb-3">
                    <p className="text-slate-500 text-sm">Nenhum documento anexado</p>
                  </div>
                )}

                {/* Upload Novo Documento */}
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
                    ${dragActive ? 'border-verde bg-verde/10' : 'border-slate-600 hover:border-slate-500'}
                    ${novoArquivo ? 'border-verde/50 bg-verde/5' : ''}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload-edit')?.click()}
                >
                  <input
                    id="file-upload-edit"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {novoArquivo ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="text-verde" size={20} />
                      <div className="text-left">
                        <p className="text-slate-200 text-sm font-medium">{novoArquivo.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(novoArquivo.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNovoArquivo(null);
                        }}
                        className="ml-2 text-slate-400 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-500 mb-1" size={24} />
                      <p className="text-slate-400 text-sm">
                        {documento ? 'Substituir documento' : 'Adicionar documento'}
                      </p>
                      <p className="text-xs text-slate-500">Arraste ou clique</p>
                    </>
                  )}
                </div>

                {/* Botão de Upload */}
                {novoArquivo && (
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={handleUploadNovo}
                    disabled={uploadingDoc}
                  >
                    {uploadingDoc ? (
                      <>
                        <div className="w-4 h-4 border-2 border-verde border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        {documento ? 'Substituir Documento' : 'Enviar Documento'}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={saving || uploadingDoc}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={saving} className="flex-1" disabled={!canSave || uploadingDoc}>
                  Salvar alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function ConfirmDeleteModal({
  empresaNome,
  onClose,
  onConfirm,
}: {
  empresaNome: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60">
        <div className="flex min-h-full items-center justify-center p-4" onClick={onClose}>
          <div
            className="relative bg-[#1E293B] border border-slate-700 rounded-xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={18} />
                Confirmar exclusão
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Você tem certeza que deseja excluir <span className="text-slate-200 font-medium">{empresaNome}</span>?
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                Essa ação não pode ser desfeita.
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  loading={deleting}
                  className="flex-1 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                >
                  <Trash2 size={16} />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function TableSkeleton() {
  return (
    <div className="table-container">
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
