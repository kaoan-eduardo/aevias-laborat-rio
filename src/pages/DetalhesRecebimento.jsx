import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  pendente_gestor: { label: 'Pendente Gestor', color: 'bg-yellow-100 text-yellow-700' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
};

export default function DetalhesRecebimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recebimento, setRecebimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gestorForm, setGestorForm] = useState({ numero_fas: '', ensaios_realizados: '' });
  const [saving, setSaving] = useState(false);

  const role = user?.role || 'auxiliar';
  const isGestor = role === 'admin' || role === 'gestor';

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.RecebimentoAmostra.filter({ id });
      const rec = data[0] || null;
      setRecebimento(rec);
      if (rec) {
        setGestorForm({
          numero_fas: rec.numero_fas || '',
          ensaios_realizados: rec.ensaios_realizados || ''
        });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSalvarGestor = async () => {
    if (!gestorForm.numero_fas || !gestorForm.ensaios_realizados) return;
    setSaving(true);
    await base44.entities.RecebimentoAmostra.update(recebimento.id, {
      ...gestorForm,
      status: 'concluido'
    });
    setRecebimento(r => ({ ...r, ...gestorForm, status: 'concluido' }));
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

  const statusConf = STATUS_CONFIG[recebimento.status] || STATUS_CONFIG.pendente_gestor;

  return (
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
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{recebimento.cliente_nome}</p>
        </div>
      </div>

      {/* Seção do Gestor — preenchimento pendente */}
      {isGestor && recebimento.status === 'pendente_gestor' && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-yellow-800">⚠️ Preenchimento pendente — Informações do Gestor</CardTitle>
            <p className="text-xs text-yellow-700">Complete os campos abaixo para concluir o protocolo.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nº FAS / Proposta Comercial *</Label>
                <Input
                  value={gestorForm.numero_fas}
                  onChange={e => setGestorForm(f => ({ ...f, numero_fas: e.target.value }))}
                  className="mt-1"
                  placeholder="Ex: FAS-2026-0001"
                />
              </div>
              <div>
                <Label className="text-xs">Ensaios a Realizar *</Label>
                <Textarea
                  value={gestorForm.ensaios_realizados}
                  onChange={e => setGestorForm(f => ({ ...f, ensaios_realizados: e.target.value }))}
                  className="mt-1"
                  placeholder="Descreva os ensaios a serem realizados..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSalvarGestor}
                disabled={!gestorForm.numero_fas || !gestorForm.ensaios_realizados || saving}
                className="gap-2 bg-yellow-600 hover:bg-yellow-700"
              >
                <CheckCircle className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Confirmar e Concluir Protocolo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados do gestor já preenchidos */}
      {recebimento.status === 'concluido' && (
        <Card className="border-green-200 bg-green-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800">Informações do Gestor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Nº FAS / Proposta Comercial" value={recebimento.numero_fas} mono />
              <InfoRow label="Ensaios a Realizar" value={recebimento.ensaios_realizados} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados Principais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informações do Protocolo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InfoRow label="Data do Registro" value={recebimento.data_registro ? new Date(recebimento.data_registro).toLocaleDateString('pt-BR') : null} />
            <InfoRow label="Data da Entrada" value={recebimento.data_entrada ? new Date(recebimento.data_entrada).toLocaleDateString('pt-BR') : null} />
            <InfoRow label="Número do Projeto" value={recebimento.numero_projeto} />
            <InfoRow label="Responsável Amostragem" value={recebimento.responsavel_amostragem} />
          </div>
          {recebimento.observacoes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
              <p className="text-sm text-foreground">{recebimento.observacoes}</p>
            </div>
          )}
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
  );
}