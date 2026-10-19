import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../strings';
import { Button } from '../actions';
import { Dialog } from './index';

type View = { scale: number; x: number; y: number };
const original: View = { scale: 1, x: 0, y: 0 };
type Point = { x: number; y: number };
type Gesture = {
  view: View;
  center: Point;
  distance: number;
  count: number;
  at: number;
  axis?: 'dismiss' | 'cancel';
};

/** Visual-only image inspection. The Host owns URLs, credentials and downloads. */
export function ImageViewer({
  open,
  src,
  alt,
  title,
  onClose,
}: {
  open: boolean;
  src: string;
  alt: string;
  title?: string;
  onClose(): void;
}) {
  const translate = useTranslation();
  const canvas = useRef<HTMLDivElement>(null),
    image = useRef<HTMLImageElement>(null);
  const points = useRef(new Map<number, Point>()),
    gesture = useRef<Gesture | null>(null);
  const [view, setView] = useState<View>(original),
    [failed, setFailed] = useState(false);
  const current = useRef(view);
  current.current = view;
  function constrain(next: View): View {
    const element = canvas.current,
      picture = image.current;
    if (!element || !picture?.naturalWidth) return next;
    const fit = Math.min(
      element.clientWidth / picture.naturalWidth,
      element.clientHeight / picture.naturalHeight,
    );
    const maxX = Math.max(0, (picture.naturalWidth * fit * next.scale - element.clientWidth) / 2);
    const maxY = Math.max(0, (picture.naturalHeight * fit * next.scale - element.clientHeight) / 2);
    return {
      scale: next.scale,
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }
  function apply(next: View, bound = true) {
    const value = bound ? constrain(next) : next;
    current.current = value;
    setView(value);
  }
  function centerAndDistance() {
    const values = [...points.current.values()];
    const a = values[0],
      b = values[1] ?? a;
    return { center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, distance: Math.hypot(a.x - b.x, a.y - b.y) };
  }
  function rebase(at: number) {
    gesture.current = points.current.size
      ? { ...centerAndDistance(), view: current.current, count: points.current.size, at }
      : null;
  }
  function cancel() {
    if (gesture.current) apply(gesture.current.view);
    points.current.clear();
    gesture.current = null;
  }
  useEffect(() => {
    current.current = original;
    setView(original);
    setFailed(false);
    points.current.clear();
    gesture.current = null;
    if (!open || !canvas.current) return;
    const observer = new ResizeObserver(() => {
      current.current = original;
      setView(original);
      points.current.clear();
      gesture.current = null;
    });
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, [open, src]);
  function down(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || failed) return;
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    rebase(event.timeStamp);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || !points.current.has(event.pointerId)) return;
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const { center, distance } = centerAndDistance(),
      dx = center.x - start.center.x,
      dy = center.y - start.center.y;
    if (points.current.size >= 2) {
      const scale = Math.max(1, Math.min(4, (start.view.scale * distance) / Math.max(1, start.distance)));
      const bounds = canvas.current!.getBoundingClientRect();
      const origin = {
        x: start.center.x - bounds.x - bounds.width / 2,
        y: start.center.y - bounds.y - bounds.height / 2,
      };
      const ratio = scale / start.view.scale;
      apply({
        scale,
        x: start.view.x * ratio + origin.x * (1 - ratio) + dx,
        y: start.view.y * ratio + origin.y * (1 - ratio) + dy,
      });
    } else if (start.view.scale > 1) apply({ ...start.view, x: start.view.x + dx, y: start.view.y + dy });
    else {
      if (!start.axis && (Math.abs(dx) > 10 || Math.abs(dy) > 10))
        start.axis = dy > 0 && dy > Math.abs(dx) * 1.5 ? 'dismiss' : 'cancel';
      if (start.axis === 'dismiss') apply({ ...original, y: Math.max(0, dy) }, false);
    }
    event.preventDefault();
  }
  function up(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || !points.current.has(event.pointerId)) return;
    const dismiss =
      start.count === 1 &&
      start.axis === 'dismiss' &&
      current.current.scale === 1 &&
      (current.current.y > 100 ||
        (current.current.y > 40 && current.current.y / Math.max(1, event.timeStamp - start.at) > 0.5));
    points.current.delete(event.pointerId);
    apply(current.current);
    rebase(event.timeStamp);
    if (gesture.current && current.current.scale === 1) gesture.current.axis = 'cancel';
    if (dismiss) onClose();
  }
  function zoom(scale: number) {
    cancel();
    apply({ ...original, scale: Math.max(1, Math.min(4, scale)) });
  }
  return (
    <Dialog open={open} title={title || alt} presentation="fullscreen" onClose={onClose}>
      <div className="desktop-image-viewer">
        <div
          ref={canvas}
          className="desktop-image-viewer__canvas"
          tabIndex={0}
          role="group"
          aria-label={alt}
          data-scale={view.scale}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={cancel}
          onLostPointerCapture={(event) => {
            if (event.target === event.currentTarget && points.current.has(event.pointerId)) cancel();
          }}
          onDoubleClick={() => zoom(current.current.scale > 1 ? 1 : 2)}
          onKeyDown={(event) => {
            if (
              event.ctrlKey ||
              event.metaKey ||
              event.altKey ||
              event.nativeEvent.isComposing ||
              event.nativeEvent.keyCode === 229 ||
              failed
            )
              return;
            if (event.key === '+' || event.key === '=') {
              event.preventDefault();
              zoom(current.current.scale + 0.5);
            } else if (event.key === '-') {
              event.preventDefault();
              zoom(current.current.scale - 0.5);
            } else if (event.key === '0') {
              event.preventDefault();
              zoom(1);
            } else if (current.current.scale > 1 && event.key.startsWith('Arrow')) {
              const moves: Record<string, [number, number]> = {
                ArrowLeft: [40, 0],
                ArrowRight: [-40, 0],
                ArrowUp: [0, 40],
                ArrowDown: [0, -40],
              };
              const move = moves[event.key];
              if (move) {
                event.preventDefault();
                apply({ ...current.current, x: current.current.x + move[0], y: current.current.y + move[1] });
              }
            }
          }}
        >
          {failed ? (
            <div role="status">{translate('图片加载失败')}</div>
          ) : (
            <img
              ref={image}
              src={src}
              alt={alt}
              draggable={false}
              onError={() => setFailed(true)}
              onDragStart={(event) => event.preventDefault()}
              style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.scale})` }}
            />
          )}
        </div>
        <div className="desktop-image-viewer__toolbar" role="toolbar" aria-label={translate('缩放')}>
          <Button
            icon={<ZoomOut />}
            iconOnly
            aria-label={translate('缩小')}
            disabled={failed || view.scale <= 1}
            onClick={() => zoom(current.current.scale - 0.5)}
          />
          <Button
            icon={<RotateCcw />}
            aria-label={translate('重置缩放')}
            disabled={failed}
            onClick={() => zoom(1)}
          >
            {Math.round(view.scale * 100)}%
          </Button>
          <Button
            icon={<ZoomIn />}
            iconOnly
            aria-label={translate('放大')}
            disabled={failed || view.scale >= 4}
            onClick={() => zoom(current.current.scale + 0.5)}
          />
        </div>
      </div>
    </Dialog>
  );
}
