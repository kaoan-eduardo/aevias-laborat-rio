import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { PenLine, RotateCcw, Check } from 'lucide-react';

export default function RubricaModal({ nome, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#00233B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const applyCtxStyle = (ctx) => {
    ctx.strokeStyle = '#00233B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    applyCtxStyle(ctx);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    applyCtxStyle(ctx);
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const confirm = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onConfirm(dataUrl);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[380px] space-y-4">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-[#566E3D]" />
          <div>
            <p className="font-semibold text-[#00233B] text-sm">Rubrica do Responsável</p>
            <p className="text-xs text-gray-500">{nome}</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={340}
            height={130}
            className="w-full cursor-crosshair block"
            style={{ touchAction: 'none' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>
        <p className="text-xs text-center text-gray-400">Desenhe sua rubrica acima</p>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-xs">
            <RotateCcw className="w-3 h-3" /> Limpar
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={confirm}
            disabled={!hasDrawn}
            className="gap-1 text-xs bg-[#566E3D] hover:bg-[#566E3D]/90 text-white"
          >
            <Check className="w-3 h-3" /> Confirmar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}