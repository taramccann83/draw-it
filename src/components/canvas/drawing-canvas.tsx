"use client";

import { useRef, useState, useEffect, useCallback } from "react";

function hslToHex(hue: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (hue < 60) { r = c; g = x; }
  else if (hue < 120) { r = x; g = c; }
  else if (hue < 180) { g = c; b = x; }
  else if (hue < 240) { g = x; b = c; }
  else if (hue < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const BRUSH_SIZES = [1, 3, 8, 16];

type ToolType = "pen" | "marker" | "crayon" | "spray" | "eraser" | "fill" | "circle" | "square" | "line" | "triangle";

const BRUSH_STYLES: { tool: ToolType; icon: string; label: string }[] = [
  { tool: "pen", icon: "edit", label: "Pen" },
  { tool: "marker", icon: "brush", label: "Marker" },
  { tool: "crayon", icon: "stylus", label: "Crayon" },
  { tool: "spray", icon: "colors", label: "Spray" },
];

const SHAPE_TOOLS: { tool: ToolType; icon: string; label: string }[] = [
  { tool: "circle", icon: "circle", label: "Circle" },
  { tool: "square", icon: "square", label: "Square" },
  { tool: "triangle", icon: "change_history", label: "Triangle" },
  { tool: "line", icon: "horizontal_rule", label: "Line" },
];

interface DrawingCanvasProps {
  onExport: (dataUrl: string) => void;
}

export function DrawingCanvas({ onExport }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#1a1c1c");
  const [hue, setHue] = useState(0);
  const [lightness, setLightness] = useState(0.5);
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<ToolType>("pen");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [activeTab, setActiveTab] = useState<"brushes" | "shapes" | "size">("brushes");
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const preShapeImage = useRef<ImageData | null>(null);

  const isShapeTool = ["circle", "square", "line", "triangle"].includes(tool);
  const isBrushTool = ["pen", "marker", "crayon", "spray"].includes(tool);

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

  // --- Brush style helpers ---
  function applyBrushStyle(ctx: CanvasRenderingContext2D, pos: { x: number; y: number }) {
    const drawColor = tool === "eraser" ? "#ffffff" : color;

    switch (tool) {
      case "pen":
      case "eraser":
        ctx.globalAlpha = 1;
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = drawColor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        break;

      case "marker":
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = brushSize * 2.5;
        ctx.strokeStyle = drawColor;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        break;

      case "crayon": {
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = brushSize * 2;
        ctx.strokeStyle = drawColor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // Add texture by drawing extra random dots
        const count = Math.floor(brushSize * 1.5);
        for (let i = 0; i < count; i++) {
          const ox = (Math.random() - 0.5) * brushSize * 2;
          const oy = (Math.random() - 0.5) * brushSize * 2;
          ctx.fillStyle = drawColor;
          ctx.globalAlpha = 0.2 + Math.random() * 0.3;
          ctx.fillRect(pos.x + ox, pos.y + oy, 1 + Math.random() * 2, 1 + Math.random() * 2);
        }
        ctx.globalAlpha = 0.6;
        break;
      }

      case "spray": {
        ctx.globalAlpha = 1;
        const density = brushSize * 3;
        const radius = brushSize * 3;
        for (let i = 0; i < density; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * radius;
          ctx.fillStyle = drawColor;
          ctx.globalAlpha = 0.3 + Math.random() * 0.4;
          ctx.fillRect(
            pos.x + Math.cos(angle) * r,
            pos.y + Math.sin(angle) * r,
            1,
            1
          );
        }
        ctx.globalAlpha = 1;
        return; // spray doesn't use lineTo
      }

    }
  }

  // --- Fill tool (flood fill) ---
  function floodFill(startX: number, startY: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    const sx = Math.floor(startX);
    const sy = Math.floor(startY);
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;

    const startIdx = (sy * w + sx) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];
    const startA = data[startIdx + 3];

    // Parse fill color
    const fillR = parseInt(color.slice(1, 3), 16);
    const fillG = parseInt(color.slice(3, 5), 16);
    const fillB = parseInt(color.slice(5, 7), 16);

    // Don't fill if same color
    if (startR === fillR && startG === fillG && startB === fillB && startA === 255) return;

    const tolerance = 30;
    function matches(idx: number) {
      return (
        Math.abs(data[idx] - startR) <= tolerance &&
        Math.abs(data[idx + 1] - startG) <= tolerance &&
        Math.abs(data[idx + 2] - startB) <= tolerance &&
        Math.abs(data[idx + 3] - startA) <= tolerance
      );
    }

    const stack = [[sx, sy]];
    const visited = new Uint8Array(w * h);

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = y * w + x;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (visited[key]) continue;
      const idx = key * 4;
      if (!matches(idx)) continue;

      visited[key] = 1;
      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveHistory();
  }

  // --- Shape drawing ---
  function drawShapePreview(start: { x: number; y: number }, end: { x: number; y: number }) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas || !preShapeImage.current) return;

    // Restore pre-shape state
    ctx.putImageData(preShapeImage.current, 0, 0);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.globalAlpha = 1;

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    switch (tool) {
      case "circle": {
        const rx = Math.abs(dx) / 2;
        const ry = Math.abs(dy) / 2;
        const cx = start.x + dx / 2;
        const cy = start.y + dy / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case "square":
        ctx.strokeRect(start.x, start.y, dx, dy);
        break;
      case "line":
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
      case "triangle": {
        const midX = start.x + dx / 2;
        ctx.moveTo(midX, start.y);
        ctx.lineTo(start.x, end.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke();
        break;
      }
    }
  }

  function saveHistory() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    setHistory((prev) => [
      ...prev.slice(-20),
      ctx.getImageData(0, 0, canvas.width, canvas.height),
    ]);
  }

  // --- Event handlers ---
  const startDrawing = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const pos = getPos(e);

      if (tool === "fill") {
        floodFill(pos.x, pos.y);
        return;
      }

      if (isShapeTool) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
          preShapeImage.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        shapeStart.current = pos;
        setIsDrawing(true);
        return;
      }

      lastPos.current = pos;
      setIsDrawing(true);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      if (tool === "spray") {
        applyBrushStyle(ctx, pos);
      } else {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
        ctx.globalAlpha = tool === "crayon" ? 0.6 : tool === "marker" ? 0.85 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPos, brushSize, color, tool, isShapeTool]
  );

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isDrawing) return;

      const pos = getPos(e);

      if (isShapeTool && shapeStart.current) {
        drawShapePreview(shapeStart.current, pos);
        return;
      }

      if (!lastPos.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      if (tool === "spray") {
        applyBrushStyle(ctx, pos);
        lastPos.current = pos;
        return;
      }

      applyBrushStyle(ctx, pos);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      lastPos.current = pos;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDrawing, getPos, color, brushSize, tool, isShapeTool]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    shapeStart.current = null;
    preShapeImage.current = null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.globalAlpha = 1;

    setHistory((prev) => [
      ...prev.slice(-20),
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
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onExport(canvas.toDataURL("image/png"));
  };

  const toolBtnClass = (active: boolean) =>
    `w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
      active
        ? "bg-primary-container border-2 border-primary"
        : "bg-surface-container border border-outline-variant"
    }`;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
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
      <div className="w-full max-w-[500px] space-y-2">
        {/* Hue bar + black/white */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setColor("#000000"); if (tool === "eraser") setTool("pen"); }}
            className={`w-8 h-8 rounded-full border-2 shrink-0 active:scale-90 transition-transform ${
              color === "#000000" ? "border-primary scale-110 shadow-md" : "border-outline-variant"
            }`}
            style={{ backgroundColor: "#000000" }}
          />
          <div
            className="flex-1 h-8 rounded-full overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              background: `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => hslToHex(i * 30, 1, lightness)).join(", ")})`,
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const h = Math.round(ratio * 360);
              setHue(h);
              setColor(hslToHex(h, 1, lightness));
              if (tool === "eraser") setTool("pen");
            }}
            onTouchEnd={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.changedTouches[0].clientX - rect.left) / rect.width));
              const h = Math.round(ratio * 360);
              setHue(h);
              setColor(hslToHex(h, 1, lightness));
              if (tool === "eraser") setTool("pen");
            }}
          />
          <button
            onClick={() => { setColor("#ffffff"); if (tool === "eraser") setTool("pen"); }}
            className={`w-8 h-8 rounded-full border-2 shrink-0 active:scale-90 transition-transform ${
              color === "#ffffff" ? "border-primary scale-110 shadow-md" : "border-outline-variant"
            }`}
            style={{ backgroundColor: "#ffffff" }}
          />
          <div
            className="w-8 h-8 rounded-full border-2 border-on-surface shrink-0"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Lightness bar — dark to light */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">dark_mode</span>
          <div
            className="flex-1 h-6 rounded-full overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              background: `linear-gradient(to right, ${hslToHex(hue, 1, 0.1)}, ${hslToHex(hue, 1, 0.3)}, ${hslToHex(hue, 1, 0.5)}, ${hslToHex(hue, 1, 0.7)}, ${hslToHex(hue, 1, 0.9)})`,
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const l = 0.1 + ratio * 0.8;
              setLightness(l);
              setColor(hslToHex(hue, 1, l));
              if (tool === "eraser") setTool("pen");
            }}
            onTouchEnd={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.changedTouches[0].clientX - rect.left) / rect.width));
              const l = 0.1 + ratio * 0.8;
              setLightness(l);
              setColor(hslToHex(hue, 1, l));
              if (tool === "eraser") setTool("pen");
            }}
          />
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">light_mode</span>
        </div>
      </div>

      {/* Tool Tabs */}
      <div className="w-full max-w-[500px]">
        <div className="flex gap-1 bg-surface-container rounded-lg p-1 mb-2">
          {(["brushes", "shapes", "size"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-surface-container-lowest shadow-sm text-primary"
                  : "text-on-surface-variant"
              }`}
            >
              {tab === "brushes" ? "Brushes" : tab === "shapes" ? "Shapes" : "Size"}
            </button>
          ))}
        </div>

        {/* Brushes Tab */}
        {activeTab === "brushes" && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {BRUSH_STYLES.map((b) => (
              <button
                key={b.tool}
                onClick={() => setTool(b.tool)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  tool === b.tool
                    ? "bg-primary-container border-2 border-primary"
                    : "bg-surface-container border border-outline-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {b.icon}
                </span>
                <span className="text-[9px] font-bold uppercase">{b.label}</span>
              </button>
            ))}

            <div className="w-px h-10 bg-outline-variant mx-1" />

            {/* Eraser */}
            <button
              onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                tool === "eraser"
                  ? "bg-primary-container border-2 border-primary"
                  : "bg-surface-container border border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">ink_eraser</span>
              <span className="text-[9px] font-bold uppercase">Eraser</span>
            </button>

            {/* Fill */}
            <button
              onClick={() => setTool(tool === "fill" ? "pen" : "fill")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                tool === "fill"
                  ? "bg-primary-container border-2 border-primary"
                  : "bg-surface-container border border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">format_color_fill</span>
              <span className="text-[9px] font-bold uppercase">Fill</span>
            </button>
          </div>
        )}

        {/* Shapes Tab */}
        {activeTab === "shapes" && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SHAPE_TOOLS.map((s) => (
              <button
                key={s.tool}
                onClick={() => setTool(s.tool)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  tool === s.tool
                    ? "bg-primary-container border-2 border-primary"
                    : "bg-surface-container border border-outline-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {s.icon}
                </span>
                <span className="text-[9px] font-bold uppercase">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Size Tab */}
        {activeTab === "size" && (
          <div className="flex items-center justify-center gap-3">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={toolBtnClass(brushSize === size)}
              >
                <div
                  className="rounded-full bg-on-surface"
                  style={{ width: size + 2, height: size + 2 }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Undo / Clear Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleUndo}
          disabled={history.length <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container border border-outline-variant disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[18px]">undo</span>
          <span className="text-xs font-bold">Undo</span>
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container border border-outline-variant"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <span className="text-xs font-bold">Clear</span>
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
