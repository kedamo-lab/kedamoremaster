import type { CSSProperties } from 'react';

export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="mist mist-left" />
      <div className="mist mist-right" />
      <div className="film-grain" />
      {Array.from({ length: 14 }, (_, index) => (
        <i
          className="ash"
          key={index}
          style={
            {
              '--x': `${(index * 37 + 11) % 100}%`,
              '--delay': `${index * -2.7}s`,
              '--duration': `${17 + (index % 5) * 3}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function ThornHalo() {
  return (
    <svg
      className="thorn-halo"
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="250"
        cy="250"
        rx="168"
        ry="200"
        stroke="currentColor"
        strokeWidth=".6"
      />
      <ellipse
        cx="250"
        cy="250"
        rx="177"
        ry="209"
        stroke="currentColor"
        strokeWidth=".35"
      />
      {[0, 90, 180, 270].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 250 250)`}>
          <path
            d="M250 5 244 50 229 77 246 64 250 106 254 64 271 77 256 50Z"
            fill="currentColor"
          />
          <path
            d="M250 52 Q222 87 195 85 L216 101 192 111 Q228 109 243 78M250 52 Q278 87 305 85 L284 101 308 111 Q272 109 257 78"
            stroke="currentColor"
            strokeWidth=".8"
          />
        </g>
      ))}
      {[45, 135, 225, 315].map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle} 250 250)`}
          d="M250 16 246 51 250 72 254 51ZM250 83V115"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth=".6"
        />
      ))}
    </svg>
  );
}
