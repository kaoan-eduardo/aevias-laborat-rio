import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NovaVerificacaoInterBalanca from './NovaVerificacaoInterBalanca';
import NovaVerificacaoInterTemperatura from './NovaVerificacaoInterTemperatura';
import NovaVerificacaoInterPaquimetro from './NovaVerificacaoInterPaquimetro';

const TIPOS = [
  { value: 'balanca',     label: 'Balança',    desc: 'FORM 016 — Checagem intermediária de balanças (≤ 0,5%)' },
  { value: 'temperatura', label: 'Temperatura', desc: 'FORM 027 — Checagem intermediária de temperatura (≤ 5,0%)' },
  { value: 'paquimetro',  label: 'Paquímetro',  desc: 'FORM 082 — Checagem intermediária de paquímetros (≤ 2%)' },
];

export default function NovaVerificacaoIntermediaria({ onBack, onSaved }) {
  const [tipo, setTipo] = useState('');

  if (tipo === 'balanca')     return <NovaVerificacaoInterBalanca   onBack={() => setTipo('')} onSaved={onSaved} />;
  if (tipo === 'temperatura') return <NovaVerificacaoInterTemperatura onBack={() => setTipo('')} onSaved={onSaved} />;
  if (tipo === 'paquimetro')  return <NovaVerificacaoInterPaquimetro  onBack={() => setTipo('')} onSaved={onSaved} />;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-xl font-bold">Nova Verificação Intermediária</h1>
          <p className="text-sm text-muted-foreground">Selecione o tipo de checagem</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIPOS.map(t => (
          <button
            key={t.value}
            onClick={() => setTipo(t.value)}
            className="rounded-xl border-2 border-border hover:border-primary p-6 text-left transition-all hover:bg-primary/5 focus:outline-none focus:border-primary"
          >
            <p className="font-semibold text-foreground text-base">{t.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}