import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { gerarNumeroProtocolo, obterDataHoje } from '@/utils/fasHelpers';

const hoje = obterDataHoje;

export default function NovoRecebimento({ open, onClose, onSaved, totalRecebimentos }) {
  const [clientes, setClientes] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    cliente_id: '',
    cliente_nome: '',
    data_registro: hoje(),
    numero_projeto: '',
    data_entrada: hoje(),
    responsavel_amostragem: '',
    observacoes: '',
    amostras: []
  });

  const [amostraTemp, setAmostraTemp] = useState({
    material_id: '', material_nome: '', procedencia: '',
    quantidade: '', observacao_recebimento: '',
    data_coleta: hoje(), peso_kg: '', quantidade_suficiente: true
  });

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const [c, m] = await Promise.all([
      base44.entities.Cliente.list(),
      base44.entities.Material.list()]
      );
      setClientes(c.filter((cl) => cl.ativo !== false));
      setMateriais(m);
    };
    load();
  }, [open]);

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    setForm((f) => ({ ...f, cliente_id: clienteId, cliente_nome: cliente?.razao_social || '' }));
  };

  const handleMaterialChange = (materialId) => {
    const material = materiais.find((m) => m.id === materialId);
    setAmostraTemp((a) => ({ ...a, material_id: materialId, material_nome: material?.nome || '' }));
  };

  const handleAddAmostra = () => {
    if (!amostraTemp.material_id || !amostraTemp.procedencia) return;
    setForm((f) => ({
      ...f,
      amostras: [...f.amostras, { ...amostraTemp, id: Math.random().toString(36).substr(2, 9) }]
    }));
    setAmostraTemp({
      material_id: '', material_nome: '', procedencia: '',
      quantidade: '', observacao_recebimento: '',
      data_coleta: hoje(), peso_kg: '', quantidade_suficiente: true
    });
  };

  const handleSalvar = async () => {
    if (!form.cliente_id || !form.data_entrada) return;
    setLoading(true);

    // Se há uma amostra temporária preenchida (não adicionada), inclui automaticamente
    let amostrasFinais = [...form.amostras];
    if (amostraTemp.material_id && amostraTemp.procedencia) {
      amostrasFinais = [...amostrasFinais, { ...amostraTemp, id: Math.random().toString(36).substr(2, 9) }];
    }

    await base44.entities.RecebimentoAmostra.create({
      ...form,
      amostras: amostrasFinais,
      numero_protocolo: gerarNumeroProtocolo(totalRecebimentos),
      status: 'pendente_gestor'
    });
    setLoading(false);
    onSaved();
  };

  const handleClose = () => {
    setForm({ cliente_id: '', cliente_nome: '', data_registro: hoje(), numero_projeto: '', data_entrada: hoje(), responsavel_amostragem: '', observacoes: '', amostras: [] });
    setAmostraTemp({ material_id: '', material_nome: '', procedencia: '', quantidade: '', observacao_recebimento: '', data_coleta: hoje(), peso_kg: '', quantidade_suficiente: true });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Novo Protocolo de Recebimento
            <span className="ml-2 text-base font-mono text-muted-foreground">#{gerarNumeroProtocolo(totalRecebimentos)}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Preencha as informações do recebimento. O gestor completará os dados de ensaios e FAS.</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Cliente *</Label>
              <Select value={form.cliente_id} onValueChange={handleClienteChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) =>
                  <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Data do Registro</Label>
              <Input type="date" value={form.data_registro} onChange={(e) => setForm((f) => ({ ...f, data_registro: e.target.value }))} className="mt-1" />
            </div>
            


            
            <div>
              <Label className="text-xs">Data da Entrada *</Label>
              <Input type="date" value={form.data_entrada} onChange={(e) => setForm((f) => ({ ...f, data_entrada: e.target.value }))} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Responsável pela Amostragem</Label>
              <Input value={form.responsavel_amostragem} onChange={(e) => setForm((f) => ({ ...f, responsavel_amostragem: e.target.value }))} className="mt-1" placeholder="Nome" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} className="mt-1" placeholder="Observações gerais" rows={2} />
          </div>

          {/* Amostras */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Identificação das Amostras</h3>
            <Card className="mb-3">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Material *</Label>
                    <Select value={amostraTemp.material_id} onValueChange={handleMaterialChange}>
                      <SelectTrigger className="mt-1 h-8"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {materiais.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Procedência *</Label>
                    <Input value={amostraTemp.procedencia} onChange={(e) => setAmostraTemp((a) => ({ ...a, procedencia: e.target.value }))} className="mt-1 h-8" placeholder="Local" />
                  </div>
                  <div>
                    <Label className="text-xs">Quantidade</Label>
                    <Input type="number" value={amostraTemp.quantidade} onChange={(e) => setAmostraTemp((a) => ({ ...a, quantidade: e.target.value }))} className="mt-1 h-8" />
                  </div>
                  <div>
                    <Label className="text-xs">Observação</Label>
                    <Input value={amostraTemp.observacao_recebimento} onChange={(e) => setAmostraTemp((a) => ({ ...a, observacao_recebimento: e.target.value }))} className="mt-1 h-8" />
                  </div>
                  <div>
                    <Label className="text-xs">Data de Coleta</Label>
                    <Input type="date" value={amostraTemp.data_coleta} onChange={(e) => setAmostraTemp((a) => ({ ...a, data_coleta: e.target.value }))} className="mt-1 h-8" />
                  </div>
                  <div>
                    <Label className="text-xs">Peso (kg)</Label>
                    <Input type="number" step="0.01" value={amostraTemp.peso_kg} onChange={(e) => setAmostraTemp((a) => ({ ...a, peso_kg: e.target.value }))} className="mt-1 h-8" />
                  </div>
                  <div className="flex items-end gap-3 col-span-2 sm:col-span-1">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={amostraTemp.quantidade_suficiente} onChange={(e) => setAmostraTemp((a) => ({ ...a, quantidade_suficiente: e.target.checked }))} />
                      Suficiente?
                    </label>
                    <Button
                      onClick={handleAddAmostra}
                      size="sm"
                      variant={amostraTemp.material_id && amostraTemp.procedencia ? 'default' : 'outline'}
                      className="gap-1 h-8 text-xs">
                      
                      <Plus className="w-3 h-3" /> Adicionar à lista
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {form.amostras.length > 0 &&
            <div className="overflow-x-auto border rounded text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-2 py-1 text-left">Material</th>
                      <th className="px-2 py-1 text-left">Procedência</th>
                      <th className="px-2 py-1 text-center">Qtd</th>
                      <th className="px-2 py-1 text-left">Obs</th>
                      <th className="px-2 py-1">Data Coleta</th>
                      <th className="px-2 py-1 text-right">Peso</th>
                      <th className="px-2 py-1 text-center">Suf?</th>
                      <th className="px-2 py-1"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {form.amostras.map((a, idx) =>
                  <tr key={idx}>
                        <td className="px-2 py-1">{a.material_nome}</td>
                        <td className="px-2 py-1">{a.procedencia}</td>
                        <td className="px-2 py-1 text-center">{a.quantidade || '—'}</td>
                        <td className="px-2 py-1">{a.observacao_recebimento || '—'}</td>
                        <td className="px-2 py-1">{a.data_coleta ? new Date(a.data_coleta).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="px-2 py-1 text-right">{a.peso_kg || '—'}</td>
                        <td className="px-2 py-1 text-center">{a.quantidade_suficiente ? 'S' : 'N'}</td>
                        <td className="px-2 py-1 text-center">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setForm((f) => ({ ...f, amostras: f.amostras.filter((_, i) => i !== idx) }))}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={!form.cliente_id || !form.data_entrada || loading}>
            {loading ? 'Salvando...' : 'Registrar Recebimento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}