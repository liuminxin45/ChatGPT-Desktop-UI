/** Escape used by an input method is text editing, not modal dismissal. */
export function protectModalEscape(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) event.preventDefault();
}
