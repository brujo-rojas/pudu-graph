import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import { toggleGridSelection } from "@state/gridSelectionSlice";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH } from "@/utils/DEFAULTS";
import { getItemHeight } from "@/utils/floatboxHeight";
import cssStyles from "./pg-table-container.css?inline";
import type { PGConfig } from "../../types";

import "./corner/pg-corner";
import "./floatboxContainer/pg-floatbox-container";
import "./floatboxContainer/pg-float-icon-container";
import "./floatbox/pg-global-tooltip";
import "./floatbox/pg-global-float-detail";
import "./pg-global-mouseover-light";
import "./pg-grid-selection";
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
export class PuduGraphTableContainer extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  config: PGConfig = { options: {}, data: [] };

  private data: any[] = [];
  private gridContainer: HTMLElement | null = null;

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

    // Agregar listener de click al grid container
    this.addEventListener('click', this.handleGridClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleGridClick);
  }

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.data = state.data;
  }

  private handleGridClick = (event: MouseEvent) => {
    if (!this.config || !this.data) return;
    
    // Verificar si el click fue en un floatbox o icono
    const target = event.target as HTMLElement;
    const isFloatboxClick = target.closest('.pg-floatbox') || target.closest('.pg-float-icon');
    
    if (isFloatboxClick) {
      // No procesar el click del grid si fue en un floatbox/icono
      return;
    }
    
    // Buscar el grid container
    const gridContainer = this.shadowRoot?.querySelector('pg-grid-container') as HTMLElement;
    if (!gridContainer) return;
    
    const rect = gridContainer.getBoundingClientRect();
    const isInsideGrid = event.clientX >= rect.left && 
                        event.clientX <= rect.right && 
                        event.clientY >= rect.top && 
                        event.clientY <= rect.bottom;
    
    if (isInsideGrid) {
      const positionInfo = this.calculateDayAndItem(event, rect);
      if (positionInfo) {
        const { dayInfo, itemInfo } = positionInfo;
        
        // Select grid cell
        store.dispatch(toggleGridSelection({
          rowIndex: itemInfo.itemIndex,
          dayIndex: dayInfo.dayIndex
        }));
        
        console.log('🎯 Grid Selection:', {
          rowIndex: itemInfo.itemIndex,
          dayIndex: dayInfo.dayIndex,
          rowLabel: this.data[itemInfo.itemIndex]?.label || 'Unknown',
          date: new Date(((this.config.options.startUnix || 0) + dayInfo.dayIndex * DAY_SECONDS) * 1000).toISOString().split('T')[0]
        });
      }
    }
  };

  private calculateDayAndItem(event: MouseEvent, rect: DOMRect) {
    if (!this.config) return null;

    const { startUnix = 0, dayWidth = DAY_WIDTH } = this.config.options;
    const zoomValue = 1; // TODO: obtener del estado
    const itemHeight = getItemHeight(this.config);

    // Calcular posición relativa al grid
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    // Calcular día
    const dayIndex = Math.floor(relativeX / (dayWidth * zoomValue));

    // Calcular item/fila
    const itemIndex = Math.floor(relativeY / itemHeight);

    // Verificar que esté dentro de los límites
    if (itemIndex >= 0 && itemIndex < this.data.length && dayIndex >= 0) {
      return {
        dayInfo: { dayIndex },
        itemInfo: { itemIndex }
      };
    }

    return null;
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
          <pg-grid-selection></pg-grid-selection>
          <pg-floatbox-container></pg-floatbox-container>
          <pg-float-icon-container></pg-float-icon-container>
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
