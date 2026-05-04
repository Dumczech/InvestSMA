'use client';

import { useRef, useState, type ReactNode } from 'react';

// Editorial chart system — SVG, sand+ink+gold, hover tooltips. Faithful
// port of the design's guide-charts.jsx. Marked 'use client' because
// each chart tracks pointer position via useRef + useState for the
// hover tooltip + active-index highlight.

const C = {
  bg:        '#ECE3CD',
  ink:       '#14130F',
  ink2:      '#3A362F',
  ink3:      'rgba(20,19,15,0.55)',
  rule:      'rgba(20,19,15,0.18)',
  rule2:     'rgba(20,19,15,0.08)',
  gold:      '#B08A3E',
  goldLight: 'rgba(176,138,62,0.18)',
} as const;

type Padding = { top: number; right: number; bottom: number; left: number };
type Hover = { x: number; y: number };

function ChartFrame({
  width = 800, height = 360, padding,
  children, ariaLabel,
}: {
  width?: number;
  height?: number;
  padding: Padding;
  children: (ctx: { width: number; height: number; padding: Padding; hover: Hover | null }) => ReactNode;
  ariaLabel: string;
}) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = ref.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    setHover({ x: local.x, y: local.y });
  };
  const handleLeave = () => setHover(null);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width='100%'
      style={{ display: 'block', userSelect: 'none' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      role='img'
      aria-label={ariaLabel}
    >
      <rect x='0' y='0' width={width} height={height} fill={C.bg} />
      {children({ width, height, padding, hover })}
    </svg>
  );
}

function TickLabel({ x, y, anchor = 'middle', children, size = 10 }: {
  x: number; y: number; anchor?: 'start' | 'middle' | 'end'; children: ReactNode; size?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor}
      style={{ fontFamily: 'var(--f-mono)', fontSize: size, fill: C.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {children}
    </text>
  );
}

function AxisLabel({ x, y, anchor = 'middle', rotate, children }: {
  x: number; y: number; anchor?: 'start' | 'middle' | 'end'; rotate?: number; children: ReactNode;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} transform={rotate != null ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fill: C.ink3, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
      {children}
    </text>
  );
}

// ---------------------------------------------------------------------------
// Seasonality — ADR (gold line) + occupancy (ink bars), 2025 LRM monthly
// ---------------------------------------------------------------------------

function SeasonalityChart() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const anr = [6591, 6754, 7912, 7613, 6464, 5663, 5643, 5347, 5421, 6719, 7982, 8585];
  const occ = [60, 69, 63, 56, 53, 56, 69, 59, 49, 62, 66, 61];

  const W = 800, H = 360;
  const pad: Padding = { top: 28, right: 76, bottom: 44, left: 64 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i + 0.5) * (innerW / months.length);
  const anrMax = 9000;
  const yANR = (v: number) => pad.top + innerH * (1 - v / anrMax);
  const yOcc = (v: number) => pad.top + innerH * (1 - v / 100);
  const barW = innerW / months.length * 0.62;
  const linePath = anr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yANR(v)}`).join(' ');

  return (
    <ChartFrame width={W} height={H} padding={pad} ariaLabel='ANR and occupancy by month, San Miguel de Allende market'>
      {({ hover }) => {
        let activeIdx: number | null = null;
        if (hover && hover.x >= pad.left && hover.x <= W - pad.right) {
          activeIdx = Math.min(months.length - 1, Math.max(0, Math.floor((hover.x - pad.left) / (innerW / months.length))));
        }
        return (
          <g>
            {[0, 25, 50, 75, 100].map(p => (
              <g key={p}>
                <line x1={pad.left} y1={yOcc(p)} x2={W - pad.right} y2={yOcc(p)} stroke={C.rule2} strokeWidth='0.6' />
                <TickLabel x={pad.left - 10} y={yOcc(p) + 3} anchor='end'>{p}%</TickLabel>
              </g>
            ))}
            {[0, 2000, 4000, 6000, 8000].map(v => (
              <TickLabel key={v} x={W - pad.right + 10} y={yANR(v) + 3} anchor='start'>MXN {(v / 1000).toFixed(0)}k</TickLabel>
            ))}
            {occ.map((v, i) => (
              <rect key={i} x={x(i) - barW / 2} y={yOcc(v)} width={barW} height={innerH - (yOcc(v) - pad.top)}
                fill={C.ink} opacity={activeIdx === null || activeIdx === i ? 0.85 : 0.25} />
            ))}
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke={C.ink} strokeWidth='1' />
            {months.map((m, i) => (
              <TickLabel key={m} x={x(i)} y={H - pad.bottom + 16}>{m}</TickLabel>
            ))}
            <path d={linePath} fill='none' stroke={C.gold} strokeWidth='2' />
            {anr.map((v, i) => (
              <circle key={i} cx={x(i)} cy={yANR(v)} r={activeIdx === i ? 5 : 3} fill={C.gold} stroke={C.bg} strokeWidth='1.5' />
            ))}
            <AxisLabel x={pad.left - 46} y={pad.top + innerH / 2} rotate={-90}>Occupancy</AxisLabel>
            <AxisLabel x={W - pad.right + 56} y={pad.top + innerH / 2} rotate={90}>ADR (MXN)</AxisLabel>
            <g transform={`translate(${pad.left}, ${pad.top - 14})`}>
              <rect x='0' y='-7' width='10' height='10' fill={C.ink} opacity='0.85' />
              <text x='14' y='2' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Occupancy</text>
              <line x1='110' y1='-2' x2='124' y2='-2' stroke={C.gold} strokeWidth='2' />
              <circle cx='117' cy='-2' r='3' fill={C.gold} />
              <text x='130' y='2' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>ADR (MXN)</text>
            </g>
            {activeIdx !== null && (
              <g>
                <line x1={x(activeIdx)} y1={pad.top} x2={x(activeIdx)} y2={H - pad.bottom} stroke={C.gold} strokeWidth='0.6' strokeDasharray='2 3' />
                <g transform={`translate(${Math.min(W - pad.right - 140, Math.max(pad.left + 4, x(activeIdx) + 10))}, ${pad.top + 6})`}>
                  <rect x='0' y='0' width='138' height='48' fill={C.bg} stroke={C.ink} strokeWidth='1' />
                  <text x='8' y='14' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{months[activeIdx]} 2025</text>
                  <text x='8' y='28' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>ADR  MXN {anr[activeIdx].toLocaleString()}</text>
                  <text x='8' y='42' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>OCC  {occ[activeIdx]}%</text>
                </g>
              </g>
            )}
          </g>
        );
      }}
    </ChartFrame>
  );
}

// ---------------------------------------------------------------------------
// Amenity uplift — horizontal bars, ADR + occupancy %
// ---------------------------------------------------------------------------

function AmenityUpliftChart() {
  const items = [
    { label: 'Heated pool',              adr: 22, occ: 8  },
    { label: 'Rooftop terrace + view',   adr: 18, occ: 6  },
    { label: 'Pro photography',          adr: 12, occ: 14 },
    { label: 'Outdoor dining (8+ seats)', adr: 9, occ: 5  },
    { label: 'Working fireplace',        adr: 7,  occ: 4  },
    { label: 'On-site parking',          adr: 5,  occ: 7  },
    { label: 'AC in all bedrooms',       adr: 4,  occ: 9  },
  ];
  const W = 800, H = 360;
  const pad: Padding = { top: 32, right: 60, bottom: 36, left: 200 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = 26;
  const rowH = innerH / items.length;
  const xv = (v: number) => pad.left + (v / max) * innerW;

  return (
    <ChartFrame width={W} height={H} padding={pad} ariaLabel='ADR and occupancy uplift by amenity'>
      {({ hover }) => {
        let activeIdx: number | null = null;
        if (hover && hover.x >= pad.left - 60 && hover.x <= W - pad.right) {
          const i = Math.floor((hover.y - pad.top) / rowH);
          if (i >= 0 && i < items.length) activeIdx = i;
        }
        return (
          <g>
            {[0, 5, 10, 15, 20, 25].map(v => (
              <g key={v}>
                <line x1={xv(v)} y1={pad.top} x2={xv(v)} y2={H - pad.bottom} stroke={C.rule2} strokeWidth='0.6' />
                <TickLabel x={xv(v)} y={H - pad.bottom + 16}>+{v}%</TickLabel>
              </g>
            ))}
            {items.map((it, i) => {
              const y = pad.top + i * rowH + rowH * 0.18;
              const h = rowH * 0.32;
              const active = activeIdx === i;
              return (
                <g key={it.label}>
                  <text x={pad.left - 14} y={pad.top + i * rowH + rowH / 2 + 4} textAnchor='end'
                    style={{ fontFamily: 'var(--f-display)', fontSize: 13, fill: C.ink, fontStyle: 'italic' }}>
                    {it.label}
                  </text>
                  <rect x={pad.left} y={y} width={xv(it.adr) - pad.left} height={h} fill={C.gold} opacity={activeIdx === null || active ? 1 : 0.35} />
                  <text x={xv(it.adr) + 6} y={y + h - 1} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>+{it.adr}% ADR</text>
                  <rect x={pad.left} y={y + h + 2} width={xv(it.occ) - pad.left} height={h} fill={C.ink} opacity={activeIdx === null || active ? 0.85 : 0.25} />
                  <text x={xv(it.occ) + 6} y={y + h * 2 + 1} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>+{it.occ}% OCC</text>
                </g>
              );
            })}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke={C.ink} strokeWidth='1' />
            <g transform={`translate(${pad.left}, ${pad.top - 14})`}>
              <rect x='0' y='-8' width='10' height='10' fill={C.gold} />
              <text x='14' y='1' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>ADR uplift</text>
              <rect x='110' y='-8' width='10' height='10' fill={C.ink} opacity='0.85' />
              <text x='124' y='1' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Occupancy uplift</text>
            </g>
          </g>
        );
      }}
    </ChartFrame>
  );
}

// ---------------------------------------------------------------------------
// Zone ADR — bars + low-high whiskers
// ---------------------------------------------------------------------------

function ZoneADRChart() {
  const zones = [
    { name: 'Centro',      low: 380, mid: 540, high: 780 },
    { name: 'Guadiana',    low: 320, mid: 460, high: 640 },
    { name: 'Atascadero',  low: 360, mid: 520, high: 760 },
    { name: 'Ojo de Agua', low: 300, mid: 420, high: 580 },
    { name: 'Los Frailes', low: 280, mid: 380, high: 520 },
    { name: 'San Antonio', low: 220, mid: 310, high: 420 },
  ];
  const W = 800, H = 360;
  const pad: Padding = { top: 32, right: 32, bottom: 56, left: 56 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = 800;
  const x = (i: number) => pad.left + (i + 0.5) * (innerW / zones.length);
  const y = (v: number) => pad.top + innerH * (1 - v / max);
  const bw = innerW / zones.length * 0.4;

  return (
    <ChartFrame width={W} height={H} padding={pad} ariaLabel='ADR range by zone'>
      {({ hover }) => {
        let activeIdx: number | null = null;
        if (hover && hover.x >= pad.left && hover.x <= W - pad.right) {
          activeIdx = Math.min(zones.length - 1, Math.max(0, Math.floor((hover.x - pad.left) / (innerW / zones.length))));
        }
        return (
          <g>
            {[0, 200, 400, 600, 800].map(v => (
              <g key={v}>
                <line x1={pad.left} y1={y(v)} x2={W - pad.right} y2={y(v)} stroke={C.rule2} strokeWidth='0.6' />
                <TickLabel x={pad.left - 10} y={y(v) + 3} anchor='end'>${v}</TickLabel>
              </g>
            ))}
            {zones.map((z, i) => {
              const op = activeIdx === null || activeIdx === i ? 1 : 0.3;
              return (
                <g key={z.name} opacity={op}>
                  <line x1={x(i)} y1={y(z.low)} x2={x(i)} y2={y(z.high)} stroke={C.ink} strokeWidth='1' />
                  <line x1={x(i) - 8} y1={y(z.low)} x2={x(i) + 8} y2={y(z.low)} stroke={C.ink} strokeWidth='1' />
                  <line x1={x(i) - 8} y1={y(z.high)} x2={x(i) + 8} y2={y(z.high)} stroke={C.ink} strokeWidth='1' />
                  <rect x={x(i) - bw / 2} y={y(z.mid) - 3} width={bw} height={6} fill={C.gold} />
                  <text x={x(i)} y={y(z.mid) - 8} textAnchor='middle'
                    style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fill: C.ink, fontWeight: 600 }}>${z.mid}</text>
                </g>
              );
            })}
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke={C.ink} strokeWidth='1' />
            {zones.map((z, i) => (
              <text key={z.name} x={x(i)} y={H - pad.bottom + 18} textAnchor='middle'
                style={{ fontFamily: 'var(--f-display)', fontSize: 12, fill: C.ink, fontStyle: 'italic' }}>{z.name}</text>
            ))}
            <AxisLabel x={pad.left - 38} y={pad.top + innerH / 2} rotate={-90}>Median ADR (USD)</AxisLabel>
            <g transform={`translate(${pad.left}, ${pad.top - 14})`}>
              <rect x='0' y='-8' width='14' height='6' fill={C.gold} />
              <text x='20' y='0' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Median</text>
              <line x1='100' y1='-5' x2='100' y2='5' stroke={C.ink} strokeWidth='1' />
              <line x1='96' y1='-5' x2='104' y2='-5' stroke={C.ink} strokeWidth='1' />
              <line x1='96' y1='5' x2='104' y2='5' stroke={C.ink} strokeWidth='1' />
              <text x='110' y='2' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Low–high range</text>
            </g>
            {activeIdx !== null && (() => {
              const z = zones[activeIdx];
              return (
                <g transform={`translate(${Math.min(W - 170, Math.max(8, x(activeIdx) + 16))}, ${pad.top + 8})`}>
                  <rect x='0' y='0' width='160' height='64' fill={C.bg} stroke={C.ink} strokeWidth='1' />
                  <text x='8' y='14' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{z.name}</text>
                  <text x='8' y='30' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>Median  ${z.mid}</text>
                  <text x='8' y='44' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>Range   ${z.low}–${z.high}</text>
                  <text x='8' y='58' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>Spread  ${z.high - z.low}</text>
                </g>
              );
            })()}
          </g>
        );
      }}
    </ChartFrame>
  );
}

// ---------------------------------------------------------------------------
// Photo conversion — area + line, 5 tiers
// ---------------------------------------------------------------------------

function PhotoConversionChart() {
  const tiers = [
    { name: 'Phone photos',          x: 1, conv: 1.0, ttb: 28 },
    { name: 'Owner DSLR',            x: 2, conv: 1.4, ttb: 21 },
    { name: 'Local pro photographer',x: 3, conv: 2.1, ttb: 12 },
    { name: 'Pro + drone + twilight',x: 4, conv: 2.8, ttb: 7  },
    { name: 'Pro + styling + video', x: 5, conv: 3.4, ttb: 5  },
  ];
  const W = 800, H = 360;
  const pad: Padding = { top: 32, right: 56, bottom: 64, left: 56 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = (i: number) => pad.left + ((i + 0.5) / tiers.length) * innerW;
  const yMax = 4;
  const y = (v: number) => pad.top + innerH * (1 - v / yMax);
  const path = tiers.map((t, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(t.conv)}`).join(' ');
  const areaPath = `${path} L ${x(tiers.length - 1)} ${H - pad.bottom} L ${x(0)} ${H - pad.bottom} Z`;

  return (
    <ChartFrame width={W} height={H} padding={pad} ariaLabel='Photo tier vs booking conversion'>
      {({ hover }) => {
        let activeIdx: number | null = null;
        if (hover && hover.x >= pad.left && hover.x <= W - pad.right) {
          activeIdx = Math.min(tiers.length - 1, Math.max(0, Math.floor((hover.x - pad.left) / (innerW / tiers.length))));
        }
        return (
          <g>
            {[0, 1, 2, 3, 4].map(v => (
              <g key={v}>
                <line x1={pad.left} y1={y(v)} x2={W - pad.right} y2={y(v)} stroke={C.rule2} strokeWidth='0.6' />
                <TickLabel x={pad.left - 10} y={y(v) + 3} anchor='end'>{v.toFixed(1)}×</TickLabel>
              </g>
            ))}
            <path d={areaPath} fill={C.goldLight} />
            <path d={path} fill='none' stroke={C.gold} strokeWidth='2' />
            {tiers.map((t, i) => (
              <g key={t.name}>
                <circle cx={x(i)} cy={y(t.conv)} r={activeIdx === i ? 7 : 4.5} fill={C.ink} />
                <circle cx={x(i)} cy={y(t.conv)} r={activeIdx === i ? 3.5 : 2} fill={C.gold} />
              </g>
            ))}
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke={C.ink} strokeWidth='1' />
            {tiers.map((t, i) => (
              <g key={t.name}>
                <text x={x(i)} y={H - pad.bottom + 18} textAnchor='middle'
                  style={{ fontFamily: 'var(--f-display)', fontSize: 11, fill: C.ink, fontStyle: 'italic' }}>Tier {t.x}</text>
                <text x={x(i)} y={H - pad.bottom + 34} textAnchor='middle'
                  style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fill: C.ink3, letterSpacing: '0.06em' }}>{t.name}</text>
              </g>
            ))}
            <AxisLabel x={pad.left - 38} y={pad.top + innerH / 2} rotate={-90}>Booking conversion (× baseline)</AxisLabel>
            {activeIdx !== null && (() => {
              const t = tiers[activeIdx];
              return (
                <g transform={`translate(${Math.min(W - 170, Math.max(8, x(activeIdx) + 16))}, ${pad.top + 8})`}>
                  <rect x='0' y='0' width='160' height='64' fill={C.bg} stroke={C.ink} strokeWidth='1' />
                  <text x='8' y='14' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Tier {t.x}</text>
                  <text x='8' y='30' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>Conv    {t.conv.toFixed(1)}× baseline</text>
                  <text x='8' y='44' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>Time-to-book  {t.ttb} d</text>
                  <text x='8' y='58' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>{t.name}</text>
                </g>
              );
            })()}
          </g>
        );
      }}
    </ChartFrame>
  );
}

// ---------------------------------------------------------------------------
// Owner usage — revenue lost per blocked week, bars by month
// ---------------------------------------------------------------------------

function OwnerUsageChart() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const cost  = [27728, 32797, 35033, 29924, 24108, 22210, 27149, 21944, 18668, 29257, 36847, 36836];
  const W = 800, H = 360;
  const pad: Padding = { top: 36, right: 32, bottom: 44, left: 76 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = 40000;
  const x = (i: number) => pad.left + (i + 0.5) * (innerW / months.length);
  const y = (v: number) => pad.top + innerH * (1 - v / max);
  const bw = innerW / months.length * 0.62;
  const avg = cost.reduce((a, b) => a + b, 0) / cost.length;

  return (
    <ChartFrame width={W} height={H} padding={pad} ariaLabel='Revenue lost per owner-blocked week, by month'>
      {({ hover }) => {
        let activeIdx: number | null = null;
        if (hover && hover.x >= pad.left && hover.x <= W - pad.right) {
          activeIdx = Math.min(months.length - 1, Math.max(0, Math.floor((hover.x - pad.left) / (innerW / months.length))));
        }
        return (
          <g>
            {[0, 10000, 20000, 30000, 40000].map(v => (
              <g key={v}>
                <line x1={pad.left} y1={y(v)} x2={W - pad.right} y2={y(v)} stroke={C.rule2} strokeWidth='0.6' />
                <TickLabel x={pad.left - 10} y={y(v) + 3} anchor='end'>MXN {(v / 1000).toFixed(0)}k</TickLabel>
              </g>
            ))}
            <line x1={pad.left} y1={y(avg)} x2={W - pad.right} y2={y(avg)} stroke={C.ink} strokeWidth='0.8' strokeDasharray='3 3' opacity='0.5' />
            <text x={W - pad.right - 4} y={y(avg) - 6} textAnchor='end'
              style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fill: C.ink2, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Avg MXN {Math.round(avg).toLocaleString()}
            </text>
            {cost.map((v, i) => {
              const isPeak = v >= 32000;
              const active = activeIdx === i;
              return (
                <g key={i} opacity={activeIdx === null || active ? 1 : 0.35}>
                  <rect x={x(i) - bw / 2} y={y(v)} width={bw} height={innerH - (y(v) - pad.top)}
                    fill={isPeak ? C.gold : C.ink} opacity={isPeak ? 1 : 0.85} />
                  {(active || isPeak) && (
                    <text x={x(i)} y={y(v) - 6} textAnchor='middle'
                      style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink, fontWeight: 600 }}>
                      {(v / 1000).toFixed(1)}k
                    </text>
                  )}
                </g>
              );
            })}
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke={C.ink} strokeWidth='1' />
            {months.map((m, i) => (
              <TickLabel key={m} x={x(i)} y={H - pad.bottom + 16}>{m}</TickLabel>
            ))}
            <AxisLabel x={pad.left - 56} y={pad.top + innerH / 2} rotate={-90}>Revenue lost per blocked week (MXN)</AxisLabel>
            <g transform={`translate(${pad.left}, ${pad.top - 18})`}>
              <rect x='0' y='-8' width='10' height='10' fill={C.gold} />
              <text x='14' y='1' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Peak month</text>
              <rect x='110' y='-8' width='10' height='10' fill={C.ink} opacity='0.85' />
              <text x='124' y='1' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Off / shoulder</text>
            </g>
          </g>
        );
      }}
    </ChartFrame>
  );
}

// ---------------------------------------------------------------------------
// 5-year projection — base / bull / bear
// ---------------------------------------------------------------------------

function ProjectionChart() {
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  const base = [1_100_000, 1_180_000, 1_220_000, 1_260_000, 1_300_000, 1_350_000];
  const bear = [950_000, 1_000_000, 1_010_000, 1_020_000, 1_030_000, 1_040_000];
  const bull = [1_290_000, 1_440_000, 1_510_000, 1_580_000, 1_650_000, 1_720_000];

  const W = 800, H = 360;
  const pad: Padding = { top: 32, right: 96, bottom: 44, left: 76 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const yMin = 800_000, yMax = 1_800_000;
  const x = (i: number) => pad.left + (i / (years.length - 1)) * innerW;
  const y = (v: number) => pad.top + innerH * (1 - (v - yMin) / (yMax - yMin));
  const mkPath = (data: number[]) => data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const fmt = (v: number) => `${(v / 1_000_000).toFixed(2)}M`;

  return (
    <ChartFrame width={W} height={H} padding={pad} ariaLabel='5-year annual net cash flow projection by scenario'>
      {({ hover }) => {
        let activeIdx: number | null = null;
        if (hover && hover.x >= pad.left - 20 && hover.x <= W - pad.right + 20) {
          activeIdx = Math.min(years.length - 1, Math.max(0, Math.round((hover.x - pad.left) / (innerW / (years.length - 1)))));
        }
        return (
          <g>
            {[800_000, 1_000_000, 1_200_000, 1_400_000, 1_600_000, 1_800_000].map(v => (
              <g key={v}>
                <line x1={pad.left} y1={y(v)} x2={W - pad.right} y2={y(v)} stroke={C.rule2} strokeWidth={0.6} />
                <TickLabel x={pad.left - 10} y={y(v) + 3} anchor='end'>MXN {fmt(v)}</TickLabel>
              </g>
            ))}
            <path d={
              `${bull.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')} ${
                bear.slice().reverse().map((v, i) => `L ${x(years.length - 1 - i)} ${y(v)}`).join(' ')
              } Z`
            } fill={C.goldLight} />
            <path d={mkPath(bear)} fill='none' stroke={C.ink} strokeWidth='1.4' strokeDasharray='4 4' opacity='0.7' />
            <path d={mkPath(base)} fill='none' stroke={C.ink} strokeWidth='2.2' />
            <path d={mkPath(bull)} fill='none' stroke={C.gold} strokeWidth='2.2' />
            <text x={x(years.length - 1) + 8} y={y(bull[bull.length - 1]) + 4}
              style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Bull {fmt(bull[bull.length - 1])}
            </text>
            <text x={x(years.length - 1) + 8} y={y(base[base.length - 1]) + 4}
              style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Base {fmt(base[base.length - 1])}
            </text>
            <text x={x(years.length - 1) + 8} y={y(bear[bear.length - 1]) + 4}
              style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Bear {fmt(bear[bear.length - 1])}
            </text>
            {[bear, base, bull].map((data, k) => data.map((v, i) => (
              <circle key={`${k}-${i}`} cx={x(i)} cy={y(v)} r={activeIdx === i ? 4.5 : 2.5}
                fill={k === 2 ? C.gold : C.ink}
                opacity={k === 0 ? 0.7 : 1} />
            )))}
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke={C.ink} strokeWidth='1' />
            {years.map((yr, i) => (
              <TickLabel key={yr} x={x(i)} y={H - pad.bottom + 16}>{yr}</TickLabel>
            ))}
            <AxisLabel x={pad.left - 56} y={pad.top + innerH / 2} rotate={-90}>Annual net to owner (MXN)</AxisLabel>
            {activeIdx !== null && (
              <g>
                <line x1={x(activeIdx)} y1={pad.top} x2={x(activeIdx)} y2={H - pad.bottom} stroke={C.gold} strokeWidth='0.6' strokeDasharray='2 3' />
                <g transform={`translate(${Math.min(W - pad.right - 160, Math.max(pad.left + 4, x(activeIdx) + 10))}, ${pad.top + 6})`}>
                  <rect x='0' y='0' width='156' height='64' fill={C.bg} stroke={C.ink} strokeWidth='1' />
                  <text x='8' y='14' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Year {years[activeIdx]}</text>
                  <text x='8' y='28' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.gold }}>Bull  MXN {bull[activeIdx].toLocaleString()}</text>
                  <text x='8' y='42' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink2 }}>Base  MXN {base[activeIdx].toLocaleString()}</text>
                  <text x='8' y='56' style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fill: C.ink3 }}>Bear  MXN {bear[activeIdx].toLocaleString()}</text>
                </g>
              </g>
            )}
          </g>
        );
      }}
    </ChartFrame>
  );
}

// ---------------------------------------------------------------------------
// Market KPI strip — three-tile snapshot (no SVG, no hover)
// ---------------------------------------------------------------------------

function MarketKPIStrip() {
  const tiles = [
    { label: 'Occupancy', value: '60.25%',    hint: 'Avg of 2025 monthly occupancy' },
    { label: 'RevPAL',    value: '$4,079',    hint: 'Revenue per available listing-night, MXN' },
    { label: 'ANR',       value: '$6,770.55', hint: 'Average nightly rate, MXN' },
  ];
  return (
    <div className='guide-kpi-strip' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '0' }}>
      {tiles.map(t => (
        <div key={t.label} style={{ background: C.bg, border: `1px solid ${C.rule}`, padding: '28px 28px 24px' }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.ink3, marginBottom: 8 }}>
            {t.label}
          </div>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.ink, fontWeight: 400 }}>
            {t.value}
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: C.ink3, letterSpacing: '0.04em', marginTop: 10, lineHeight: 1.4 }}>
            {t.hint}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

const CHARTS = {
  seasonality:     SeasonalityChart,
  amenityUplift:   AmenityUpliftChart,
  zoneADR:         ZoneADRChart,
  photoConversion: PhotoConversionChart,
  ownerUsage:      OwnerUsageChart,
  projection:      ProjectionChart,
  marketKPI:       MarketKPIStrip,
} as const;

export type GuideChartKind = keyof typeof CHARTS;

export function GuideChart({
  kind, caption, source, illustrative = false,
}: {
  kind: GuideChartKind;
  caption?: string;
  source?: string;
  illustrative?: boolean;
}) {
  const Cmp = CHARTS[kind];
  const isStrip = kind === 'marketKPI';
  return (
    <figure style={{ margin: 0 }}>
      {isStrip ? <Cmp /> : (
        <div style={{ background: C.bg, border: `1px solid ${C.rule}`, padding: '4px' }}>
          <Cmp />
        </div>
      )}
      {(caption || source) && (
        <figcaption style={{ marginTop: 12, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.55 }}>
          {illustrative && <span style={{ color: C.gold, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', marginRight: 8 }}>Illustrative ·</span>}
          {caption}
          {source && (
            <span style={{ display: 'block', marginTop: 6, color: C.ink3, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {source}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
