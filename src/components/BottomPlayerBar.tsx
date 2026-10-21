import {
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from './Icons';
import { useAudio } from '../context/AudioContext';

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export function BottomPlayerBar({
  onOpenMusicTab,
}: {
  onOpenMusicTab: () => void;
}) {
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
  return (
    <aside className="player" aria-label="Музыкальный плеер">
      <div className="player-inner">
        <button
          type="button"
          className="player-track"
          onClick={onOpenMusicTab}
          aria-label={`Открыть музыку — ${currentTrack.title}`}
        >
          <img src={currentTrack.coverSrc} alt="" />
          <span>
            <strong>{currentTrack.title}</strong>
            <small>{currentTrack.artist}</small>
          </span>
        </button>
        <div className="player-center">
          <div className="playback-controls">
            <button
              type="button"
              className="icon-button"
              onClick={prevTrack}
              aria-label="Предыдущий трек"
            >
              <SkipBack size={17} />
            </button>
            <button
              type="button"
              className="main-play"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {isPlaying ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={nextTrack}
              aria-label="Следующий трек"
            >
              <SkipForward size={17} />
            </button>
          </div>
          <div className="seek-row">
            <time>{formatTime(currentTime)}</time>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Позиция воспроизведения"
            />
            <time>{formatTime(duration)}</time>
          </div>
        </div>
        <div className="player-volume">
          <button
            type="button"
            className={`icon-button loop-button ${isLooping ? 'selected' : ''}`}
            onClick={toggleLoop}
            aria-label="Повтор трека"
            aria-pressed={isLooping}
          >
            <Repeat size={16} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={17} />
            ) : (
              <Volume2 size={17} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(event) => setVolumeLevel(Number(event.target.value))}
            aria-label="Громкость"
          />
        </div>
      </div>
    </aside>
  );
}
