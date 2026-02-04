"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  Difficulty,
  GameState,
  DartsResult,
  DartMarkerData,
  DartsSessionStats,
  Ring4Segment,
} from "@/types";
import { playRound, resolveContractIndexes, getRing4Segments } from "@/engine/DartsEngine";
import { DEFAULTS, BOARD, BOARD_CONFIG } from "@/config/darts-config";

const initialStats: DartsSessionStats = {
  totalRounds: 0,
  wins: 0,
  losses: 0,
  netPnL: 0,
  biggestWin: 0,
  biggestMultiplier: 0,
};

const ANGLE_OFFSET = -90;
const DEG_TO_RAD = Math.PI / 180;
const VIEW = BOARD.viewBox;
const CX = VIEW / 2;
const CY = VIEW / 2;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg + ANGLE_OFFSET) * DEG_TO_RAD;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Pending throw data for the animation overlay */
export interface PendingThrow {
  /** Target position as % of the board container (0-100) */
  targetX: number;
  targetY: number;
  color: string;
  /** The pre-computed round result, placed on board after animation */
  roundResult: {
    dartsResult: DartsResult;
    dartMarker: DartMarkerData;
    ring4Segments: Ring4Segment[];
  };
  dartIdx: number;
  totalDarts: number;
}

export function useDartsGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [difficulty, setDifficultyState] = useState<Difficulty>(DEFAULTS.difficulty);
  const [betAmount, setBetAmount] = useState<number>(DEFAULTS.betAmount);
  const [balance, setBalance] = useState<number>(DEFAULTS.balance);
  const [dartsPerRound, setDartsPerRound] = useState<number>(1);
  const [lastResult, setLastResult] = useState<DartsResult | null>(null);
  const [sessionStats, setSessionStats] = useState<DartsSessionStats>(initialStats);
  const [dartMarkers, setDartMarkers] = useState<DartMarkerData[]>([]);
  const [ring4Segments, setRing4Segments] = useState<Ring4Segment[]>(() =>
    getRing4Segments(DEFAULTS.difficulty)
  );
  const [resultHistory, setResultHistory] = useState<{ multiplier: number; color: string }[]>([]);

  // Multi-dart state
  const [currentDartIndex, setCurrentDartIndex] = useState(0);
  const [totalDartsInRound, setTotalDartsInRound] = useState(0);
  const [roundTotalPayout, setRoundTotalPayout] = useState(0);

  // Pending throw for the animation
  const [pendingThrow, setPendingThrow] = useState<PendingThrow | null>(null);

  const throwTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceRef = useRef(false);
  // Track total bet for finalization
  const roundBetRef = useRef(0);
  // Queue of pre-computed throws for the current round
  const throwQueueRef = useRef<PendingThrow[]>([]);

  const setDifficulty = useCallback((d: Difficulty) => {
    setDifficultyState(d);
    setRing4Segments(getRing4Segments(d));
    setDartMarkers([]);
    setResultHistory([]);
  }, []);

  /**
   * Convert a dart's board-SVG position to a % position within the board container.
   * The SVG viewBox is VIEW×VIEW with the board centered, so the SVG position
   * maps directly to a percentage of the container.
   */
  const dartToContainerPercent = useCallback(
    (marker: DartMarkerData): { px: number; py: number } => {
      let cx: number, cy: number;
      if (marker.isBullseye) {
        const offset = Math.random() * 4;
        const oAngle = Math.random() * 360;
        const p = polar(CX, CY, offset, oAngle);
        cx = p.x;
        cy = p.y;
      } else {
        const p = polar(CX, CY, marker.radius, marker.angle);
        cx = p.x;
        cy = p.y;
      }
      // Map SVG coords (0-VIEW) to percentage (0-100)
      // Account for the padding in the board container (~p-6 to p-12)
      // The SVG fills the inner area, and the board is centered with padding.
      // The overlay covers the entire game window including padding,
      // but the board SVG sits inside with padding. We need to account for that.
      // Since the board container has padding (~12% on each side roughly),
      // and the SVG fills the padded area, we map to the padded region.
      // However, the animation overlay covers the FULL game window,
      // so we just map to the SVG percentage within the padded area.
      // The board padding means the SVG area starts at roughly 12% and ends at 88%.
      // Let's use a simple approach: map SVG position to the full container
      // with an offset for padding.
      const padFrac = 0.12; // approximate padding fraction
      const px = padFrac * 100 + (cx / VIEW) * (1 - 2 * padFrac) * 100;
      const py = padFrac * 100 + (cy / VIEW) * (1 - 2 * padFrac) * 100;
      return { px, py };
    },
    []
  );

  /** Place a dart marker on the board (called after animation completes) */
  const placeDartMarker = useCallback(
    (pending: PendingThrow) => {
      const { roundResult, dartIdx, totalDarts } = pending;
      const { dartsResult, dartMarker, ring4Segments: newSegments } = roundResult;

      setDartMarkers((prev) => {
        const updated = prev.map((m) => ({ ...m, isLatest: false }));
        updated.push(dartMarker);
        if (updated.length > BOARD.maxVisibleDarts) {
          return updated.slice(updated.length - BOARD.maxVisibleDarts);
        }
        return updated;
      });

      setRing4Segments(newSegments);
      setRoundTotalPayout((prev) => prev + dartsResult.payout);

      setResultHistory((prev) => {
        const entry = {
          multiplier: dartsResult.multiplier,
          color: dartsResult.color,
        };
        return [entry, ...prev].slice(0, 4);
      });

      setLastResult(dartsResult);
      setCurrentDartIndex(dartIdx + 1);
    },
    []
  );

  /** Called when a throw animation finishes — place the marker then continue */
  const onThrowAnimationComplete = useCallback(() => {
    const pending = throwQueueRef.current[0];
    if (!pending) return;

    // Remove from queue
    throwQueueRef.current = throwQueueRef.current.slice(1);

    // Place marker on board
    placeDartMarker(pending);

    // Clear pending throw display
    setPendingThrow(null);

    // Continue with next dart or finalize
    if (throwQueueRef.current.length > 0) {
      // Small gap between darts
      const gap = throwQueueRef.current.length > 5 ? 80 : 120;
      throwTimerRef.current = setTimeout(() => {
        if (!sequenceRef.current) return;
        setPendingThrow(throwQueueRef.current[0]);
      }, gap);
    } else {
      // All darts placed — finalize
      throwTimerRef.current = setTimeout(() => {
        finalizeRound();
      }, 200);
    }
  }, [placeDartMarker]);

  const finalizeRound = useCallback(() => {
    const totalBet = roundBetRef.current;
    setRoundTotalPayout((currentPayout) => {
      setBalance((prev) => prev + currentPayout);

      const profit = currentPayout - totalBet;

      setLastResult((lastRes) => {
        setSessionStats((prev) => ({
          totalRounds: prev.totalRounds + 1,
          wins: prev.wins + (currentPayout >= totalBet ? 1 : 0),
          losses: prev.losses + (currentPayout < totalBet ? 1 : 0),
          netPnL: prev.netPnL + profit,
          biggestWin: profit > 0 ? Math.max(prev.biggestWin, profit) : prev.biggestWin,
          biggestMultiplier: Math.max(prev.biggestMultiplier, lastRes?.multiplier ?? 0),
        }));

        if (lastRes) {
          return {
            ...lastRes,
            payout: currentPayout,
            betAmount: totalBet,
            isWin: currentPayout >= totalBet,
          };
        }
        return lastRes;
      });

      return currentPayout;
    });

    setGameState("result");
    sequenceRef.current = false;
  }, []);

  // ============================================================
  // TODO: Implement — Replace this dummy data with on-chain contract result.
  // The contract returns an array of zone indexes (one per dart):
  //   0 = Bullseye, 1 = Purple, 2 = Blue, 3 = Yellow, 4 = Pink, 5 = Mint
  // Example: [1, 1, 3, 1, 5] means 3 purple, 1 yellow, 1 mint.
  // Set to null before the contract responds, then populate with the array.
  // ============================================================
  const [contractResultIndexes, setContractResultIndexes] = useState<number[] | null>(null);

  /**
   * Generate dummy contract result (simulates what the contract will return).
   * Replace this function body with actual contract call when ready.
   */
  const fetchContractResult = useCallback((numDarts: number, diff: Difficulty): number[] => {
    // TODO: Implement — Replace with actual contract call.
    // This generates random indexes weighted by zone probabilities to simulate the contract.
    const board = BOARD_CONFIG[diff];
    const totalArea = board.r5 * board.r5;
    const bullProb = (board.bullseyeR * board.bullseyeR) / totalArea;
    const ring2Prob = (board.r2 * board.r2 - board.bullseyeR * board.bullseyeR) / totalArea;
    const ring3Prob = (board.r3 * board.r3 - board.r2 * board.r2) / totalArea;
    const ring4Prob = (board.r4 * board.r4 - board.r3 * board.r3) / totalArea;
    // ring5 = remainder

    // Ring4 sub-probabilities by segment count
    const yellowFrac = board.yellowCount / board.totalSegments;
    const pinkFrac = board.pinkCount / board.totalSegments;
    const mintFrac = board.mintCount / board.totalSegments;

    // Combined purple = ring2 + ring5
    const purpleProb = ring2Prob + (1 - bullProb - ring2Prob - ring3Prob - ring4Prob);

    const cumulative = [
      bullProb,
      bullProb + purpleProb,
      bullProb + purpleProb + ring3Prob,
      bullProb + purpleProb + ring3Prob + ring4Prob * yellowFrac,
      bullProb + purpleProb + ring3Prob + ring4Prob * yellowFrac + ring4Prob * pinkFrac,
      1.0, // mint fills the rest
    ];

    const results: number[] = [];
    for (let i = 0; i < numDarts; i++) {
      const r = Math.random();
      let idx = 0;
      for (let j = 0; j < cumulative.length; j++) {
        if (r < cumulative[j]) { idx = j; break; }
      }
      results.push(idx);
    }
    return results;
  }, []);

  // When contractResultIndexes is populated, convert to visual results and start animation
  useEffect(() => {
    if (!contractResultIndexes || gameState !== "throwing") return;

    const totalBet = roundBetRef.current;
    const betPerDart = totalBet / contractResultIndexes.length;

    // Convert contract indexes to visual dart results
    const roundResults = resolveContractIndexes(contractResultIndexes, betPerDart, difficulty);

    const queue: PendingThrow[] = roundResults.map((roundResult, i) => {
      const { px, py } = dartToContainerPercent(roundResult.dartMarker);
      return {
        targetX: px,
        targetY: py,
        color: roundResult.dartsResult.color,
        roundResult,
        dartIdx: i,
        totalDarts: contractResultIndexes.length,
      };
    });
    throwQueueRef.current = queue;

    // Clear the indexes (consumed)
    setContractResultIndexes(null);

    // Kick off first dart animation
    throwTimerRef.current = setTimeout(() => {
      if (!sequenceRef.current) return;
      setPendingThrow(queue[0]);
    }, 150);
  }, [contractResultIndexes, gameState, difficulty, dartToContainerPercent]);

  // Main play function — starts loading, then waits for contract result
  const play = useCallback(() => {
    if (gameState !== "idle") return;
    const totalBet = betAmount;
    if (totalBet <= 0 || totalBet > balance) return;

    // Deduct full bet upfront
    setBalance((prev) => prev - totalBet);
    roundBetRef.current = totalBet;
    setRoundTotalPayout(0);
    setCurrentDartIndex(0);
    setTotalDartsInRound(dartsPerRound);
    setGameState("throwing");
    sequenceRef.current = true;

    // TODO: Implement — Replace this with the actual contract call.
    // When the contract responds, call setContractResultIndexes(resultArray).
    // The useEffect above will pick it up and start the dart animation.
    const dummyResult = fetchContractResult(dartsPerRound, difficulty);

    // Simulate network delay (remove when using real contract)
    setTimeout(() => {
      setContractResultIndexes(dummyResult);
    }, 500);
  }, [gameState, betAmount, balance, difficulty, dartsPerRound, fetchContractResult]);

  const resetGame = useCallback(() => {
    sequenceRef.current = false;
    if (throwTimerRef.current) {
      clearTimeout(throwTimerRef.current);
      throwTimerRef.current = null;
    }
    throwQueueRef.current = [];
    setPendingThrow(null);
    setGameState("idle");
    setLastResult(null);
    setDartMarkers([]);
    setCurrentDartIndex(0);
    setTotalDartsInRound(0);
  }, []);

  const playAgain = useCallback(() => {
    sequenceRef.current = false;
    throwQueueRef.current = [];
    setPendingThrow(null);
    setGameState("idle");
    setLastResult(null);
    setCurrentDartIndex(0);
    setTotalDartsInRound(0);
  }, []);

  useEffect(() => {
    return () => {
      sequenceRef.current = false;
      if (throwTimerRef.current) clearTimeout(throwTimerRef.current);
    };
  }, []);

  return {
    gameState,
    difficulty,
    setDifficulty,
    betAmount,
    setBetAmount,
    balance,
    dartsPerRound,
    setDartsPerRound,
    lastResult,
    sessionStats,
    dartMarkers,
    ring4Segments,
    resultHistory,
    currentDartIndex,
    totalDartsInRound,
    pendingThrow,
    onThrowAnimationComplete,
    play,
    resetGame,
    playAgain,
  };
}
