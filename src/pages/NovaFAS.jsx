import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const gerarNumeroFAS = (total) => {
  const ano = new Date().getFullYear();
  return `FAS-${ano}-${String(total + 1).padStart(4, '0')}`;
};

const gerarCodigoAmostra = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'AM-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const hoje = () => new Date().toISOString().split('T')[0];

export default function NovaFAS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [ensaios, setEnsaios] = useState([]);
  const [totalFas, setTotalFas] = useState(0);
  const [saving, setSaving] = useState(false);

  const role = user?.role || '';
  const canCreate = role === 'comercial' || role === 'admin' || role === 'gestor';

  const [form, setForm] = useState({
    numero_proposta: '',
    cliente_id: '',
    razao_social: '',
    cnpj: '',
    responsavel: '',
    email_envio: '',
    exige_art: false,
    objetivo: '',
    itens: [],
    declaracao_confidencialidade: false,
    exige_simbolo: false,
    observacoes: '',
    nome_solicitante: user?.full_name || '',
    data_solicitacao: hoje(),
    status: 'aberta',
  });

  useEffect(() => {
    const load = async () => {
      const [cList, eList, fList] = await Promise.all([
        base44.entities.Cliente.list('razao_social'),
        base44.entities.Ensaio.list('nome'),
        base44.entities.FAS.list(),
      ]);
      setClientes(cList.filter(c => c.ativo !== false));
      setEnsaios(eList.filter(e => e.ativo !== false));
      setTotalFas(fList.length);
    };
    load();
  }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleClienteChange = (clienteId) => {
    const c = clientes.find(c => c.id === clienteId);
    if (c) {
      setForm(f => ({
        ...f,
        cliente_id: clienteId,
        razao_social: c.razao_social,
        cnpj: c.cnpj || '',
        responsavel: c.responsavel || '',
        email_envio: c.email || '',
      }));
    }
  };

  const addItem = () => {
    setForm(f => ({
      ...f,
      itens: [...f.itens, { ensaio_id: '', ensaio_nome: '', norma: '', quantidade: 1, unidade: '', prazo_dias: '' }]
    }));
  };

  const updateItem = (idx, field, value) => {
    setForm(f => {
      const itens = [...f.itens];
      itens[idx] = { ...itens[idx], [field]: value };
      if (field === 'ensaio_id') {
        const e = ensaios.find(e => e.id === value);
        if (e) {
          itens[idx].ensaio_nome = e.nome;
          itens[idx].norma = e.norma;
          itens[idx].unidade = e.unidade_padrao || '';
          itens[idx].prazo_dias = e.prazo_padrao_dias || '';
        }
      }
      return { ...f, itens };
    });
  };

  const removeItem = (idx) => {
    setForm(f => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.cliente_id || !form.numero_proposta || !form.objetivo) return;
    setSaving(true);
    const andamentoInicial = [
      { atividade: 'Abertura da FAS', data: hoje(), concluida: true },
      { atividade: 'Recebimento do Material', data: null, concluida: false },
      { atividade: 'Envio do Relatório', data: null, concluida: false },
    ];
    const payload = {
      ...form,
      status: 'aberta',
      numero_fas: gerarNumeroFAS(totalFas),
      codigo_amostra: gerarCodigoAmostra(),
      andamento: andamentoInicial,
    };
    await base44.entities.FAS.create(payload);
    setSaving(false);
    navigate('/fas');
  };

  if (!canCreate) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center mt-20">
        <p className="text-muted-foreground text-lg">Apenas o perfil Comercial pode criar novas FAS.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/fas')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fas')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Ficha de Aprovação de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Nº FAS será gerado automaticamente ao salvar</p>
        </div>
      </div>

      {/* Dados da Proposta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dados da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Número da Proposta Comercial *</Label>
              <Input
                value={form.numero_proposta}
                onChange={e => set('numero_proposta', e.target.value)}
                placeholder="Ex: PROP-2026-001"
                className="font-mono-data"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.cliente_id} onValueChange={handleClienteChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Razão Social</Label>
              <Input value={form.razao_social} readOnly className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} readOnly className="bg-muted text-muted-foreground font-mono-data" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Input value={form.responsavel} onChange={e => set('responsavel', e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail de Envio dos Resultados</Label>
              <Input type="email" value={form.email_envio} onChange={e => set('email_envio', e.target.value)} placeholder="email@empresa.com" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Objetivo *</Label>
            <Textarea
              value={form.objetivo}
              onChange={e => set('objetivo', e.target.value)}
              placeholder="Descreva o objetivo do serviço..."
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch checked={form.exige_art} onCheckedChange={v => set('exige_art', v)} />
              <Label>Exige ART</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.exige_simbolo} onCheckedChange={v => set('exige_simbolo', v)} />
              <Label>Exige Símbolo de Acreditação</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.declaracao_confidencialidade} onCheckedChange={v => set('declaracao_confidencialidade', v)} />
              <Label>Declaração de Confidencialidade</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ensaios */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Ensaios Solicitados</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Adicionar Ensaio
          </Button>
        </CardHeader>
        <CardContent>
          {form.itens.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              Nenhum ensaio adicionado. Clique em "Adicionar Ensaio" para começar.
            </p>
          ) : (
            <div className="space-y-4">
              {form.itens.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ensaio {idx + 1}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(idx)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Ensaio</Label>
                      <Select value={item.ensaio_id} onValueChange={v => updateItem(idx, 'ensaio_id', v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ensaios.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Norma</Label>
                      <Input value={item.norma} readOnly className="h-9 bg-muted text-muted-foreground font-mono-data text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantidade</Label>
                      <Input type="number" value={item.quantidade} onChange={e => updateItem(idx, 'quantidade', Number(e.target.value))} className="h-9 font-mono-data" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Unidade</Label>
                      <Input value={item.unidade} onChange={e => updateItem(idx, 'unidade', e.target.value)} className="h-9" placeholder="amostra" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Prazo (dias úteis)</Label>
                      <Input type="number" value={item.prazo_dias} onChange={e => updateItem(idx, 'prazo_dias', Number(e.target.value))} className="h-9 font-mono-data" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complementar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informações Complementares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome do Solicitante</Label>
              <Input value={form.nome_solicitante} onChange={e => set('nome_solicitante', e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-1.5">
              <Label>Data da Solicitação</Label>
              <Input type="date" value={form.data_solicitacao} onChange={e => set('data_solicitacao', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Informações adicionais relevantes..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-4">
        <Button variant="outline" onClick={() => navigate('/fas')}>Cancelar</Button>
        <Button
          onClick={handleSave}
          disabled={saving || !form.cliente_id || !form.numero_proposta || !form.objetivo}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Abrir FAS'}
        </Button>
      </div>
    </div>
  );
}