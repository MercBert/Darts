/**
 * SegmentGenerator
 * 
 * Builds ring 4 segments from the interleaved layout config.
 * All segments are equal angular width.
 */

import type { Difficulty, Ring4Segment } from '@/types';
import { BOARD_CONFIG, RING4_LAYOUT, TIER_COLORS } from '@/config/darts-config';

/** Map ring4 color index (0=yellow, 1=pink, 2=mint) to tier color index */
const RING4_TO_TIER: Record<number, number> = { 0: 2, 1: 3, 2: 4 };

/**
 * Generate ring 4 segments for a difficulty.
 */
export function generateRing4Segments(difficulty: Difficulty): Ring4Segment[] {
    const board = BOARD_CONFIG[difficulty];
    const layout = RING4_LAYOUT[difficulty];
    const degreesPerSeg = 360 / board.totalSegments;

    const multipliers = [board.yellowMult, board.pinkMult, board.mintMult];

    return layout.map((colorIndex, i) => {
        const tierIdx = RING4_TO_TIER[colorIndex];
        return {
            id: i,
            colorIndex,
            startAngle: i * degreesPerSeg,
            endAngle: (i + 1) * degreesPerSeg,
            color: TIER_COLORS[tierIdx].color,
            multiplier: multipliers[colorIndex],
        };
    });
}

/**
 * Find which ring4 segment an angle falls into.
 */
export function findRing4SegmentAtAngle(
    segments: Ring4Segment[],
    angle: number,
    totalSegments: number
): Ring4Segment {
    const normalized = ((angle % 360) + 360) % 360;
    const degreesPerSeg = 360 / totalSegments;
    const index = Math.min(
        Math.floor(normalized / degreesPerSeg),
        segments.length - 1
    );
    return segments[index];
}
