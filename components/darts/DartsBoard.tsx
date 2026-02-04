"use client";

import React, { useMemo } from "react";
import type { Ring4Segment, DartMarkerData, Difficulty } from "@/types";
import DartMarker from "./DartMarker";
import DartPayouts from "./DartPayout";
import { BOARD_CONFIG, BULLSEYE_COLOR, TIER_COLORS, FRAME, BOARD } from "@/config/darts-config";

interface DartsBoardProps {
  difficulty: Difficulty;
  ring4Segments: Ring4Segment[];
  dartMarkers: DartMarkerData[];
}

const DEG_TO_RAD = Math.PI / 180;
const ANGLE_OFFSET = -90; // 0° at 12 o'clock
const VIEW = BOARD.viewBox;
const CX = VIEW / 2;
const CY = VIEW / 2;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg + ANGLE_OFFSET) * DEG_TO_RAD;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startAngle: number, endAngle: number
): string {
  const sweep = endAngle - startAngle;
  const large = sweep > 180 ? 1 : 0;
  const os = polar(cx, cy, outerR, startAngle);
  const oe = polar(cx, cy, outerR, endAngle);
  const is_ = polar(cx, cy, innerR, startAngle);
  const ie = polar(cx, cy, innerR, endAngle);
  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is_.x} ${is_.y}`,
    `Z`,
  ].join(" ");
}

const DartsBoard: React.FC<DartsBoardProps> = ({ difficulty, ring4Segments, dartMarkers }) => {
  const board = BOARD_CONFIG[difficulty];

  const markerPositions = useMemo(() => {
    return dartMarkers.map((m) => {
      if (m.isBullseye) {
        // Slight offset from dead center for visual variety
        const offset = Math.random() * 4;
        const oAngle = Math.random() * 360;
        const p = polar(CX, CY, offset, oAngle);
        return { ...m, cx: p.x, cy: p.y };
      }
      const p = polar(CX, CY, m.radius, m.angle);
      return { ...m, cx: p.x, cy: p.y };
    });
  }, [dartMarkers]);

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="w-full h-full"
      style={{ aspectRatio: "1/1" }}
    >
      <defs>
        <filter id="boardShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <filter id="dartGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fbbf24" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#fff" floodOpacity="0.4" />
        </filter>
        <filter id="bullseyeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={BULLSEYE_COLOR} floodOpacity="0.8" />
        </filter>
        <radialGradient id="frameGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="40%" stopColor="#3a4550" />
          <stop offset="100%" stopColor="#2d3748" />
        </radialGradient>
        <radialGradient id="frameHighlight" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#5a6a78" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3a4550" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Board sits directly on the animated background — no shadow overlay */}

      {/* === Ring 5: outer Slate (loss) — outermost ring === */}
      <circle cx={CX} cy={CY} r={board.r5} fill={TIER_COLORS[0].color} />
      <circle cx={CX} cy={CY} r={board.r5} fill="rgba(0,0,0,0.15)" />

      {/* Thick border around Ring 5 (board edge) */}
      <circle cx={CX} cy={CY} r={board.r5} fill="none" stroke="#1e2a34" strokeWidth={5} />

      {/* === Ring 4: segmented (wins) === */}
      <circle cx={CX} cy={CY} r={board.r4} fill="#1a2332" />
      <g>
        {ring4Segments.map((seg) => (
          <path
            key={seg.id}
            d={arcPath(CX, CY, board.r3, board.r4, seg.startAngle, seg.endAngle)}
            fill={seg.color}
            stroke="#1a2332"
            strokeWidth={1.2}
          />
        ))}
      </g>

      {/* Border between ring4 and ring5 */}
      <circle cx={CX} cy={CY} r={board.r4} fill="none" stroke="#1a2332" strokeWidth={2} />

      {/* === Ring 3: Blue (loss) === */}
      <circle cx={CX} cy={CY} r={board.r3} fill={TIER_COLORS[1].color} />
      <circle cx={CX} cy={CY} r={board.r3} fill="rgba(0,0,0,0.15)" />

      {/* Border between ring3 and ring4 */}
      <circle cx={CX} cy={CY} r={board.r3} fill="none" stroke="#1a2332" strokeWidth={2} />

      {/* === Ring 2: inner Slate (loss) === */}
      <circle cx={CX} cy={CY} r={board.r2} fill={TIER_COLORS[0].color} />
      <circle cx={CX} cy={CY} r={board.r2} fill="rgba(0,0,0,0.15)" />

      {/* Border between ring2 and ring3 */}
      <circle cx={CX} cy={CY} r={board.r2} fill="none" stroke="#1a2332" strokeWidth={1.5} />

      {/* === Bullseye (single solid circle) === */}
      <circle cx={CX} cy={CY} r={board.bullseyeR} fill={BULLSEYE_COLOR} />

      {/* === Dart markers === */}
      <g>
        {markerPositions.map((m) => (
          <DartMarker
            key={m.id}
            x={m.cx}
            y={m.cy}
            isLatest={m.isLatest}
            color={m.color}
          />
        ))}
      </g>

      {/* === Floating payout labels === */}
      <DartPayouts markers={markerPositions} />
    </svg>
  );
};

export default DartsBoard;
