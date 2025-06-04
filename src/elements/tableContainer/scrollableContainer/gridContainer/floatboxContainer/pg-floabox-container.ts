import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-floabox-container.css?inline";

import "./floatbox/pg-floatbox";

@customElement("pg-floatbox-container")
export class PuduGraphFloatboxContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];
  render() {
    return html`
      <slot></slot>
      <pg-floatbox> </pg-floatbox>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox-container": PuduGraphFloatboxContainer;
  }
}
