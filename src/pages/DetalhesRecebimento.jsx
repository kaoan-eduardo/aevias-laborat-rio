import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, Search, X, Play, Ban, Pencil } from 'lucide-react';
import FotosRecebimento from '@/components/recebimento/FotosRecebimento';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

function ClienteInfo({ clienteId, clienteNome }) {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    if (!clienteId) return;
    base44.entities.Cliente.filter({ id: clienteId }).then(res => setCliente(res[0] || null));
  }, [clienteId]);

  if (!cliente) return <p className="text-sm text-foreground">{clienteNome || '—'}</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div className="col-span-2 sm:col-span-3">
        <p className="text-sm font-semibold text-foreground">{cliente.razao_social}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">CNPJ</p>
        <p className="text-sm font-mono-data">{cliente.cnpj || '—'}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Responsável</p>
        <p className="text-sm">{cliente.responsavel || '—'}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Telefone</p>
        <p className="text-sm">{cliente.telefone || '—'}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">E-mail</p>
        <p className="text-sm">{cliente.email || '—'}</p>
      </div>
      {cliente.endereco && (
        <div className="col-span-2 sm:col-span-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Endereço</p>
          <p className="text-sm">{cliente.endereco}</p>
        </div>
      )}
    </div>
  );
}

const InfoRow = ({ label, value, mono }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
    <p className={`text-sm text-foreground ${mono ? 'font-mono-data' : ''}`}>{value || '—'}</p>
  </div>
);

const BoolBadge = ({ value }) => (
  <Badge className={value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
    {value ? 'Sim' : 'Não'}
  </Badge>
);

const STATUS_CONFIG = {
  a_definir:      { label: 'A Definir',      color: 'bg-gray-100 text-gray-600' },
  iniciado:       { label: 'Iniciado',       color: 'bg-blue-100 text-blue-700' },
  concluido:      { label: 'Concluído',      color: 'bg-green-100 text-green-700' },
  cancelado:      { label: 'Cancelado',      color: 'bg-red-100 text-red-600' },
  // legados — compatibilidade com registros antigos
  pendente_gestor: { label: 'A Definir',     color: 'bg-gray-100 text-gray-600' },
};

export default function DetalhesRecebimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recebimento, setRecebimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fasList, setFasList] = useState([]);
  const [ensaios, setEnsaios] = useState([]);
  const [possuiFas, setPossuiFas] = useState(null); // null=não respondido, true, false
  const [fasId, setFasId] = useState('');
  const [ensaiosSelecionados, setEnsaiosSelecionados] = useState([]);
  const [ensaioSearch, setEnsaioSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [clientes, setClientes] = useState([]);

  const role = user?.role || 'auxiliar';
  const isGestor = role === 'admin' || role === 'gestor';
  // Cargos técnicos que podem alterar status de execução
  const isTecnico = role === 'coordenadora_tecnica' || role === 'encarregado' || role === 'auxiliar_qualidade' || role === 'admin';

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.RecebimentoAmostra.filter({ id });
      const rec = data[0] || null;
      setRecebimento(rec);
      if (rec) {
        setFasId(rec.fas_id || '');
        setEnsaiosSelecionados(rec.ensaios_selecionados || []);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Carrega FAS em aberto do cliente e todos os ensaios quando gestor abre em status a_definir
  useEffect(() => {
    if (!isGestor || !recebimento || recebimento.status !== 'a_definir') return;
    // Resetar a escolha de FAS ao entrar no modo a_definir
    setPossuiFas(null);
    setFasId('');
    setEnsaiosSelecionados([]);
    const loadGestorData = async () => {
      const [fasData, ensaiosData] = await Promise.all([
        base44.entities.FAS.filter({ cliente_id: recebimento.cliente_id, status: 'aberta' }),
        base44.entities.Ensaio.list('nome')
      ]);
      setFasList(fasData);
      setEnsaios(ensaiosData.filter(e => e.ativo !== false));
    };
    loadGestorData();
  }, [isGestor, recebimento?.status, recebimento?.cliente_id]);

  const toggleEnsaio = (ensaio) => {
    setEnsaiosSelecionados(prev => {
      const exists = prev.find(e => e.ensaio_id === ensaio.id);
      if (exists) return prev.filter(e => e.ensaio_id !== ensaio.id);
      return [...prev, { ensaio_id: ensaio.id, ensaio_nome: ensaio.nome, norma: ensaio.norma }];
    });
  };

  const handleFasChange = (id) => {
    setFasId(id);
    const fasEscolhida = fasList.find(f => f.id === id);
    if (fasEscolhida?.itens?.length > 0) {
      // Pré-seleciona ensaios da FAS escolhida
      const preSelected = fasEscolhida.itens
        .filter(item => item.ensaio_id)
        .map(item => ({ ensaio_id: item.ensaio_id, ensaio_nome: item.ensaio_nome, norma: item.norma }));
      setEnsaiosSelecionados(preSelected);
    }
  };

  const canConfirm = ensaiosSelecionados.length > 0 && (possuiFas === false || (possuiFas === true && fasId));

  const handleSalvarGestor = async () => {
    if (!canConfirm) return;
    setSaving(true);
    const fasEscolhida = possuiFas ? fasList.find(f => f.id === fasId) : null;

    const updates = [
      base44.entities.RecebimentoAmostra.update(recebimento.id, {
        fas_id: possuiFas ? fasId : null,
        numero_fas: fasEscolhida?.numero_fas || fasEscolhida?.numero_proposta || '',
        ensaios_selecionados: ensaiosSelecionados,
        status: 'iniciado'
      })
    ];

    // Se vinculou uma FAS, marca como material_recebido
    if (fasEscolhida) {
      const andamento = (fasEscolhida.andamento || []).map(a =>
        a.atividade === 'Recebimento do Material' ? { ...a, data: new Date().toISOString().split('T')[0], concluida: true } : a
      );
      updates.push(
        base44.entities.FAS.update(fasEscolhida.id, { status: 'material_recebido', andamento })
      );
    }

    await Promise.all(updates);

    setRecebimento(r => ({
      ...r,
      fas_id: possuiFas ? fasId : null,
      numero_fas: fasEscolhida?.numero_fas || fasEscolhida?.numero_proposta || '',
      ensaios_selecionados: ensaiosSelecionados,
      status: 'iniciado'
    }));
    setSaving(false);
  };

  const handleConcluir = async () => {
    await base44.entities.RecebimentoAmostra.update(recebimento.id, { status: 'concluido' });
    setRecebimento(r => ({ ...r, status: 'concluido' }));
  };

  const handleCancelar = async () => {
    await base44.entities.RecebimentoAmostra.update(recebimento.id, { status: 'cancelado' });
    setRecebimento(r => ({ ...r, status: 'cancelado' }));
  };

  const ensaiosFiltrados = ensaios.filter(e =>
    e.nome?.toLowerCase().includes(ensaioSearch.toLowerCase()) ||
    e.norma?.toLowerCase().includes(ensaioSearch.toLowerCase())
  );

  const handleAbrirEdicao = async () => {
    setEditForm({
      cliente_id: recebimento.cliente_id || '',
      cliente_nome: recebimento.cliente_nome || '',
      data_entrada: recebimento.data_entrada || '',
      data_registro: recebimento.data_registro || '',
      numero_projeto: recebimento.numero_projeto || '',
      responsavel_amostragem: recebimento.responsavel_amostragem || '',
      observacoes: recebimento.observacoes || '',
    });
    if (clientes.length === 0) {
      const c = await base44.entities.Cliente.list('razao_social');
      setClientes(c.filter(x => x.ativo !== false));
    }
    setEditando(true);
  };

  const handleSalvarEdicao = async () => {
    setSaving(true);
    const clienteEscolhido = clientes.find(c => c.id === editForm.cliente_id);
    const updates = {
      ...editForm,
      cliente_nome: clienteEscolhido?.razao_social || editForm.cliente_nome,
    };
    await base44.entities.RecebimentoAmostra.update(recebimento.id, updates);
    setRecebimento(r => ({ ...r, ...updates }));
    setEditando(false);
    setSaving(false);
  };

  const handleDeleteAmostra = async (amostraId) => {
    const updatedAmostras = recebimento.amostras.filter(a => a.id !== amostraId);
    await base44.entities.RecebimentoAmostra.update(recebimento.id, { amostras: updatedAmostras });
    setRecebimento(r => ({ ...r, amostras: updatedAmostras }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (!recebimento) return (
    <div className="p-6 text-center text-muted-foreground">Protocolo não encontrado.</div>
  );

  const statusConf = STATUS_CONFIG[recebimento.status] || STATUS_CONFIG.a_definir;

  return (
    <>
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/recebimento')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono-data">{recebimento.numero_protocolo}</h1>
            <Badge className={statusConf.color}>{statusConf.label}</Badge>
            {isGestor && recebimento.status !== 'cancelado' && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleAbrirEdicao}>
                <Pencil className="w-3.5 h-3.5" />
                Editar Protocolo
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{recebimento.cliente_nome}</p>
        </div>
      </div>

      {/* Ações de status para técnicos */}
      {isTecnico && recebimento.status === 'iniciado' && (
        <div className="flex gap-3 flex-wrap">
          <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleConcluir}>
            <CheckCircle className="w-4 h-4" />
            Marcar como Concluído
          </Button>
          <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancelar}>
            <Ban className="w-4 h-4" />
            Cancelar Protocolo
          </Button>
        </div>
      )}
      {(isGestor || isTecnico) && recebimento.status === 'concluido' && (
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancelar}>
            <Ban className="w-4 h-4" />
            Cancelar Protocolo
          </Button>
        </div>
      )}
      {isGestor && recebimento.status === 'cancelado' && (
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={async () => {
            const novoStatus = recebimento.fas_id ? 'iniciado' : 'a_definir';
            await base44.entities.RecebimentoAmostra.update(recebimento.id, { status: novoStatus });
            setRecebimento(r => ({ ...r, status: novoStatus }));
          }}>
            <Play className="w-4 h-4" />
            Reabrir Protocolo
          </Button>
        </div>
      )}

      {/* Seção do Gestor — preenchimento pendente */}
      {isGestor && recebimento.status === 'a_definir' && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-yellow-800">⚠️ Definição pendente — FAS e Ensaios</CardTitle>
            <p className="text-xs text-yellow-700">Vincule uma FAS e selecione os ensaios para iniciar o protocolo.</p>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Pergunta: Possui FAS? */}
            <div>
              <Label className="text-sm font-medium">Esta amostra possui FAS vinculada?</Label>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => { setPossuiFas(true); setFasId(''); setEnsaiosSelecionados([]); }}
                  className={`px-5 py-2 rounded-md text-sm font-medium border transition-colors ${possuiFas === true ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}
                >
                  Sim
                </button>
                <button
                  onClick={() => { setPossuiFas(false); setFasId(''); setEnsaiosSelecionados([]); }}
                  className={`px-5 py-2 rounded-md text-sm font-medium border transition-colors ${possuiFas === false ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-foreground border-border hover:border-primary/50'}`}
                >
                  Não
                </button>
              </div>
            </div>

            {/* Select da FAS (só se possuiFas = true) */}
            {possuiFas === true && (
              <div>
                <Label className="text-xs">FAS em Aberto para este cliente *</Label>
                {fasList.length === 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground italic">Nenhuma FAS em aberto para este cliente.</p>
                ) : (
                  <Select value={fasId} onValueChange={handleFasChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a FAS..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fasList.map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.numero_fas || f.numero_proposta}
                          {f.objetivo ? ` — ${f.objetivo.slice(0, 50)}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Seletor de Ensaios com busca — aparece após responder ou sempre se possuiFas=false */}
            {possuiFas !== null && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">
                    Ensaios a Realizar *
                    {ensaiosSelecionados.length > 0 && (
                      <span className="ml-1 text-primary font-semibold">({ensaiosSelecionados.length} selecionados)</span>
                    )}
                  </Label>
                  {ensaiosSelecionados.length > 0 && (
                    <button onClick={() => setEnsaiosSelecionados([])} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                      <X className="w-3 h-3" /> Limpar
                    </button>
                  )}
                </div>

                {/* Chips dos selecionados */}
                {ensaiosSelecionados.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {ensaiosSelecionados.map(e => (
                      <span key={e.ensaio_id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {e.ensaio_nome}
                        <button onClick={() => setEnsaiosSelecionados(prev => prev.filter(s => s.ensaio_id !== e.ensaio_id))}>
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Busca */}
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={ensaioSearch}
                    onChange={e => setEnsaioSearch(e.target.value)}
                    placeholder="Filtrar ensaios por nome ou norma..."
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                {/* Lista de ensaios */}
                <div className="border rounded-md bg-white max-h-52 overflow-y-auto divide-y divide-border">
                  {ensaiosFiltrados.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground text-center">Nenhum ensaio encontrado.</p>
                  ) : ensaiosFiltrados.map(e => {
                    const checked = ensaiosSelecionados.some(s => s.ensaio_id === e.id);
                    return (
                      <label key={e.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${checked ? 'bg-primary/5' : 'hover:bg-muted/40'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleEnsaio(e)} className="flex-shrink-0 accent-primary" />
                        <span className="flex-1 min-w-0">
                          <span className={`text-xs font-medium ${checked ? 'text-primary' : 'text-foreground'}`}>{e.nome}</span>
                          {e.norma && <span className="text-xs text-muted-foreground ml-1.5">{e.norma}</span>}
                        </span>
                        {checked && <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleSalvarGestor}
                disabled={!canConfirm || saving}
                className="gap-2 bg-yellow-600 hover:bg-yellow-700"
              >
                <CheckCircle className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Confirmar e Iniciar Protocolo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados do gestor já preenchidos */}
      {(recebimento.status === 'iniciado' || recebimento.status === 'concluido' || recebimento.status === 'cancelado') && recebimento.ensaios_selecionados?.length > 0 && (
        <Card className="border-green-200 bg-green-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800">Informações do Gestor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nº FAS / Proposta Comercial" value={recebimento.numero_fas} mono />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Ensaios Selecionados</p>
              <div className="flex flex-wrap gap-1.5">
                {(recebimento.ensaios_selecionados || []).map(e => (
                  <Badge key={e.ensaio_id} variant="outline" className="text-xs font-normal">
                    {e.ensaio_nome}{e.norma ? ` · ${e.norma}` : ''}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados Principais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informações do Protocolo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cliente */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cliente</p>
            <ClienteInfo clienteId={recebimento.cliente_id} clienteNome={recebimento.cliente_nome} />
          </div>
          <div className="border-t border-border pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InfoRow label="Data do Registro" value={recebimento.data_registro ? new Date(recebimento.data_registro).toLocaleDateString('pt-BR') : null} />
            <InfoRow label="Data da Entrada" value={recebimento.data_entrada ? new Date(recebimento.data_entrada).toLocaleDateString('pt-BR') : null} />
            <InfoRow label="Número do Projeto" value={recebimento.numero_projeto} />
            <InfoRow label="Responsável Amostragem" value={recebimento.responsavel_amostragem} />
          </div>
          {recebimento.observacoes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
              <p className="text-sm text-foreground">{recebimento.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fotos do Material</CardTitle>
        </CardHeader>
        <CardContent>
          <FotosRecebimento
            fotos={recebimento.fotos || []}
            recebimentoId={recebimento.id}
            onChange={(novasFotos) => setRecebimento(r => ({ ...r, fotos: novasFotos }))}
          />
        </CardContent>
      </Card>

      {/* Amostras */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identificação das Amostras ({recebimento.amostras?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!recebimento.amostras || recebimento.amostras.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">Nenhuma amostra vinculada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Material</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Procedência</th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Qtd</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Observação</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Data Coleta</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Peso (kg)</th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Suficiente?</th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recebimento.amostras.map(a => (
                    <tr key={a.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium text-foreground">{a.material_nome || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{a.procedencia || '—'}</td>
                      <td className="px-3 py-2 text-center font-mono-data">{a.quantidade || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{a.observacao_recebimento || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {a.data_coleta ? new Date(a.data_coleta).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">{a.peso_kg || '—'}</td>
                      <td className="px-3 py-2 text-center"><BoolBadge value={a.quantidade_suficiente} /></td>
                      <td className="px-3 py-2 text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAmostra(a.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Modal de Edição do Protocolo */}

    <Dialog open={editando} onOpenChange={setEditando}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Protocolo {recebimento.numero_protocolo}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Cliente</Label>
            <Select value={editForm.cliente_id} onValueChange={v => setEditForm(f => ({ ...f, cliente_id: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data de Entrada</Label>
              <Input type="date" className="mt-1" value={editForm.data_entrada} onChange={e => setEditForm(f => ({ ...f, data_entrada: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Data de Registro</Label>
              <Input type="date" className="mt-1" value={editForm.data_registro} onChange={e => setEditForm(f => ({ ...f, data_registro: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Número do Projeto</Label>
            <Input className="mt-1" value={editForm.numero_projeto} onChange={e => setEditForm(f => ({ ...f, numero_projeto: e.target.value }))} placeholder="Ex: PRJ-2026-001" />
          </div>
          <div>
            <Label className="text-xs">Responsável pela Amostragem</Label>
            <Input className="mt-1" value={editForm.responsavel_amostragem} onChange={e => setEditForm(f => ({ ...f, responsavel_amostragem: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea className="mt-1 resize-none" rows={3} value={editForm.observacoes} onChange={e => setEditForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
          <Button onClick={handleSalvarEdicao} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}