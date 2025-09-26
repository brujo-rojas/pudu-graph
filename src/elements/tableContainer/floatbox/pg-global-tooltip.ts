import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "../../../state/store";
import type { RootState } from "../../../state/store";

@customElement("pg-global-tooltip")
export class PGGlobalTooltip extends connect(store)(LitElement) {
  static styles = css`
    :host {
      position: fixed;
      pointer-events: none;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    :host(.show) {
      opacity: 1 !important;
    }

    .tooltip {
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      position: fixed;
      transform: translateX(-50%) translateY(-100%);
      margin-top: -8px;
    }

    .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -6px;
      border: 6px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.9);
    }
  `;

  @state()
  private tooltipState = {
    isVisible: false,
    x: 0,
    y: 0,
    text: ''
  };

  stateChanged(state: RootState) {
    this.tooltipState = state.tooltip;
    
    // Actualizar clase show basada en el estado
    if (this.tooltipState.isVisible) {
      this.classList.add('show');
    } else {
      this.classList.remove('show');
    }
    
    this.requestUpdate();
  }

  render() {
    if (!this.tooltipState.isVisible || !this.tooltipState.text) {
      return html``;
    }

    return html`
      <div 
        class="tooltip"
        style="left: ${this.tooltipState.x}px; top: ${this.tooltipState.y}px;"
      >
        ${this.tooltipState.text}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-global-tooltip": PGGlobalTooltip;
  }
}
