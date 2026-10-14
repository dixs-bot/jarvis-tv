"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { AlertIcon, CheckIcon, WifiIcon } from "@/components/ui/Icons";
import { dur, ease } from "@/lib/motion";

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            type="button"
            key={t.id}
            className={`toast toast--${t.kind}`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: dur.base, ease }}
            onClick={() => dismissToast(t.id)}
            aria-label={`${t.message}. Dismiss`}
          >
            {t.kind === "success" ? <CheckIcon /> : t.kind === "error" ? <AlertIcon /> : <WifiIcon />}
            <span>{t.message}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
