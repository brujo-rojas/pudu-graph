import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-floabox-container.css?inline";

import "./floatbox/pudu-graph-floatbox";

@customElement("pudu-graph-floatbox-container")
export class PuduGraphFloatboxContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];
  render() {
    return html`
      <slot></slot>
      <pudu-graph-floatbox> </pudu-graph-floatbox>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-floatbox-container": PuduGraphFloatboxContainer;
  }
}
