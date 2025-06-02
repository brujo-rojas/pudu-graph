import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-sidebar.css?inline";

@customElement("pudu-graph-sidebar")
export class PuduGraphSidebar extends LitElement {
  static styles = [unsafeCSS(cssStyles)];
  render() {
    return html`<div>Sidebar</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-sidebar": PuduGraphSidebar;
  }
}
