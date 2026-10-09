import { type KeyboardEvent, type ReactNode } from 'react';

/** IME confirmation is text entry, never an application command. */
export function isInputComposing(event: { nativeEvent: { isComposing?: boolean; keyCode?: number } }) {
  return Boolean(event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229);
}

export function isInputConfirm(event: KeyboardEvent) {
  return event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && !isInputComposing(event);
}

function textTarget(target: EventTarget) {
  if (!(target instanceof HTMLElement)) return null;
  const element = target.closest<HTMLElement>('input,textarea,[contenteditable="true"]');
  if (!element) return null;
  if (element instanceof HTMLInputElement && ['button','submit','reset','checkbox','radio','file','range','color'].includes(element.type)) return null;
  return element;
}

/** Host actions are explicit: never infer a submit action from labels or button order. */
export function confirmTextInput(event: KeyboardEvent) {
  if (event.defaultPrevented || !isInputConfirm(event)) return;
  const target = textTarget(event.target);
  if (!target || target.matches(':disabled,[readonly],[aria-readonly="true"]')) return;
  event.preventDefault();
  if (event.repeat) return;
  const scopeSelector = '[data-phd-input-scope],.phd-composer,form,[role="dialog"],[role="alertdialog"]';
  const scope = target.closest(scopeSelector);
  const actions = scope ? [...scope.querySelectorAll<HTMLButtonElement>('button[data-phd-enter-confirm],button[type="submit"],input[type="submit"]')]
    .filter(button => button.closest(scopeSelector) === scope && button.getClientRects().length > 0 && !button.closest('[hidden],[aria-hidden="true"],[inert]')) : [];
  if (actions.length === 1) {
    if (!actions[0].disabled && actions[0].getAttribute('aria-disabled') !== 'true') actions[0].click();
    return;
  }
  if (scope instanceof HTMLFormElement && actions.length === 0) {
    // Disabled submit actions must not be bypassed by implicit form submission.
    if (!scope.querySelector('button[type="submit"],input[type="submit"]')) scope.requestSubmit();
    return;
  }
  // Live filters and automatically applied fields confirm their current value on blur.
  // Ambiguous/multi-action scopes keep focus instead of choosing an arbitrary command.
  if (!scope || actions.length === 0) target.blur();
}

export function protectTextInput(event: KeyboardEvent) {
  if (event.key !== 'Enter') return;
  const target = textTarget(event.target);
  if (!target) return;
  if (isInputComposing(event)) { event.stopPropagation(); return; }
  if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
    // Preserve native Shift+Enter line breaks, but suppress legacy submit shortcuts.
    event.stopPropagation();
    if (target instanceof HTMLInputElement) event.preventDefault();
  }
  if (event.repeat && isInputConfirm(event)) { event.preventDefault(); event.stopPropagation(); }
}

/** One event boundary per Host; DOM scopes also work for React portal dialogs. */
export function InputBehaviorRoot({ children }: { children: ReactNode }) {
  return <div style={{ display: 'contents' }} onKeyDownCapture={protectTextInput} onKeyDown={confirmTextInput}>{children}</div>;
}
