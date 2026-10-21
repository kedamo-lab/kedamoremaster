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

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [ambientMotion, setAmbientMotion] = useState(true);
  const { isPlaying } = useAudio();
  function navigate(tab: TabType) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return (
    <div className={`site-shell ${ambientMotion ? '' : 'effects-paused'}`}>
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
        ambientMotion={ambientMotion}
        onToggleMotion={() => setAmbientMotion((value) => !value)}
      />
      <main id="main-content" className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'home' && (
              <HomePage
                onNavigateToMusic={() => navigate('music')}
                onNavigateToGames={() => navigate('games')}
                effectsEnabled={ambientMotion}
              />
            )}
            {activeTab === 'music' && <MusicPage />}
            {activeTab === 'games' && <GamesPage />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomPlayerBar onOpenMusicTab={() => navigate('music')} />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </MotionConfig>
  );
}
