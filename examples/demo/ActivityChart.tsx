import { useEffect, useId, useRef, useState } from 'react';
import { Select, Tabs } from '../../src';

const weeks = ['Jul 24','Jul 31','Aug 07','Aug 14','Aug 21','Aug 28','Sep 04','Sep 11','Sep 18','Sep 25','Oct 02','Oct 09'];
const series = { completed: [8,12,10,16,13,19,11,15,18,16,22,25], opened: [14,16,13,22,18,24,19,21,17,28,24,29] };

// A smooth cubic curve through each observed weekly total.
function curve(points: { x: number; y: number }[]) {
  return points.map((point, index) => {
    if (!index) return `M ${point.x},${point.y}`;
    const previous = points[index - 1], before = points[index - 2] || previous, after = points[index + 1] || point;
    return `C ${previous.x + (point.x - before.x) / 6},${previous.y + (point.y - before.y) / 6} ${point.x - (after.x - previous.x) / 6},${point.y - (after.y - previous.y) / 6} ${point.x},${point.y}`;
  }).join(' ');
}

export function ActivityChart({ compact = false }: { compact?: boolean }) {
  const [period, setPeriod] = useState('6');
  const [metric, setMetric] = useState<'completed' | 'opened'>('completed');
  const [active, setActive] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width:700, height:222 });
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize(before => before.width === width && before.height === height ? before : { width, height });
    });
    if (svg.current) observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);
  const id = useId().replaceAll(':', '');
  const values = series[metric].slice(-Number(period)), labels = weeks.slice(-Number(period));
  const bottom = size.height - 42, right = size.width - 32, step = (size.height - 80) / 35;
  const points = values.map((value, index) => ({ x: 40 + index * (right - 40) / (values.length - 1), y: bottom - value * step }));
  const path = curve(points);
  const selected = active === null ? null : points[active];
  return <section className={`demo-chart${compact ? ' demo-chart--compact' : ''}`} data-phd-feature="demo.activity" data-phd-surface="demo.activity.chart">
    <div className="demo-chart-heading"><div><h2>Team momentum</h2><span className="demo-chart-value">{values.at(-1)}<small>{metric === 'completed' ? 'completed this week' : 'opened this week'}</small></span></div><Tabs actionId="demo.activity.period" value={period} onValueChange={value => { setPeriod(value); setActive(null); }} items={[{ value:'6', label:'6 weeks' }, { value:'12', label:'12 weeks' }]}/></div>
    <div className="demo-chart-toolbar"><Select aria-label="Chart metric" actionId="demo.activity.metric" value={metric} onValueChange={value => { setMetric(value as typeof metric); setActive(null); }} options={[{ value:'completed', label:'Completed tasks' }, { value:'opened', label:'Opened tasks' }]}/><span className="demo-chart-readout" aria-live="polite">{active === null ? '' : `${labels[active]} · ${values[active]} ${metric}`}</span></div>
    <svg ref={svg} viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-label={`Weekly ${metric} tasks. Use arrow keys to inspect points.`} tabIndex={0} data-phd-action="demo.activity.inspect" onPointerMove={event => { const bounds = event.currentTarget.getBoundingClientRect(); setActive(Math.max(0, Math.min(values.length - 1, Math.round(((event.clientX - bounds.left) / bounds.width * size.width - 40) / (right - 40) * (values.length - 1))))); }} onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setActive(old => Math.max(0, Math.min(values.length - 1, (old ?? 0) + (event.key === 'ArrowRight' ? 1 : -1)))); } }}>
      <defs><linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--phd-color-info)" stopOpacity=".15"/><stop offset="100%" stopColor="var(--phd-color-info)" stopOpacity="0"/></linearGradient></defs>
      {[0,10,20,30].map(value => <g key={value}><line x1="40" y1={bottom - value * step} x2={right} y2={bottom - value * step} className="demo-chart-grid"/><text x="12" y={bottom + 4 - value * step}>{value}</text></g>)}
      <path d={`${path} L ${right},${bottom} L 40,${bottom} Z`} fill={`url(#${id}-area)`}/><path key={`${metric}-${period}`} pathLength={1} className="demo-chart-line" d={path} fill="none"/>
      {points.map((point, index) => <g key={labels[index]}><circle cx={point.x} cy={point.y} r="3" className="demo-chart-dot"/>{values.length === 6 || index % 2 === 0 || index === values.length - 1 ? <text x={point.x} y={size.height - 11} textAnchor="middle">{labels[index]}</text> : null}</g>)}
      {selected ? <g><line x1={selected.x} y1="30" x2={selected.x} y2={bottom} className="demo-chart-crosshair"/><circle cx={selected.x} cy={selected.y} r="5" className="demo-chart-selected"/></g> : null}
    </svg>
  </section>;
}
