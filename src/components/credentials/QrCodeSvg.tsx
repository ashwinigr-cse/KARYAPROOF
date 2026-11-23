import { useMemo } from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  label?: string;
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function QrCodeSvg({ value, size = 112, label }: QrCodeSvgProps) {
  const modules = 21;

  const matrix = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: modules }, () =>
      Array.from({ length: modules }, () => false)
    );

    const drawFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startR + r][startC + c] = isOuter || isInner;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, modules - 7);
    drawFinder(modules - 7, 0);

    let seed = hashSeed(value);
    const nextBit = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed & 1) === 1;
    };

    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= modules - 8;
        const inBottomLeft = r >= modules - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        if (r === 6 || c === 6) {
          grid[r][c] = (r + c) % 2 === 0;
          continue;
        }

        grid[r][c] = nextBit();
      }
    }

    return grid;
  }, [value]);

  return (
    <div className="inline-flex flex-col items-center rounded-lg border border-zinc-200 bg-white p-2.5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${modules} ${modules}`}
        role="img"
        aria-label={label || `Verification QR placeholder for ${value}`}
        shapeRendering="crispEdges"
      >
        <rect width={modules} height={modules} fill="#FFFFFF" />
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#18181B" /> : null
          )
        )}
      </svg>
      <span className="mt-1.5 font-mono text-[10px] text-zinc-500">QR Verification Preview</span>
    </div>
  );
}
