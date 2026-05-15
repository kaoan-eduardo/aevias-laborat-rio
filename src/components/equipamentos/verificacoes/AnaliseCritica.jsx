import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RubricaButton from './RubricaButton';

const RESULTADO_COLOR = {
  em_andamento: 'border-yellow-300 bg-yellow-50',
  aprovado: 'border-green-300 bg-green-50',
  reprovado: 'border-red-300 bg-red-50'
};

/**
 * Seção de Análise Crítica reutilizável.
 * Props:
 *   resultadoGeral, onResultadoChange
 *   responsavel, onResponsavelChange
 *   data, onDataChange
 *   rubricaUrl, onRubricaConfirm
 *   nomeUsuario  — nome padrão para a rubrica
 *   disabled     — modo somente leitura
 *   showResultado — se false, oculta o select de resultado (ex: quando gestor controla em outro lugar)
 */
export default function AnaliseCritica({
  resultadoGeral,
  onResultadoChange,
  responsavel,
  onResponsavelChange,
  data,
  onDataChange,
  rubricaUrl,
  onRubricaConfirm,
  nomeUsuario = '',
  disabled = false,
  showResultado = true
}) {
  return (
    <div className={`rounded-lg border-2 p-4 space-y-3 ${RESULTADO_COLOR[resultadoGeral] || 'border-border bg-muted/10'}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Análise Crítica</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">

        {showResultado &&
        <div className="space-y-1.5">
            <Label className="text-xs">Resultado Geral</Label>
            <Select value={resultadoGeral} onValueChange={onResultadoChange} disabled={disabled || !rubricaUrl}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
            {!rubricaUrl && <p className="text-xs text-muted-foreground">Rubrique para liberar o resultado</p>}
          </div>
        }

        <div className="space-y-1.5">
          <Label className="text-xs">Data</Label>
          <Input
            type="date"
            value={data || ''}
            onChange={(e) => onDataChange(e.target.value)}
            disabled={disabled}
            className="text-xs pt-1 pr-3 pb-1 pl-3" />
          
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Responsável (rubrica)</Label>
          <div className="flex items-center gap-2">
            




            
            
            <RubricaButton
              nome={responsavel || nomeUsuario}
              rubricaUrl={rubricaUrl}
              responsavel={responsavel}
              disabled={disabled}
              onConfirm={(dataUrl) => {
                if (!responsavel && nomeUsuario) onResponsavelChange(nomeUsuario);
                onRubricaConfirm(dataUrl);
              }} />
            
          </div>
        </div>

      </div>
    </div>);

}