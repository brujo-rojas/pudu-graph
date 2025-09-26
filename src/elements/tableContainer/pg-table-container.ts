import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-table-container.css?inline";
import type { PGConfig } from "../../types";

import "./corner/pg-corner";
import "./floatboxContainer/pg-floatbox-container";
import "./floatbox/pg-global-tooltip";
import "./floatbox/pg-global-float-detail";
import "./pg-global-mouseover-light";
import "./gridBackground/pg-grid-background";
import "./gridContainer/pg-grid-container";
import "./header-inputs/pg-header-inputs";
import "./header-timeline/pg-header-timeline";
import "./header/pg-header";
import "./horizontalPlotsContainer/pg-horizontal-plots-container";
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
    
    console.log('🏗️ Table Container Connected - DOM should be ready now');
    
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
    
    // Crear el mouseover light global fuera del shadow DOM
    if (!document.querySelector('pg-global-mouseover-light')) {
      const mouseoverLight = document.createElement('pg-global-mouseover-light');
      document.body.appendChild(mouseoverLight);
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
