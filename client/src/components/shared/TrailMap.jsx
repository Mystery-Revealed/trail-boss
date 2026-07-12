// TrailMap.jsx — the interactive cattle-trail map (spec §3.1). Pure SVG, so it
// stays crisp at any size and is keyboard accessible. Each trail ships its own
// ordered WAYPOINTS (meta.variants[variant].waypoints): six "leg" waypoints the
// herd walks in order, plus a few "option" nodes for the crossings and lanes a
// map action lets you choose between.
//
// The teachable idea (spec §3.1): the geography IS the scoreboard. The herd 🐂
// advances one waypoint per leg, north toward the railhead, past rivers and dry
// country and quarantine lines. Where a map action offers real places, those
// waypoints glow and can be tapped.
//
// Placement is server truth: markers render only from `map.positions`. The
// component holds no state; `eligible`/`selected`/`onSelect` are controlled by
// the parent (MatchView). Colorblind-safe: hazards and the herd read by SHAPE and
// ICON, never color alone.

const VIEW_W = 460;
const VIEW_H = 560;

// Small hand-drawn glyphs for each placed-marker type (22×22 box, drawn at origin).
function MarkerGlyph({ marker }) {
  if (marker === 'ford') {
    // A river crossing: stacked wavy lines.
    return (
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2,7 q4,-4 8,0 t8,0" />
        <path d="M2,12 q4,-4 8,0 t8,0" />
        <path d="M2,17 q4,-4 8,0 t8,0" />
      </g>
    );
  }
  if (marker === 'camp') {
    // A camp: a tent with a little fire.
    return (
      <g>
        <path d="M11,4 L18,16 H4 Z" fill="currentColor" />
        <path d="M11,4 L11,16" stroke="#fff" strokeWidth="1.2" />
        <circle cx="11" cy="18.5" r="1.6" fill="var(--gold, #d99a2b)" />
      </g>
    );
  }
  if (marker === 'route') {
    // Route taken: a pair of chevrons pointing on up the trail.
    return (
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5,13 L11,6 L17,13" />
        <path d="M5,18 L11,11 L17,18" />
      </g>
    );
  }
  // herd — a longhorn head with wide horns.
  return (
    <g>
      <path d="M4,9 Q11,3 18,9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="11" cy="13" rx="4.4" ry="5" fill="currentColor" />
      <circle cx="9.3" cy="12.5" r="0.9" fill="#fff" />
      <circle cx="12.7" cy="12.5" r="0.9" fill="#fff" />
    </g>
  );
}

// The herd token — the bigger marker that shows where the drive is right now.
function HerdToken() {
  return (
    <g aria-hidden="true">
      <circle r="13" className="herd-token-bg" />
      <g transform="translate(-11,-11)"><g className="herd-token-glyph"><MarkerGlyph marker="herd" /></g></g>
    </g>
  );
}

// A small hazard badge (⚠ triangle) for waypoints that carry danger — a river, a
// dry drive, a quarantine line. Shape + icon, so it never relies on color alone.
function HazardBadge() {
  return (
    <g aria-hidden="true">
      <path d="M0,-8 L8,7 L-8,7 Z" className="hazard-badge" />
      <path d="M0,-3 L0,3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="0" cy="5" r="1" fill="#fff" />
    </g>
  );
}

export default function TrailMap({
  meta,                 // { meters, markers, variants: { [id]: { waypoints, ... } } }
  variant,              // which trail — 'chisholm' | 'goodnight' | 'western'
  map,                  // { positions: { id: { markers: [{ side, marker }] } } }
  legIndex = 0,         // current leg (0..5) — the herd sits at leg legIndex+1
  eligible = [],        // waypoint ids that are choices this step (highlighted)
  selected = null,      // waypoint id currently picked
  onSelect,
}) {
  const v = meta?.variants?.[variant] || {};
  const waypoints = v.waypoints || [];
  const byId = Object.fromEntries(waypoints.map((w) => [w.id, w]));
  const mainLine = waypoints.filter((w) => w.leg).sort((a, b) => a.leg - b.leg);
  const eligibleSet = new Set(eligible);
  const interactive = eligibleSet.size > 0;

  // The herd rides at the current leg's main waypoint (clamped to the last leg).
  const herdLeg = Math.min(legIndex + 1, mainLine.length);
  const herdAt = mainLine.find((w) => w.leg === herdLeg) || mainLine[0];

  // Path string down the main line (a smooth-ish polyline).
  const linePts = mainLine.map((w) => `${w.x},${w.y}`).join(' ');
  // How far the herd has come, for the "trail behind" styling.
  const doneIdx = herdLeg - 1;

  return (
    <svg
      className={`trail-map ${interactive ? 'selectable' : ''}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="group"
      aria-label={`${v.name || 'Cattle trail'} map — the herd is on leg ${herdLeg} of ${mainLine.length}`}
    >
      <defs>
        <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#4a3413" floodOpacity="0.3" />
        </filter>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="sky-top" />
          <stop offset="1" className="sky-bottom" />
        </linearGradient>
      </defs>

      {/* land */}
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} className="map-land" rx="14" />
      <rect x="0" y="0" width={VIEW_W} height="120" className="map-sky" rx="14" fill="url(#skyFade)" />
      <text x={VIEW_W - 16} y="30" textAnchor="end" className="railhead-label">▲ North · the railhead</text>

      {/* the trail — a dashed line down the legs, "behind" solid and "ahead" faint */}
      <polyline points={linePts} className="trail-line ahead" />
      {doneIdx > 0 && (
        <polyline points={mainLine.slice(0, doneIdx + 1).map((w) => `${w.x},${w.y}`).join(' ')} className="trail-line behind" />
      )}

      {/* spurs from a main leg to its option nodes (thin dotted connectors) */}
      {waypoints.filter((w) => w.option).map((w) => {
        // connect each option to the nearest main-line waypoint
        let nearest = mainLine[0];
        let best = Infinity;
        for (const m of mainLine) {
          const d = (m.x - w.x) ** 2 + (m.y - w.y) ** 2;
          if (d < best) { best = d; nearest = m; }
        }
        return <line key={`spur-${w.id}`} x1={w.x} y1={w.y} x2={nearest.x} y2={nearest.y} className="trail-spur" />;
      })}

      {/* waypoints */}
      {waypoints.map((w) => {
        const markers = map?.positions?.[w.id]?.markers || [];
        const isEligible = eligibleSet.has(w.id);
        const isSelected = selected === w.id;
        const isOption = !!w.option;
        const cls = [
          'wp-dot',
          isOption ? 'option' : 'main',
          w.hazard ? 'hazard' : '',
          isEligible ? 'clickable' : '',
          isSelected ? 'selected' : '',
        ].filter(Boolean).join(' ');
        const labelAnchor = w.x > VIEW_W - 120 ? 'end' : w.x < 120 ? 'start' : 'middle';
        const lx = labelAnchor === 'end' ? w.x - 12 : labelAnchor === 'start' ? w.x + 12 : w.x;
        const ly = w.y + (isOption ? 4 : 22);

        return (
          <g key={w.id} className="wp-group">
            {(isEligible || isSelected) && (
              <circle cx={w.x} cy={w.y} r={isOption ? 14 : 18} className={`wp-halo ${isSelected ? 'selected' : 'eligible'}`} />
            )}

            <circle cx={w.x} cy={w.y} r={isOption ? 5.5 : 8} className={cls} filter="url(#mapShadow)"
                    role={isEligible ? undefined : 'img'} aria-label={isEligible ? undefined : w.name} />

            {/* hazard badge, up-right of the dot */}
            {w.hazard && (
              <g transform={`translate(${w.x + (isOption ? 9 : 12)}, ${w.y - (isOption ? 9 : 12)}) scale(0.8)`}>
                <HazardBadge />
              </g>
            )}

            {/* label */}
            <text x={lx} y={ly} textAnchor={labelAnchor}
                  className={`wp-label ${isOption ? 'option' : 'main'} ${w.hazard ? 'hazard' : ''}`}>
              {w.name}
            </text>

            {/* placed markers, in a small row under/right of the dot */}
            {markers.slice(0, 3).map((m, i) => (
              <g key={i} className="placed-marker" transform={`translate(${w.x - 16 + i * 13}, ${w.y - 26})`} aria-hidden="true">
                <circle cx="6" cy="6" r="8.5" className="placed-halo" />
                <g className="placed-glyph" transform="translate(-5,-5) scale(0.5)"><MarkerGlyph marker={m.marker} /></g>
              </g>
            ))}

            {/* generous transparent hit target LAST so it sits on top and actually
                receives taps (only when this waypoint is a choice this step) */}
            {isEligible && (
              <circle
                cx={w.x} cy={w.y} r="24" className="wp-hit"
                role="button" tabIndex={0}
                aria-label={`${w.name}${w.sub ? ` (${w.sub})` : ''}${w.hazard ? ', marked as dangerous on the map' : ''}. Press Enter to choose this.`}
                onClick={() => onSelect?.(w.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(w.id); } }}
              />
            )}
          </g>
        );
      })}

      {/* the herd token — where the drive is right now */}
      {herdAt && (
        <g transform={`translate(${herdAt.x}, ${herdAt.y})`} className="herd-token">
          <HerdToken />
          <text x="0" y="26" textAnchor="middle" className="herd-label">the herd</text>
        </g>
      )}

      {/* compass */}
      <g transform="translate(34, 522)" className="map-compass" aria-hidden="true">
        <circle r="15" />
        <path d="M0,-12 L4,0 L0,12 L-4,0 Z" />
        <text y="-18" textAnchor="middle">N</text>
      </g>
    </svg>
  );
}

export { MarkerGlyph, HazardBadge };
