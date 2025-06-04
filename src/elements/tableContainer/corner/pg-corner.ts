import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-corner.css?inline";

@customElement("pg-corner")
export class PgCorner extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
        <slot></slot>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-corner": PgCorner;
  }
}
