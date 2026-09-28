"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Fades + lifts its children in the first time they scroll into view. */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  rotate = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  rotate?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, rotate: rotate ? rotate * 2 : 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
