"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "neutral" });

export default function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const trimmed = chart.trim();
    const timer = setTimeout(async () => {
      try {
        await mermaid.parse(trimmed);
      } catch {
        return;
      }
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const result = await mermaid.render(id, trimmed);
        // Remove fixed dimensions so the SVG scales with its container
        const scalable = result.svg
          .replace(/width="[^"]*"/, 'width="100%"')
          .replace(/height="[^"]*"/, 'height="100%"');
        setSvg(scalable);
        setError(null);
      } catch (err) {
        setError(String(err));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [chart]);

  if (error) {
    return (
      <pre className="bg-zinc-200 dark:bg-zinc-700 rounded p-3 my-2 text-xs font-mono overflow-x-auto whitespace-pre text-red-500">
        {chart}
      </pre>
    );
  }

  if (!svg) return null;

  return (
    <>
      <div className="relative my-3 group">
        <div
          ref={ref}
          className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-700 bg-white p-2"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <button
          onClick={() => setZoomed(true)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          ⤢ Zoom
        </button>
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
          onClick={() => setZoomed(false)}
        >
          <div
            className="relative w-full h-full overflow-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 text-lg font-bold"
            >
              ✕
            </button>
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      )}
    </>
  );
}
