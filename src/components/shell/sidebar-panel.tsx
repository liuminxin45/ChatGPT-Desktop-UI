import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { classes } from '../classes';

export interface SidebarResizeOptions {
  width?: number;
  minWidth: number;
  maxWidth: number;
  label: string;
  actionId: string;
  featureId?: string;
  surfaceId?: string;
  scopeId?: string;
  onChange(width: number, collapsed: boolean): void;
  onStart?(): void;
  onEnd?(cancelled: boolean): void;
}

/** Shared sidebar geometry and resize target; the Host owns width, folding and persistence. */
export function SidebarPanel({
  resize,
  hidden,
  className,
  children,
  style,
  ...props
}: HTMLAttributes<HTMLElement> & { resize?: SidebarResizeOptions }) {
  const panel = useRef<HTMLElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>();
  const resizable = Boolean(resize);
  const drag = useRef<{
    pointerId: number;
    x: number;
    width: number;
    scale: number;
    resize: SidebarResizeOptions;
  }>();
  const finish = (cancelled: boolean) => {
    const current = drag.current;
    if (!current) return;
    drag.current = undefined;
    panel.current?.removeAttribute('data-resizing');
    if (handle.current?.hasPointerCapture(current.pointerId))
      handle.current.releasePointerCapture(current.pointerId);
    if (cancelled) current.resize.onChange(current.width, false);
    current.resize.onEnd?.(cancelled);
  };
  useEffect(() => {
    if (hidden) finish(true);
  }, [hidden]);
  useEffect(() => () => finish(true), [resize?.scopeId]);
  useEffect(() => {
    if (!resizable || !panel.current || hidden) return;
    const element = panel.current;
    const measure = () => setMeasuredWidth(element.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [resizable, hidden]);
  const width =
    resize?.width === undefined
      ? undefined
      : Math.max(resize.minWidth, Math.min(resize.maxWidth, resize.width));
  const change = (requested: number) => {
    if (!resize) return;
    const collapsed = requested <= resize.minWidth;
    // End capture before the Host hides the sidebar at the minimum.
    if (collapsed) finish(false);
    resize.onChange(Math.max(resize.minWidth, Math.min(resize.maxWidth, requested)), collapsed);
  };
  return (
    <aside
      {...props}
      ref={panel}
      hidden={hidden}
      {...(hidden ? { inert: '' } : {})}
      className={classes('kit-sidebar', resize && 'kit-sidebar--resizable', className)}
      style={
        {
          ...style,
          ...(resize
            ? {
                '--desktop-sidebar-min-width': `${resize.minWidth}px`,
                '--desktop-sidebar-max-width': `${resize.maxWidth}px`,
              }
            : {}),
          ...(width === undefined ? {} : { '--desktop-sidebar-width': `${width}px` }),
        } as CSSProperties
      }
    >
      {children}
      {resize && (
        <div
          ref={handle}
          className="kit-sidebar-resizer"
          role="separator"
          tabIndex={hidden ? -1 : 0}
          aria-label={resize.label}
          aria-orientation="vertical"
          aria-controls={props.id}
          aria-valuemin={resize.minWidth}
          aria-valuemax={resize.maxWidth}
          aria-valuenow={width ?? measuredWidth ?? resize.minWidth}
          data-desktop-action={resize.actionId}
          data-desktop-drag-action={resize.actionId}
          data-desktop-feature={resize.featureId}
          data-desktop-surface={resize.surfaceId}
          onPointerDown={(event) => {
            if (event.button !== 0 || drag.current || !panel.current) return;
            event.preventDefault();
            event.currentTarget.focus({ preventScroll: true });
            const rect = panel.current.getBoundingClientRect();
            const scale = rect.width / panel.current.offsetWidth || 1;
            drag.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              width: rect.width / scale,
              scale,
              resize,
            };
            panel.current.setAttribute('data-resizing', 'true');
            event.currentTarget.setPointerCapture(event.pointerId);
            resize.onStart?.();
          }}
          onPointerMove={(event) => {
            const current = drag.current;
            if (current && current.pointerId === event.pointerId)
              change(current.width + (event.clientX - current.x) / current.scale);
          }}
          onPointerUp={(event) => {
            if (drag.current?.pointerId === event.pointerId) finish(false);
          }}
          onPointerCancel={(event) => {
            if (drag.current?.pointerId === event.pointerId) finish(true);
          }}
          onLostPointerCapture={() => finish(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && drag.current) {
              event.preventDefault();
              finish(true);
              return;
            }
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || drag.current) return;
            event.preventDefault();
            // Controlled keyboard steps use the Host target, not an in-flight CSS transition.
            const current = width ?? (panel.current?.offsetWidth || resize.minWidth);
            resize.onStart?.();
            change(
              event.key === 'Home'
                ? resize.minWidth
                : event.key === 'End'
                  ? resize.maxWidth
                  : current + (event.key === 'ArrowLeft' ? -10 : 10),
            );
            resize.onEnd?.(false);
          }}
        />
      )}
    </aside>
  );
}
