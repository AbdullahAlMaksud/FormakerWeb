"use client";

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "h-5 w-5", size = 20 }: LogoProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      whileHover="hover"
    >
      {/* Outer frame */}
      <motion.path
        d="M4 7C4 5.11438 4 4.17157 4.58579 3.58579C5.17157 3 6.11438 3 8 3H16C17.8856 3 18.8284 3 19.4142 3.58579C20 4.17157 20 5.11438 20 7V15C20 17.8284 20 19.2426 19.1213 20.1213C18.2426 21 16.8284 21 14 21H10C7.17157 21 5.75736 21 4.87868 20.1213C4 19.2426 4 17.8284 4 15V7Z"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
        variants={{
          hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
          }
        }}
      />
      {/* Bottom feet/clips */}
      <motion.path
        d="M15 18L15 21M9 18L9 21"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          delay: 0.6,
        }}
      />
      {/* Top line */}
      <motion.path
        d="M9 8L15 8"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
          delay: 1.0,
        }}
        variants={{
          hover: {
            x: [0, 2, -2, 0],
            transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
          }
        }}
      />
      {/* Middle line */}
      <motion.path
        d="M9 12L15 12"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
          delay: 1.2,
        }}
        variants={{
          hover: {
            x: [0, -2, 2, 0],
            transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.1 }
          }
        }}
      />
    </motion.svg>
  );
}
