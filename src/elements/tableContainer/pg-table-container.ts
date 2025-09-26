import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-table-container.css?inline";
import type { PGConfig } from "../../types";

import "./corner/pg-corner";
import "./floatboxContainer/pg-floatbox-container";
import "./floatbox/pg-global-tooltip";
import "./floatbox/pg-global-float-detail";
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

  connectedCallback() {
    super.connectedCallback();
    
    // Crear el tooltip global fuera del shadow DOM
    if (!document.querySelector('pg-global-tooltip')) {
      const tooltip = document.createElement('pg-global-tooltip');
      document.body.appendChild(tooltip);
    }
    
    // Crear el float detail global fuera del shadow DOM
    if (!document.querySelector('pg-global-float-detail')) {
      const floatDetail = document.createElement('pg-global-float-detail');
      document.body.appendChild(floatDetail);
    }
  }

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
