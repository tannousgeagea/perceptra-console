/** True when a key event comes from a text field, so global shortcuts should not fire. */
export const isTypingTarget = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    !!target?.isContentEditable
  );
};
