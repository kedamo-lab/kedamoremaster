import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TabType } from './types';
import { AudioProvider, useAudio } from './context/AudioContext';
import { PixelBlast } from './components/PixelBlast';
import { CardNav } from './components/CardNav';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { HomePage } from './pages/HomePage';
import { MusicPage } from './pages/MusicPage';
import { GamesPage } from './pages/GamesPage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { isPlaying, currentTrack } = useAudio();

  return (
    <div className="relative min-h-screen w-full bg-black text-zinc-100 overflow-x-hidden selection:bg-zinc-800 selection:text-white">
      {/* 1. Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grayscale Background Artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 grayscale brightness-75 transition-opacity duration-1000"
          style={{
            backgroundImage: `url('/background/33608051c4ca3b4894bfd585043d5ba8.jpg')`,
          }}
        />

        {/* Monochrome PixelBlast Interactive WebGL Layer */}
        <div className="absolute inset-0 pointer-events-auto opacity-40">
          <PixelBlast
            variant="diamond"
            pixelSize={3.5}
            color="#ffffff"
            patternScale={2.5}
            patternDensity={1.2}
            liquid={false}
            enableRipples={true}
            rippleIntensityScale={1.2}
            rippleSpeed={0.35}
            speed={0.3}
            edgeFade={0.6}
          />
        </div>

        {/* Dark Vignette to Blend Seamlessly */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/60 to-black pointer-events-none" />
      </div>

      {/* 2. Top Header Navigation Bar */}
      <CardNav
        activeTab={activeTab}
        onSelectTab={(tab: TabType) => setActiveTab(tab)}
        isPlaying={isPlaying}
        currentTrackTitle={currentTrack.title}
      />

      {/* 3. Page Content Transition */}
      <main className="relative z-10 w-full min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <HomePage
                onNavigateToMusic={() => setActiveTab('music')}
                onNavigateToGames={() => setActiveTab('games')}
              />
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <MusicPage />
            </motion.div>
          )}

          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <GamesPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. Persistent Bottom Audio Bar */}
      <BottomPlayerBar onOpenMusicTab={() => setActiveTab('music')} />
    </div>
  );
};

export function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;

