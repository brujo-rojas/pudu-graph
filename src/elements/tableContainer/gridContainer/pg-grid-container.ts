import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-grid-container.css?inline";

@customElement("pg-grid-container")
export class PuduGraphGridContainer extends LitElement {
  static styles = unsafeCSS(cssStyles);

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-grid-container": PuduGraphGridContainer;
  }
}
