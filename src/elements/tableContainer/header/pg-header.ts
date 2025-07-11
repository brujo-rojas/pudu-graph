import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-header.css?inline";

@customElement("pg-header")
export class PuduGraphHeader extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`<slot></slot>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-header": PuduGraphHeader;
  }
}
