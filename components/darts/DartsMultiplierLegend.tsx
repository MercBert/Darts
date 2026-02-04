"use client";

import React from "react";
import type { Difficulty, HitZone } from "@/types";
import { BOARD_CONFIG, TIER_COLORS, BULLSEYE_COLOR } from "@/config/darts-config";
import { cn } from "@/lib/utils";

interface DartsMultiplierLegendProps {
  difficulty: Difficulty;
  activeZone: HitZone | null;
}

function fmt(v: number): string {
  if (v >= 100) return `${Math.round(v)}×`;
  return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}×`;
}

interface LegendItem {
  key: string;
  label: string;
  color: string;
  multiplier: number;
  zone: HitZone;
}

const DartsMultiplierLegend: React.FC<DartsMultiplierLegendProps> = ({
  difficulty,
  activeZone,
}) => {
  const b = BOARD_CONFIG[difficulty];

  const items: LegendItem[] = [
    { key: 'purple', label: 'purple', color: TIER_COLORS[0].color, multiplier: b.purpleMult, zone: 'purple' },
    { key: 'blue', label: 'blue', color: TIER_COLORS[1].color, multiplier: b.blueMult, zone: 'blue' },
    { key: 'yellow', label: 'yellow', color: TIER_COLORS[2].color, multiplier: b.yellowMult, zone: 'yellow' },
    { key: 'pink', label: 'pink', color: TIER_COLORS[3].color, multiplier: b.pinkMult, zone: 'pink' },
    { key: 'mint', label: 'mint', color: TIER_COLORS[4].color, multiplier: b.mintMult, zone: 'mint' },
    { key: 'bull', label: 'bullseye', color: BULLSEYE_COLOR, multiplier: b.bullseyeMult, zone: 'bullseye' },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-2">
      {items.map((item) => {
        const isActive = activeZone === item.zone;
        return (
          <div
            key={item.key}
            className={cn(
              "flex items-center justify-center rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 transition-all duration-300 min-w-[44px]",
              isActive ? "scale-110 shadow-lg" : "hover:brightness-110"
            )}
            style={{
              backgroundColor: item.color,
              ...(isActive
                ? { boxShadow: `0 0 16px ${item.color}80, 0 0 6px ${item.color}A0` }
                : {}),
            }}
          >
            <span
              className={cn(
                "text-xs sm:text-sm font-bold tabular-nums drop-shadow-md",
                isActive ? "text-white" : "text-white/90"
              )}
            >
              {fmt(item.multiplier)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DartsMultiplierLegend;
