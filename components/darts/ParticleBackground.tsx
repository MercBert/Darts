"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

/* ── Stars ── */

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  maxOpacity: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3.5,
    delay: Math.random() * -8,
    duration: 1.5 + Math.random() * 3,
    maxOpacity: 0.4 + Math.random() * 0.6,
  }));
}

const ORBIT_CSS = `
  @keyframes cosmos-orbit {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const ParticleBackground: React.FC = () => {
  const stars = useMemo(() => generateStars(150), []);

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: ORBIT_CSS }} />

      {/*
        Orbiting cosmos container:
        - 200% of game window — visible area is the center 50%
        - Planets at orbit radius ~22-30% from center orbit in and out of view
      */}
      <div
        className="absolute"
        style={{
          width: "200%",
          height: "200%",
          left: "50%",
          top: "50%",
          animation: "cosmos-orbit 150s linear infinite",
        }}
      >
        {/* Stars */}
        {stars.map((s) => (
          <motion.div
            key={`star-${s.id}`}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              backgroundColor: "#ffffff",
              boxShadow: `0 0 ${s.size * 1.5}px rgba(255,255,255,0.6), 0 0 ${s.size * 3}px rgba(180,210,255,0.3)`,
            }}
            animate={{
              opacity: [0, s.maxOpacity, 0],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: s.delay,
            }}
          />
        ))}

        {/* ── Jupiter — close, large ──
            At (28%, 50%): orbit radius = 22% from center
            Spends significant time in the visible area */}
        <div
          className="absolute"
          style={{
            left: "28%",
            top: "50%",
            width: 120,
            height: 120,
            opacity: 0.5,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <radialGradient id="jupiter-light" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#E8C99B" />
                <stop offset="100%" stopColor="#A67C52" />
              </radialGradient>
              <clipPath id="jupiter-clip">
                <circle cx="50" cy="50" r="48" />
              </clipPath>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#jupiter-light)" />
            <g clipPath="url(#jupiter-clip)">
              <rect x="0" y="15" width="100" height="8" rx="3" fill="#C4956A" opacity="0.6" />
              <rect x="0" y="28" width="100" height="11" rx="3" fill="#D4A574" opacity="0.5" />
              <rect x="0" y="43" width="100" height="6" rx="3" fill="#B8845A" opacity="0.55" />
              <rect x="0" y="53" width="100" height="9" rx="3" fill="#C9A07A" opacity="0.45" />
              <rect x="0" y="66" width="100" height="7" rx="3" fill="#B08050" opacity="0.5" />
              <rect x="0" y="77" width="100" height="10" rx="3" fill="#D4A574" opacity="0.4" />
              <ellipse cx="64" cy="47" rx="10" ry="6" fill="#C06030" opacity="0.6" />
            </g>
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(232,201,155,0.2)" strokeWidth="2" />
          </svg>
        </div>

        {/* ── Saturn — distant, smaller, with rings ──
            At (50%, 22%): orbit radius = 28% from center
            Peeks in through edges/corners, more time hidden */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "22%",
            width: 100,
            height: 60,
            opacity: 0.35,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 160 100" width="100%" height="100%" overflow="visible">
            <defs>
              <radialGradient id="saturn-light" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#F0DEB4" />
                <stop offset="100%" stopColor="#C4A265" />
              </radialGradient>
              <clipPath id="saturn-clip">
                <circle cx="80" cy="50" r="28" />
              </clipPath>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4B896" stopOpacity="0.1" />
                <stop offset="20%" stopColor="#C9A87C" stopOpacity="0.5" />
                <stop offset="40%" stopColor="#B8956A" stopOpacity="0.3" />
                <stop offset="55%" stopColor="#D4B896" stopOpacity="0.55" />
                <stop offset="75%" stopColor="#C4A070" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4B896" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Back ring */}
            <ellipse
              cx="80" cy="50" rx="56" ry="14"
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth="8"
              opacity="0.5"
              strokeDasharray="0 88 90 0"
            />

            {/* Planet body */}
            <circle cx="80" cy="50" r="28" fill="url(#saturn-light)" />
            <g clipPath="url(#saturn-clip)">
              <rect x="50" y="30" width="60" height="5" rx="2" fill="#C9A87C" opacity="0.4" />
              <rect x="50" y="40" width="60" height="7" rx="2" fill="#B8956A" opacity="0.35" />
              <rect x="50" y="52" width="60" height="4" rx="2" fill="#D4B896" opacity="0.3" />
              <rect x="50" y="60" width="60" height="6" rx="2" fill="#C4A070" opacity="0.35" />
            </g>

            {/* Front ring */}
            <ellipse
              cx="80" cy="50" rx="56" ry="14"
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth="8"
              opacity="0.6"
              strokeDasharray="88 0 0 90"
            />

            <circle cx="80" cy="50" r="28" fill="none" stroke="rgba(240,222,180,0.15)" strokeWidth="2" />
          </svg>
        </div>

        {/* ── Neptune — far out, small, icy blue ──
            At (75%, 35%): orbit radius = ~29% from center
            Farther out than Saturn, brief appearances at edges */}
        <div
          className="absolute"
          style={{
            left: "75%",
            top: "35%",
            width: 44,
            height: 44,
            opacity: 0.3,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <radialGradient id="neptune-light" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#7BB8E0" />
                <stop offset="100%" stopColor="#2E5C8A" />
              </radialGradient>
              <clipPath id="neptune-clip">
                <circle cx="50" cy="50" r="48" />
              </clipPath>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#neptune-light)" />
            <g clipPath="url(#neptune-clip)">
              <rect x="0" y="22" width="100" height="6" rx="3" fill="#5A9DC4" opacity="0.4" />
              <rect x="0" y="38" width="100" height="8" rx="3" fill="#4B8AB5" opacity="0.35" />
              <rect x="0" y="55" width="100" height="5" rx="3" fill="#6AAED0" opacity="0.3" />
              <rect x="0" y="68" width="100" height="7" rx="3" fill="#4E90B8" opacity="0.35" />
              {/* Dark spot */}
              <ellipse cx="58" cy="44" rx="7" ry="5" fill="#1E4A6E" opacity="0.5" />
            </g>
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(123,184,224,0.2)" strokeWidth="2" />
          </svg>
        </div>

        {/* ── Mars — tight orbit, small, rusty red ──
            At (65.25%, 50%): orbit radius = 15.25% from center, opposite side from Jupiter
            Passes behind/around the dartboard center */}
        <div
          className="absolute"
          style={{
            left: "65.25%",
            top: "50%",
            width: 32,
            height: 32,
            opacity: 0.4,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <radialGradient id="mars-light" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#E8A88A" />
                <stop offset="100%" stopColor="#A84420" />
              </radialGradient>
              <clipPath id="mars-clip">
                <circle cx="50" cy="50" r="48" />
              </clipPath>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#mars-light)" />
            <g clipPath="url(#mars-clip)">
              {/* Surface features */}
              <ellipse cx="38" cy="35" rx="12" ry="8" fill="#C45C30" opacity="0.4" />
              <ellipse cx="62" cy="55" rx="15" ry="10" fill="#B84D25" opacity="0.35" />
              <ellipse cx="45" cy="65" rx="10" ry="6" fill="#C46838" opacity="0.3" />
              {/* Polar cap */}
              <ellipse cx="50" cy="8" rx="22" ry="8" fill="#E8D8CC" opacity="0.5" />
            </g>
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(232,168,138,0.2)" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ParticleBackground;
