import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-table-container.css?inline";
import type { PGConfig } from "../../types";

import "./corner/pg-corner";
import "./floatboxContainer/pg-floatbox-container";
import "./floatDetails/pg-float-details";
import "./gridBackground/pg-grid-background";
import "./gridContainer/pg-grid-container";
import "./header-inputs/pg-header-inputs";
import "./header-timeline/pg-header-timeline";
import "./header/pg-header";
import "./horizontalPlotsContainer/pg-horizontal-plots-container";
import "./mouseoverLight/pg-mouseover-light";
import "./scrollableContainer/pg-scrollable-container";
import "./selectionLight/pg-selection-light";
import "./sidebar/pg-sidebar";
import "./todayLine/pg-today-line";
import "./verticalPlotsContainer/pg-vertical-plots-container";

@customElement("pg-table-container")
export class PuduGraphTableContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  config: PGConfig = { options: {}, data: [] };

  render() {
    return html`
      <pg-corner></pg-corner>

      <pg-scrollable-container>
        <pg-header>
          <pg-header-timeline></pg-header-timeline>
          <pg-header-inputs></pg-header-inputs>
        </pg-header>

        <pg-vertical-plots-container></pg-vertical-plots-container>
        <pg-horizontal-plots-container></pg-horizontal-plots-container>
        <pg-today-line></pg-today-line>

        <pg-sidebar> </pg-sidebar>

        <pg-grid-container>
          <pg-grid-background></pg-grid-background>
          <pg-mouseover-light></pg-mouseover-light>
          <pg-selection-light></pg-selection-light>
          <pg-float-details></pg-float-details>
          <div style="color: blue; padding: 5px; border: 1px solid blue;">
            TableContainer: Renderizando FloatboxContainer
          </div>
          <pg-floatbox-container></pg-floatbox-container>
        </pg-grid-container>
      </pg-scrollable-container>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-table-container": PuduGraphTableContainer;
  }
}
