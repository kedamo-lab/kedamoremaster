import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, X } from '../components/Icons';
import { games } from '../data/games';
import { GameItem } from '../types';

function GameDialog({
  game,
  onClose,
}: {
  game: GameItem;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [videoError, setVideoError] = useState(false);
  useEffect(() => {
    dialogRef.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="game-dialog"
      onClose={onClose}
      aria-labelledby="game-dialog-title"
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <div className="dialog-header">
        <div>
          <p className="eyebrow">{game.genre}</p>
          <h2 id="game-dialog-title">{game.title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Закрыть окно игры"
          autoFocus
        >
          <X size={22} />
        </button>
      </div>
      {game.videoSrc && !videoError ? (
        <video
          controls
          autoPlay
          playsInline
          poster={game.image}
          onError={() => setVideoError(true)}
          src={game.videoSrc}
        />
      ) : (
        <img className="dialog-image" src={game.image} alt={game.title} />
      )}
      <p className="game-description">{game.fullDescription}</p>
      <div className="dialog-tags">
        {game.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </dialog>
  );
}

export function GamesPage({
  effectsEnabled = true,
}: {
  effectsEnabled?: boolean;
}) {
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const animateCards = effectsEnabled;
  return (
    <div className="collection-page games-page">
      <div className="page-heading">
        <div>
          <h1>Игры</h1>
        </div>
      </div>
      <div className="games-grid">
        {games.map((game, index) => (
          <motion.button
            type="button"
            key={game.id}
            className="game-card"
            initial={
              animateCards ? { opacity: 0, y: 36, filter: 'blur(5px)' } : false
            }
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
              duration: 0.55,
              delay: animateCards ? index * 0.07 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={
              animateCards
                ? { y: -5, transition: { duration: 0.22, delay: 0 } }
                : undefined
            }
            whileTap={
              animateCards
                ? { scale: 0.985, transition: { duration: 0.12, delay: 0 } }
                : undefined
            }
            onClick={() => setSelectedGame(game)}
            aria-label={`Подробнее об игре ${game.title}`}
          >
            <span className="game-image">
              <img src={game.image} alt="" loading="lazy" />
              <span className="game-open">
                <ArrowUpRight size={22} />
              </span>
            </span>
            <span className="game-card-info">
              <span>
                <strong>{game.title}</strong>
                <small>{game.genre}</small>
              </span>
              <span className="game-card-mark" aria-hidden="true">
                ✧
              </span>
            </span>
          </motion.button>
        ))}
      </div>
      {selectedGame && (
        <GameDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  );
}
