import { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { TabType } from './types';
import { AudioProvider, useAudio } from './context/AudioContext';
import { CardNav } from './components/CardNav';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { Ravens } from './components/Ravens';
import { Atmosphere } from './components/Atmosphere';
import { HomePage } from './pages/HomePage';
import { MusicPage } from './pages/MusicPage';
import { GamesPage } from './pages/GamesPage';
import './motion.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const ambientMotion = true;
  const pageMotion = ambientMotion;
  const { isPlaying } = useAudio();
  function navigate(tab: TabType) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return (
    <MotionConfig reducedMotion={ambientMotion ? 'never' : 'always'}>
      <div
        className={`site-shell ${ambientMotion ? 'effects-enabled' : 'effects-paused'}`}
      >
        <a className="skip-link" href="#main-content">
          К содержимому
        </a>
        <div className="ambient-background" aria-hidden="true" />
        <Atmosphere />
        <Ravens enabled={ambientMotion} />
        <CardNav
          activeTab={activeTab}
          onSelectTab={navigate}
          isPlaying={isPlaying}
        />
        <main id="main-content" className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              className="page-transition"
              key={activeTab}
              initial={
                pageMotion ? { opacity: 0, y: 24, filter: 'blur(5px)' } : false
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={
                pageMotion
                  ? {
                      opacity: 0,
                      y: -12,
                      filter: 'blur(3px)',
                      transition: { duration: 0.18 },
                    }
                  : { opacity: 0 }
              }
              transition={{
                duration: pageMotion ? 0.45 : 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {activeTab === 'home' && (
                <HomePage
                  onNavigateToMusic={() => navigate('music')}
                  onNavigateToGames={() => navigate('games')}
                  effectsEnabled={ambientMotion}
                />
              )}
              {activeTab === 'music' && <MusicPage />}
              {activeTab === 'games' && (
                <GamesPage effectsEnabled={ambientMotion} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomPlayerBar onOpenMusicTab={() => navigate('music')} />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
