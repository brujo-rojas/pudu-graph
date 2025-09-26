import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("pg-tooltip")
export class PGTooltip extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }

    .tooltip {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      white-space: nowrap;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -4px;
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.9);
    }

    .tooltip.show {
      opacity: 1;
    }

    .tooltip-content {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  @property({ type: String })
  text: string = '';

  @property({ type: String })
  position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipElement?: HTMLElement;

  connectedCallback() {
    super.connectedCallback();
    // Esperar a que se renderice
    this.updateComplete.then(() => {
      this.tooltipElement = this.shadowRoot?.querySelector('.tooltip') as HTMLElement;
      console.log('Tooltip element encontrado:', this.tooltipElement);
    });
  }

  show() {
    console.log('Tooltip show() llamado');
    // Buscar el elemento si no está disponible
    if (!this.tooltipElement) {
      this.tooltipElement = this.shadowRoot?.querySelector('.tooltip') as HTMLElement;
    }
    
    if (this.tooltipElement) {
      console.log('Agregando clase show');
      this.tooltipElement.classList.add('show');
    } else {
      console.log('Tooltip element no encontrado');
    }
  }

  hide() {
    console.log('Tooltip hide() llamado');
    // Buscar el elemento si no está disponible
    if (!this.tooltipElement) {
      this.tooltipElement = this.shadowRoot?.querySelector('.tooltip') as HTMLElement;
    }
    
    if (this.tooltipElement) {
      console.log('Removiendo clase show');
      this.tooltipElement.classList.remove('show');
    } else {
      console.log('Tooltip element no encontrado');
    }
  }

  render() {
    console.log('Tooltip render:', { text: this.text, hasText: !!this.text });
    if (!this.text) {
      return html``;
    }

    return html`
      <div class="tooltip">${this.text}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-tooltip": PGTooltip;
  }
}
