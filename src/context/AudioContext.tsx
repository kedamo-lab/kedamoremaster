import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { Track } from '../types';
import { tracks } from '../data/tracks';

interface AudioContextType {
  tracks: Track[];
  currentTrack: Track;
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolumeLevel: (volume: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
}

type AudioControls = Pick<
  AudioContextType,
  'playTrack' | 'togglePlay' | 'nextTrack' | 'prevTrack' | 'seek'
>;

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [trackList] = useState<Track[]>(tracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controlsRef = useRef<AudioControls | null>(null);
  const trackIndexRef = useRef(0);
  const currentTrack = trackList[currentTrackIndex] || trackList[0];

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;
    let frame = 0;
    let playRequest = 0;
    let pendingPlay = false;
    let disposed = false;

    // Always read the media clock: no accumulated timer drift or estimated progress.
    const syncTime = () => {
      setCurrentTime(
        Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      );
    };
    const syncDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const stopClock = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const tick = () => {
      syncTime();
      frame = !audio.paused && !audio.ended ? requestAnimationFrame(tick) : 0;
    };
    const startClock = () => {
      stopClock();
      tick();
    };

    const requestPlay = () => {
      const request = ++playRequest;
      pendingPlay = true;
      // Keep play() inside the user action, including track selection on mobile.
      void audio.play().then(
        () => {
          if (!disposed && request === playRequest) pendingPlay = false;
        },
        () => {
          if (!disposed && request === playRequest) {
            pendingPlay = false;
            setIsPlaying(false);
            stopClock();
          }
        },
      );
    };

    const selectTrack = (index: number, shouldPlay: boolean) => {
      if (!Number.isInteger(index) || index < 0 || index >= trackList.length)
        return;
      const source = trackList[index].audioSrc;
      if (
        trackIndexRef.current === index &&
        audio.getAttribute('src') === source
      ) {
        if (shouldPlay) {
          if (audio.ended) audio.currentTime = 0;
          requestPlay();
        }
        return;
      }

      ++playRequest;
      pendingPlay = false;
      audio.pause();
      stopClock();
      trackIndexRef.current = index;
      setCurrentTrackIndex(index);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      // A source change happens once here, never again in a render effect.
      audio.src = source;
      audio.load();
      if (shouldPlay) requestPlay();
    };

    const onPlay = () => {
      if (audio.paused || audio.ended) return;
      setIsPlaying(true);
      startClock();
    };
    const onPause = () => {
      if (!audio.paused) return;
      setIsPlaying(false);
      stopClock();
      syncTime();
    };
    const onEnded = () => {
      if (!audio.ended) return;
      if (audio.loop) {
        audio.currentTime = 0;
        syncTime();
        requestPlay();
      } else {
        selectTrack((trackIndexRef.current + 1) % trackList.length, true);
      }
    };
    const onError = () => {
      if (!audio.error) return;
      ++playRequest;
      pendingPlay = false;
      setIsPlaying(false);
      stopClock();
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('playing', startClock);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', syncTime);
    audio.addEventListener('seeking', syncTime);
    audio.addEventListener('seeked', syncTime);
    audio.addEventListener('loadedmetadata', syncDuration);
    audio.addEventListener('durationchange', syncDuration);

    controlsRef.current = {
      playTrack: (index) => selectTrack(index, true),
      togglePlay: () => {
        if (!audio.paused || pendingPlay) {
          ++playRequest;
          pendingPlay = false;
          audio.pause();
          onPause();
        } else {
          if (audio.ended) audio.currentTime = 0;
          requestPlay();
        }
      },
      nextTrack: () =>
        selectTrack(
          (trackIndexRef.current + 1) % trackList.length,
          !audio.paused || pendingPlay,
        ),
      prevTrack: () =>
        selectTrack(
          (trackIndexRef.current - 1 + trackList.length) % trackList.length,
          !audio.paused || pendingPlay,
        ),
      seek: (time) => {
        if (!Number.isFinite(time) || !Number.isFinite(audio.duration)) return;
        audio.currentTime = Math.max(0, Math.min(audio.duration, time));
        syncTime();
      },
    };

    audio.src = trackList[trackIndexRef.current].audioSrc;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    return () => {
      disposed = true;
      ++playRequest;
      stopClock();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('playing', startClock);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', syncTime);
      audio.removeEventListener('seeking', syncTime);
      audio.removeEventListener('seeked', syncTime);
      audio.removeEventListener('loadedmetadata', syncDuration);
      audio.removeEventListener('durationchange', syncDuration);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
      controlsRef.current = null;
    };
  }, [trackList]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping;
  }, [isLooping]);

  const setVolumeLevel = (newVolume: number) => {
    if (!Number.isFinite(newVolume)) return;
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolume(clamped);
    if (clamped > 0) setIsMuted(false);
  };

  return (
    <AudioContext.Provider
      value={{
        tracks: trackList,
        currentTrack,
        currentTrackIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isLooping,
        playTrack: (index) => controlsRef.current?.playTrack(index),
        togglePlay: () => controlsRef.current?.togglePlay(),
        nextTrack: () => controlsRef.current?.nextTrack(),
        prevTrack: () => controlsRef.current?.prevTrack(),
        seek: (time) => controlsRef.current?.seek(time),
        setVolumeLevel,
        toggleMute: () => setIsMuted((value) => !value),
        toggleLoop: () => setIsLooping((value) => !value),
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context)
    throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
