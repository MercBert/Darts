export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameState = 'idle' | 'throwing' | 'result';

/** Ring zones the dart can land on */
export type HitZone = 'bullseye' | 'purple' | 'blue' | 'yellow' | 'pink' | 'mint';

/** A single segment in ring 4 */
export interface Ring4Segment {
    id: number;
    /** 0=yellow, 1=pink, 2=mint */
    colorIndex: number;
    startAngle: number;  // degrees (0 = 12 o'clock)
    endAngle: number;
    color: string;
    multiplier: number;
}

export interface DartsResult {
    hitZone: HitZone;
    angle: number;           // landing angle (0 for bullseye)
    radius: number;          // distance from center
    segment: Ring4Segment | null;  // only if hitZone is yellow/pink/mint
    multiplier: number;
    payout: number;
    isWin: boolean;          // multiplier >= 1.0
    isBullseye: boolean;
    betAmount: number;
    color: string;           // color of the zone hit
}

export interface DartMarkerData {
    id: number;
    angle: number;
    radius: number;          // absolute radius from center
    color: string;
    multiplier: number;
    isLatest: boolean;
    isBullseye: boolean;
    payout: number;          // betPerDart × multiplier
}

export interface DartsSessionStats {
    totalRounds: number;
    wins: number;
    losses: number;
    netPnL: number;
    biggestWin: number;
    biggestMultiplier: number;
}

export interface TierConfig {
    color: string;
    label: string;
}
