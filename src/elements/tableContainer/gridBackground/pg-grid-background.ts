import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-grid-background.css?inline";

@customElement("pg-grid-background")
export class PuduGraphGridBackground extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-grid-background": PuduGraphGridBackground;
  }
}
