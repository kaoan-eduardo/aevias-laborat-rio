import { PenLine } from 'lucide-react';
import RubricaModal from './RubricaModal';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

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

  const handleConfirm = async (dataUrl) => {
    // Converte o dataURL para File e faz upload, armazenando só a URL
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'rubrica.png', { type: 'image/png' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onConfirm(file_url);
    setOpen(false);
  };

  return (
    <>
      {open &&
      <RubricaModal
        nome={nome}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)} />

      }
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={`flex items-center gap-1.5 h-9 rounded border text-xs transition-all w-full px-3
          ${rubricaUrl ?
        'border-green-300 bg-green-50 text-green-700' :
        'border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary'} disabled:opacity-40 disabled:cursor-not-allowed`
        }>
        
        {rubricaUrl ?
        <><img src={rubricaUrl} alt="rubrica" className="h-4 object-contain" /><span className="truncate text-[10px]">{responsavel}</span></> :
        <><PenLine className="w-3 h-3" /><span className="truncate">{responsavel || 'Rubricar'}</span></>
        }
      </button>
    </>);

}