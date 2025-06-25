import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-table-container.css?inline";
import type { PGConfig } from "../../types";
import "./corner/pg-corner";
import "./scrollableContainer/pg-scrollable-container";

@customElement("pg-table-container")
export class PuduGraphTableContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  config: PGConfig = { options: {}, data: [] };

  render() {
    return html`
        <pg-corner></pg-corner>
        <pg-scrollable-container></pg-scrollable-container>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-table-container": PuduGraphTableContainer;
  }
}
