// Compact full-width brand hero banner: full-width sky, a ROUND Earth curving
// across the bottom (continents from the approved version), the wing + orbiting
// icons + wordmark centered. Deterministic markup; hw--prefixed; reduced-motion
// fallback in globals.css.

const STARS = Array.from({ length: 46 }, (_, i) => ({
  cx: (i * 211) % 720,
  cy: (i * 97) % 210,
  r: 0.5 + ((i * 7) % 11) / 10,
  d: ((i * 13) % 32) / 10,
}));

const LIGHTS = Array.from({ length: 18 }, (_, i) => ({
  left: 18 + ((i * 191) % 640) / 10,
  top: 12 + ((i * 143) % 640) / 10,
  d: ((i * 9) % 26) / 10,
  o: 0.4 + ((i * 5) % 6) / 10,
}));

const ORBS = ["✈️", "🏨", "🚗", "🧳", "🌍", "📍"];

export default function Hero() {
  return (
    <div className="hw-sky">
      <h2 className="hw-sr">
        Hiddenwing — travel icons orbit a glowing wing above a night Earth with green continents and
        city lights, while planes cross the globe.
      </h2>
      <div className="hw-nebula" />

      <svg className="hw-starfield" viewBox="0 0 720 470" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
        <defs>
          <linearGradient id="hw-pg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eef4ff" />
            <stop offset="1" stopColor="#b3caff" />
          </linearGradient>
        </defs>
        <g>
          {STARS.map((s, i) => (
            <circle key={i} className="hw-star" cx={s.cx} cy={s.cy} r={s.r} style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>
        <g>
          <path className="hw-planefar" d="M-9,-4 L9,0 L-9,4 L-4,0 Z" fill="url(#hw-pg)" />
          <animateMotion dur="10s" repeatCount="indefinite" rotate="auto" calcMode="linear">
            <mpath href="#hw-rt" />
          </animateMotion>
        </g>
        <path id="hw-rt" d="M20,60 C240,34 520,26 700,16" fill="none" />
      </svg>

      <div className="hw-scene">
        <div className="hw-earth" />

        <svg className="hw-layer" viewBox="0 0 720 470" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <clipPath id="hw-eclip">
              <circle cx="360" cy="941" r="650" />
            </clipPath>
          </defs>
          <g clipPath="url(#hw-eclip)">
            <path fill="#3f9a54" d="M96,472 C104,410 176,382 258,392 C330,401 392,380 424,414 C450,442 414,466 356,470 C280,475 150,478 96,472 Z" />
            <path fill="#54b167" opacity="0.6" d="M120,452 C150,420 210,404 270,410 C324,415 372,404 404,416 C372,430 316,426 262,434 C206,442 158,452 120,452 Z" />
            <path fill="#3c9450" d="M474,472 C480,428 530,402 598,408 C660,414 712,394 720,430 C726,454 700,468 654,470 C580,474 504,474 474,472 Z" />
            <path fill="#52ae64" opacity="0.55" d="M494,452 C520,428 566,414 616,420 C566,432 520,432 494,452 Z" />
            <path fill="#49a35b" d="M300,360 C316,351 342,353 350,366 C356,379 342,391 322,390 C302,389 286,372 300,360 Z" />
          </g>
        </svg>

        <svg className="hw-layer" viewBox="0 0 720 470" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path id="hw-pa" className="hw-ftrail" d="M-40,418 Q360,332 760,406" />
          <path id="hw-pb" className="hw-ftrail" d="M760,372 Q360,316 -40,398" />
          <g>
            <path className="hw-plane2" d="M-11,-5 L11,0 L-11,5 L-5,0 Z" fill="#eaf2ff" />
            <animateMotion dur="15s" repeatCount="indefinite" rotate="auto" calcMode="linear">
              <mpath href="#hw-pa" />
            </animateMotion>
          </g>
          <g opacity="0.85">
            <path className="hw-plane2" d="M-9,-4 L9,0 L-9,4 L-4,0 Z" fill="#eaf2ff" />
            <animateMotion dur="19s" begin="-7s" repeatCount="indefinite" rotate="auto" calcMode="linear">
              <mpath href="#hw-pb" />
            </animateMotion>
          </g>
        </svg>

        <div className="hw-atmo" />

        <div className="hw-lights">
          {LIGHTS.map((l, i) => (
            <span
              key={i}
              className="hw-lite"
              style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.d}s`, opacity: l.o }}
            />
          ))}
        </div>

        <div className="hw-center">
          <div className="hw-stage">
            <svg className="hw-ringguide" viewBox="0 0 280 150" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx="140" cy="75" rx="122" ry="48" fill="none" stroke="rgba(160,190,255,.2)" strokeWidth="1" strokeDasharray="3 8" />
            </svg>
            <div className="hw-glow" />
            {ORBS.map((e, i) => (
              <div key={i} className={`hw-orb hw-o${i + 1}`}>
                {e}
              </div>
            ))}
            <div className="hw-wing">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="hw-wg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5b9bff" />
                    <stop offset="1" stopColor="#8a6bff" />
                  </linearGradient>
                </defs>
                <path d="M2 13.5 L21 3 L13.5 12.5 L21.5 21 Z" fill="url(#hw-wg)" />
                <path d="M2 13.5 L13.5 12.5 L8.5 20 Z" fill="url(#hw-wg)" opacity="0.55" />
              </svg>
            </div>
          </div>
          <div className="hw-wordmark">Hiddenwing</div>
          <p className="hw-tag">The best trip for you — not just the cheapest flight.</p>
        </div>
      </div>
      <div className="hw-fade" />
    </div>
  );
}
