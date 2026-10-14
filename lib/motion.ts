import type { Transition, Variants } from "framer-motion";

/** All durations within 150-350ms. */
export const dur = { fast: 0.15, base: 0.22, slow: 0.32 } as const;
export const ease = [0.22, 1, 0.36, 1] as const;

export const spring: Transition = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: dur.slow, ease } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
