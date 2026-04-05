"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const COLORS = [
  "#1a1c1c", // black
  "#ba1a1a", // red
  "#bb0056", // pink
  "#8b5cf6", // purple
  "#006688", // teal
  "#2563eb", // blue
  "#10b981", // green
  "#f5b830", // yellow
  "#f97316", // orange
  "#7c5800", // brown
  "#777777", // gray
  "#ffffff", // white
];

const BRUSH_SIZES = [3, 6, 10, 16];

interface DrawingCanvasProps {
  onExport: (dataUrl: string) => void;
}

export function DrawingCanvas({ onExport }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#1a1c1c");
  const [brushSize, setBrushSize] = useState(6);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const size = Math.min(container.clientWidth, 500);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const getPos = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const pos = getPos(e);
      lastPos.current = pos;
      setIsDrawing(true);

      // Draw a dot for taps
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.fill();
    },
    [getPos, brushSize, color, tool]
  );

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isDrawing || !lastPos.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      const pos = getPos(e);

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPos.current = pos;
    },
    [isDrawing, getPos, color, brushSize, tool]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;

    // Save to history for undo
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    setHistory((prev) => [
      ...prev.slice(-20), // Keep last 20 states
      ctx.getImageData(0, 0, canvas.width, canvas.height),
    ]);
  }, [isDrawing]);

  const handleUndo = () => {
    if (history.length <= 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onExport(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Canvas */}
      <div className="w-full max-w-[500px] aspect-square bg-white rounded-xl shadow-sm overflow-hidden border-2 border-outline-variant">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Color Picker */}
      <div className="flex flex-wrap justify-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setTool("pen");
            }}
            className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${
              color === c && tool === "pen"
                ? "border-primary scale-110 shadow-md"
                : "border-outline-variant"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Tools Row */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Brush Sizes */}
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              brushSize === size
                ? "bg-primary-container border-2 border-primary"
                : "bg-surface-container border border-outline-variant"
            }`}
          >
            <div
              className="rounded-full bg-on-surface"
              style={{ width: size + 2, height: size + 2 }}
            />
          </button>
        ))}

        <div className="w-px h-8 bg-outline-variant mx-1" />

        {/* Eraser */}
        <button
          onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            tool === "eraser"
              ? "bg-primary-container border-2 border-primary"
              : "bg-surface-container border border-outline-variant"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            ink_eraser
          </span>
        </button>

        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={history.length <= 1}
          className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[20px]">undo</span>
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">
            delete
          </span>
        </button>
      </div>

      {/* Done Button */}
      <button
        onClick={handleDone}
        className="w-full max-w-[500px] py-4 rounded-xl bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-xl active:scale-95 transition-all duration-300 shadow-lg"
      >
        Done!
      </button>
    </div>
  );
}
