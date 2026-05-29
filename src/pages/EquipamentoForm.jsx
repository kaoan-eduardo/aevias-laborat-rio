import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { STATUS_EQUIPAMENTO, PERIODICIDADE_LABELS } from '@/utils/equipamentoHelpers';
import { useEquipamentoForm } from '@/hooks/useEquipamentoForm';

const CATEGORIAS = ['Vidraria','Soquete','Cilindros','Banho Maria','Estufa','Balança','Termômetro','Densímetro','Prensa','Peso Padrão','Outros'];

const CERT_CHECK_FIELDS = [
  ['identificacao_lab',        'Identificação do lab.'],
  ['selo_rbc',                 'Selo RBC e nº CAL'],
  ['identificacao_certificado','Identificação do certificado'],
  ['numero_paginas',           'Número de páginas'],
  ['nome_endereco_cliente',    'Nome e endereço do cliente'],
  ['descricao_item_calibrado', 'Descrição do item calibrado'],
  ['identificacao_metodo',     'Identificação do método'],
  ['data_calibracao',          'Data da calibração'],
  ['nome_autorizou',           'Nome/função que autorizou'],
  ['rastreabilidade',          'Rastreabilidade das medições'],
  ['certificado_aceito',       'Certificado pode ser aceito?'],
];

// ── Componentes reutilizáveis internos ───────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div className="bg-muted/60 border border-border rounded-md px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </div>
  );
}

function Field({ label, children, htmlFor, colSpan2 }) {
  return (
    <div className={`space-y-1.5${colSpan2 ? ' sm:col-span-2' : ''}`}>
      <Label htmlFor={htmlFor} className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function CheckField({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
      <Checkbox id={id} checked={!!checked} onCheckedChange={onChange} />
      <span className="text-xs text-foreground">{label}</span>
    </label>
  );
}

function SaveButton({ isSaving, isEditing, isDisabled }) {
  return (
    <Button onClick={undefined} type="submit" disabled={isDisabled} className="gap-2">
      <Save className="w-4 h-4" aria-hidden="true" />
      {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar'}
    </Button>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function EquipamentoForm() {
  const navigate = useNavigate();
  const {
    form, isEditing, isLoading, isSaving, isFormValid, hasStatusChanged,
    statusChangeDate, statusChangeNote,
    setField, setStatusChangeDate, setStatusChangeNote,
    addCalibration, removeCalibration, updateCalibration,
    addMaintenance, removeMaintenance, updateMaintenance,
    addCalibrationPoint, removeCalibrationPoint, updateCalibrationPoint,
    handleSave,
  } = useEquipamentoForm();

  const isSaveDisabled = isSaving || !isFormValid;

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    handleSave();
  }, [handleSave]);

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center" aria-busy="true" aria-label="Carregando equipamento">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" role="status" />
    </div>
  );

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <div className="p-6 max-w-5xl mx-auto space-y-6 pb-16">

        {/* Header */}
        <header className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/equipamentos')} aria-label="Voltar para equipamentos">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}</h1>
            <p className="text-sm text-muted-foreground">Preencha todas as informações do equipamento</p>
          </div>
          <div className="ml-auto">
            <Button type="submit" disabled={isSaveDisabled} className="gap-2">
              <Save className="w-4 h-4" aria-hidden="true" />
              {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </div>
        </header>

        {/* Identificação */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Identificação</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Identificação Interna *" htmlFor="identificacao_interna">
                <Input id="identificacao_interna" value={form.identificacao_interna} onChange={e => setField('identificacao_interna', e.target.value)} placeholder="Ex: LC-001" className="font-mono" required />
              </Field>
              <Field label="Nome *" htmlFor="nome">
                <Input id="nome" value={form.nome} onChange={e => setField('nome', e.target.value)} placeholder="Nome do equipamento" required />
              </Field>
              <Field label="Categoria *" htmlFor="categoria">
                <Select value={form.categoria} onValueChange={v => setField('categoria', v)}>
                  <SelectTrigger id="categoria"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Fabricante" htmlFor="fabricante">
                <Input id="fabricante" value={form.fabricante || ''} onChange={e => setField('fabricante', e.target.value)} placeholder="Ex: MARTE" />
              </Field>
              <Field label="Modelo" htmlFor="modelo">
                <Input id="modelo" value={form.modelo || ''} onChange={e => setField('modelo', e.target.value)} placeholder="Ex: AD16K" />
              </Field>
              <Field label="Número de Série" htmlFor="numero_serie">
                <Input id="numero_serie" value={form.numero_serie || ''} onChange={e => setField('numero_serie', e.target.value)} />
              </Field>
              <Field label="Software / Firmware" htmlFor="software_firmware">
                <Input id="software_firmware" value={form.software_firmware || ''} onChange={e => setField('software_firmware', e.target.value)} placeholder="N.A." />
              </Field>
              <Field label="Ano de Entrada em Serviço" htmlFor="data_entrada_servico">
                <Input
                  id="data_entrada_servico" type="number" min="1900" max={new Date().getFullYear()}
                  value={form.data_entrada_servico || ''} onChange={e => setField('data_entrada_servico', e.target.value)}
                  placeholder="Ex: 2020" className="font-mono"
                />
              </Field>
              <Field label="Resolução / Precisão" htmlFor="precisao">
                <Input id="precisao" value={form.precisao || ''} onChange={e => setField('precisao', e.target.value)} placeholder="Ex: 0,1 g" />
              </Field>
              <Field label="Faixa Nominal Máxima" htmlFor="faixa_nominal_maxima">
                <Input id="faixa_nominal_maxima" value={form.faixa_nominal_maxima || ''} onChange={e => setField('faixa_nominal_maxima', e.target.value)} placeholder="Ex: 10 000 g" />
              </Field>
              <Field label="Localização" htmlFor="localizacao">
                <Input id="localizacao" value={form.localizacao || ''} onChange={e => setField('localizacao', e.target.value)} placeholder="Ex: Laboratório Central" />
              </Field>
              <Field label="Responsável pela Atualização" htmlFor="responsavel_atualizacao">
                <Input id="responsavel_atualizacao" value={form.responsavel_atualizacao || ''} onChange={e => setField('responsavel_atualizacao', e.target.value)} />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Pontos de calibração */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pontos de Calibração / Critérios / Observações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Unidade do Equipamento" htmlFor="unidade_equipamento">
                <Input id="unidade_equipamento" value={form.unidade_equipamento || ''} onChange={e => setField('unidade_equipamento', e.target.value)} placeholder="Ex.: kg, kgf, ºC" />
              </Field>
              <Field label="Tolerância" htmlFor="tolerancia">
                <Input id="tolerancia" value={form.tolerancia || ''} onChange={e => setField('tolerancia', e.target.value)} placeholder="Ex.: 5%" />
              </Field>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">
                  Pontos de Calibração × Critérios de Aceitação{' '}
                  <span className="text-muted-foreground font-normal">(máx. 16 linhas)</span>
                </Label>
                {(form.pontos_calibracao || []).length < 16 && (
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addCalibrationPoint}>
                    <Plus className="w-3 h-3" aria-hidden="true" /> Adicionar linha
                  </Button>
                )}
              </div>
              {(form.pontos_calibracao || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3 border border-dashed border-border rounded-md">
                  Nenhum ponto adicionado. Clique em "Adicionar linha".
                </p>
              ) : (
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-xs" aria-label="Pontos de calibração">
                    <thead>
                      <tr className="bg-accent/40">
                        <th scope="col" className="text-left px-3 py-1.5 font-semibold w-8 text-muted-foreground">#</th>
                        <th scope="col" className="text-left px-3 py-1.5 font-semibold w-1/2">Ponto de Calibração</th>
                        <th scope="col" className="text-left px-3 py-1.5 font-semibold w-1/2">Critério de Aceitação</th>
                        <th scope="col" className="w-8"><span className="sr-only">Remover</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.pontos_calibracao || []).map((p, idx) => (
                        <tr key={p.id || idx} className="border-t border-border">
                          <td className="px-3 py-1 text-muted-foreground">{idx + 1}</td>
                          <td className="px-2 py-1">
                            <Input
                              value={p.ponto || ''} aria-label={`Ponto ${idx + 1}`}
                              onChange={e => updateCalibrationPoint(idx, 'ponto', e.target.value)}
                              placeholder="Ex.: 20" className="h-7 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <Input
                              value={p.criterio || ''} aria-label={`Critério do ponto ${idx + 1}`}
                              onChange={e => updateCalibrationPoint(idx, 'criterio', e.target.value)}
                              placeholder="Ex.: 21" className="h-7 text-xs"
                            />
                          </td>
                          <td className="px-1 py-1 text-center">
                            <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" aria-label={`Remover ponto ${idx + 1}`} onClick={() => removeCalibrationPoint(idx)}>
                              <Trash2 className="w-3 h-3" aria-hidden="true" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <Field label="Observações" htmlFor="observacoes" colSpan2>
              <Input id="observacoes" value={form.observacoes || ''} onChange={e => setField('observacoes', e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        {/* Calibração — campos gerais */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Calibração</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Data de Calibração" htmlFor="data_calibracao">
                <Input id="data_calibracao" type="date" value={form.data_calibracao || ''} onChange={e => setField('data_calibracao', e.target.value)} />
              </Field>
              <Field label="Validade da Calibração" htmlFor="validade_calibracao">
                <Input id="validade_calibracao" type="date" value={form.validade_calibracao || ''} onChange={e => setField('validade_calibracao', e.target.value)} />
              </Field>
              <Field label="Frequência de Calibração" htmlFor="frequencia_calibracao">
                <Input id="frequencia_calibracao" value={form.frequencia_calibracao || ''} onChange={e => setField('frequencia_calibracao', e.target.value)} placeholder="Ex: Anual" />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Calibração */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Histórico de Calibração (FORM 013)</CardTitle>
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addCalibration}>
              <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {(form.historico_calibracao || []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro de calibração adicionado.</p>
            )}
            {(form.historico_calibracao || []).map((c, i) => (
              <section key={i} className="border border-border rounded-lg p-4 space-y-4 bg-muted/10" aria-label={`Calibração ${i + 1}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-primary">Calibração #{i + 1}</span>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" aria-label={`Remover calibração ${i + 1}`} onClick={() => removeCalibration(i)}>
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </Button>
                </div>

                <SectionTitle>Análise das Informações do Certificado</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Número do Certificado" htmlFor={`cert-num-${i}`}>
                    <Input id={`cert-num-${i}`} value={c.numero_certificado || ''} onChange={e => updateCalibration(i, 'numero_certificado', e.target.value)} />
                  </Field>
                  <Field label="Órgão" htmlFor={`cert-orgao-${i}`}>
                    <Input id={`cert-orgao-${i}`} value={c.orgao || ''} onChange={e => updateCalibration(i, 'orgao', e.target.value)} placeholder="Ex: K&L" />
                  </Field>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Título</Label>
                    <CheckField id={`cert-titulo-${i}`} label="Sim" checked={!!c.titulo} onChange={v => updateCalibration(i, 'titulo', v)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CERT_CHECK_FIELDS.map(([field, label]) => (
                    <CheckField key={field} id={`cert-${field}-${i}`} label={label} checked={c[field]} onChange={v => updateCalibration(i, field, v)} />
                  ))}
                </div>

                <SectionTitle>Análise dos Resultados</SectionTitle>
                <div className="mb-3">
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Erros Obtidos <span className="text-muted-foreground font-normal">(um por ponto de calibração)</span>
                  </Label>
                  {(form.pontos_calibracao || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Cadastre os pontos de calibração primeiro.</p>
                  ) : (
                    <div className="border border-border rounded-md overflow-hidden">
                      <table className="w-full text-xs" aria-label="Erros obtidos por ponto">
                        <thead>
                          <tr className="bg-accent/40">
                            <th scope="col" className="text-left px-3 py-1.5 font-semibold w-1/2">Ponto de Calibração</th>
                            <th scope="col" className="text-left px-3 py-1.5 font-semibold w-1/2">Erro Obtido</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(form.pontos_calibracao || []).map((p, idx) => (
                            <tr key={idx} className="border-t border-border">
                              <td className="px-3 py-1 text-muted-foreground">{p.ponto || `Ponto ${idx + 1}`}</td>
                              <td className="px-2 py-1">
                                <Input
                                  value={(c.erros_obtidos || [])[idx] || ''}
                                  aria-label={`Erro obtido no ponto ${p.ponto || idx + 1}`}
                                  onChange={e => {
                                    const arr = [...(c.erros_obtidos || [])];
                                    arr[idx] = e.target.value;
                                    updateCalibration(i, 'erros_obtidos', arr);
                                  }}
                                  placeholder="Ex.: 21,3" className="h-7 text-xs"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Periodicidade entre calibrações" htmlFor={`cal-per-${i}`}>
                    <Input id={`cal-per-${i}`} value={c.periodicidade || ''} onChange={e => updateCalibration(i, 'periodicidade', e.target.value)} placeholder="Ex: Manter" />
                  </Field>
                  <Field label="Observações" htmlFor={`cal-obs-${i}`}>
                    <Input id={`cal-obs-${i}`} value={c.observacoes_resultado || ''} onChange={e => updateCalibration(i, 'observacoes_resultado', e.target.value)} />
                  </Field>
                  <Field label="Data da análise" htmlFor={`cal-data-${i}`}>
                    <Input id={`cal-data-${i}`} value={c.data_analise || ''} onChange={e => updateCalibration(i, 'data_analise', e.target.value)} placeholder="Ex: 18/05/2026" />
                  </Field>
                  <Field label="Responsável pela análise" htmlFor={`cal-resp-${i}`}>
                    <Input id={`cal-resp-${i}`} value={c.responsavel_analise || ''} onChange={e => updateCalibration(i, 'responsavel_analise', e.target.value)} />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-4 mt-1">
                  <CheckField id={`cal-atende-${i}`} label="Atende ao especificado?" checked={c.atende_especificado} onChange={v => updateCalibration(i, 'atende_especificado', v)} />
                  <CheckField id={`cal-uso-${i}`} label="Item pode ser colocado em uso?" checked={c.item_em_uso} onChange={v => updateCalibration(i, 'item_em_uso', v)} />
                </div>
              </section>
            ))}
          </CardContent>
        </Card>

        {/* Histórico de Manutenção */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Histórico de Manutenção (FORM 013)</CardTitle>
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addMaintenance}>
              <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {(form.historico_manutencao || []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro de manutenção adicionado.</p>
            )}
            {(form.historico_manutencao || []).map((m, i) => (
              <section key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/10" aria-label={`Manutenção ${i + 1}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-primary">Manutenção #{i + 1}</span>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" aria-label={`Remover manutenção ${i + 1}`} onClick={() => removeMaintenance(i)}>
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Data" htmlFor={`man-data-${i}`}><Input id={`man-data-${i}`} value={m.data || ''} onChange={e => updateMaintenance(i, 'data', e.target.value)} placeholder="Ex: abr/26" /></Field>
                  <Field label="Responsável" htmlFor={`man-resp-${i}`}><Input id={`man-resp-${i}`} value={m.responsavel || ''} onChange={e => updateMaintenance(i, 'responsavel', e.target.value)} /></Field>
                  <Field label="Descrição do problema" htmlFor={`man-desc-${i}`} colSpan2>
                    <Input id={`man-desc-${i}`} value={m.descricao_problema || ''} onChange={e => updateMaintenance(i, 'descricao_problema', e.target.value)} />
                  </Field>
                  <Field label="FORM 011 — Etiqueta NC" htmlFor={`man-nc-${i}`}><Input id={`man-nc-${i}`} value={m.form011_etiqueta_nc || ''} onChange={e => updateMaintenance(i, 'form011_etiqueta_nc', e.target.value)} /></Field>
                  <Field label="Status FORM 012" htmlFor={`man-st012-${i}`}><Input id={`man-st012-${i}`} value={m.status_form012 || ''} onChange={e => updateMaintenance(i, 'status_form012', e.target.value)} /></Field>
                  <Field label="Data da aprovação" htmlFor={`man-aprov-${i}`}><Input id={`man-aprov-${i}`} value={m.data_aprovacao || ''} onChange={e => updateMaintenance(i, 'data_aprovacao', e.target.value)} /></Field>
                  <Field label="Fornecedor" htmlFor={`man-forn-${i}`}><Input id={`man-forn-${i}`} value={m.fornecedor || ''} onChange={e => updateMaintenance(i, 'fornecedor', e.target.value)} /></Field>
                  <Field label="Ordem de compra" htmlFor={`man-oc-${i}`}><Input id={`man-oc-${i}`} value={m.ordem_compra || ''} onChange={e => updateMaintenance(i, 'ordem_compra', e.target.value)} /></Field>
                  <Field label="Data ordem de compra" htmlFor={`man-doc-${i}`}><Input id={`man-doc-${i}`} value={m.data_ordem_compra || ''} onChange={e => updateMaintenance(i, 'data_ordem_compra', e.target.value)} /></Field>
                  <Field label="Nota Fiscal" htmlFor={`man-nf-${i}`}><Input id={`man-nf-${i}`} value={m.nota_fiscal || ''} onChange={e => updateMaintenance(i, 'nota_fiscal', e.target.value)} /></Field>
                  <Field label="Data do recebimento" htmlFor={`man-receb-${i}`}><Input id={`man-receb-${i}`} value={m.data_recebimento || ''} onChange={e => updateMaintenance(i, 'data_recebimento', e.target.value)} /></Field>
                  <Field label="Detalhes da execução do Serviço" htmlFor={`man-det-${i}`} colSpan2>
                    <Input id={`man-det-${i}`} value={m.detalhes_execucao || ''} onChange={e => updateMaintenance(i, 'detalhes_execucao', e.target.value)} />
                  </Field>
                  <Field label="Inspeção de recebimento" htmlFor={`man-insp-${i}`}><Input id={`man-insp-${i}`} value={m.inspecao_recebimento || ''} onChange={e => updateMaintenance(i, 'inspecao_recebimento', e.target.value)} /></Field>
                  <Field label="Análise Crítica" htmlFor={`man-ac-${i}`}><Input id={`man-ac-${i}`} value={m.analise_critica || ''} onChange={e => updateMaintenance(i, 'analise_critica', e.target.value)} /></Field>
                  <Field label="Status FORM 012 (final)" htmlFor={`man-stf-${i}`}><Input id={`man-stf-${i}`} value={m.status_form012_final || ''} onChange={e => updateMaintenance(i, 'status_form012_final', e.target.value)} /></Field>
                </div>
              </section>
            ))}
          </CardContent>
        </Card>

        {/* Verificação e Status */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Verificação e Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Periodicidade da Verificação Interna" htmlFor="periodicidade_verificacao">
                <Select value={form.periodicidade_verificacao} onValueChange={v => setField('periodicidade_verificacao', v)}>
                  <SelectTrigger id="periodicidade_verificacao"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PERIODICIDADE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" htmlFor="status">
                <Select value={form.status} onValueChange={v => setField('status', v)}>
                  <SelectTrigger id="status"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_EQUIPAMENTO).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-5 pt-1">
              <label htmlFor="verif-diaria" className="flex items-center gap-2.5 cursor-pointer select-none">
                <Checkbox id="verif-diaria" checked={!!form.obrigatorio_verificacao_diaria} onCheckedChange={v => setField('obrigatorio_verificacao_diaria', v)} />
                <span className="text-sm">Verificação diária obrigatória</span>
              </label>
              <label htmlFor="verif-intermediaria" className="flex items-center gap-2.5 cursor-pointer select-none">
                <Checkbox id="verif-intermediaria" checked={!!form.obrigatorio_verificacao_intermediaria} onCheckedChange={v => setField('obrigatorio_verificacao_intermediaria', v)} />
                <span className="text-sm">Verificação intermediária obrigatória</span>
              </label>
            </div>

            {(isEditing || !isEditing) && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold">{isEditing ? 'Registrar alteração' : 'Data de cadastro'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Data da alteração *" htmlFor="status-data">
                    <Input id="status-data" type="date" value={statusChangeDate} onChange={e => setStatusChangeDate(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
                  </Field>
                  <Field label="Observação (opcional)" htmlFor="status-obs">
                    <Input id="status-obs" value={statusChangeNote} onChange={e => setStatusChangeNote(e.target.value)} placeholder="Ex: Enviado para calibração externa" />
                  </Field>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/equipamentos')}>Cancelar</Button>
          <Button type="submit" disabled={isSaveDisabled} className="gap-2">
            <Save className="w-4 h-4" aria-hidden="true" />
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </footer>
      </div>
    </form>
  );
}