'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoThrowArgs {
  throwDarts: () => void;
  isThrowing: boolean;
  balance: number;
  betPerRound: number;
  paused?: boolean;
}

interface UseAutoThrowReturn {
  autoThrowing: boolean;
  autoThrowCount: number;
  remainingRounds: number;
  startAutoThrow: (count: number) => void;
  stopAutoThrow: () => void;
}

export const AUTO_THROW_OPTIONS = [10, 25, 50] as const;

export function useAutoThrow({
  throwDarts,
  isThrowing,
  balance,
  betPerRound,
  paused = false,
}: UseAutoThrowArgs): UseAutoThrowReturn {
  const [autoThrowing, setAutoThrowing] = useState(false);
  const [autoThrowCount, setAutoThrowCount] = useState(0);
  const [remainingRounds, setRemainingRounds] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAutoThrow = useCallback(() => {
    setAutoThrowing(false);
    setAutoThrowCount(0);
    setRemainingRounds(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startAutoThrow = useCallback(
    (count: number) => {
      setAutoThrowing(true);
      setAutoThrowCount(count);
      setRemainingRounds(count);
      throwDarts();
    },
    [throwDarts],
  );

  // Chain rounds: when a throw cycle finishes and auto is active, queue next
  useEffect(() => {
    if (!autoThrowing) return;
    if (isThrowing) return;
    if (paused) return;

    if (remainingRounds <= 1 || balance < betPerRound) {
      stopAutoThrow();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setRemainingRounds((prev) => prev - 1);
      throwDarts();
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isThrowing, autoThrowing, paused, remainingRounds, balance, betPerRound, throwDarts, stopAutoThrow]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    autoThrowing,
    autoThrowCount,
    remainingRounds,
    startAutoThrow,
    stopAutoThrow,
  };
}
