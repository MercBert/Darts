/**
 * DartsResolver — utility helpers for dart throw mechanics.
 */

import type { Ring4Segment } from '@/types';

/** Pick a random angle on the ring (0-360°). */
export function randomAngle(): number {
    return Math.random() * 360;
}

/** Pick a random radius within a ring band (uniform by area). */
export function randomRadius(inner: number, outer: number): number {
    const r2 = Math.random() * (outer * outer - inner * inner) + inner * inner;
    return Math.sqrt(r2);
}

/** Calculate the midpoint angle of a ring4 segment. */
export function segmentMidAngle(segment: Ring4Segment): number {
    return (segment.startAngle + segment.endAngle) / 2;
}
