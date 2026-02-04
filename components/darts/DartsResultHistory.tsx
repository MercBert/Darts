"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultEntry {
  multiplier: number;
  color: string;
}

interface DartsResultHistoryProps {
  results: ResultEntry[];
}

const MAX_VISIBLE = 4;

function formatMultiplier(value: number): string {
  const s = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${s}×`;
}

const DartsResultHistory: React.FC<DartsResultHistoryProps> = ({ results }) => {
  if (results.length === 0) return null;

  const visible = results.slice(0, MAX_VISIBLE);

  return (
    <div className="absolute right-3 sm:right-4 top-0 bottom-12 flex items-center z-10 pointer-events-none">
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((entry, idx) => {
            const isWin = entry.multiplier >= 1.0;
            // Unique key: use history position offset so keys shift as new items arrive
            const key = `result-${results.length - idx}`;

            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.7 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  layout: { type: "spring", stiffness: 400, damping: 30 },
                }}
              >
                <div
                  className="flex items-center justify-center rounded-md font-bold tabular-nums text-xs sm:text-sm min-w-[48px] sm:min-w-[54px] px-2 py-1.5 drop-shadow-md"
                  style={{ backgroundColor: entry.color, color: "#FFFFFF" }}
                >
                  {formatMultiplier(entry.multiplier)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DartsResultHistory;
