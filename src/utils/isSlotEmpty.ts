export default function isSlotEmpty(
  renderRoot: Element | ShadowRoot,
  slotName: string
): boolean {
  const slot = renderRoot?.querySelector(`slot[name='${slotName}']`);
  if (!slot) return true;
  const assigned = (slot as HTMLSlotElement).assignedNodes({ flatten: true });
  return (
    assigned.length === 0 ||
    assigned.every((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) {
        return !(n as HTMLElement).innerHTML.trim();
      }
      if (n.nodeType === Node.TEXT_NODE) {
        return !n.textContent?.trim();
      }
      return true;
    })
  );
}
