import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import { showMouseoverLight, updateMouseoverLightPosition, hideMouseoverLight, setTableRect } from "@state/mouseoverLightSlice";

@customElement("pg-global-mouseover-light")
export class PGGlobalMouseoverLight extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: none;
    }
  `;

  @state()
  private mouseoverLightState = {
    isVisible: false,
    x: 0,
    y: 0,
    tableRect: null
  };

  private tableElement: HTMLElement | null = null;
  private verticalLine: HTMLElement | null = null;
  private horizontalLine: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    
    console.log('🎨 Global Mouseover Light Connected');
    
    // Agregar listeners globales
    document.addEventListener('mousemove', this.handleGlobalMouseMove);
    document.addEventListener('mouseleave', this.handleGlobalMouseLeave);
    window.addEventListener('resize', this.updateTableRect);
    
    // Buscar el elemento de la tabla después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      this.findTableElement();
    }, 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    
    // Remover listeners
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    document.removeEventListener('mouseleave', this.handleGlobalMouseLeave);
    window.removeEventListener('resize', this.updateTableRect);
  }

  private findTableElement = () => {
    // Buscar dentro del shadow DOM de pudu-graph
    const puduGraph = document.querySelector('pudu-graph');
    
    if (puduGraph && puduGraph.shadowRoot) {
      // Buscar el table container dentro del shadow DOM
      const tableContainer = puduGraph.shadowRoot.querySelector('pg-table-container');
      
      if (tableContainer && tableContainer.shadowRoot) {
        // Buscar el grid container dentro del shadow DOM del table container
        this.tableElement = tableContainer.shadowRoot.querySelector('pg-grid-container') as HTMLElement;
        
        if (this.tableElement) {
          console.log('✅ Grid container found, creating mouseover lines inside');
          this.createMouseoverLines();
          this.updateTableRect();
        }
      }
    }
    
    if (!this.tableElement) {
      console.log('❌ Grid container NOT found - trying again in 500ms');
      setTimeout(() => {
        this.findTableElement();
      }, 500);
    }
  };

  private createMouseoverLines = () => {
    if (!this.tableElement) return;
    
    // Crear las líneas dentro del grid container
    const verticalLine = document.createElement('div');
    verticalLine.className = 'mouseover-vertical-line';
    verticalLine.style.cssText = `
      position: absolute;
      width: 2px;
      background-color: #007bff;
      opacity: 0.6;
      pointer-events: none;
      z-index: 1;
      display: none;
    `;
    
    const horizontalLine = document.createElement('div');
    horizontalLine.className = 'mouseover-horizontal-line';
    horizontalLine.style.cssText = `
      position: absolute;
      height: 2px;
      background-color: #007bff;
      opacity: 0.6;
      pointer-events: none;
      z-index: 1;
      display: none;
    `;
    
    this.tableElement.appendChild(verticalLine);
    this.tableElement.appendChild(horizontalLine);
    
    this.verticalLine = verticalLine;
    this.horizontalLine = horizontalLine;
    
    console.log('✅ Mouseover lines created inside grid container');
  };

  private updateTableRect = () => {
    if (this.tableElement) {
      const rect = this.tableElement.getBoundingClientRect();
      console.log('📐 Table rect updated:', rect);
      store.dispatch(setTableRect(rect));
    } else {
      console.log('❌ Cannot update rect - no table element');
    }
  };

  private handleGlobalMouseMove = (event: MouseEvent) => {
    if (!this.tableElement || !this.verticalLine || !this.horizontalLine) {
      return;
    }
    
    const rect = this.tableElement.getBoundingClientRect();
    const isInsideTable = event.clientX >= rect.left && 
                         event.clientX <= rect.left + rect.width && 
                         event.clientY >= rect.top && 
                         event.clientY <= rect.top + rect.height;

    if (isInsideTable) {
      // Calcular posiciones relativas al grid container
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      
      // Mostrar y posicionar las líneas
      this.verticalLine.style.display = 'block';
      this.horizontalLine.style.display = 'block';
      
      this.verticalLine.style.left = `${relativeX}px`;
      this.verticalLine.style.top = '0px';
      this.verticalLine.style.height = `${rect.height}px`;
      
      this.horizontalLine.style.left = '0px';
      this.horizontalLine.style.top = `${relativeY}px`;
      this.horizontalLine.style.width = `${rect.width}px`;
      
      console.log('🎯 Lines positioned:', { relativeX, relativeY, rect });
    } else {
      // Ocultar las líneas
      this.verticalLine.style.display = 'none';
      this.horizontalLine.style.display = 'none';
    }
  };

  private handleGlobalMouseLeave = () => {
    if (this.verticalLine && this.horizontalLine) {
      this.verticalLine.style.display = 'none';
      this.horizontalLine.style.display = 'none';
    }
  };

  stateChanged(state: RootState) {
    this.mouseoverLightState = state.mouseoverLight;
    
    // Actualizar clase show basada en el estado
    if (this.mouseoverLightState.isVisible) {
      this.classList.add('show');
    } else {
      this.classList.remove('show');
    }
    
    console.log('🎨 Global Mouseover Light State Changed:', this.mouseoverLightState);
    
    this.requestUpdate();
  }

  render() {
    // Las líneas ahora se manejan directamente en el DOM del grid container
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-global-mouseover-light": PGGlobalMouseoverLight;
  }
}
