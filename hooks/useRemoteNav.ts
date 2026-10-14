"use client";

import { useEffect } from "react";

const FOCUSABLE = "[data-focusable]:not([disabled]):not([aria-hidden='true'])";

function isTyping(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const t = (el as HTMLInputElement).type;
    return !["button", "checkbox", "radio", "range", "submit"].includes(t);
  }
  return (el as HTMLElement).isContentEditable;
}

function visible(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
}

type Dir = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

/** Geometric spatial navigation: nearest focusable in the pressed direction. */
function findNext(from: HTMLElement, dir: Dir, scope: ParentNode): HTMLElement | null {
  const a = from.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  scope.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((el) => {
    if (el === from || !visible(el)) return;
    const b = el.getBoundingClientRect();
    const bx = b.left + b.width / 2;
    const by = b.top + b.height / 2;
    const dx = bx - ax;
    const dy = by - ay;
    let primary: number;
    let secondary: number;
    switch (dir) {
      case "ArrowRight":
        if (b.left < a.right - 4 && dx <= 0) return;
        if (dx <= 0) return;
        primary = dx;
        secondary = Math.abs(dy);
        break;
      case "ArrowLeft":
        if (dx >= 0) return;
        primary = -dx;
        secondary = Math.abs(dy);
        break;
      case "ArrowDown":
        if (dy <= 0) return;
        primary = dy;
        secondary = Math.abs(dx);
        break;
      default:
        if (dy >= 0) return;
        primary = -dy;
        secondary = Math.abs(dx);
    }
    // Penalise off-axis candidates so we move along the row/column first.
    const score = primary + secondary * 2.5;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  });
  return best;
}

interface Options {
  /** Called on Escape / Backspace (outside inputs) when nothing else handled it. */
  onBack?: () => void;
  enabled?: boolean;
}

/**
 * Global Android TV remote / keyboard navigation.
 * - Arrow keys move focus between `[data-focusable]` elements.
 * - Enter / OK activates the focused element natively (buttons/links) — we do not hijack it.
 * - While typing in an input, arrows/backspace are left alone (Escape blurs it, Arrow Down leaves it).
 * - If a `[data-focus-scope]` (modal) exists, focus is trapped inside it.
 */
export function useRemoteNav({ onBack, enabled = true }: Options) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const active = document.activeElement as HTMLElement | null;
      const typing = isTyping(active);
      const scopeEl = document.querySelector<HTMLElement>("[data-focus-scope]");
      const scope: ParentNode = scopeEl ?? document;

      if (e.key === "Escape") {
        if (typing && active && !scopeEl) {
          active.blur();
          e.preventDefault();
          return;
        }
        onBack?.();
        return;
      }

      if (e.key === "Backspace") {
        if (typing) return; // let the user delete text
        e.preventDefault();
        onBack?.();
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (typing) {
          // Left/Right must edit caret; Up/Down may leave the field.
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") return;
        }
        const dir = e.key as Dir;
        // Don't steal arrows from range sliders.
        if (active instanceof HTMLInputElement && active.type === "range" && (dir === "ArrowLeft" || dir === "ArrowRight")) return;
        const from = active && active.matches("[data-focusable]") ? active : null;
        if (!from) {
          const first = (scope as ParentNode).querySelector<HTMLElement>(FOCUSABLE);
          if (first) {
            first.focus();
            e.preventDefault();
          }
          return;
        }
        const next = findNext(from, dir, scope);
        if (next) {
          e.preventDefault();
          next.focus({ preventScroll: true });
          next.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        } else if (scopeEl) {
          e.preventDefault(); // keep focus trapped in modal
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack, enabled]);
}
