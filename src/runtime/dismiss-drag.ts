import { useCallback, useEffect, useRef, type PointerEvent, type RefObject } from 'react';

/** Shared direct-manipulation logic. Only an explicit handle owns the gesture. */
export function useDismissDrag({
  enabled,
  axis,
  direction,
  surface,
  extent,
  attribute,
  onDismiss,
  offsetProperty,
  progressProperty,
}: {
  enabled: boolean;
  axis: 'x' | 'y';
  direction: 1 | -1;
  surface: RefObject<HTMLElement | null>;
  extent: RefObject<HTMLElement | null>;
  attribute: string;
  onDismiss(): void;
  offsetProperty: string;
  progressProperty: string;
}) {
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    at: number;
    distance: number;
    locked: boolean;
  } | null>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  const reset = useCallback(() => {
    gesture.current = null;
    surface.current?.style.removeProperty(offsetProperty);
    surface.current?.style.removeProperty(progressProperty);
    if (surface.current) delete surface.current.dataset.dragging;
  }, [surface, offsetProperty, progressProperty]);
  useEffect(() => {
    if (!enabled) reset();
  }, [enabled, reset]);
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (event.isPrimary === false) {
        reset();
        return;
      }
      if (!enabled || event.button !== 0 || !(event.target as HTMLElement).closest(`[${attribute}]`)) return;
      gesture.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        at: event.timeStamp,
        distance: 0,
        locked: false,
      };
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;
      const distance = (axis === 'x' ? event.clientX - start.x : event.clientY - start.y) * direction;
      const cross = Math.abs(axis === 'x' ? event.clientY - start.y : event.clientX - start.x);
      if (!start.locked) {
        if ((cross > 8 && cross > Math.abs(distance)) || distance < -8) {
          reset();
          return;
        }
        if (distance < 10 || distance < cross * 1.5) return;
        start.locked = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      const size = (axis === 'x' ? extent.current?.offsetWidth : extent.current?.offsetHeight) || 1;
      start.distance = Math.max(0, Math.min(distance, size));
      if (surface.current) {
        surface.current.dataset.dragging = 'true';
        surface.current.style.setProperty(offsetProperty, `${start.distance * direction}px`);
        surface.current.style.setProperty(progressProperty, String(start.distance / size));
      }
      event.preventDefault();
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;
      const size = (axis === 'x' ? extent.current?.offsetWidth : extent.current?.offsetHeight) || 340;
      const commit =
        start.locked &&
        (start.distance > Math.min(size * 0.28, 96) ||
          (start.distance > 32 && start.distance / Math.max(1, event.timeStamp - start.at) > 0.45));
      reset();
      if (commit) dismiss.current();
    },
    onPointerCancel: reset,
    onLostPointerCapture(event: PointerEvent<HTMLElement>) {
      if (event.target === event.currentTarget && gesture.current?.id === event.pointerId) reset();
    },
  };
}
