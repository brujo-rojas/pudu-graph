import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-scrollable-container.css?inline";

@customElement("pg-scrollable-container")
export class PuduGraphScrollableContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html` <slot></slot>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-scrollable-container": PuduGraphScrollableContainer;
  }
}
