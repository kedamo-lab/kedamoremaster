import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { PointerEvent } from 'react';
import { ArrowUpRight, Headphones, Play } from '../components/Icons';
import { ThornHalo } from '../components/Atmosphere';
import { LivingBotanical } from '../components/LivingBotanical';
import { socialLinks } from '../data/servers';
import { useAudio } from '../context/AudioContext';

interface HomePageProps {
  onNavigateToMusic: () => void;
  onNavigateToGames: () => void;
  effectsEnabled: boolean;
}

export function HomePage({
  onNavigateToMusic,
  onNavigateToGames,
  effectsEnabled,
}: HomePageProps) {
  const { currentTrack, isPlaying, togglePlay } = useAudio();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 90, damping: 22 });
  const rotateY = useSpring(x, { stiffness: 90, damping: 22 });
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (!effectsEnabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 7);
    y.set(-((event.clientY - rect.top) / rect.height - 0.5) * 7);
  }
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          <span className="profile-handle">
            kxdmo. <span lang="ja">逃げろ</span>
          </span>
          <h1 id="home-title">kedamo</h1>
          <p className="hero-motto">
            the stars collide<span aria-hidden="true">✧</span>
          </p>
          <p className="hero-japanese" lang="ja">
            ハットサハートのファン
          </p>
          <div className="social-links" aria-label="Социальные сети">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="social-link"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <img src={social.icon} alt="" />
                <span>{social.name.replace(' Profile', '')}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="portrait-scene"
          onPointerMove={tilt}
          onPointerLeave={() => {
            x.set(0);
            y.set(0);
          }}
          style={{
            rotateX: effectsEnabled ? rotateX : 0,
            rotateY: effectsEnabled ? rotateY : 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="portrait-aura" aria-hidden="true" />
          <ThornHalo />
          <div className="portrait-window">
            <img src="/icons/avatar/IMG_2856.jpg" alt="Аватар Kedamo" />
          </div>
          <LivingBotanical enabled={effectsEnabled} />
          <div className="portrait-reflection" aria-hidden="true" />
        </motion.div>
      </section>
      <section className="home-explore" aria-label="Музыка и игры">
        <div className="explore-card music-preview">
          <button
            type="button"
            className="preview-play"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести музыку'}
          >
            <img src={currentTrack.coverSrc} alt="" />
            <span>
              {isPlaying ? <Headphones size={23} /> : <Play size={23} />}
            </span>
          </button>
          <button
            type="button"
            className="explore-link"
            onClick={onNavigateToMusic}
          >
            <strong>{currentTrack.title}</strong>
            <span>{currentTrack.artist}</span>
            <ArrowUpRight className="explore-arrow" size={23} />
          </button>
        </div>
        <button
          type="button"
          className="explore-card game-preview"
          onClick={onNavigateToGames}
        >
          <span className="game-preview-art">
            <img src="/game/Dead by Daylight/images.jpg" alt="" />
          </span>
          <span className="explore-link">
            <strong>Игры</strong>
            <ArrowUpRight className="explore-arrow" size={23} />
          </span>
        </button>
      </section>
    </div>
  );
}
