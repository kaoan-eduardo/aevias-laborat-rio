import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Mail, Save, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracaoAlertaEmail({ onClose }) {
  const [config, setConfig] = useState(null);
  const [configId, setConfigId] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ConfiguracaoEmail.filter({ tipo: 'alerta_calibracao' })
      .then(results => {
        if (results && results.length > 0) {
          setConfig(results[0]);
          setConfigId(results[0].id);
        } else {
          setConfig({ tipo: 'alerta_calibracao', emails_destinatarios: [], ativo: true, dias_antecedencia: 60 });
        }
        setLoading(false);
      });
  }, []);

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email inválido');
      return;
    }
    if ((config.emails_destinatarios || []).includes(email)) {
      toast.error('Email já adicionado');
      return;
    }
    setConfig(c => ({ ...c, emails_destinatarios: [...(c.emails_destinatarios || []), email] }));
    setEmailInput('');
  };

  const removeEmail = (email) => {
    setConfig(c => ({ ...c, emails_destinatarios: c.emails_destinatarios.filter(e => e !== email) }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (configId) {
      await base44.entities.ConfiguracaoEmail.update(configId, config);
    } else {
      const novo = await base44.entities.ConfiguracaoEmail.create(config);
      setConfigId(novo.id);
    }
    setSaving(false);
    toast.success('Configuração salva!');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addEmail(); }
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Alertas de Calibração</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-muted-foreground">
            Configure os emails que receberão alertas automáticos quando equipamentos estiverem com calibração próxima do vencimento.
          </p>

          {/* Ativo / Inativo */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Envio automático</p>
              <p className="text-xs text-muted-foreground">Emails enviados todos os dias às 8h</p>
            </div>
            <Switch
              checked={!!config?.ativo}
              onCheckedChange={v => setConfig(c => ({ ...c, ativo: v }))}
            />
          </div>

          {/* Dias de antecedência */}
          <div className="space-y-1.5">
            <Label className="text-xs">Dias de antecedência para alertar</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={7}
                max={365}
                value={config?.dias_antecedencia || 60}
                onChange={e => setConfig(c => ({ ...c, dias_antecedencia: Number(e.target.value) }))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">dias antes do vencimento</span>
            </div>
          </div>

          {/* Emails */}
          <div className="space-y-2">
            <Label className="text-xs">Destinatários</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={addEmail} className="gap-1.5 flex-shrink-0">
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            </div>

            {(config?.emails_destinatarios || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3 border border-dashed border-border rounded-md">
                Nenhum destinatário configurado.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {config.emails_destinatarios.map(email => (
                  <div key={email} className="flex items-center justify-between px-3 py-2 bg-muted/40 rounded-md border border-border">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground">{email}</span>
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEmail(email)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Salvando...' : 'Salvar configuração'}
          </Button>
        </div>
      </div>
    </div>
  );
}