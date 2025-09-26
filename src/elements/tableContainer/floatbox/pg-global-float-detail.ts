import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "../../../state/store";
import type { RootState } from "../../../state/store";

@customElement("pg-global-float-detail")
export class PGGlobalFloatDetail extends connect(store)(LitElement) {
  static styles = css`
    :host {
      position: fixed;
      pointer-events: none;
      z-index: 99998;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    :host(.show) {
      opacity: 1 !important;
    }

    .float-detail {
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 16px;
      position: fixed;
      font-size: 14px;
      color: #333;
      line-height: 1.4;
    }

    .float-detail::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border: 8px solid transparent;
      z-index: 1;
    }

    .float-detail::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border: 9px solid transparent;
      z-index: 0;
    }

    /* Flecha para posición top */
    :host(.position-top) .float-detail::before {
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: white;
      border-bottom: none;
    }

    :host(.position-top) .float-detail::after {
      bottom: -9px;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: #e0e0e0;
      border-bottom: none;
    }

    /* Flecha para posición bottom */
    :host(.position-bottom) .float-detail::before {
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: white;
      border-top: none;
    }

    :host(.position-bottom) .float-detail::after {
      top: -9px;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: #e0e0e0;
      border-top: none;
    }

    /* Flecha para posición left */
    :host(.position-left) .float-detail::before {
      right: -8px;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: white;
      border-right: none;
    }

    :host(.position-left) .float-detail::after {
      right: -9px;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: #e0e0e0;
      border-right: none;
    }

    /* Flecha para posición right */
    :host(.position-right) .float-detail::before {
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: white;
      border-left: none;
    }

    :host(.position-right) .float-detail::after {
      left: -9px;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: #e0e0e0;
      border-left: none;
    }
  `;

  @state()
  private floatDetailState = {
    isVisible: false,
    x: 0,
    y: 0,
    content: '',
    position: 'top' as 'top' | 'bottom' | 'left' | 'right',
    width: 200,
    height: 100
  };

  stateChanged(state: RootState) {
    this.floatDetailState = state.floatDetail;
    
    // Actualizar clases basadas en el estado
    if (this.floatDetailState.isVisible) {
      this.classList.add('show');
      this.classList.add(`position-${this.floatDetailState.position}`);
    } else {
      this.classList.remove('show');
      this.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');
    }
    
    this.requestUpdate();
  }

  render() {
    if (!this.floatDetailState.isVisible || !this.floatDetailState.content) {
      return html``;
    }

    // Logs removidos para producción

    return html`
      <div 
        class="float-detail"
        style="
          left: ${this.floatDetailState.x}px; 
          top: ${this.floatDetailState.y}px;
          width: ${this.floatDetailState.width}px;
          height: ${this.floatDetailState.height}px;
        "
      >
        ${this.floatDetailState.content}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-global-float-detail": PGGlobalFloatDetail;
  }
}
