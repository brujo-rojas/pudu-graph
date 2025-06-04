import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-scrollable-container.css?inline";

import "./header/pg-header";
import "./verticalPlotsContainer/pg-vertical-plots-container";
import "./horizontalPlotsContainer/pg-horizontal-plots-container";
import "./todayLine/pg-today-line";
import "./sidebar/pg-sidebar";
import "./gridContainer/pg-grid-container";

@customElement("pg-scrollable-container")
export class PuduGraphScrollableContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
      <pg-header></pg-header>
      <pg-vertical-plots-container></pg-vertical-plots-container>
      <pg-horizontal-plots-container></pg-horizontal-plots-container>
      <pg-today-line></pg-today-line>
      <pg-sidebar></pg-sidebar>
      <pg-grid-container></pg-grid-container>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-scrollable-container": PuduGraphScrollableContainer;
  }
}
