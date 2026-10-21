import { Pause, Play } from '../components/Icons';
import { useAudio } from '../context/AudioContext';
import { SyncedLyrics } from '../components/SyncedLyrics';

export function MusicPage() {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    playTrack,
    togglePlay,
  } = useAudio();
  return (
    <div className="collection-page music-page">
      <div className="page-heading">
        <h1>Музыка</h1>
      </div>
      <section className="music-showcase" aria-label="Текущий трек">
        <div className="record-frame">
          <div className="record-glow" aria-hidden="true" />
          <button
            type="button"
            className={`vinyl ${isPlaying ? 'is-playing' : ''}`}
            onClick={togglePlay}
            aria-label={
              isPlaying
                ? 'Поставить трек на паузу'
                : 'Воспроизвести текущий трек'
            }
          >
            <span className="vinyl-disc">
              <img
                src={currentTrack.coverSrc}
                alt={`Обложка ${currentTrack.title}`}
              />
              <span className="spindle" />
            </span>
            <span className="vinyl-control">
              {isPlaying ? <Pause size={30} /> : <Play size={30} />}
            </span>
          </button>
        </div>
        <div className="song-detail">
          <h2>{currentTrack.title}</h2>
          <p className="song-artist">{currentTrack.artist}</p>
          <SyncedLyrics
            key={currentTrack.id}
            lines={currentTrack.syncedLyrics}
            fallback={currentTrack.lyrics}
            currentTime={currentTime}
          />
        </div>
      </section>
      <section className="tracklist" aria-label="Список треков">
        {tracks.map((track, index) => (
          <button
            type="button"
            className={`track-row ${currentTrackIndex === index ? 'selected' : ''}`}
            key={track.id}
            onClick={() =>
              currentTrackIndex === index ? togglePlay() : playTrack(index)
            }
            aria-label={`${currentTrackIndex === index && isPlaying ? 'Пауза' : 'Воспроизвести'} — ${track.title}`}
          >
            <img src={track.coverSrc} alt="" loading="lazy" />
            <span className="track-info">
              <strong>{track.title}</strong>
              <span>{track.artist}</span>
            </span>
            {currentTrackIndex === index && isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} />
            )}
          </button>
        ))}
      </section>
    </div>
  );
}
