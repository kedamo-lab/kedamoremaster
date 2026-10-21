import { motion } from 'framer-motion';
import type { LyricLine } from '../types';
import { findActiveLyricIndex } from '../utils/lyrics';
import { Music } from './Icons';

export function SyncedLyrics({
  lines = [],
  fallback,
  currentTime,
}: {
  lines?: LyricLine[];
  fallback: string[];
  currentTime: number;
}) {
  const index = findActiveLyricIndex(lines, currentTime);
  const current = lines[index];
  const previous = lines
    .slice(0, Math.max(0, index))
    .reverse()
    .find((line) => line.text.trim());
  const next = lines.slice(index + 1).find((line) => line.text.trim());
  if (!lines.length)
    return (
      <div className="lyrics static-lyrics" aria-label="Текст песни">
        {fallback.slice(0, 3).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  return (
    <div
      className="lyrics"
      aria-label="Синхронизированный текст песни"
      aria-live="off"
    >
      <p className="lyric-neighbor lyric-previous">
        {previous?.text || '\u00a0'}
      </p>
      <motion.div
        className="lyric-active-wrap"
        key={index}
        initial={{ opacity: 0.25, y: 7, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.15 }}
      >
        {current?.text.trim() ? (
          <p
            className="current-line"
            aria-current="true"
            data-cue-time={current.time}
          >
            {current.text}
          </p>
        ) : (
          <Music
            className="lyric-rest"
            size={29}
            aria-label="Музыкальная пауза"
          />
        )}
      </motion.div>
      <p className="lyric-neighbor lyric-next">{next?.text || '\u00a0'}</p>
    </div>
  );
}
