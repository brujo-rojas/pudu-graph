import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-scrollable-container.css?inline";

import "./header/pudu-graph-header";
import "./verticalPlotsContainer/pudu-graph-vertical-plots-container";
import "./horizontalPlotsContainer/pudu-graph-horizontal-plots-container";
import "./todayLine/pudu-graph-today-line";
import "./sidebar/pudu-graph-sidebar";
import "./gridContainer/pudu-graph-grid-container";

@customElement("pudu-graph-scrollable-container")
export class PuduGraphScrollableContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
      <pudu-graph-header></pudu-graph-header>
      <pudu-graph-vertical-plots-container></pudu-graph-vertical-plots-container>
      <pudu-graph-horizontal-plots-container></pudu-graph-horizontal-plots-container>
      <pudu-graph-today-line></pudu-graph-today-line>
      <pudu-graph-sidebar></pudu-graph-sidebar>
      <pudu-graph-grid-container></pudu-graph-grid-container>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-scrollable-container": PuduGraphScrollableContainer;
  }
}
