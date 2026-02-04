"use client";

import React from "react";
import { motion } from "framer-motion";

interface DartMarkerProps {
  x: number;
  y: number;
  isLatest: boolean;
  color?: string;
}

/**
 * Stylized pin/needle — the cross-section of a dart embedded in the board.
 * Outer chrome ring + zone-color center + drop shadow for depth.
 */
const DartMarker: React.FC<DartMarkerProps> = ({
  x,
  y,
  isLatest,
  color = "#ffffff",
}) => {
  const outerR = 6;
  const ringW = 1.8;
  const innerR = outerR - ringW;

  if (isLatest) {
    return (
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 18,
        }}
        style={{ transformOrigin: `${x}px ${y}px` }}
      >
        {/* Drop shadow for depth */}
        <circle
          cx={x + 1.5}
          cy={y + 2}
          r={outerR + 0.5}
          fill="rgba(0,0,0,0.45)"
        />

        {/* Glowing pulse ring */}
        <motion.circle
          cx={x}
          cy={y}
          r={outerR + 3}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.7}
          animate={{
            r: [outerR + 3, outerR + 8, outerR + 3],
            opacity: [0.7, 0.1, 0.7],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Chrome outer ring — gradient effect via layered circles */}
        <circle cx={x} cy={y} r={outerR} fill="#c0c8d0" />
        <circle cx={x} cy={y - 0.6} r={outerR - 0.3} fill="#dce2e8" />
        <circle cx={x} cy={y} r={outerR - 0.6} fill="#a8b4c0" />

        {/* Zone color center fill */}
        <circle cx={x} cy={y} r={innerR} fill={color} />

        {/* Specular highlight on chrome ring */}
        <circle
          cx={x - 1.2}
          cy={y - 1.5}
          r={1.2}
          fill="rgba(255,255,255,0.6)"
        />
      </motion.g>
    );
  }

  // Older dart — muted, smaller feel
  return (
    <g opacity={0.5}>
      {/* Drop shadow */}
      <circle
        cx={x + 1}
        cy={y + 1.5}
        r={outerR + 0.3}
        fill="rgba(0,0,0,0.3)"
      />

      {/* Chrome ring — muted */}
      <circle cx={x} cy={y} r={outerR} fill="#7a8590" />
      <circle cx={x} cy={y} r={outerR - 0.5} fill="#8a94a0" />

      {/* Zone color center */}
      <circle cx={x} cy={y} r={innerR} fill={color} opacity={0.7} />
    </g>
  );
};

export default DartMarker;
