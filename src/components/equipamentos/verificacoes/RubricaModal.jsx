import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PenLine, RotateCcw, Check } from 'lucide-react';

export default function RubricaModal({ nome, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#00233B';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const confirm = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onConfirm(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[360px] space-y-4">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-[#566E3D]" />
          <div>
            <p className="font-semibold text-[#00233B] text-sm">Rubrica do Responsável</p>
            <p className="text-xs text-muted-foreground">{nome}</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-[#EFEBDC] rounded-xl overflow-hidden bg-[#F2F1EF] touch-none">
          <canvas
            ref={canvasRef}
            width={320}
            height={120}
            className="w-full cursor-crosshair"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">Desenhe sua rubrica acima</p>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-xs">
            <RotateCcw className="w-3 h-3" /> Limpar
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancelar
          </Button>
          <Button size="sm" onClick={confirm} disabled={!hasDrawn} className="gap-1 text-xs bg-[#566E3D] hover:bg-[#566E3D]/90">
            <Check className="w-3 h-3" /> Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}