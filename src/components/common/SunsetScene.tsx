/** Escena original (SVG) de atardecer y palmeras. No usa fotografías ni logos protegidos. */
export function SunsetScene() {
  return (
    <svg
      className="sunset-scene"
      viewBox="0 0 600 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8062E9" />
          <stop offset="42%" stopColor="#FF4FA3" />
          <stop offset="100%" stopColor="#FFB45E" />
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF0C7" />
          <stop offset="50%" stopColor="#FFB45E" />
          <stop offset="100%" stopColor="#FF4FA3" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF784B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#10101B" stopOpacity="0.95" />
        </linearGradient>
        <mask id="sun-stripes">
          <rect width="600" height="420" fill="#fff" />
          {[248, 262, 276, 290, 304, 318].map((y, index) => (
            <rect key={y} x="200" y={y} width="320" height={3 + index} fill="#000" />
          ))}
        </mask>
      </defs>

      <rect width="600" height="420" fill="url(#sky)" />
      <circle cx="360" cy="225" r="128" fill="url(#sun)" mask="url(#sun-stripes)" />
      <rect y="268" width="600" height="152" fill="url(#water)" />

      <g stroke="#FFD9C0" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round">
        <path d="M250 288h220M285 302h150M235 318h250M300 336h120M260 356h200" />
      </g>

      <g fill="#10101B" stroke="#10101B" strokeLinecap="round">
        <path d="M96 420c5-80-12-140 14-206l14 3c-24 66-7 126-12 203Z" />
        <g fill="none" strokeWidth="7">
          <path d="M116 216C78 184 52 188 22 210" />
          <path d="M116 216C86 170 62 156 30 150" />
          <path d="M116 216c-8-44 4-66 16-88" />
          <path d="M116 216c34-42 64-48 92-36" />
          <path d="M116 216c38-22 70-18 98 0" />
        </g>
      </g>

      <g fill="#161126" stroke="#161126" strokeLinecap="round" transform="translate(452 74) scale(0.62)">
        <path d="M96 420c5-80-12-140 14-206l14 3c-24 66-7 126-12 203Z" />
        <g fill="none" strokeWidth="7">
          <path d="M116 216C78 184 52 188 22 210" />
          <path d="M116 216C86 170 62 156 30 150" />
          <path d="M116 216c-8-44 4-66 16-88" />
          <path d="M116 216c34-42 64-48 92-36" />
          <path d="M116 216c38-22 70-18 98 0" />
        </g>
      </g>
    </svg>
  );
}
