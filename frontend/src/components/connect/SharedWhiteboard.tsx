'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, RotateCcw, Download, Eraser, Paintbrush } from 'lucide-react';

export default function SharedWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // Resize canvas to match offset dimensions with Retina devicePixelRatio scaling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save existing drawing buffer before resize
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Restore previous drawing if present
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr, 0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Multiply by 1 (since CSS px matches context units after ctx.scale)
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#0a0a0f' : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.strokeStyle = isEraser ? '#0a0a0f' : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: canvas.width, height: canvas.height };

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ScholarOS_Whiteboard_${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl select-none">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-default)] pb-3">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" /> Realtime Group Study Whiteboard
        </h2>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Colors */}
          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-white/10">
            {['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-lg transition border ${
                  color === c && !isEraser ? 'scale-110 border-white ring-2 ring-white/30' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-white/10">
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                  lineWidth === w ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>

          {/* Eraser Tool */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition border ${
              isEraser
                ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" /> Eraser
          </button>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>

          {/* Download Image */}
          <button
            onClick={downloadCanvas}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-md"
          >
            <Download className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      {/* Canvas Box */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] h-[360px] sm:h-[450px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none block"
        />
      </div>
    </div>
  );
}
