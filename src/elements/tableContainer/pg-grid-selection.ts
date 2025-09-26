import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { store } from '@state/store';
import type { RootState } from '@state/store';
import type { PGConfig } from '@/types';
import { DAY_WIDTH } from '@/utils/DEFAULTS';

@customElement('pg-grid-selection')
export class PGGridSelection extends connect(store)(LitElement) {
  @property({ type: Object })
  config?: PGConfig;

  @property({ type: Object })
  gridSelection?: any;

  static styles = css`
    :host {
      position: absolute;
      pointer-events: none;
      z-index: 1; /* Debajo de los floatboxes */
    }

    .selection-box {
      position: absolute;
      background-color: rgba(52, 152, 219, 0.3);
      border: 2px solid #3498db;
      border-radius: 4px;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .selection-box.active {
      background-color: rgba(52, 152, 219, 0.4);
      border-color: #2980b9;
    }
  `;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.gridSelection = state.gridSelection;
  }

  private calculateSelectionPositions() {
    if (!this.config || !this.gridSelection?.selections?.length) {
      return [];
    }

    const { dayWidth = DAY_WIDTH, itemHeight = 60 } = this.config.options;
    const zoomValue = 1; // TODO: obtener del estado de UI

    return this.gridSelection.selections.map((selection: any) => {
      const { rowIndex, dayIndex } = selection;
      
      // Calcular posición
      const left = dayIndex * dayWidth * zoomValue;
      const top = rowIndex * itemHeight;
      const width = dayWidth * zoomValue;
      const height = itemHeight;

      return {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`
      };
    });
  }

  render() {
    const positions = this.calculateSelectionPositions();
    const hasSelections = positions.length > 0;

    if (!hasSelections) {
      return html``;
    }

    return html`
      ${positions.map((position: any) => html`
        <div 
          class="selection-box active"
          style="
            left: ${position.left};
            top: ${position.top};
            width: ${position.width};
            height: ${position.height};
          "
        ></div>
      `)}
    `;
  }
}
