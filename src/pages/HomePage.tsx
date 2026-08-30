import React from 'react';
import { socialLinks } from '../data/servers';

interface HomePageProps {
  onNavigateToMusic?: () => void;
  onNavigateToGames?: () => void;
}

export const HomePage: React.FC<HomePageProps> = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-28 sm:pb-24 text-center">
      {/* Avatar */}
      <div className="relative mb-4 sm:mb-6">
        <img
          src="/icons/avatar/IMG_2856.jpg"
          alt="Kedamo"
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-white grayscale hover:grayscale-0 transition-all duration-500 shadow-2xl"
        />
      </div>

      {/* Nickname */}
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-widest text-white uppercase font-display mb-6 sm:mb-8">
        Kedamo
      </h1>

      {/* Social Networks */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 max-w-md w-full">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all duration-200 group border border-white/10 hover:border-white/30"
          >
            <img
              src={social.icon}
              alt={social.name}
              className="w-5 h-5 brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-xs sm:text-sm font-medium tracking-wide font-mono text-white">
              {social.name.replace(' Profile', '')}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

