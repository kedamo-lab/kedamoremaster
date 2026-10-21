import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import '../botanical-motion.css';

// The original engraving is layered at runtime, keeping its texture and silhouette.
const birdOutline =
  'M508 0H1024V725L895 704L760 579L692 490L613 456L570 391L540 304L516 195Z';
const lowerBeak = 'M705 95L777 113L735 115L703 107Z';

export function LivingBotanical({ enabled }: { enabled: boolean }) {
  const id = `botanical-${useId().replace(/:/g, '')}`;
  const [callSequence, setCallSequence] = useState(0);
  const [calling, setCalling] = useState(false);
  const finishTimer = useRef<number>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const caw = useCallback((withSound = false) => {
    setCallSequence((value) => value + 1);
    setCalling(true);
    window.clearTimeout(finishTimer.current);
    finishTimer.current = window.setTimeout(() => setCalling(false), 3100);
    if (withSound && audioRef.current) {
      const audio = audioRef.current;
      audio.volume = 0.85;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        /* A denied sound never interrupts visual motion. */
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const first = window.setTimeout(() => caw(), 950);
    const repeat = window.setInterval(() => caw(), 6800);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(repeat);
      window.clearTimeout(finishTimer.current);
    };
  }, [enabled, caw]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      window.clearTimeout(finishTimer.current);
    };
  }, []);

  const art = `#${id}-art`;
  const clip = (name: string) => `url(#${id}-${name})`;

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/raven-caw.mp3"
        preload="none"
        hidden
        aria-hidden="true"
      />
      <svg
        className="living-botanical"
        viewBox="0 0 1024 1536"
        role="group"
        aria-label="Розы и ворон"
      >
        <defs>
          <image
            id={`${id}-art`}
            href="/art/roses-raven.png"
            width="1024"
            height="1536"
          />
          <mask
            id={`${id}-roses`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1024"
            height="1536"
            style={{ maskType: 'luminance' }}
          >
            <rect width="1024" height="1536" fill="white" />
            <path d={birdOutline} fill="black" />
          </mask>
          <mask
            id={`${id}-body`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1024"
            height="1536"
            style={{ maskType: 'luminance' }}
          >
            <path d={birdOutline} fill="white" />
            <rect x="500" width="350" height="162" fill="black" />
          </mask>
          <mask
            id={`${id}-head`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1024"
            height="1536"
            style={{ maskType: 'luminance' }}
          >
            <rect x="500" width="350" height="176" fill="white" />
            <path d={lowerBeak} fill="black" />
          </mask>
          <clipPath id={`${id}-jaw`}>
            <path d={lowerBeak} />
          </clipPath>
          <clipPath id={`${id}-wing`}>
            <path d="M617 185Q710 213 776 314L858 514L766 469Q659 385 634 275Z" />
          </clipPath>
          <clipPath id={`${id}-tail`}>
            <path d="M733 439L827 470L990 708L849 657Z" />
          </clipPath>
        </defs>
        <g className="botanical-stem">
          <g className="living-roses" aria-hidden="true">
            <use href={art} mask={clip('roses')} />
          </g>
          <g className="perched-raven">
            <g
              key={callSequence}
              className={`raven-gesture ${calling ? 'is-cawing' : ''}`}
              pointerEvents="none"
            >
              <g className="perched-raven-body">
                <use href={art} mask={clip('body')} />
                <g className="perched-raven-wing">
                  <use href={art} clipPath={clip('wing')} />
                </g>
                <g className="perched-raven-tail">
                  <use href={art} clipPath={clip('tail')} />
                </g>
              </g>
              <g className="perched-raven-head">
                <path
                  className="raven-mouth"
                  d="M702 95L778 113L718 134Z"
                  fill="#08070a"
                />
                <use href={art} mask={clip('head')} />
                <g className="raven-lower-beak">
                  <use href={art} clipPath={clip('jaw')} />
                </g>
                <ellipse
                  className="raven-eyelid"
                  cx="666"
                  cy="55"
                  rx="9"
                  ry="6"
                  fill="#151318"
                />
                {calling && (
                  <g
                    transform="translate(775 112)"
                    className="raven-voice"
                    aria-hidden="true"
                  >
                    <text className="raven-caw-text" x="12" y="-5">
                      кар
                    </text>
                    <text className="raven-caw-text caw-echo" x="12" y="-5">
                      кар
                    </text>
                  </g>
                )}
              </g>
            </g>
            <foreignObject
              className="raven-control"
              x="515"
              y="0"
              width="490"
              height="720"
            >
              <button
                type="button"
                className="raven-touch-target"
                aria-label="Ворон: каркнуть"
                onClick={() => caw(true)}
              />
            </foreignObject>
          </g>
          <g className="rose-petals" aria-hidden="true" pointerEvents="none">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <g
                key={index}
                transform={`translate(${[265, 325, 650][index % 3]} ${[470, 870, 1150][index % 3]})`}
              >
                <path
                  className="falling-rose-petal"
                  d="M-15-8Q9-27 23-3Q12 21-6 29Q-23 17-15-8Z"
                  fill="#53415e"
                  stroke="#bca5cb"
                  strokeWidth="1.5"
                  style={
                    {
                      '--petal-delay': `${index * -1.65}s`,
                      '--petal-duration': `${7 + (index % 3)}s`,
                      '--petal-drift': `${65 + index * 22}px`,
                    } as CSSProperties
                  }
                />
              </g>
            ))}
          </g>
        </g>
      </svg>
    </>
  );
}
