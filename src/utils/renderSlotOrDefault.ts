import { html } from "lit";
import isSlotEmpty from "./isSlotEmpty";

export default function renderSlotOrDefault(
  renderRoot: Element | ShadowRoot,
  slotName: string,
  fallback: unknown,
  requestUpdate: () => void
) {
  const slotTemplate = html`
    <slot name=${slotName} @slotchange=${requestUpdate}></slot>
  `;

  const fallbackTemplate = isSlotEmpty(renderRoot, slotName)
    ? html`<span>${fallback}</span>`
    : null;

  return html`${slotTemplate}${fallbackTemplate}`;
}
