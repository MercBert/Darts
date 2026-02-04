/**
 * DartsEngine
 * 
 * Area-based probability model:
 * 1. Random point on the board (proportional to ring area)
 * 2. Determine which ring the dart lands on
 * 3. If ring 4: determine which segment
 * 4. Return result with multiplier and payout
 */

import type { Difficulty, Ring4Segment, DartsResult, DartMarkerData, HitZone } from '@/types';
import { generateRing4Segments, findRing4SegmentAtAngle } from './SegmentGenerator';
import { BOARD_CONFIG, BULLSEYE_COLOR, TIER_COLORS } from '@/config/darts-config';
import type { DifficultyBoard } from '@/config/darts-config';

export interface RoundResult {
    dartsResult: DartsResult;
    dartMarker: DartMarkerData;
    ring4Segments: Ring4Segment[];
}

// Cache ring4 segments per difficulty
const segmentCache = new Map<Difficulty, Ring4Segment[]>();
let dartIdCounter = 0;

export function getRing4Segments(difficulty: Difficulty): Ring4Segment[] {
    if (!segmentCache.has(difficulty)) {
        segmentCache.set(difficulty, generateRing4Segments(difficulty));
    }
    return segmentCache.get(difficulty)!;
}

export function clearSegmentCache(): void {
    segmentCache.clear();
}

/**
 * Calculate ring areas and cumulative probabilities.
 */
function computeZoneProbabilities(board: DifficultyBoard) {
    const totalArea = board.r5 * board.r5; // π cancels out in ratios

    const bullArea = board.bullseyeR * board.bullseyeR;
    const ring2Area = board.r2 * board.r2 - board.bullseyeR * board.bullseyeR;
    const ring3Area = board.r3 * board.r3 - board.r2 * board.r2;
    const ring4Area = board.r4 * board.r4 - board.r3 * board.r3;
    const ring5Area = board.r5 * board.r5 - board.r4 * board.r4;

    // Cumulative thresholds (0 → 1)
    const bullEnd = bullArea / totalArea;
    const ring2End = bullEnd + ring2Area / totalArea;
    const ring3End = ring2End + ring3Area / totalArea;
    const ring4End = ring3End + ring4Area / totalArea;
    // ring5 fills the rest to 1.0

    return { bullEnd, ring2End, ring3End, ring4End, ring4Area, totalArea };
}

/**
 * Pick a random radius within a ring (uniform by area → proportional to r²).
 */
function randomRadiusInRing(innerR: number, outerR: number): number {
    // Uniform by area: r = sqrt(random * (outer² - inner²) + inner²)
    const r2 = Math.random() * (outerR * outerR - innerR * innerR) + innerR * innerR;
    return Math.sqrt(r2);
}

/**
 * CONTRACT INDEX MAPPING
 * 
 * Each difficulty has 6 possible outcome zones:
 *   0 = Bullseye (jackpot)
 *   1 = Purple (loss — rings 2 & 5)
 *   2 = Blue (loss — ring 3)
 *   3 = Yellow (win — ring 4 segments)
 *   4 = Pink (win — ring 4 segments)
 *   5 = Mint (win — ring 4 segments)
 * 
 * The contract returns an array of these indexes (one per dart).
 * This function converts them into visual RoundResults for animation.
 */
export function resolveContractIndexes(
    indexes: number[],
    betPerDart: number,
    difficulty: Difficulty,
): RoundResult[] {
    const board = BOARD_CONFIG[difficulty];
    const ring4Segments = getRing4Segments(difficulty);

    // Map index → { hitZone, multiplier, color, radiusRange, isBullseye }
    const zoneMap: Record<number, {
        hitZone: HitZone;
        multiplier: number;
        color: string;
        innerR: number;
        outerR: number;
        isBullseye: boolean;
        colorIndex?: number; // for ring4 segments (0=yellow, 1=pink, 2=mint)
    }> = {
        0: { hitZone: 'bullseye', multiplier: board.bullseyeMult, color: BULLSEYE_COLOR, innerR: 0, outerR: board.bullseyeR, isBullseye: true },
        1: { hitZone: 'purple', multiplier: board.purpleMult, color: TIER_COLORS[0].color, innerR: board.bullseyeR, outerR: board.r2, isBullseye: false },
        2: { hitZone: 'blue', multiplier: board.blueMult, color: TIER_COLORS[1].color, innerR: board.r2, outerR: board.r3, isBullseye: false },
        3: { hitZone: 'yellow', multiplier: board.yellowMult, color: TIER_COLORS[2].color, innerR: board.r3, outerR: board.r4, isBullseye: false, colorIndex: 0 },
        4: { hitZone: 'pink', multiplier: board.pinkMult, color: TIER_COLORS[3].color, innerR: board.r3, outerR: board.r4, isBullseye: false, colorIndex: 1 },
        5: { hitZone: 'mint', multiplier: board.mintMult, color: TIER_COLORS[4].color, innerR: board.r3, outerR: board.r4, isBullseye: false, colorIndex: 2 },
    };

    return indexes.map((idx) => {
        const zone = zoneMap[idx];
        if (!zone) throw new Error(`Invalid contract index: ${idx}`);

        // Pick a random visual position within the zone
        const r2 = Math.random() * (zone.outerR * zone.outerR - zone.innerR * zone.innerR) + zone.innerR * zone.innerR;
        const radius = Math.sqrt(r2);

        let angle = Math.random() * 360;
        let segment: Ring4Segment | null = null;

        // For ring4 zones, snap angle to a segment of the correct color
        if (zone.colorIndex !== undefined) {
            const matching = ring4Segments.filter(s => s.colorIndex === zone.colorIndex);
            if (matching.length > 0) {
                const seg = matching[Math.floor(Math.random() * matching.length)];
                angle = seg.startAngle + Math.random() * (seg.endAngle - seg.startAngle);
                segment = seg;
            }
        }

        const payout = betPerDart * zone.multiplier;

        const dartsResult: DartsResult = {
            hitZone: zone.hitZone,
            angle: zone.isBullseye ? 0 : angle,
            radius,
            segment,
            multiplier: zone.multiplier,
            payout,
            isWin: zone.multiplier >= 1.0,
            isBullseye: zone.isBullseye,
            betAmount: betPerDart,
            color: zone.color,
        };

        const dartMarker: DartMarkerData = {
            id: ++dartIdCounter,
            angle: zone.isBullseye ? Math.random() * 360 : angle,
            radius,
            color: zone.color,
            multiplier: zone.multiplier,
            isLatest: true,
            isBullseye: zone.isBullseye,
            payout,
        };

        return { dartsResult, dartMarker, ring4Segments };
    });
}

/**
 * Play a round of darts (local random — used for offline/dummy mode).
 */
export function playRound(betAmount: number, difficulty: Difficulty): RoundResult {
    const board = BOARD_CONFIG[difficulty];
    const ring4Segments = getRing4Segments(difficulty);
    const zones = computeZoneProbabilities(board);

    // Roll which zone the dart hits (area-weighted)
    const roll = Math.random();
    const angle = Math.random() * 360;

    let hitZone: HitZone;
    let multiplier: number;
    let radius: number;
    let color: string;
    let segment: Ring4Segment | null = null;
    let isBullseye = false;

    if (roll < zones.bullEnd) {
        // Bullseye!
        hitZone = 'bullseye';
        multiplier = board.bullseyeMult;
        radius = Math.random() * board.bullseyeR;
        color = BULLSEYE_COLOR;
        isBullseye = true;
    } else if (roll < zones.ring2End) {
        // Ring 2 — Purple (inner)
        hitZone = 'purple';
        multiplier = board.purpleMult;
        radius = randomRadiusInRing(board.bullseyeR, board.r2);
        color = TIER_COLORS[0].color;
    } else if (roll < zones.ring3End) {
        // Ring 3 — Blue
        hitZone = 'blue';
        multiplier = board.blueMult;
        radius = randomRadiusInRing(board.r2, board.r3);
        color = TIER_COLORS[1].color;
    } else if (roll < zones.ring4End) {
        // Ring 4 — Segmented (Yellow/Pink/Mint)
        segment = findRing4SegmentAtAngle(ring4Segments, angle, board.totalSegments);
        hitZone = (['yellow', 'pink', 'mint'] as const)[segment.colorIndex];
        multiplier = segment.multiplier;
        radius = randomRadiusInRing(board.r3, board.r4);
        color = segment.color;
    } else {
        // Ring 5 — Purple (outer)
        hitZone = 'purple';
        multiplier = board.purpleMult;
        radius = randomRadiusInRing(board.r4, board.r5);
        color = TIER_COLORS[0].color;
    }

    const payout = betAmount * multiplier;

    const dartsResult: DartsResult = {
        hitZone,
        angle: isBullseye ? 0 : angle,
        radius,
        segment,
        multiplier,
        payout,
        isWin: multiplier >= 1.0,
        isBullseye,
        betAmount,
        color,
    };

    const dartMarker: DartMarkerData = {
        id: ++dartIdCounter,
        angle: isBullseye ? Math.random() * 360 : angle,
        radius,
        color,
        multiplier,
        isLatest: true,
        isBullseye,
        payout,
    };

    return { dartsResult, dartMarker, ring4Segments };
}
