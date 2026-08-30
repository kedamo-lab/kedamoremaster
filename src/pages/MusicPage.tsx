import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MusicPage: React.FC = () => {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    togglePlay,
  } = useAudio();

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  // Synchronized 4-line lyrics calculation
  let currentLineIndex = 0;
  const synced = currentTrack.syncedLyrics;

  if (synced && synced.length > 0) {
    // Exact timestamp matching
    for (let i = 0; i < synced.length; i++) {
      if (currentTime >= synced[i].time) {
        currentLineIndex = i;
      } else {
        break;
      }
    }
  } else {
    // Smooth fallback
    const totalLyrics = currentTrack.lyrics.length;
    const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
    currentLineIndex = Math.min(
      totalLyrics - 1,
      Math.floor(progressRatio * totalLyrics)
    );
  }

  // Group into pages/chunks of 4 lines
  const chunkIndex = Math.floor(currentLineIndex / 4);
  const startLineIndex = chunkIndex * 4;
  const current4Lines = currentTrack.lyrics.slice(startLineIndex, startLineIndex + 4);

  return (
    <div className="min-h-screen pt-20 sm:pt-28 pb-28 sm:pb-32 px-3 sm:px-4 max-w-5xl mx-auto flex flex-col justify-center">
      {/* Vinyl & Lyrics Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        {/* Large Disk + Avatar */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            onClick={togglePlay}
            className="relative cursor-pointer group select-none"
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {/* Vinyl Record */}
            <div
              className={`w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full bg-neutral-950 shadow-2xl relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{
                background:
                  'radial-gradient(circle, #1a1a1a 0%, #111111 25%, #050505 45%, #181818 55%, #080808 70%, #1c1c1c 85%, #050505 100%)',
                boxShadow:
                  '0 0 0 2px rgba(255,255,255,0.08), 0 25px 60px -15px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.8)',
              }}
            >
              {/* Concentric Grooves */}
              <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none" />

              {/* Center Label with Track Artwork */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden relative shadow-inner bg-neutral-900 border-2 border-white/20 flex items-center justify-center">
                <img
                  src={currentTrack.coverSrc}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover grayscale brightness-90"
                />
                {/* Center Spindle Hole */}
                <div className="absolute w-4 h-4 rounded-full bg-black border border-neutral-700 shadow-md" />
              </div>
            </div>

            {/* Subtle Play/Pause Overlay Indicator on Hover */}
            <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
              {isPlaying ? (
                <Pause className="w-10 h-10 text-white" />
              ) : (
                <Play className="w-10 h-10 text-white fill-white translate-x-0.5" />
              )}
            </div>
          </div>
        </div>

        {/* Track Info & 4-Line Lyrics */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6 text-center lg:text-left mt-4 sm:mt-8 lg:mt-16">
          {/* Track Header */}
          <div>
            <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-1">
              {currentTrack.artist}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-display">
              {currentTrack.title}
            </h2>
          </div>

          {/* 4-Line Synchronized Lyrics Container */}
          <div className="min-h-[120px] sm:min-h-[160px] flex flex-col justify-center py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentTrack.id}-${chunkIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-3"
              >
                {current4Lines.map((line, idx) => {
                  const absoluteLineIdx = startLineIndex + idx;
                  const isCurrentActive = absoluteLineIdx === currentLineIndex;

                  return (
                    <p
                      key={idx}
                      className={`transition-all duration-300 font-serif leading-relaxed ${
                        isCurrentActive
                          ? 'text-white text-lg sm:text-xl font-semibold scale-[1.01] tracking-wide'
                          : 'text-zinc-500 text-sm sm:text-base font-normal opacity-60'
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tracklist / Список треков */}
      <div className="mt-16 pt-8 border-t border-white/5 space-y-4">
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
          Список треков ({tracks.length})
        </h3>

        <div className="space-y-1">
          {tracks.map((track, idx) => {
            const isSelected = currentTrackIndex === idx;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(idx)}
                className={`group flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-zinc-600 w-4">{idx + 1}</span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium truncate block">{track.title}</span>
                    <span className="text-xs font-mono text-zinc-500">{track.artist}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isSelected && isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

