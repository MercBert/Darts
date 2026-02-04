"use client";

import React, { useState } from "react";
import type { Difficulty, DartsResult, DartsSessionStats } from "@/types";
import type { Game } from "@/lib/games";
import { DIFFICULTY_LEVELS, BOARD_CONFIG } from "@/config/darts-config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BetAmountInput from "@/components/BetAmountInput";
import { CustomSlider } from "@/components/CustomSlider";

/* ------------------------------------------------------------------ */
/*  Difficulty Selector                                                */
/* ------------------------------------------------------------------ */

function DifficultySelector({
  difficulty,
  setDifficulty,
  themeColor,
  disabled,
}: {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  themeColor: string;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#91989C] mb-2 block">
        Difficulty
      </label>
      <div className="flex rounded-lg overflow-hidden border border-[#2A3640]">
        {DIFFICULTY_LEVELS.map((d) => (
          <button
            key={d}
            onClick={() => !disabled && setDifficulty(d)}
            disabled={disabled}
            className={`
              flex-1 py-2 text-sm font-bold transition-all capitalize
              ${difficulty === d
                ? "text-black shadow-inner"
                : "bg-[#1E2A35] text-[#91989C] hover:bg-[#2A3640]"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            style={difficulty === d ? { backgroundColor: themeColor } : undefined}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

const MAX_DARTS = 50;
const DARTS_PRESETS = [1, 5, 10, 25, 50];

/* ------------------------------------------------------------------ */
/*  Auto-Throw Toggle                                                  */
/* ------------------------------------------------------------------ */

function AutoThrowToggle({
  enabled,
  setEnabled,
  themeColor,
  disabled,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  themeColor: string;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-[#91989C]">Auto Throw</label>
      <button
        onClick={() => !disabled && setEnabled(!enabled)}
        disabled={disabled}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        style={{ backgroundColor: enabled ? themeColor : "#2A3640" }}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
            ${enabled ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatMultiplier(value: number): string {
  if (value >= 100) return `${Math.round(value)}x`;
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}x`;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DartsSetupCardProps {
  game: Game;
  onPlay: () => void;
  onReset: () => void;
  onPlayAgain: () => void;
  onAutoStart: (count: number) => void;
  onAutoStop: () => void;
  currentView: 0 | 1 | 2;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  dartsPerRound: number;
  setDartsPerRound: (n: number) => void;
  lastResult: DartsResult | null;
  isLoading: boolean;
  walletBalance: number;
  stats: DartsSessionStats;
  currentDartIndex: number;
  totalDartsInRound: number;
  autoThrowing: boolean;
  remainingRounds: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const DartsSetupCard: React.FC<DartsSetupCardProps> = ({
  game,
  onPlay,
  onReset,
  onPlayAgain,
  onAutoStart,
  onAutoStop,
  currentView,
  betAmount,
  setBetAmount,
  difficulty,
  setDifficulty,
  dartsPerRound,
  setDartsPerRound,
  lastResult,
  isLoading,
  walletBalance,
  stats,
  currentDartIndex,
  totalDartsInRound,
  autoThrowing,
  remainingRounds,
}) => {
  const themeColor = game.themeColorBackground || "#22C55E";
  const maxMultiplier = BOARD_CONFIG[difficulty].bullseyeMult;
  const totalBet = betAmount;
  const betPerDart = dartsPerRound > 0 ? betAmount / dartsPerRound : betAmount;

  const [autoEnabled, setAutoEnabled] = useState(false);

  const isActive = currentView !== 0 || autoThrowing;

  const handleThrow = () => {
    if (autoEnabled && !autoThrowing) {
      onAutoStart(Number.MAX_SAFE_INTEGER);
    } else {
      onPlay();
    }
  };

  const throwLabel = autoThrowing
    ? "Stop Auto Throw"
    : currentView === 1
      ? `Throwing ${currentDartIndex}/${totalDartsInRound}...`
      : autoEnabled
        ? "Auto Throw 🎯"
        : dartsPerRound > 1
          ? `Throw ${dartsPerRound} Darts 🎯`
          : "Throw 🎯";

  return (
    <Card className="lg:basis-1/3 p-4 sm:p-6 flex flex-col">
      {/* ── View 0: Setup ─────────────────────────────── */}
      {currentView === 0 && !autoThrowing && (
        <CardContent className="font-roboto flex flex-col grow">
          {/* Play button — mobile top */}
          <Button
            onClick={handleThrow}
            className="lg:hidden w-full mb-5"
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
            disabled={totalBet <= 0 || totalBet > walletBalance}
          >
            {throwLabel}
          </Button>

          {/* Bet Amount */}
          <BetAmountInput
            min={0}
            max={walletBalance}
            step={0.1}
            value={betAmount}
            onChange={setBetAmount}
            balance={walletBalance}
            usdMode={false}
            setUsdMode={() => {}}
            disabled={isActive}
            themeColorBackground={themeColor}
          />

          {/* Difficulty */}
          <div className="mt-5">
            <DifficultySelector
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              themeColor={themeColor}
              disabled={isActive}
            />
          </div>

          {/* Darts Per Round */}
          <div className="mt-5">
            <CustomSlider
              label="Darts Per Round"
              min={1}
              max={MAX_DARTS}
              step={1}
              value={dartsPerRound}
              onChange={setDartsPerRound}
              presets={DARTS_PRESETS}
              themeColor={themeColor}
              disabled={isActive}
            />
          </div>

          {/* Auto Throw */}
          <div className="mt-5">
            <AutoThrowToggle
              enabled={autoEnabled}
              setEnabled={setAutoEnabled}
              themeColor={themeColor}
              disabled={isActive}
            />
          </div>

          {/* Spacer */}
          <div className="grow" />

          {/* Summary */}
          <div className="w-full flex flex-col gap-2 font-medium text-xs text-[#91989C] mt-5">
            <div className="w-full flex justify-between items-center">
              <p>Difficulty</p>
              <p className="capitalize">{difficulty}</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Darts</p>
              <p>{dartsPerRound}</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Bet Per Dart</p>
              <p>{betPerDart.toFixed(3)} APE</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Total Bet</p>
              <p>{totalBet.toFixed(2)} APE</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Max Win (Bullseye)</p>
              <p>{formatMultiplier(maxMultiplier)}</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Wallet Balance</p>
              <p>{walletBalance.toFixed(2)} APE</p>
            </div>
          </div>

          {/* Play button — desktop bottom */}
          <Button
            onClick={handleThrow}
            className="hidden lg:flex w-full mt-5"
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
            disabled={totalBet <= 0 || totalBet > walletBalance}
          >
            {throwLabel}
          </Button>
        </CardContent>
      )}

      {/* ── View 1: Throwing ──────────────────────────── */}
      {(currentView === 1 || autoThrowing) && (
        <CardContent className="font-roboto flex flex-col gap-4 grow">
          <div className="text-center">
            <p className="text-lg font-medium text-[#91989C]">
              {autoThrowing ? "Auto Throwing..." : "Throwing..."}
            </p>
            <p className="mt-1 font-semibold text-2xl" style={{ color: themeColor }}>
              {totalDartsInRound > 1
                ? `Dart ${Math.min(currentDartIndex + 1, totalDartsInRound)} / ${totalDartsInRound}`
                : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
              }
            </p>
          </div>

          <div className="grow" />

          <div className="w-full flex flex-col gap-2 font-medium text-xs text-[#91989C]">
            <div className="w-full flex justify-between items-center">
              <p>Bet Per Dart</p>
              <p>{betPerDart.toFixed(3)} APE</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Total Bet</p>
              <p>{totalBet.toFixed(2)} APE</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Darts</p>
              <p>{currentDartIndex} / {totalDartsInRound}</p>
            </div>
          </div>

          {autoThrowing && (
            <Button
              onClick={onAutoStop}
              className="w-full mt-5"
              variant="destructive"
            >
              Stop Auto Throw
            </Button>
          )}
        </CardContent>
      )}

      {/* ── View 2: Result ────────────────────────────── */}
      {currentView === 2 && !autoThrowing && (
        <CardContent className="font-roboto flex flex-col grow">
          {/* Result */}
          <div className="text-center">
            <p
              className="text-3xl font-bold"
              style={{ color: lastResult?.isWin ? "#22c55e" : "#ef4444" }}
            >
              {lastResult?.isWin ? "WIN! 🎯" : "LOSS 💨"}
            </p>
            {lastResult && (
              <>
                {lastResult.isWin ? (
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    +{(lastResult.payout - lastResult.betAmount).toFixed(2)} APE
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    -{(lastResult.betAmount - lastResult.payout).toFixed(2)} APE
                  </p>
                )}
                {totalDartsInRound > 1 && (
                  <p className="text-sm text-[#91989C] mt-1">
                    {totalDartsInRound} darts thrown
                  </p>
                )}
              </>
            )}
          </div>

          {/* Spacer */}
          <div className="grow" />

          {/* Session stats */}
          <div className="w-full flex flex-col gap-2 font-medium text-xs text-[#91989C]">
            <div className="w-full flex justify-between items-center">
              <p>Rounds</p>
              <p>{stats.totalRounds}</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>W / L</p>
              <p>{stats.wins} / {stats.losses}</p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Net P&L</p>
              <p style={{ color: stats.netPnL >= 0 ? "#22c55e" : "#ef4444" }}>
                {stats.netPnL >= 0 ? "+" : ""}{stats.netPnL.toFixed(2)} APE
              </p>
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Wallet Balance</p>
              <p>{walletBalance.toFixed(2)} APE</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-5">
            <Button
              onClick={onPlayAgain}
              className="w-full"
              style={{ backgroundColor: themeColor, borderColor: themeColor }}
            >
              Play Again 🎯
            </Button>
            <Button onClick={onReset} className="w-full" variant="secondary">
              Change Settings
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DartsSetupCard;
