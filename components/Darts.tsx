"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { bytesToHex } from "viem";
import type { Game } from "@/lib/games";
import { randomBytes } from "@/lib/games";
import type { HitZone } from "@/types";
import { useDartsGame } from "@/hooks/useDartsGame";
import { useAutoThrow } from "@/hooks/useAutoThrow";
import GameResultsModal from "@/components/GameResultsModal";
import DartsBoard from "@/components/darts/DartsBoard";
import DartsMultiplierLegend from "@/components/darts/DartsMultiplierLegend";
import DartsResultHistory from "@/components/darts/DartsResultHistory";
import DartsSetupCard from "@/components/darts/DartsSetupCard";
import DartThrowAnimation from "@/components/darts/DartThrowAnimation";
import dynamic from "next/dynamic";
const ParticleBackground = dynamic(
  () => import("@/components/darts/ParticleBackground"),
  { ssr: false }
);

interface DartsProps {
  game: Game;
}

const Darts: React.FC<DartsProps> = ({ game }) => {
  const {
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
  } = useDartsGame();

  const [currentView, setCurrentView] = useState<0 | 1 | 2>(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<bigint>(
    BigInt(bytesToHex(new Uint8Array(randomBytes(32))))
  );

  const isThrowing = gameState === "throwing";
  const betPerRound = betAmount;
  const playRef = useRef(play);
  playRef.current = play;

  // Auto-throw hook
  const {
    autoThrowing,
    remainingRounds,
    startAutoThrow,
    stopAutoThrow,
  } = useAutoThrow({
    throwDarts: useCallback(() => {
      setGameOver(false);
      setCurrentGameId(BigInt(bytesToHex(new Uint8Array(randomBytes(32)))));
      playAgain();
      setTimeout(() => play(), 100);
    }, [play, playAgain]),
    isThrowing,
    balance,
    betPerRound,
  });

  useEffect(() => {
    switch (gameState) {
      case "idle":
        if (!autoThrowing) setCurrentView(0);
        break;
      case "throwing":
        setCurrentView(1);
        break;
      case "result":
        setCurrentView(2);
        if (!autoThrowing) setGameOver(true);
        break;
    }
  }, [gameState, autoThrowing]);

  const handlePlay = useCallback(() => {
    setGameOver(false);
    setCurrentGameId(BigInt(bytesToHex(new Uint8Array(randomBytes(32)))));
    play();
  }, [play]);

  const handleReset = useCallback(() => {
    stopAutoThrow();
    setGameOver(false);
    setCurrentGameId(BigInt(bytesToHex(new Uint8Array(randomBytes(32)))));
    resetGame();
  }, [resetGame, stopAutoThrow]);

  const handlePlayAgain = useCallback(() => {
    setGameOver(false);
    setCurrentGameId(BigInt(bytesToHex(new Uint8Array(randomBytes(32)))));
    playAgain();
    // Use ref to get the latest play() after state settles
    setTimeout(() => playRef.current(), 150);
  }, [playAgain]);

  const handleAutoStart = useCallback((count: number) => {
    setGameOver(false);
    setCurrentGameId(BigInt(bytesToHex(new Uint8Array(randomBytes(32)))));
    startAutoThrow(count);
  }, [startAutoThrow]);

  const activeZone: HitZone | null = lastResult ? lastResult.hitZone : null;
  const payout = lastResult ? lastResult.payout : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-10">
      {/* Game Window */}
      <div className="lg:basis-2/3 w-full rounded-[12px] border-[2.25px] sm:border-[3.75px] lg:border-[4.68px] border-[#2A3640] relative overflow-hidden bg-[#11171b]">

        {/* Particle field + glow background */}
        <ParticleBackground />

        {gameOver && lastResult && !autoThrowing && (
          <GameResultsModal
            key={currentGameId.toString()}
            isOpen={gameOver}
            payout={payout}
            betAmount={lastResult.betAmount}
            usdMode={false}
            apePrice={1}
            isLoading={false}
            gameTitle={game.title}
            onReset={handleReset}
            onPlayAgain={handlePlayAgain}
            playAgainButtonText="Play Again"
            showPlayAgainOption={true}
            showRewatchOption={false}
            showPNL={lastResult.isWin}
          />
        )}

        {/* Board */}
        <div className="w-full aspect-square flex items-center justify-center relative z-10 p-6 sm:p-10 lg:p-12">
          <DartsBoard
            difficulty={difficulty}
            ring4Segments={ring4Segments}
            dartMarkers={dartMarkers}
          />

          {/* Dart throw animation overlay — inside the board area */}
          <DartThrowAnimation
            isActive={!!pendingThrow}
            targetX={pendingThrow?.targetX ?? 50}
            targetY={pendingThrow?.targetY ?? 50}
            color={pendingThrow?.color ?? "#ffffff"}
            onComplete={onThrowAnimationComplete}
          />
        </div>

        {/* Result History */}
        <DartsResultHistory results={resultHistory} />

        {/* Multiplier Legend */}
        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-10">
          <DartsMultiplierLegend
            difficulty={difficulty}
            activeZone={activeZone}
          />
        </div>
      </div>

      {/* Setup Card */}
      <DartsSetupCard
        game={game}
        onPlay={handlePlay}
        onReset={handleReset}
        onPlayAgain={handlePlayAgain}
        onAutoStart={handleAutoStart}
        onAutoStop={stopAutoThrow}
        currentView={currentView}
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        dartsPerRound={dartsPerRound}
        setDartsPerRound={setDartsPerRound}
        lastResult={lastResult}
        isLoading={false}
        walletBalance={balance}
        stats={sessionStats}
        currentDartIndex={currentDartIndex}
        totalDartsInRound={totalDartsInRound}
        autoThrowing={autoThrowing}
        remainingRounds={remainingRounds}
      />
    </div>
  );
};

export default Darts;
