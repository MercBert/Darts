/**
 * Darts Game Configuration
 * 
 * Multi-ring dartboard: solid loss rings + one segmented winning ring + green bullseye.
 * Probability = ring area / total area. Bullseye multiplier solves for 2% house edge.
 * Colors from Blocks game palette.
 */

import type { Difficulty, TierConfig } from '@/types';

export const DIFFICULTY_LEVELS: readonly Difficulty[] = ['easy', 'medium', 'hard', 'expert'] as const;

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */

export const TIER_COLORS: readonly TierConfig[] = [
    { color: '#577590', label: 'slate' },     // loss (rings 2 & 5)
    { color: '#277DA1', label: 'blue' },      // loss (ring 3)
    { color: '#F9C74F', label: 'yellow' },    // small win (ring 4)
    { color: '#F3722C', label: 'orange' },    // medium win (ring 4)
    { color: '#F94144', label: 'red' },       // big win (ring 4)
] as const;

export const BULLSEYE_COLOR = '#90BE6D';

/* ------------------------------------------------------------------ */
/*  Ring layout per difficulty                                         */
/*                                                                     */
/*  Rings (inside → outside):                                          */
/*    bullseye (r=0→bullseyeR)  — green jackpot                       */
/*    ring2    (bullseyeR→r2)   — solid Purple (loss)                  */
/*    ring3    (r2→r3)          — solid Blue (loss)                    */
/*    ring4    (r3→r4)          — segmented (Yellow/Pink/Mint wins)    */
/*    ring5    (r4→r5)          — solid Purple (loss)                  */
/*    border   (r5→frame)       — decorative gray frame                */
/* ------------------------------------------------------------------ */

export interface DifficultyBoard {
    /** Ring boundary radii */
    bullseyeR: number;
    r2: number;   // outer edge ring2 / inner edge ring3
    r3: number;   // outer edge ring3 / inner edge ring4
    r4: number;   // outer edge ring4 / inner edge ring5
    r5: number;   // outer edge ring5 (= scoring boundary)

    /** Multipliers */
    purpleMult: number;    // rings 2 & 5
    blueMult: number;      // ring 3
    yellowMult: number;    // ring 4 segments
    pinkMult: number;      // ring 4 segments
    mintMult: number;      // ring 4 segments
    bullseyeMult: number;  // bullseye

    /** Ring 4 segment counts (must sum to totalSegments) */
    yellowCount: number;
    pinkCount: number;
    mintCount: number;
    totalSegments: number;
}

/**
 * EASY: 18 segments (9Y, 5P, 4M), thick colorful ring
 * 
 * Areas (total = π×168² = π×28224):
 *   Bull: 144/28224 = 0.510%
 *   Ring2 (Purple): 2881/28224 = 10.21%
 *   Ring3 (Blue): 6975/28224 = 24.72%
 *   Ring4 (Segments): 9321/28224 = 33.03%
 *   Ring5 (Purple): 8903/28224 = 31.54%
 * 
 * Purple total: 41.75%, Blue: 24.72%
 * Yellow: 16.52%, Pink: 9.17%, Mint: 7.34%, Bull: 0.51%
 * 
 * EV = 0.4175×0.5 + 0.2472×0.8 + 0.1652×1.2 + 0.0917×1.5 + 0.0734×2.7 + 0.0051×7.7
 *    = 0.2088 + 0.1978 + 0.1982 + 0.1376 + 0.1982 + 0.0393 = 0.9799 ✓ (2.0%)
 */
const EASY_BOARD: DifficultyBoard = {
    bullseyeR: 12, r2: 55, r3: 100, r4: 139, r5: 168,
    purpleMult: 0.5, blueMult: 0.8,
    yellowMult: 1.2, pinkMult: 1.5, mintMult: 2.7,
    bullseyeMult: 7.7,
    yellowCount: 9, pinkCount: 5, mintCount: 4, totalSegments: 18,
};

/**
 * MEDIUM: 18 segments (9Y, 5P, 4M), ring4 ~50% thinner
 * 
 * Areas:
 *   Ring2: 4081/28224 = 14.46%
 *   Ring3: 10175/28224 = 36.05%
 *   Ring4: 5200/28224 = 18.42%
 *   Ring5: 8624/28224 = 30.56%
 * 
 * Purple: 45.02%, Blue: 36.05%
 * Yellow: 9.21%, Pink: 5.12%, Mint: 4.09%, Bull: 0.51%
 * 
 * EV = 0.4502×0.4 + 0.3605×0.6 + 0.0921×1.3 + 0.0512×2.0 + 0.0409×4.0 + 0.0051×39
 *    = 0.1801 + 0.2163 + 0.1197 + 0.1024 + 0.1636 + 0.1989 = 0.9810 ✓ (1.9%)
 */
const MEDIUM_BOARD: DifficultyBoard = {
    bullseyeR: 12, r2: 65, r3: 120, r4: 140, r5: 168,
    purpleMult: 0.4, blueMult: 0.6,
    yellowMult: 1.3, pinkMult: 2.0, mintMult: 4.0,
    bullseyeMult: 39,
    yellowCount: 9, pinkCount: 5, mintCount: 4, totalSegments: 18,
};

/**
 * HARD: 18 segments (9Y, 6P, 3M), ring4 thinner
 * 
 * Areas:
 *   Ring2: 4756/28224 = 16.85%
 *   Ring3: 12000/28224 = 42.52%
 *   Ring4: 4125/28224 = 14.61%
 *   Ring5: 7199/28224 = 25.51%
 * 
 * Purple: 42.36%, Blue: 42.52%
 * Yellow: 7.31%, Pink: 4.87%, Mint: 2.44%, Bull: 0.51%
 * 
 * EV = 0.4236×0.2 + 0.4252×0.5 + 0.0731×1.5 + 0.0487×2.5 + 0.0244×5.0 + 0.0051×65
 *    = 0.0847 + 0.2126 + 0.1097 + 0.1218 + 0.1220 + 0.3315 = 0.9823 ✓ (1.8%)
 */
const HARD_BOARD: DifficultyBoard = {
    bullseyeR: 12, r2: 70, r3: 130, r4: 145, r5: 168,
    purpleMult: 0.2, blueMult: 0.5,
    yellowMult: 1.5, pinkMult: 2.5, mintMult: 5.0,
    bullseyeMult: 65,
    yellowCount: 9, pinkCount: 6, mintCount: 3, totalSegments: 18,
};

/**
 * EXPERT: 12 segments (6Y, 4P, 2M), ring4 thinnest
 * 
 * Areas:
 *   Ring2: 5481/28224 = 19.42%
 *   Ring3: 13419/28224 = 47.55%
 *   Ring4: 2860/28224 = 10.13%
 *   Ring5: 6320/28224 = 22.39%
 * 
 * Purple: 41.81%, Blue: 47.55%
 * Yellow: 5.07%, Pink: 3.38%, Mint: 1.69%, Bull: 0.51%
 * 
 * EV = 0.4181×0.1 + 0.4755×0.3 + 0.0507×1.5 + 0.0338×3.0 + 0.0169×8.0 + 0.0051×95
 *    = 0.0418 + 0.1427 + 0.0761 + 0.1014 + 0.1352 + 0.4845 = 0.9817 ✓ (1.8%)
 */
const EXPERT_BOARD: DifficultyBoard = {
    bullseyeR: 12, r2: 75, r3: 138, r4: 148, r5: 168,
    purpleMult: 0.1, blueMult: 0.3,
    yellowMult: 1.5, pinkMult: 3.0, mintMult: 8.0,
    bullseyeMult: 95,
    yellowCount: 6, pinkCount: 4, mintCount: 2, totalSegments: 12,
};

export const BOARD_CONFIG: Record<Difficulty, DifficultyBoard> = {
    easy: EASY_BOARD,
    medium: MEDIUM_BOARD,
    hard: HARD_BOARD,
    expert: EXPERT_BOARD,
};

/* ------------------------------------------------------------------ */
/*  Ring 4 segment interleaving (no two adjacent same color)           */
/*  Values: 0=Yellow, 1=Pink, 2=Mint                                  */
/* ------------------------------------------------------------------ */

export const RING4_LAYOUT: Record<Difficulty, number[]> = {
    // 18 segments: 9Y, 5P, 4M
    easy:   [0,1,0,2,0,1,0,2,0,1,0,2,0,1,0,1,0,2],
    medium: [0,1,0,2,0,1,0,2,0,1,0,2,0,1,0,1,0,2],
    // 18 segments: 9Y, 6P, 3M
    hard:   [0,1,0,1,0,2,0,1,0,1,0,2,0,1,0,1,0,2],
    // 12 segments: 6Y, 4P, 2M
    expert: [0,1,0,2,0,1,0,1,0,2,0,1],
};

/* ------------------------------------------------------------------ */
/*  Visual / animation constants                                       */
/* ------------------------------------------------------------------ */

export const FRAME = {
    outerR: 225,
    innerR: 170,
} as const;

export const ANIMATION = {
    dartThrowDuration: 600,
    dartImpactPause: 200,
    resultRevealDelay: 400,
    resultDisplayDuration: 2000,
    autoPlayDelay: 1500,
} as const;

export const BOARD = {
    viewBox: 500,
    maxVisibleDarts: 10,
} as const;

export const DEFAULTS = {
    betAmount: 10,
    difficulty: 'easy' as Difficulty,
    balance: 1000,
} as const;
