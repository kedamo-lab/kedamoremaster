import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat } from 'lucide-react';

interface BottomPlayerBarProps {
  onOpenMusicTab: () => void;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({ onOpenMusicTab }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleLoop,
  } = useAudio();

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="Музыкальный плеер"
      className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-40 w-[97%] sm:w-[94%] max-w-4xl rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 p-2 sm:px-4 sm:py-3 shadow-2xl transition-all"
    >
      {/* Mini Progress Bar on Top Edge */}
      <div
        className="absolute -top-[1px] left-3 right-3 h-[2px] bg-white/10 rounded-full overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const pct = Math.max(0, Math.min(1, clickX / rect.width));
          seek(pct * duration);
        }}
      >
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Left: Track Info + Cover */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[140px] sm:max-w-[280px]">
          <button
            type="button"
            onClick={onOpenMusicTab}
            className="relative group shrink-0"
            title="Открыть плеер"
          >
            <img
              src={currentTrack.coverSrc}
              alt={currentTrack.title}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover grayscale brightness-90 shadow-md group-hover:grayscale-0 transition-all"
            />
          </button>

          <div className="min-w-0">
            <button
              type="button"
              onClick={onOpenMusicTab}
              className="text-xs sm:text-sm font-bold text-white hover:text-zinc-300 transition-colors truncate block text-left"
            >
              {currentTrack.title}
            </button>
            <div className="text-[11px] text-zinc-400 font-mono truncate flex items-center gap-1.5">
              <span>{currentTrack.artist}</span>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <span className="hidden sm:inline text-[10px] text-zinc-400 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={prevTrack}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Предыдущий трек"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="p-2 sm:p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105"
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Следующий трек"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleLoop}
            className={`p-1.5 rounded-lg hidden sm:inline-flex transition-colors ${
              isLooping ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={isLooping ? 'Повтор включен' : 'Включить повтор'}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Volume & Tab Launcher */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition-colors"
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              aria-label="Громкость"
              className="w-16 h-1 accent-white bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

