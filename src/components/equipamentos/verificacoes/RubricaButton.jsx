import { PenLine } from 'lucide-react';
import RubricaModal from './RubricaModal';
import { useState } from 'react';

/**
 * Botão de rubricar reutilizável.
 * Exibe um botão que abre o modal de assinatura ao clicar.
 * Props:
 *  - nome: nome pré-preenchido no modal
 *  - rubricaUrl: data URL da rubrica já salva (ou '')
 *  - responsavel: nome já salvo
 *  - disabled: booleano
 *  - onConfirm(dataUrl, nome): callback ao confirmar
 */
export default function RubricaButton({ nome, rubricaUrl, responsavel, disabled, onConfirm }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = (dataUrl) => {
    onConfirm(dataUrl);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <RubricaModal
          nome={nome}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={`flex items-center gap-1.5 h-6 px-2 rounded border text-xs transition-all w-full
          ${rubricaUrl
            ? 'border-green-300 bg-green-50 text-green-700'
            : 'border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {rubricaUrl
          ? <><img src={rubricaUrl} alt="rubrica" className="h-4 object-contain" /><span className="truncate text-[10px]">{responsavel}</span></>
          : <><PenLine className="w-3 h-3" /><span className="truncate">{responsavel || 'Rubricar'}</span></>
        }
      </button>
    </>
  );
}