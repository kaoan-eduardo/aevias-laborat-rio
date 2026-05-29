import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Seção reutilizável de Equipamento de Referência (Padrão).
 */
export default function EqReferenciaSection({ eqRefId, eqRefDesc, eqRefCal, opcoes, placeholderSelect, erros, onIdChange, onDescChange, onCalChange }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento de Referência (Padrão)</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Identificação *</Label>
          {opcoes.length > 0 ? (
            <Select value={eqRefId} onValueChange={onIdChange}>
              <SelectTrigger className={`text-xs h-9 ${erros?.eqRefId ? 'border-destructive' : ''}`}>
                <SelectValue placeholder={placeholderSelect} />
              </SelectTrigger>
              <SelectContent>
                {opcoes.map(p => (
                  <SelectItem key={p.id} value={p.identificacao_interna}>
                    {p.identificacao_interna} — {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={eqRefId} onChange={e => onIdChange(e.target.value)} placeholder="ID do equip. referência" className={`text-xs ${erros?.eqRefId ? 'border-destructive' : ''}`} />
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Descrição</Label>
          <Input value={eqRefDesc} onChange={e => onDescChange(e.target.value)} className="text-xs" disabled={!!eqRefId && opcoes.length > 0} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Data de Calibração *</Label>
          <Input type="date" value={eqRefCal} onChange={e => onCalChange(e.target.value)} className={`text-xs ${erros?.eqRefCal ? 'border-destructive' : ''}`} />
        </div>
      </div>
    </div>
  );
}