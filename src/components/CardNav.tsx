import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronDown,
  Wind,
  User,
  Music,
  Gamepad2,
} from './Icons';
import { TabType } from '../types';
import { discordServers } from '../data/servers';

interface CardNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isPlaying: boolean;
  ambientMotion: boolean;
  onToggleMotion: () => void;
}
const tabs = [
  { id: 'home' as const, label: 'Обо мне', Icon: User },
  { id: 'music' as const, label: 'Музыка', Icon: Music },
  { id: 'games' as const, label: 'Игры', Icon: Gamepad2 },
];

export function CardNav({
  activeTab,
  onSelectTab,
  isPlaying,
  ambientMotion,
  onToggleMotion,
}: CardNavProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, [open]);
  return (
    <header className="site-header">
      <button
        type="button"
        className="wordmark"
        aria-label="Kedamo — главная"
        onClick={() => onSelectTab('home')}
      >
        kedamo
      </button>
      <nav className="primary-nav" aria-label="Основная навигация">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            type="button"
            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => {
              setOpen(false);
              onSelectTab(tab.id);
            }}
          >
            {activeTab === tab.id && (
              <motion.span
                className="nav-active-bg"
                layoutId="nav-active"
                transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              />
            )}
            <tab.Icon size={19} aria-hidden="true" />
            <span>{tab.label}</span>
            {tab.id === 'music' && isPlaying && (
              <span className="playing-dot" aria-label="Играет музыка" />
            )}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <button
          type="button"
          className="icon-button motion-toggle"
          onClick={onToggleMotion}
          aria-pressed={ambientMotion}
          aria-label={
            ambientMotion
              ? 'Выключить визуальные эффекты'
              : 'Включить визуальные эффекты'
          }
          title="Визуальные эффекты"
        >
          <Wind size={21} />
        </button>
        <div className="server-menu" ref={menuRef}>
          <button
            type="button"
            ref={toggleRef}
            id="discord-servers-toggle-btn"
            className="servers-toggle"
            aria-label="Серверы Discord"
            title="Серверы Discord"
            aria-expanded={open}
            aria-controls={open ? 'server-list' : undefined}
            onClick={() => setOpen((value) => !value)}
          >
            <img src="/icons/discord.svg" alt="" />
            <ChevronDown size={13} className={open ? 'rotate-chevron' : ''} />
          </button>
          {open && (
            <motion.div
              id="server-list"
              className="server-dropdown"
              initial={{ opacity: 0, y: -7 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {discordServers.map((server) => (
                <a
                  href={server.url}
                  key={server.name}
                  target="_blank"
                  rel="noreferrer"
                  className="server-item"
                >
                  <img src={server.avatar} alt="" />
                  <strong>{server.name}</strong>
                  <ArrowUpRight size={18} />
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
