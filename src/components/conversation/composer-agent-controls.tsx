import { useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  PauseCircle,
  Paperclip,
  Lightbulb,
  Sparkles,
  PlayCircle,
  Plus,
  RotateCcw,
  Target,
  Trash2,
  Zap,
} from 'lucide-react';
import { Button } from '../actions';
import { Popover, PopoverContent, PopoverTrigger } from '../radix/popover';
import { ToolVisibilityContext } from '../../surface-visibility';
import { createDesktopPortal } from '../../scoped-surface';
import { useDismissalLayer } from '../../dismissal';
import { ActionTooltip } from '../../action-tooltip';
const MenuPortal = createDesktopPortal(Menu.Portal);

export interface ComposerModelOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Controlled, acknowledged configuration. The draft slider commits once per gesture. */
export function ComposerModelPicker({
  id,
  model,
  effort,
  models,
  efforts,
  defaultEffort,
  disabled,
  effortDisabled,
  onModelChange,
  onEffortChange,
  label = 'Select effort',
  modelLabel = 'Select model',
  resetLabel = 'Reset effort',
  defaultLabel,
  defaultDescription,
  onDefault,
  shortcut = 'Ctrl+Shift+M',
}: {
  id?: string;
  model: string;
  effort: string;
  models: readonly ComposerModelOption[];
  efforts: readonly ComposerModelOption[];
  defaultEffort?: string;
  disabled?: boolean;
  effortDisabled?: boolean;
  onModelChange(value: string): void;
  onEffortChange(value: string): void;
  label?: string;
  modelLabel?: string;
  resetLabel?: string;
  defaultLabel?: string;
  defaultDescription?: string;
  onDefault?(): void;
  /** Empty disables the standard composer shortcut. No message is ever submitted here. */
  shortcut?: string;
}) {
  const visible = useContext(ToolVisibilityContext);
  const [open, setOpen] = useState(false),
    [view, setView] = useState<'effort' | 'models'>('effort');
  const [draft, setDraft] = useState(effort);
  const trigger = useRef<HTMLButtonElement>(null),
    range = useRef<HTMLInputElement>(null),
    modelMenu = useRef<HTMLDivElement>(null);
  const gesture = useRef(effort),
    dirty = useRef(false),
    tickId = useId();
  const currentModel = models.find((x) => x.value === model),
    currentEffort = efforts.find((x) => x.value === effort);
  const selected = Math.max(
    0,
    efforts.findIndex((x) => x.value === draft),
  );
  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) {
      setView('effort');
      setDraft(effort);
      gesture.current = effort;
      dirty.current = false;
    }
  };
  useEffect(() => {
    setDraft(effort);
    gesture.current = effort;
    dirty.current = false;
  }, [effort, model]);
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);
  useEffect(() => {
    if (open && view === 'models')
      modelMenu.current
        ?.querySelector<HTMLButtonElement>('[aria-checked="true"],button:not(:disabled)')
        ?.focus();
  }, [open, view]);
  useEffect(() => {
    if (!shortcut || !visible || disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.code === 'KeyM' &&
        !e.repeat &&
        !e.isComposing &&
        !e.defaultPrevented &&
        trigger.current?.getClientRects().length
      ) {
        e.preventDefault();
        changeOpen(!open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
  const commit = () => {
    if (!dirty.current) return;
    dirty.current = false;
    if (!disabled && !effortDisabled && gesture.current !== effort) onEffortChange(gesture.current);
  };
  return (
    <Popover open={open && visible} onOpenChange={changeOpen}>
      <ActionTooltip label={label} shortcut={shortcut}>
        <PopoverTrigger asChild>
          <Button
            ref={trigger}
            id={id}
            actionId="composer.model.open"
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={label}
            className="desktop-composer-model-picker"
          >
            <span>{currentModel?.label || model || modelLabel}</span>
            <span className="desktop-composer-model-picker__effort">{currentEffort?.label || effort}</span>
            <ChevronDown size={12} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent
        side="top"
        align="end"
        className={view === 'effort' ? 'desktop-effort-panel' : 'desktop-model-panel'}
        aria-label={view === 'effort' ? label : modelLabel}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          requestAnimationFrame(() => range.current?.focus());
        }}
        onEscapeKeyDown={(e) => {
          dirty.current = false;
          setDraft(effort);
          if (view === 'models') {
            e.preventDefault();
            setView('effort');
            requestAnimationFrame(() => range.current?.focus());
          }
        }}
      >
        {view === 'effort' ? (
          <>
            <div className="desktop-effort-panel__header">
              <Zap size={15} aria-hidden="true" />
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="desktop-effort-panel__model"
                  aria-label={modelLabel}
                  onClick={() => setView('models')}
                >
                  <output className="desktop-effort-panel__value" htmlFor={tickId}>
                    {efforts.find((x) => x.value === draft)?.label || currentEffort?.label || effort}
                  </output>
                  <span>
                    {currentModel?.label || model || modelLabel}
                    <ChevronRight size={12} aria-hidden="true" />
                  </span>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={resetLabel}
                icon={<RotateCcw size={15} />}
                disabled={disabled || effortDisabled || !defaultEffort || defaultEffort === effort}
                onClick={() => {
                  if (defaultEffort) {
                    setDraft(defaultEffort);
                    onEffortChange(defaultEffort);
                  }
                }}
              />
            </div>
            <div
              className="desktop-effort-panel__range"
              data-effort-position={efforts.length < 2 ? '0' : String(selected)}
            >
              <div className="desktop-effort-panel__track" aria-hidden="true">
                {efforts.map((x, i) => (
                  <span key={x.value} data-filled={i <= selected} data-current={i === selected} />
                ))}
              </div>
              <input
                ref={range}
                id={tickId}
                type="range"
                min={0}
                max={Math.max(0, efforts.length - 1)}
                step={1}
                value={selected}
                aria-label={label}
                aria-valuetext={efforts[selected]?.label || effort}
                disabled={disabled || effortDisabled || efforts.length < 2}
                onChange={(e) => {
                  const next = efforts[Number(e.target.value)];
                  if (next && !next.disabled) {
                    gesture.current = next.value;
                    dirty.current = true;
                    setDraft(next.value);
                  }
                }}
                onPointerUp={commit}
                onPointerCancel={() => {
                  dirty.current = false;
                  setDraft(effort);
                }}
                onKeyUp={(e) => {
                  if (
                    [
                      'ArrowLeft',
                      'ArrowRight',
                      'ArrowUp',
                      'ArrowDown',
                      'Home',
                      'End',
                      'PageUp',
                      'PageDown',
                    ].includes(e.key)
                  )
                    commit();
                }}
                onBlur={commit}
              />
            </div>
          </>
        ) : (
          <>
            <div className="desktop-model-panel__heading">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={label}
                icon={<ChevronLeft size={15} />}
                onClick={() => setView('effort')}
              />
              <span>{modelLabel}</span>
            </div>
            <div
              role="menu"
              ref={modelMenu}
              aria-label={modelLabel}
              onKeyDown={(e) => {
                if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
                e.preventDefault();
                const options = [
                  ...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
                ];
                const index = options.indexOf(document.activeElement as HTMLButtonElement);
                options[
                  e.key === 'Home'
                    ? 0
                    : e.key === 'End'
                      ? options.length - 1
                      : (index + (e.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length
                ]?.focus();
              }}
            >
              {onDefault && (
                <Button
                  role="menuitem"
                  layout="command"
                  variant="ghost"
                  className="desktop-model-panel__option"
                  disabled={disabled}
                  onClick={() => {
                    onDefault();
                    setOpen(false);
                  }}
                >
                  <span>
                    {defaultLabel || 'Default'}
                    <small>{defaultDescription}</small>
                  </span>
                </Button>
              )}
              {models.map((option, index) => (
                <Button
                  key={option.value}
                  role="menuitemradio"
                  aria-label={option.label}
                  aria-describedby={
                    option.description && option.description !== option.label
                      ? `${tickId}-model-${index}`
                      : undefined
                  }
                  aria-checked={option.value === model}
                  layout="command"
                  variant="ghost"
                  className="desktop-model-panel__option"
                  disabled={disabled || option.disabled}
                  onClick={() => {
                    if (option.value !== model) onModelChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span>
                    {option.label}
                    {option.description && option.description !== option.label ? (
                      <small id={`${tickId}-model-${index}`}>{option.description}</small>
                    ) : null}
                  </span>
                  {option.value === model && <Check size={15} aria-hidden="true" />}
                </Button>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export interface ComposerAddItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  kind?: 'files' | 'plan' | 'goal' | 'skills';
  checked?: boolean;
  disabled?: boolean;
  onSelect(): void;
}
/** Capability-driven Add menu. File acquisition and agent/skill semantics belong to the Host. */
export function ComposerAddMenu({
  label = 'Add',
  sections,
  disabled,
}: {
  label?: string;
  disabled?: boolean;
  sections: readonly { id: string; label?: string; items: readonly ComposerAddItem[] }[];
}) {
  const [open, setOpen] = useState(false),
    visible = useContext(ToolVisibilityContext);
  useDismissalLayer(open && visible, () => setOpen(false));
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);
  return (
    <Menu.Root open={open && visible} onOpenChange={setOpen}>
      <Menu.Trigger asChild>
        <Button
          actionId="composer.add"
          variant="ghost"
          size="sm"
          disabled={disabled}
          iconOnly
          aria-label={label}
          icon={<Plus size={19} />}
        />
      </Menu.Trigger>
      <MenuPortal>
        <Menu.Content
          side="top"
          align="start"
          sideOffset={5}
          className="desktop-menu desktop-composer-add-menu"
        >
          {sections
            .filter((s) => s.items.length)
            .map((section) => (
              <Menu.Group key={section.id}>
                {section.label && (
                  <Menu.Label className="desktop-composer-add-menu__heading">{section.label}</Menu.Label>
                )}
                {section.items.map((item) => (
                  <Menu.Item
                    key={item.id}
                    className="desktop-menu-item desktop-composer-add-menu__item"
                    data-desktop-action={item.id}
                    disabled={item.disabled}
                    onSelect={item.onSelect}
                  >
                    <span className="desktop-menu-item-icon" aria-hidden="true">
                      {item.icon ||
                        (item.kind === 'files' ? (
                          <Paperclip size={15} />
                        ) : item.kind === 'plan' ? (
                          <Lightbulb size={15} />
                        ) : item.kind === 'goal' ? (
                          <Target size={15} />
                        ) : item.kind === 'skills' ? (
                          <Sparkles size={15} />
                        ) : null)}
                    </span>
                    <span>{item.label}</span>
                    {item.description && <small>{item.description}</small>}
                    {item.checked && <Check size={14} aria-hidden="true" />}
                  </Menu.Item>
                ))}
              </Menu.Group>
            ))}
        </Menu.Content>
      </MenuPortal>
    </Menu.Root>
  );
}

/** A static goal record with independent commands; elapsed time is authoritative Host data. */
export function ComposerGoal({
  objective,
  statusLabel,
  elapsed,
  paused,
  disabled,
  onEdit,
  onPause,
  onResume,
  onRemove,
  onExpand,
  labels = {},
}: {
  objective: string;
  statusLabel: string;
  elapsed: string;
  paused?: boolean;
  disabled?: boolean;
  onEdit?(): void;
  onPause?(): void;
  onResume?(): void;
  onRemove?(): void;
  onExpand?(): void;
  labels?: { edit?: string; pause?: string; resume?: string; remove?: string; expand?: string };
}) {
  return (
    <section className="desktop-composer-goal" aria-label={statusLabel}>
      <Target size={14} aria-hidden="true" />
      <strong>{statusLabel}</strong>
      <Button
        variant="ghost"
        size="sm"
        className="desktop-composer-goal__objective"
        title={objective}
        disabled={disabled || !onEdit}
        onClick={onEdit}
      >
        {objective}
      </Button>
      <span className="desktop-composer-goal__elapsed" aria-label={elapsed}>
        {elapsed}
      </span>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={labels.remove || 'Remove goal'}
          icon={<Trash2 size={13} />}
          disabled={disabled}
          onClick={onRemove}
        />
      )}
      {(paused ? onResume : onPause) && (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={paused ? labels.resume || 'Resume goal' : labels.pause || 'Pause goal'}
          icon={paused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
          disabled={disabled}
          onClick={paused ? onResume : onPause}
        />
      )}
      {onExpand && (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={labels.expand || 'View goal'}
          icon={<Expand size={13} />}
          onClick={onExpand}
        />
      )}
    </section>
  );
}

/** Proposed Markdown and explicit review actions. This component never authorizes execution. */
export function PlanReview({
  title,
  children,
  onExecute,
  onContinue,
  executeLabel = 'Implement this plan',
  continueLabel = 'Continue planning',
  disabled,
  actionsDisabled,
}: {
  title: string;
  children: ReactNode;
  onExecute?(): void;
  onContinue?(): void;
  executeLabel?: string;
  continueLabel?: string;
  disabled?: boolean;
  actionsDisabled?: boolean;
}) {
  return (
    <section className="desktop-plan-review" aria-label={title}>
      <h3>{title}</h3>
      <div>{children}</div>
      {(onExecute || onContinue) && (
        <footer>
          {onContinue && (
            <Button disabled={disabled || actionsDisabled} onClick={onContinue}>
              {continueLabel}
            </Button>
          )}
          {onExecute && (
            <Button variant="primary" disabled={disabled || actionsDisabled} onClick={onExecute}>
              {executeLabel}
            </Button>
          )}
        </footer>
      )}
    </section>
  );
}
