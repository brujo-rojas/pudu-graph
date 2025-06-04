import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-sidebar.css?inline";

@customElement("pg-sidebar")
export class PuduGraphSidebar extends LitElement {
  static styles = [unsafeCSS(cssStyles)];
  render() {
    return html`<div>Sidebar</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-sidebar": PuduGraphSidebar;
  }
}
