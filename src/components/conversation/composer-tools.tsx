import { type HTMLAttributes, type ReactNode } from 'react';
import {
  CornerDownRight,
  ListStart,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Pause,
  Play,
} from 'lucide-react';
import { Button, type ButtonProps } from '../actions';
import { Select, type SelectProps } from '../forms';
import { MenuButton } from '../overlays';
import { classes } from '../classes';
import { ActionTooltip } from '../../action-tooltip';

/** A cohesive display with two independent native selectors, no settings dialog. */
export function ComposerModelControl({
  model,
  effort,
  label = 'Model and reasoning',
}: {
  model: SelectProps;
  effort?: SelectProps;
  label?: string;
}) {
  return (
    <div className="desktop-composer-model" role="group" aria-label={label}>
      <Select {...model} size="sm" className={classes('desktop-composer-model__name', model.className)} />
      {effort && (
        <Select
          {...effort}
          size="sm"
          className={classes('desktop-composer-model__effort', effort.className)}
        />
      )}
    </div>
  );
}

/** Permissions remain a real Select: only its closed trigger is a shield. */
export function ComposerPermissionSelect({
  risk = 'default',
  ...props
}: SelectProps & { risk?: 'default' | 'elevated' }) {
  const selected = props.options.find((option) => option.value === props.value);
  const label = typeof selected?.label === 'string' ? selected.label : '';
  return (
    <ActionTooltip
      label={props.title || [props['aria-label'], label].filter(Boolean).join(': ')}
      disabled={props.disabled}
    >
      <Select
        {...props}
        size="sm"
        className={classes('desktop-composer-permission', props.className)}
        triggerContent={
          <span data-permission-risk={risk} className="desktop-composer-permission__value">
            {risk === 'elevated' ? (
              <ShieldAlert size={15} aria-hidden="true" />
            ) : (
              <ShieldCheck size={15} aria-hidden="true" />
            )}
            <span className="desktop-composer-sr-only">{selected?.label ?? props.placeholder}</span>
          </span>
        }
      />
    </ActionTooltip>
  );
}

/** Plus opens Host attachment acquisition; it does not imply a new conversation. */
export function ComposerAttachmentButton({
  label = 'Add attachments',
  ...props
}: Omit<ButtonProps, 'children' | 'icon' | 'iconOnly'> & { label?: string }) {
  return (
    <Button {...props} variant="ghost" size="sm" iconOnly aria-label={label} icon={<Plus size={19} />} />
  );
}

export function ComposerStack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classes('desktop-composer-stack', className)} />;
}

export interface ComposerQueueItem {
  id: string;
  text: string;
  description?: ReactNode;
  disabled?: boolean;
  editDisabled?: boolean;
  steerDisabled?: boolean;
  editLabel?: string;
  removeLabel?: string;
  moreLabel?: string;
  onEdit?: () => void;
  onSteer?: () => void;
  onRemove?: () => void;
}
export interface ComposerQueueProps extends HTMLAttributes<HTMLElement> {
  items: readonly ComposerQueueItem[];
  label?: string;
  activity?: ReactNode;
  description?: ReactNode;
  paused?: boolean;
  disabled?: boolean;
  steerLabel?: string;
  editLabel?: string;
  removeLabel?: string;
  moreLabel?: string;
  pauseLabel?: string;
  resumeLabel?: string;
  pausedLabel?: string;
  onPause?: () => void;
  onResume?: () => void;
  /** Only a bounded preview is shown; the Host owns its complete queue view. */
  maxVisible?: number;
  viewAllLabel?: string;
  onViewAll?: () => void;
}
/** Static queued records, independent commands, collision-aware per-message menus. */
export function ComposerQueue({
  items,
  label = 'Queued messages',
  activity,
  description,
  paused = false,
  disabled = false,
  steerLabel = 'Steer',
  editLabel = 'Edit message',
  removeLabel = 'Remove message',
  moreLabel = 'More message actions',
  pauseLabel = 'Pause queue',
  resumeLabel = 'Resume queue',
  pausedLabel = 'Queue paused',
  onPause,
  onResume,
  maxVisible = 3,
  viewAllLabel = 'View all queued messages',
  onViewAll,
  className,
  ...props
}: ComposerQueueProps) {
  if (!items.length && !paused && !activity && !description) return null;
  const visible = onViewAll ? items.slice(0, Math.max(1, maxVisible)) : items;
  return (
    <section {...props} aria-label={label} className={classes('desktop-composer-queue', className)}>
      {visible.length > 0 && (
        <ol className="desktop-composer-queue__list">
          {visible.map((item) => (
            <li key={item.id} data-queue={item.id} className="desktop-composer-queue__row">
              <ListStart size={14} className="desktop-composer-queue__glyph" aria-hidden="true" />
              <span className="desktop-composer-queue__copy">
                <span title={item.text}>{item.text}</span>
                {item.description && (
                  <span className="desktop-composer-queue__description">{item.description}</span>
                )}
              </span>
              <div className="desktop-composer-queue__actions">
                {item.onSteer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="desktop-composer-queue__steer"
                    icon={<CornerDownRight size={13} />}
                    disabled={disabled || item.disabled || item.steerDisabled}
                    onClick={item.onSteer}
                  >
                    {steerLabel}
                  </Button>
                )}
                {item.onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={item.removeLabel || removeLabel}
                    icon={<Trash2 size={14} />}
                    disabled={disabled || item.disabled}
                    onClick={item.onRemove}
                  />
                )}
                <MenuButton
                  label={item.moreLabel || moreLabel}
                  actionId={'composer.queue.' + item.id + '.more'}
                  icon={<MoreHorizontal size={16} />}
                  iconOnly
                  className="desktop-composer-queue__more"
                  side="bottom"
                  disabled={disabled || item.disabled}
                  items={[
                    ...(item.onEdit
                      ? [
                          {
                            label: item.editLabel || editLabel,
                            icon: <Pencil size={14} />,
                            actionId: 'composer.queue.edit',
                            disabled: item.editDisabled,
                            onSelect: item.onEdit,
                          },
                        ]
                      : []),
                    ...(onViewAll
                      ? [
                          {
                            label: viewAllLabel,
                            icon: <List size={14} />,
                            actionId: 'composer.queue.inspect',
                            onSelect: onViewAll,
                          },
                        ]
                      : []),
                    ...(paused && onResume
                      ? [
                          {
                            label: resumeLabel,
                            icon: <Play size={14} />,
                            actionId: 'composer.queue.resume',
                            onSelect: onResume,
                          },
                        ]
                      : !paused && onPause
                        ? [
                            {
                              label: pauseLabel,
                              icon: <Pause size={14} />,
                              actionId: 'composer.queue.pause',
                              onSelect: onPause,
                            },
                          ]
                        : []),
                  ]}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
      {items.length > visible.length && onViewAll && (
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          {viewAllLabel}
        </Button>
      )}
      {(activity || paused || description) && (
        <div className="desktop-composer-queue__status">
          {activity}
          {paused && <span className="desktop-composer-queue__description">{pausedLabel}</span>}
          {description && <span className="desktop-composer-queue__description">{description}</span>}
          {paused && onResume && (
            <Button variant="ghost" size="sm" disabled={disabled} onClick={onResume}>
              {resumeLabel}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
