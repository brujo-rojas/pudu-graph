import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-row-sidebar.css?inline";

@customElement("pg-row-sidebar")
export class PuduGraphRowSidebar extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  public itemRow: any;

  render() {
    return html`
      <div>
        <div class="row-title">${this.itemRow.label}</div>
        <slot></slot>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-row-sidebar": PuduGraphRowSidebar;
  }
}
