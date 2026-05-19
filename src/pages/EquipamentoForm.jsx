import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { STATUS_EQUIPAMENTO, PERIODICIDADE_LABELS } from '@/utils/equipamentoHelpers';

const EMPTY_FORM = {
  identificacao_interna: '', nome: '', categoria: '', fabricante: '', modelo: '',
  numero_serie: '', software_firmware: '', data_entrada_servico: '', faixa_nominal_maxima: '',
  localizacao: '', responsavel_atualizacao: '', precisao: '', frequencia_calibracao: '',
  pontos_calibracao: '', criterios_aceitacao: '', erro_maximo_admissivel: '', observacoes: '',
  data_calibracao: '', validade_calibracao: '', periodicidade_verificacao: '', status: 'em_uso',
  obrigatorio_verificacao_diaria: false, obrigatorio_verificacao_intermediaria: false,
  historico_calibracao: [], historico_manutencao: [],
};

const EMPTY_CAL = {
  numero_certificado: '', orgao: '', titulo: '',
  identificacao_lab: false, selo_rbc: false, identificacao_certificado: false,
  numero_paginas: false, nome_endereco_cliente: false, descricao_item_calibrado: false,
  identificacao_metodo: false, data_calibracao: false, nome_autorizou: false,
  rastreabilidade: false, certificado_aceito: false,
  erro_maximo_admissivel_ref: '', erro_maximo_obtido_1: '', erro_maximo_admissivel_1: '',
  erro_maximo_obtido_2: '', erro_maximo_admissivel_2: '', erro_maximo_obtido_3: '',
  atende_especificado: false, periodicidade: '', data_calibracao_resultado: '',
  proxima_calibracao: '', item_em_uso: false, observacoes_resultado: '',
  data_analise: '', responsavel_analise: '',
};

const EMPTY_MAN = {
  data: '', descricao_problema: '', form011_etiqueta_nc: '', responsavel: '',
  status_form012: '', data_aprovacao: '', fornecedor: '', ordem_compra: '',
  data_ordem_compra: '', nota_fiscal: '', data_recebimento: '', detalhes_execucao: '',
  inspecao_recebimento: '', analise_critica: '', status_form012_final: '',
};

function SectionTitle({ children }) {
  return (
    <div className="bg-muted/60 border border-border rounded-md px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </div>
  );
}

function Field({ label, children, col2 }) {
  return (
    <div className={`space-y-1.5${col2 ? ' sm:col-span-2' : ''}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <Checkbox checked={!!checked} onCheckedChange={onChange} />
      <span className="text-xs text-foreground">{label}</span>
    </label>
  );
}

export default function EquipamentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [statusOriginal, setStatusOriginal] = useState('em_uso');
  const [dataAlteracaoStatus, setDataAlteracaoStatus] = useState('');
  const [observacaoStatus, setObservacaoStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      base44.entities.Equipamento.get(id).then(eq => {
        if (eq) {
          setForm({ ...EMPTY_FORM, ...eq });
          setStatusOriginal(eq.status || 'em_uso');
        }
        setLoading(false);
      });
    }
  }, [id]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const statusMudou = form.status !== statusOriginal;

  // ── Calibração helpers ────────────────────────────────────────────────────
  const addCal = () => setForm(f => ({ ...f, historico_calibracao: [...(f.historico_calibracao || []), { ...EMPTY_CAL }] }));
  const removeCal = (i) => setForm(f => ({ ...f, historico_calibracao: f.historico_calibracao.filter((_, idx) => idx !== i) }));
  const setCal = (i, field, value) => setForm(f => {
    const arr = [...(f.historico_calibracao || [])];
    arr[i] = { ...arr[i], [field]: value };
    return { ...f, historico_calibracao: arr };
  });

  // ── Manutenção helpers ────────────────────────────────────────────────────
  const addMan = () => setForm(f => ({ ...f, historico_manutencao: [...(f.historico_manutencao || []), { ...EMPTY_MAN }] }));
  const removeMan = (i) => setForm(f => ({ ...f, historico_manutencao: f.historico_manutencao.filter((_, idx) => idx !== i) }));
  const setMan = (i, field, value) => setForm(f => {
    const arr = [...(f.historico_manutencao || [])];
    arr[i] = { ...arr[i], [field]: value };
    return { ...f, historico_manutencao: arr };
  });

  const handleSave = async () => {
    if (!form.identificacao_interna || !form.nome || !form.categoria) return;
    if (statusMudou && !dataAlteracaoStatus) return;

    setSaving(true);
    let novoHistorico = form.historico_status || [];

    if (statusMudou) {
      novoHistorico = [...novoHistorico, { status: form.status, data: dataAlteracaoStatus, observacao: observacaoStatus.trim() }];
    }

    const payload = { ...form, historico_status: novoHistorico };

    if (isEdit) {
      await base44.entities.Equipamento.update(id, payload);
    } else {
      const historicoInicial = [{ status: form.status, data: dataAlteracaoStatus || new Date().toISOString().split('T')[0], observacao: 'Cadastro inicial' }];
      await base44.entities.Equipamento.create({ ...payload, historico_status: historicoInicial });
    }

    setSaving(false);
    navigate('/equipamentos');
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/equipamentos')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Editar Equipamento' : 'Novo Equipamento'}</h1>
          <p className="text-sm text-muted-foreground">Preencha todas as informações do equipamento</p>
        </div>
        <div className="ml-auto">
          <Button
            onClick={handleSave}
            disabled={saving || !form.identificacao_interna || !form.nome || !form.categoria || (statusMudou && !dataAlteracaoStatus)}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </div>
      </div>

      {/* ── IDENTIFICAÇÃO ── */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Identificação</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Identificação Interna *">
              <Input value={form.identificacao_interna} onChange={e => set('identificacao_interna', e.target.value)} placeholder="Ex: LC-001" className="font-mono" />
            </Field>
            <Field label="Nome *">
              <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do equipamento" />
            </Field>
            <Field label="Categoria *">
              <Select value={form.categoria} onValueChange={v => set('categoria', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {['Vidraria','Soquete','Cilindros','Banho Maria','Estufa','Balança','Termômetro','Densímetro','Outros'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fabricante">
              <Input value={form.fabricante || ''} onChange={e => set('fabricante', e.target.value)} placeholder="Ex: MARTE" />
            </Field>
            <Field label="Modelo">
              <Input value={form.modelo || ''} onChange={e => set('modelo', e.target.value)} placeholder="Ex: AD16K" />
            </Field>
            <Field label="Número de Série">
              <Input value={form.numero_serie || ''} onChange={e => set('numero_serie', e.target.value)} />
            </Field>
            <Field label="Software / Firmware">
              <Input value={form.software_firmware || ''} onChange={e => set('software_firmware', e.target.value)} placeholder="N.A." />
            </Field>
            <Field label="Data de Entrada em Serviço">
              <Input type="date" value={form.data_entrada_servico || ''} onChange={e => set('data_entrada_servico', e.target.value)} />
            </Field>
            <Field label="Resolução / Precisão">
              <Input value={form.precisao || ''} onChange={e => set('precisao', e.target.value)} placeholder="Ex: 0,1 g" />
            </Field>
            <Field label="Faixa Nominal Máxima">
              <Input value={form.faixa_nominal_maxima || ''} onChange={e => set('faixa_nominal_maxima', e.target.value)} placeholder="Ex: 10 000 g" />
            </Field>
            <Field label="Localização">
              <Input value={form.localizacao || ''} onChange={e => set('localizacao', e.target.value)} placeholder="Ex: Laboratório Central" />
            </Field>
            <Field label="Responsável pela Atualização">
              <Input value={form.responsavel_atualizacao || ''} onChange={e => set('responsavel_atualizacao', e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ── PONTOS / CRITÉRIOS / OBSERVAÇÕES ── */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Pontos de Calibração / Critérios / Observações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Pontos de Calibração" col2>
            <Input value={form.pontos_calibracao || ''} onChange={e => set('pontos_calibracao', e.target.value)} placeholder="Ex: 100 ; 1 000 ; 2 000 ; 5 000 ; 10 000 g" />
          </Field>
          <Field label="Critérios de Aceitação" col2>
            <Input value={form.criterios_aceitacao || ''} onChange={e => set('criterios_aceitacao', e.target.value)} />
          </Field>
          <Field label="Observações" col2>
            <Input value={form.observacoes || ''} onChange={e => set('observacoes', e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      {/* ── CALIBRAÇÃO — campos gerais ── */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Calibração</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Data de Calibração">
              <Input type="date" value={form.data_calibracao || ''} onChange={e => set('data_calibracao', e.target.value)} />
            </Field>
            <Field label="Validade da Calibração">
              <Input type="date" value={form.validade_calibracao || ''} onChange={e => set('validade_calibracao', e.target.value)} />
            </Field>
            <Field label="Frequência de Calibração">
              <Input value={form.frequencia_calibracao || ''} onChange={e => set('frequencia_calibracao', e.target.value)} placeholder="Ex: Anual" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ── HISTÓRICO DE CALIBRAÇÃO ── */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Histórico de Calibração (FORM 013)</CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={addCal}>
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(form.historico_calibracao || []).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro de calibração adicionado.</p>
          )}
          {(form.historico_calibracao || []).map((c, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-4 bg-muted/10 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-primary">Calibração #{i + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeCal(i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <SectionTitle>Análise das Informações do Certificado</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Número do Certificado">
                  <Input value={c.numero_certificado || ''} onChange={e => setCal(i, 'numero_certificado', e.target.value)} />
                </Field>
                <Field label="Órgão">
                  <Input value={c.orgao || ''} onChange={e => setCal(i, 'orgao', e.target.value)} placeholder="Ex: K&L" />
                </Field>
                <div className="space-y-1.5">
                  <Label className="text-xs">Título</Label>
                  <CheckField label="Sim" checked={!!c.titulo} onChange={v => setCal(i, 'titulo', v)} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['identificacao_lab', 'Identificação do lab.'],
                  ['selo_rbc', 'Selo RBC e nº CAL'],
                  ['identificacao_certificado', 'Identificação do certificado'],
                  ['numero_paginas', 'Número de páginas'],
                  ['nome_endereco_cliente', 'Nome e endereço do cliente'],
                  ['descricao_item_calibrado', 'Descrição do item calibrado'],
                  ['identificacao_metodo', 'Identificação do método'],
                  ['data_calibracao', 'Data da calibração'],
                  ['nome_autorizou', 'Nome/função que autorizou'],
                  ['rastreabilidade', 'Rastreabilidade das medições'],
                  ['certificado_aceito', 'Certificado pode ser aceito?'],
                ].map(([field, label]) => (
                  <CheckField key={field} label={label} checked={c[field]} onChange={v => setCal(i, field, v)} />
                ))}
              </div>

              <SectionTitle>Análise dos Resultados</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Erro máx. admissível (ref)">
                  <Input value={c.erro_maximo_admissivel_ref || ''} onChange={e => setCal(i, 'erro_maximo_admissivel_ref', e.target.value)} />
                </Field>
                <Field label="Erro máx. obtido (1)">
                  <Input value={c.erro_maximo_obtido_1 || ''} onChange={e => setCal(i, 'erro_maximo_obtido_1', e.target.value)} />
                </Field>
                <Field label="Erro máx. admissível (1)">
                  <Input value={c.erro_maximo_admissivel_1 || ''} onChange={e => setCal(i, 'erro_maximo_admissivel_1', e.target.value)} />
                </Field>
                <Field label="Erro máx. obtido (2)">
                  <Input value={c.erro_maximo_obtido_2 || ''} onChange={e => setCal(i, 'erro_maximo_obtido_2', e.target.value)} />
                </Field>
                <Field label="Erro máx. admissível (2)">
                  <Input value={c.erro_maximo_admissivel_2 || ''} onChange={e => setCal(i, 'erro_maximo_admissivel_2', e.target.value)} />
                </Field>
                <Field label="Erro máx. obtido (3)">
                  <Input value={c.erro_maximo_obtido_3 || ''} onChange={e => setCal(i, 'erro_maximo_obtido_3', e.target.value)} className="bg-yellow-50" />
                </Field>
                <Field label="Periodicidade entre calibrações">
                  <Input value={c.periodicidade || ''} onChange={e => setCal(i, 'periodicidade', e.target.value)} placeholder="Ex: Manter" />
                </Field>
                <Field label="Observações">
                  <Input value={c.observacoes_resultado || ''} onChange={e => setCal(i, 'observacoes_resultado', e.target.value)} />
                </Field>
                <Field label="Data da análise">
                  <Input value={c.data_analise || ''} onChange={e => setCal(i, 'data_analise', e.target.value)} placeholder="Ex: 18/05/2026" />
                </Field>
                <Field label="Responsável pela análise">
                  <Input value={c.responsavel_analise || ''} onChange={e => setCal(i, 'responsavel_analise', e.target.value)} />
                </Field>
              </div>
              <div className="flex flex-wrap gap-4 mt-1">
                <CheckField label="Atende ao especificado?" checked={c.atende_especificado} onChange={v => setCal(i, 'atende_especificado', v)} />
                <CheckField label="Item pode ser colocado em uso?" checked={c.item_em_uso} onChange={v => setCal(i, 'item_em_uso', v)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── HISTÓRICO DE MANUTENÇÃO ── */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Histórico de Manutenção (FORM 013)</CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={addMan}>
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(form.historico_manutencao || []).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro de manutenção adicionado.</p>
          )}
          {(form.historico_manutencao || []).map((m, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-primary">Manutenção #{i + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeMan(i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Data"><Input value={m.data || ''} onChange={e => setMan(i, 'data', e.target.value)} placeholder="Ex: abr/26" /></Field>
                <Field label="Responsável"><Input value={m.responsavel || ''} onChange={e => setMan(i, 'responsavel', e.target.value)} /></Field>
                <Field label="Descrição do problema" col2>
                  <Input value={m.descricao_problema || ''} onChange={e => setMan(i, 'descricao_problema', e.target.value)} />
                </Field>
                <Field label="FORM 011 — Etiqueta NC"><Input value={m.form011_etiqueta_nc || ''} onChange={e => setMan(i, 'form011_etiqueta_nc', e.target.value)} /></Field>
                <Field label="Status FORM 012"><Input value={m.status_form012 || ''} onChange={e => setMan(i, 'status_form012', e.target.value)} /></Field>
                <Field label="Data da aprovação"><Input value={m.data_aprovacao || ''} onChange={e => setMan(i, 'data_aprovacao', e.target.value)} /></Field>
                <Field label="Fornecedor"><Input value={m.fornecedor || ''} onChange={e => setMan(i, 'fornecedor', e.target.value)} /></Field>
                <Field label="Ordem de compra"><Input value={m.ordem_compra || ''} onChange={e => setMan(i, 'ordem_compra', e.target.value)} /></Field>
                <Field label="Data ordem de compra"><Input value={m.data_ordem_compra || ''} onChange={e => setMan(i, 'data_ordem_compra', e.target.value)} /></Field>
                <Field label="Nota Fiscal"><Input value={m.nota_fiscal || ''} onChange={e => setMan(i, 'nota_fiscal', e.target.value)} /></Field>
                <Field label="Data do recebimento"><Input value={m.data_recebimento || ''} onChange={e => setMan(i, 'data_recebimento', e.target.value)} /></Field>
                <Field label="Detalhes da execução do Serviço" col2>
                  <Input value={m.detalhes_execucao || ''} onChange={e => setMan(i, 'detalhes_execucao', e.target.value)} />
                </Field>
                <Field label="Inspeção de recebimento"><Input value={m.inspecao_recebimento || ''} onChange={e => setMan(i, 'inspecao_recebimento', e.target.value)} /></Field>
                <Field label="Análise Crítica"><Input value={m.analise_critica || ''} onChange={e => setMan(i, 'analise_critica', e.target.value)} /></Field>
                <Field label="Status FORM 012 (final)"><Input value={m.status_form012_final || ''} onChange={e => setMan(i, 'status_form012_final', e.target.value)} /></Field>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── VERIFICAÇÃO E STATUS ── */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Verificação e Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Periodicidade da Verificação Interna">
              <Select value={form.periodicidade_verificacao} onValueChange={v => set('periodicidade_verificacao', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIODICIDADE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_EQUIPAMENTO).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Checkbox checked={!!form.obrigatorio_verificacao_diaria} onCheckedChange={v => set('obrigatorio_verificacao_diaria', v)} />
              <span className="text-sm">Verificação diária obrigatória</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Checkbox checked={!!form.obrigatorio_verificacao_intermediaria} onCheckedChange={v => set('obrigatorio_verificacao_intermediaria', v)} />
              <span className="text-sm">Verificação intermediária obrigatória</span>
            </label>
          </div>

          {(statusMudou || !isEdit) && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold">{isEdit ? 'Registrar alteração de status' : 'Data de cadastro'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Data da alteração *">
                  <Input type="date" value={dataAlteracaoStatus} onChange={e => setDataAlteracaoStatus(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                </Field>
                <Field label="Observação (opcional)">
                  <Input value={observacaoStatus} onChange={e => setObservacaoStatus(e.target.value)} placeholder="Ex: Enviado para calibração externa" />
                </Field>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer botões */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate('/equipamentos')}>Cancelar</Button>
        <Button
          onClick={handleSave}
          disabled={saving || !form.identificacao_interna || !form.nome || !form.categoria || (statusMudou && !dataAlteracaoStatus)}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar'}
        </Button>
      </div>
    </div>
  );
}