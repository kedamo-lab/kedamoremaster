import type { CSSProperties } from 'react';

// Independent wing groups create flight without a video or WebGL layer.
export function Ravens({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="ravens" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div
          className={`raven raven-${index}`}
          key={index}
          style={{ '--flight-delay': `${index * 0.8 + 3}s` } as CSSProperties}
        >
          <svg viewBox="0 0 120 70" fill="currentColor">
            <path d="M49 34 Q61 28 70 35 L81 38 73 41 66 40 58 48 43 54 47 44 39 43Z" />
            <g className="raven-wing wing-near">
              <path d="M59 39 Q40 13 7 10 L18 20 8 18 25 29 15 26 35 37 28 37 48 45Z" />
            </g>
            <g className="raven-wing wing-far">
              <path d="M61 37 Q81 9 113 4 L105 17 116 12 100 27 111 22 91 36 98 33 76 44Z" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}
