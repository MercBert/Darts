"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DartPayoutProps {
  x: number;
  y: number;
  payout: number;
  multiplier: number;
  id: number;
  isBullseye: boolean;
}

/**
 * Floating multiplier label — gold, bouncy, glowing.
 */
const DartPayout: React.FC<DartPayoutProps> = ({
  x,
  y,
  multiplier,
  id,
  isBullseye,
}) => {
  const fmt = multiplier >= 10
    ? `${Math.round(multiplier)}×`
    : `${multiplier % 1 === 0 ? multiplier.toFixed(0) : multiplier.toFixed(1)}×`;

  const label = isBullseye ? `🎯 ${fmt}` : fmt;
  const fontSize = isBullseye ? 19 : 16;

  // Offset to the right and slightly above
  const offsetX = 14;
  const offsetY = -8;

  return (
    <motion.g
      key={id}
      initial={{ opacity: 0, y: 0, scale: 1.5 }}
      animate={{
        opacity: [0, 1, 1, 1, 0],
        y: [0, -4, -14, -28, -42],
        scale: [1.5, 1.05, 1, 1, 0.9],
      }}
      transition={{
        duration: 2,
        ease: "easeOut",
        scale: {
          duration: 2,
          times: [0, 0.15, 0.3, 0.7, 1],
          ease: "easeOut",
        },
        opacity: {
          duration: 2,
          times: [0, 0.08, 0.3, 0.75, 1],
        },
      }}
    >
      {/* Glow halo */}
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor="start"
        dominantBaseline="middle"
        fill="#FFD166"
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        style={{
          filter: `drop-shadow(0 0 4px rgba(255,209,102,0.9)) drop-shadow(0 0 8px rgba(255,209,102,0.5))`,
        }}
        opacity="0.6"
      >
        {label}
      </text>
      {/* Dark shadow for contrast */}
      <text
        x={x + offsetX + 0.6}
        y={y + offsetY + 0.6}
        textAnchor="start"
        dominantBaseline="middle"
        fill="rgba(0,0,0,0.8)"
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {label}
      </text>
      {/* Main gold text */}
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor="start"
        dominantBaseline="middle"
        fill="#FFD166"
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {label}
      </text>
    </motion.g>
  );
};

interface DartPayoutsProps {
  markers: Array<{
    id: number;
    cx: number;
    cy: number;
    payout: number;
    multiplier: number;
    isLatest: boolean;
    isBullseye: boolean;
  }>;
}

/**
 * Renders floating multiplier labels for the 3 most recent darts.
 */
const DartPayouts: React.FC<DartPayoutsProps> = ({ markers }) => {
  const lastThree = markers.slice(-3);

  return (
    <AnimatePresence>
      {lastThree.map((m) => (
        <DartPayout
          key={m.id}
          id={m.id}
          x={m.cx}
          y={m.cy}
          payout={m.payout}
          multiplier={m.multiplier}
          isBullseye={m.isBullseye}
        />
      ))}
    </AnimatePresence>
  );
};

export default DartPayouts;
