import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Step 1 reutilizável: selecionar equipamento na lista.
 */
export default function EquipamentoSelectorStep({ titulo, subtitulo, equipamentos, isLoading, emptyMessage, onBack, onSelect }) {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-xl font-bold">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{subtitulo}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : equipamentos.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-xl">
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {equipamentos.map(eq => (
            <button
              key={eq.id}
              onClick={() => onSelect(eq)}
              className="w-full rounded-lg border border-border hover:border-primary hover:bg-primary/5 px-4 py-3 text-left flex items-center justify-between transition-all"
            >
              <div>
                <span className="font-mono-data text-sm font-semibold text-primary">{eq.identificacao_interna}</span>
                <span className="ml-3 text-sm text-foreground">{eq.nome}</span>
                {eq.categoria && <span className="ml-2 text-xs text-muted-foreground">· {eq.categoria}</span>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}