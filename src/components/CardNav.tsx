import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { TabType } from '../types';
import { discordServers } from '../data/servers';
import { Home, Music, Gamepad2, ExternalLink } from 'lucide-react';

export interface CardNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isPlaying?: boolean;
  currentTrackTitle?: string;
}

export const CardNav: React.FC<CardNavProps> = ({
  activeTab,
  onSelectTab,
  isPlaying = false,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    if (!navRef.current) return 250;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      return 64 + 85 * discordServers.length + 12 * (discordServers.length - 1) + 24;
    }
    return 210;
  };

  const createTimeline = () => {
    const nav = navRef.current;
    if (!nav) return null;

    gsap.set(nav, { height: 54, overflow: 'hidden' });
    gsap.set(cardsRef.current.filter(Boolean), { y: 20, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(nav, {
      height: calculateHeight,
      duration: 0.35,
      ease: 'power3.out',
    });
    tl.to(
      cardsRef.current.filter(Boolean),
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power3.out',
        stagger: 0.06,
      },
      '-=0.15'
    );
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    timelineRef.current = tl;
    return () => {
      tl?.kill();
      timelineRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!timelineRef.current) return;
      if (isMenuOpen) {
        const h = calculateHeight();
        gsap.set(navRef.current, { height: h });
        timelineRef.current.kill();
        const tl = createTimeline();
        if (tl) {
          tl.progress(1);
          timelineRef.current = tl;
        }
      } else {
        timelineRef.current.kill();
        const tl = createTimeline();
        if (tl) {
          timelineRef.current = tl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    const tl = timelineRef.current;
    if (!tl) return;

    if (isMenuOpen) {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => {
        setIsMenuOpen(false);
      });
      tl.reverse();
    } else {
      setIsHamburgerOpen(true);
      setIsMenuOpen(true);
      tl.play(0);
    }
  };

  return (
    <div className="card-nav-container" id="main-header-nav">
      <nav ref={navRef} className={`card-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="card-nav-top">
          {/* Left: Discord servers dropdown toggle */}
          <button
            id="discord-servers-toggle-btn"
            type="button"
            className={`hamburger-button ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Закрыть список серверов' : 'Открыть список Discord серверов'}
            aria-expanded={isMenuOpen}
            title="Список Discord серверов"
          >
            <div className="hamburger-icon">
              <div className="hamburger-line" />
              <div className="hamburger-line" />
            </div>
            <span className="hidden sm:inline-block text-xs font-mono font-medium tracking-wide uppercase text-white">
              Серверы
            </span>
          </button>

          {/* Center: Primary Navigation Tabs */}
          <div className="center-nav-tabs">
            <button
              id="nav-tab-home"
              type="button"
              onClick={() => {
                if (isMenuOpen) toggleMenu();
                onSelectTab('home');
              }}
              className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              <Home className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Главная</span>
            </button>

            <button
              id="nav-tab-music"
              type="button"
              onClick={() => {
                if (isMenuOpen) toggleMenu();
                onSelectTab('music');
              }}
              className={`nav-tab-btn ${activeTab === 'music' ? 'active' : ''}`}
            >
              <Music className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Музыка</span>
              {isPlaying && (
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-2.5 bg-white rounded-full animate-pulse" />
                  <span className="w-1 h-3.5 bg-white rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
                </span>
              )}
            </button>

            <button
              id="nav-tab-games"
              type="button"
              onClick={() => {
                if (isMenuOpen) toggleMenu();
                onSelectTab('games');
              }}
              className={`nav-tab-btn ${activeTab === 'games' ? 'active' : ''}`}
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Игры</span>
            </button>
          </div>

          {/* Right: Profile Avatar Chip */}
          <div className="nav-avatar-badge hidden sm:flex">
            <div className="relative">
              <img
                src="/icons/avatar/IMG_2856.jpg"
                alt="Kedamo Avatar"
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
            </div>
            <span className="text-xs font-semibold text-white font-mono tracking-wider">
              Kedamo
            </span>
          </div>
        </div>

        {/* Dropdown Content: Discord Servers */}
        <div className="card-nav-content">
          {discordServers.map((server, idx) => (
            <a
              key={server.name}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              href={server.url}
              target="_blank"
              rel="noopener noreferrer"
              className="server-card group"
              id={`discord-server-${idx}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={server.avatar}
                    alt={server.name}
                    className="w-8 h-8 rounded-lg object-cover border border-white/20 group-hover:border-white transition-colors"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors leading-tight">
                      {server.name}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {server.tag}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2 font-light leading-relaxed">
                {server.description}
              </p>

              <div className="mt-auto flex items-center justify-end text-[11px] font-mono text-zinc-400 pt-1.5 border-t border-white/5">
                <span className="text-white font-medium group-hover:underline">
                  Войти →
                </span>
              </div>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};
