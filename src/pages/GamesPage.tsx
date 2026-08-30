import React, { useState } from 'react';
import { games } from '../data/games';
import { GameItem } from '../types';
import { X } from 'lucide-react';

export const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [videoError, setVideoError] = useState(false);

  const handleSelectGame = (game: GameItem) => {
    setSelectedGame(game);
    setVideoError(false);
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-28 pb-28 sm:pb-32 px-3 sm:px-4 max-w-5xl mx-auto space-y-8 sm:space-y-12">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-widest uppercase font-display">
          Игры
        </h1>
      </div>

      {/* Games Grid (Clean, borderless, minimalist, no hours) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        {games.map((game) => (
            <div
            key={game.id}
            onClick={() => handleSelectGame(game)}
            className="group cursor-pointer space-y-3"
          >
            {/* Image Artwork */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-950 shadow-2xl">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Title & Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-zinc-300 transition-colors">
                  {game.title}
                </h3>
                <span className="text-xs font-mono text-zinc-500">{game.genre}</span>
              </div>
              <span className="text-xs font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Инфо →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Minimalist Modal for Details */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="relative w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-neutral-950 p-5 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors z-10"
              title="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                {selectedGame.genre}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display">
                {selectedGame.title}
              </h2>
            </div>

            {/* Game Visual / Video Banner */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 shadow-2xl">
              {selectedGame.videoSrc && !videoError ? (
                <video
                  key={selectedGame.videoSrc}
                  poster={selectedGame.image}
                  controls
                  autoPlay
                  playsInline
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover"
                >
                  <source src={selectedGame.videoSrc} type="video/mp4" />
                  <img
                    src={selectedGame.image}
                    alt={selectedGame.title}
                    className="w-full h-full object-cover"
                  />
                </video>
              ) : (
                <img
                  src={selectedGame.image}
                  alt={selectedGame.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Game Description */}
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              {selectedGame.fullDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
