import type { LyricLine } from '../types';

// A cue becomes active exactly at its timestamp. Empty cues represent vocal gaps.
export function findActiveLyricIndex(
  lines: readonly LyricLine[],
  currentTime: number,
): number {
  if (!Number.isFinite(currentTime) || lines.length === 0) return -1;
  let left = 0;
  let right = lines.length;
  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (lines[middle].time <= currentTime) left = middle + 1;
    else right = middle;
  }
  return left - 1;
}
