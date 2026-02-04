"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimate } from "framer-motion";

export interface DartThrowAnimationProps {
  isActive: boolean;
  targetX: number; // 0-100 % within container
  targetY: number; // 0-100 %
  color: string;
  onComplete: () => void;
}

/**
 * Full-overlay dart throw animation: wind-up → flight → impact.
 * Renders absolutely inside the game window.
 * Uses framer-motion useAnimate for sequenced keyframes.
 */
const DartThrowAnimation: React.FC<DartThrowAnimationProps> = ({
  isActive,
  targetX,
  targetY,
  color,
  onComplete,
}) => {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [showFlash, setShowFlash] = useState(false);
  const [visible, setVisible] = useState(false);
  const runningRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const runAnimation = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setVisible(true);
    setShowFlash(false);

    const dart = scope.current;
    if (!dart) {
      runningRef.current = false;
      onCompleteRef.current();
      return;
    }

    // Randomize start position — anywhere in a zone around center
    const startX = 35 + Math.random() * 30;  // 35-65%
    const startY = 35 + Math.random() * 30;  // 35-65%
    const dx = targetX - startX;
    const dy = targetY - startY;

    try {
      // Reset to randomized start
      dart.style.opacity = "1";
      dart.style.transform =
        "translate(-50%, -50%) perspective(800px) rotateX(70deg) scale(1.1)";
      dart.style.left = `${startX}%`;
      dart.style.top = `${startY}%`;
      dart.style.filter = "none";

      // Phase 1: Wind-up pulse (200ms)
      await animate(
        dart,
        {
          scale: [1.1, 1.0],
          rotateX: [70, 70],
        },
        { duration: 0.18, ease: "easeOut" }
      );

      // Phase 2: Flight (300ms)
      await animate(
        dart,
        {
          scale: [1.0, 0.12],
          rotateX: [70, 12],
          x: [`0%`, `${dx}%`],
          y: [`0%`, `${dy}%`],
          filter: [
            "blur(0px) brightness(1)",
            "blur(1.5px) brightness(1.3)",
          ],
        },
        { duration: 0.28, ease: [0.45, 0, 0.55, 1] }
      );

      // Phase 3: Impact flash (150ms)
      setShowFlash(true);

      await animate(
        dart,
        { opacity: [1, 0], scale: [0.12, 0.06] },
        { duration: 0.12, ease: "easeOut" }
      );
    } catch {
      // animation interrupted — that's fine
    }

    setShowFlash(false);
    setVisible(false);
    runningRef.current = false;
    onCompleteRef.current();
  }, [animate, scope, targetX, targetY]);

  useEffect(() => {
    if (isActive) {
      runAnimation();
    }
  }, [isActive, runAnimation]);

  if (!visible && !isActive) return null;

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
      style={{ perspective: "800px" }}
    >
      {/* Dart element */}
      <div
        ref={scope}
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform:
            "translate(-50%, -50%) perspective(800px) rotateX(70deg) scale(1.1)",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, filter",
        }}
      >
        <motion.div
          animate={{ rotateZ: [-3, 3, -3] }}
          transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
        >
          <DartSVG color={color} />
        </motion.div>
      </div>

      {/* Impact flash */}
      {showFlash && (
        <motion.div
          className="absolute rounded-full"
          style={{
            left: `${targetX}%`,
            top: `${targetY}%`,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, ${color}44 50%, transparent 70%)`,
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ width: 60, height: 60, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
      )}
    </div>
  );
};

/**
 * Premium rocket SVG with animated exhaust flame.
 * Curved fuselage, panel lines, rivets, engine bell, swept fins, multi-layer flame.
 */
function DartSVG({ color }: { color: string }) {
  return (
    <div style={{ position: "relative", width: 80, height: 200 }}>
      <svg
        width="80"
        height="200"
        viewBox="0 0 80 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.6))" }}
      >
        <defs>
          {/* Body — multi-stop cylindrical metallic */}
          <linearGradient id="rBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a919a" />
            <stop offset="12%" stopColor="#b8c0ca" />
            <stop offset="30%" stopColor="#e0e6ec" />
            <stop offset="42%" stopColor="#f0f3f6" />
            <stop offset="55%" stopColor="#e8ecf0" />
            <stop offset="70%" stopColor="#ccd4dc" />
            <stop offset="85%" stopColor="#a8b2be" />
            <stop offset="100%" stopColor="#7a8490" />
          </linearGradient>

          {/* Specular highlight strip */}
          <linearGradient id="rSpec" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Ambient occlusion at edges */}
          <linearGradient id="rAO" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="8%" stopColor="transparent" />
            <stop offset="92%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
          </linearGradient>

          {/* Nose ogive — zone color */}
          <linearGradient id="rNose" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="35%" stopColor={color} />
            <stop offset="65%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>

          {/* Fin — zone color with metallic edge */}
          <linearGradient id="rFinL" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="rFinR" x1="1" y1="0" x2="0" y2="0.5">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>

          {/* Engine bell */}
          <linearGradient id="rBell" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a4e58" />
            <stop offset="30%" stopColor="#6b7380" />
            <stop offset="50%" stopColor="#7d8694" />
            <stop offset="70%" stopColor="#6b7380" />
            <stop offset="100%" stopColor="#3e434c" />
          </linearGradient>

          {/* Flame gradients */}
          <linearGradient id="rFlameOuter" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="25%" stopColor="#F94144" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#F3722C" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F9C74F" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rFlameMid" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFD166" />
            <stop offset="30%" stopColor="#F9C74F" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#F3722C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F94144" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rFlameInner" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#E0F0FF" />
            <stop offset="50%" stopColor="#FFD166" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F9C74F" stopOpacity="0" />
          </linearGradient>

          {/* Window */}
          <radialGradient id="rWin" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#b8e4ff" />
            <stop offset="40%" stopColor="#5aa8d0" />
            <stop offset="100%" stopColor="#1a4a6a" />
          </radialGradient>

          {/* Stripe bevel */}
          <linearGradient id="rStripe" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>

          {/* Clip for body shape */}
          <clipPath id="rBodyClip">
            <path d="M 27,28 C 25,30 24,34 24,38 L 24,98 C 24,100 25,102 28,102 L 52,102 C 55,102 56,100 56,98 L 56,38 C 56,34 55,30 53,28 Z" />
          </clipPath>
        </defs>

        {/* ═══ NOSE CONE — smooth ogive curve ═══ */}
        <path
          d="M 40,4 C 40,4 36,10 33,16 C 30,22 28,26 27,28 L 53,28 C 52,26 50,22 47,16 C 44,10 40,4 40,4 Z"
          fill="url(#rNose)"
        />
        {/* Nose specular highlight */}
        <path
          d="M 40,6 C 38,12 35,20 33,26"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Nose-body seam */}
        <line x1="26" y1="28" x2="54" y2="28" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />

        {/* ═══ FUSELAGE — tapered body ═══ */}
        <path
          d="M 27,28 C 25,30 24,34 24,38 L 24,98 C 24,100 25,102 28,102 L 52,102 C 55,102 56,100 56,98 L 56,38 C 56,34 55,30 53,28 Z"
          fill="url(#rBody)"
        />
        {/* Specular strip */}
        <path
          d="M 27,28 C 25,30 24,34 24,38 L 24,98 C 24,100 25,102 28,102 L 52,102 C 55,102 56,100 56,98 L 56,38 C 56,34 55,30 53,28 Z"
          fill="url(#rSpec)"
        />
        {/* Ambient occlusion */}
        <path
          d="M 27,28 C 25,30 24,34 24,38 L 24,98 C 24,100 25,102 28,102 L 52,102 C 55,102 56,100 56,98 L 56,38 C 56,34 55,30 53,28 Z"
          fill="url(#rAO)"
        />

        {/* ═══ PANEL LINES ═══ */}
        <g clipPath="url(#rBodyClip)" opacity="0.2">
          <line x1="24" y1="45" x2="56" y2="45" stroke="#4a525c" strokeWidth="0.5" />
          <line x1="24" y1="65" x2="56" y2="65" stroke="#4a525c" strokeWidth="0.5" />
          <line x1="24" y1="82" x2="56" y2="82" stroke="#4a525c" strokeWidth="0.5" />
          <line x1="40" y1="82" x2="40" y2="102" stroke="#4a525c" strokeWidth="0.4" />
        </g>

        {/* ═══ RIVETS ═══ */}
        <g opacity="0.3">
          {[32, 45, 58, 71, 84, 97].map((y) => (
            <React.Fragment key={y}>
              <circle cx="26" cy={y} r="0.7" fill="#6b7380" />
              <circle cx="54" cy={y} r="0.7" fill="#6b7380" />
              <circle cx="26.2" cy={y - 0.4} r="0.3" fill="rgba(255,255,255,0.5)" />
              <circle cx="54.2" cy={y - 0.4} r="0.3" fill="rgba(255,255,255,0.5)" />
            </React.Fragment>
          ))}
        </g>

        {/* ═══ ZONE COLOR STRIPES with bevel ═══ */}
        <g clipPath="url(#rBodyClip)">
          <rect x="24" y="38" width="32" height="5" fill="url(#rStripe)" />
          <line x1="24" y1="38" x2="56" y2="38" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="24" y1="43" x2="56" y2="43" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

          <rect x="24" y="75" width="32" height="5" fill="url(#rStripe)" />
          <line x1="24" y1="75" x2="56" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="24" y1="80" x2="56" y2="80" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        </g>

        {/* ═══ PORTHOLE WINDOW ═══ */}
        {/* Shadow behind window */}
        <circle cx="40" cy="58" r="7.5" fill="rgba(0,0,0,0.2)" />
        {/* Outer chrome ring */}
        <circle cx="40" cy="57" r="7.5" fill="none" stroke="#9aa4b0" strokeWidth="2" />
        <circle cx="40" cy="57" r="7.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        {/* Glass */}
        <circle cx="40" cy="57" r="6" fill="url(#rWin)" />
        {/* Inner shadow on glass */}
        <circle cx="40" cy="57" r="6" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
        {/* Glare reflection */}
        <ellipse cx="37.5" cy="54.5" rx="3" ry="2" fill="rgba(255,255,255,0.4)" />
        <ellipse cx="43" cy="59" rx="1.2" ry="0.8" fill="rgba(255,255,255,0.2)" />

        {/* ═══ SWEPT FINS ═══ */}
        {/* Left fin — aerodynamic swept shape */}
        <path
          d="M 25,88 C 20,92 10,100 6,108 C 4,112 5,114 8,114 L 18,108 C 22,104 24,96 25,92 Z"
          fill="url(#rFinL)"
        />
        <path
          d="M 25,88 C 20,92 10,100 6,108"
          stroke={color}
          strokeWidth="0.8"
          strokeOpacity="0.7"
          fill="none"
        />
        {/* Left fin shadow on body */}
        <path d="M 25,90 L 25,105" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />

        {/* Right fin */}
        <path
          d="M 55,88 C 60,92 70,100 74,108 C 76,112 75,114 72,114 L 62,108 C 58,104 56,96 55,92 Z"
          fill="url(#rFinR)"
        />
        <path
          d="M 55,88 C 60,92 70,100 74,108"
          stroke={color}
          strokeWidth="0.8"
          strokeOpacity="0.7"
          fill="none"
        />
        {/* Right fin shadow on body */}
        <path d="M 55,90 L 55,105" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />

        {/* ═══ ENGINE BELL — flared nozzle ═══ */}
        <path
          d="M 28,102 L 24,112 C 23,114 24,116 26,116 L 54,116 C 56,116 57,114 56,112 L 52,102 Z"
          fill="url(#rBell)"
        />
        {/* Bell interior */}
        <path
          d="M 30,104 L 27,113 L 53,113 L 50,104 Z"
          fill="#2a2e36"
        />
        {/* Bell rim highlight */}
        <path
          d="M 26,116 L 54,116"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
        />
        {/* Inner bell ring */}
        <ellipse cx="40" cy="113" rx="12" ry="1.5" fill="none" stroke="#5a626e" strokeWidth="0.6" />
      </svg>

      {/* ═══ ANIMATED EXHAUST FLAME ═══ */}
      {/* Positioned below the engine bell, animated with framer-motion */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -4,
          transform: "translateX(-50%)",
          width: 50,
          height: 70,
        }}
      >
        {/* Outer flame — red/orange, slow pulse */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            width: 28,
            height: 55,
            background: "linear-gradient(to bottom, #FF6B35 0%, #F94144 25%, #F3722C 50%, rgba(249,193,79,0) 100%)",
            borderRadius: "40% 40% 50% 50%",
            opacity: 0.8,
          }}
          animate={{
            scaleX: [1, 1.15, 0.9, 1.1, 1],
            scaleY: [1, 1.12, 0.92, 1.08, 1],
            opacity: [0.8, 0.6, 0.85, 0.65, 0.8],
          }}
          transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Mid flame — yellow/orange */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            width: 18,
            height: 42,
            background: "linear-gradient(to bottom, #FFD166 0%, #F9C74F 30%, #F3722C 70%, rgba(243,114,44,0) 100%)",
            borderRadius: "40% 40% 50% 50%",
            opacity: 0.9,
          }}
          animate={{
            scaleX: [1, 0.85, 1.2, 0.9, 1],
            scaleY: [1, 1.15, 0.88, 1.1, 1],
            opacity: [0.9, 0.75, 0.95, 0.7, 0.9],
          }}
          transition={{ duration: 0.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner flame — white/blue hot core */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: -2,
            transform: "translateX(-50%)",
            width: 10,
            height: 28,
            background: "linear-gradient(to bottom, #FFFFFF 0%, #E0F0FF 30%, #FFD166 70%, rgba(255,209,102,0) 100%)",
            borderRadius: "40% 40% 50% 50%",
            opacity: 0.95,
          }}
          animate={{
            scaleX: [1, 1.2, 0.8, 1.15, 1],
            scaleY: [1, 0.9, 1.15, 0.85, 1],
            opacity: [0.95, 0.8, 1, 0.85, 0.95],
          }}
          transition={{ duration: 0.15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Spark particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`spark-${i}`}
            style={{
              position: "absolute",
              left: `${40 + (i - 2) * 8}%`,
              top: 30 + i * 6,
              width: 2,
              height: 2,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? "#FFD166" : "#FF6B35",
            }}
            animate={{
              y: [0, 15 + i * 4, 30 + i * 3],
              x: [(i - 2) * 2, (i - 2) * 5, (i - 2) * 8],
              opacity: [0.9, 0.5, 0],
              scale: [1, 0.7, 0.3],
            }}
            transition={{
              duration: 0.4 + i * 0.08,
              repeat: Infinity,
              delay: i * 0.07,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default DartThrowAnimation;
