import { useEffect, useRef, useState } from "react";

/**
 * Returns a scale factor to fit a fixed-size element (baseW x baseH) inside its
 * parent container while preserving aspect ratio. Use with `transform: scale(x)`.
 */
export function useFitScale(baseW: number, baseH: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const recalc = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / baseW, height / baseH));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [baseW, baseH]);

  return { containerRef, scale };
}

/**
 * Auto-shrinks an element's font-size until its scrollHeight fits within its
 * clientHeight. Returns a ref to attach to the measuring container.
 */
export function useAutoShrink<T extends HTMLElement>(
  deps: unknown[],
  opts: { min?: number; max?: number; step?: number } = {}
) {
  const { min = 0.55, max = 1, step = 0.04 } = opts;
  const ref = useRef<T | null>(null);
  const [fontScale, setFontScale] = useState(max);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let s = max;
    el.style.setProperty("--auto-fs", String(s));
    // Force layout, then shrink until it fits or hits min.
    let guard = 0;
    while (el.scrollHeight > el.clientHeight + 1 && s > min && guard < 40) {
      s = Math.max(min, s - step);
      el.style.setProperty("--auto-fs", String(s));
      guard++;
    }
    setFontScale(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, fontScale };
}
