import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [fasList, setFasList] = useState([]);
  const [ensaios, setEnsaios] = useState([]);
  const [fasId, setFasId] = useState('');
  const [ensaiosSelecionados, setEnsaiosSelecionados] = useState([]);
  const [saving, setSaving] = useState(false);

  const role = user?.role || 'auxiliar';
  const isGestor = role === 'admin' || role === 'gestor';

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

  // Carrega FAS em aberto do cliente e todos os ensaios quando gestor abre pendente
  useEffect(() => {
    if (!isGestor || !recebimento || recebimento.status !== 'pendente_gestor') return;
    const loadGestorData = async () => {
      const [fasData, ensaiosData] = await Promise.all([
        base44.entities.FAS.filter({ cliente_id: recebimento.cliente_id, status: 'aberta' }),
        base44.entities.Ensaio.list('nome')
      ]);
      setFasList(fasData);
      setEnsaios(ensaiosData.filter(e => e.ativo !== false));
    };
    loadGestorData();
  }, [isGestor, recebimento]);

  const toggleEnsaio = (ensaio) => {
    setEnsaiosSelecionados(prev => {
      const exists = prev.find(e => e.ensaio_id === ensaio.id);
      if (exists) return prev.filter(e => e.ensaio_id !== ensaio.id);
      return [...prev, { ensaio_id: ensaio.id, ensaio_nome: ensaio.nome, norma: ensaio.norma }];
    });
  };

  const handleSalvarGestor = async () => {
    if (!fasId || ensaiosSelecionados.length === 0) return;
    setSaving(true);
    const fasEscolhida = fasList.find(f => f.id === fasId);
    await base44.entities.RecebimentoAmostra.update(recebimento.id, {
      fas_id: fasId,
      numero_fas: fasEscolhida?.numero_fas || fasEscolhida?.numero_proposta || '',
      ensaios_selecionados: ensaiosSelecionados,
      status: 'concluido'
    });
    setRecebimento(r => ({
      ...r,
      fas_id: fasId,
      numero_fas: fasEscolhida?.numero_fas || fasEscolhida?.numero_proposta || '',
      ensaios_selecionados: ensaiosSelecionados,
      status: 'concluido'
    }));
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
          <CardContent className="space-y-4">
            {/* FAS em aberto do cliente */}
            <div>
              <Label className="text-xs">FAS em Aberto *</Label>
              {fasList.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground italic">Nenhuma FAS em aberto para este cliente.</p>
              ) : (
                <Select value={fasId} onValueChange={setFasId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a FAS..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fasList.map(f => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.numero_fas || f.numero_proposta} — {f.objetivo?.slice(0, 40) || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Ensaios — checkboxes */}
            <div>
              <Label className="text-xs">Ensaios a Realizar * ({ensaiosSelecionados.length} selecionados)</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-48 overflow-y-auto border rounded-md p-3 bg-white">
                {ensaios.map(e => {
                  const checked = ensaiosSelecionados.some(s => s.ensaio_id === e.id);
                  return (
                    <label key={e.id} className="flex items-start gap-2 cursor-pointer py-1 hover:bg-muted/30 rounded px-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEnsaio(e)}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs text-foreground leading-tight">
                        <span className="font-medium">{e.nome}</span>
                        {e.norma && <span className="text-muted-foreground"> · {e.norma}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSalvarGestor}
                disabled={!fasId || ensaiosSelecionados.length === 0 || saving}
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