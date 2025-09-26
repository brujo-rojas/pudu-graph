import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import { showMouseoverLight, updateMouseoverLightPosition, hideMouseoverLight, setTableRect, updateMouseoverInfo } from "@state/mouseoverLightSlice";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH } from "@/utils/DEFAULTS";
import { getItemHeight } from "@/utils/floatboxHeight";

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

  @state()
  private config: any = null;

  @state()
  private data: any[] = [];

  @state()
  private uiState: any = null;

  private tableElement: HTMLElement | null = null;
  private verticalLine: HTMLElement | null = null;
  private horizontalLine: HTMLElement | null = null;
  private gridHoverElement: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    
    
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
          this.createMouseoverLines();
          this.updateTableRect();
        }
      }
    }
    
    if (!this.tableElement) {
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
      z-index: 0;
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
      z-index: 0;
      display: none;
    `;
    
    // Crear el elemento de hover del grid
    const gridHover = document.createElement('div');
    gridHover.className = 'grid-hover-element';
    gridHover.style.cssText = `
      position: absolute;
      width: calc(var(--pg-cell-width, 30px) - 2px);
      height: calc(var(--pg-item-height, 60px) - 2px);
      background-color: rgba(0, 123, 255, 0.2);
      border: 2px solid #007bff;
      pointer-events: none;
      z-index: 0;
      display: none;
      transition: all 0.1s ease;
    `;
    
    this.tableElement.appendChild(verticalLine);
    this.tableElement.appendChild(horizontalLine);
    this.tableElement.appendChild(gridHover);
    
    this.verticalLine = verticalLine;
    this.horizontalLine = horizontalLine;
    this.gridHoverElement = gridHover;
    
  };

  private updateTableRect = () => {
    if (this.tableElement) {
      const rect = this.tableElement.getBoundingClientRect();
      // Convertir DOMRect a objeto serializable
      const serializableRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        x: rect.x,
        y: rect.y
      };
      store.dispatch(setTableRect(serializableRect));
    }
  };

  private calculateDayAndItem(event: MouseEvent, rect: DOMRect) {
    if (!this.config || !this.data) return null;

    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    // Calcular el día basado en la posición X
    const { startUnix, dayWidth = DAY_WIDTH } = this.config.options;
    const zoomValue = this.uiState?.zoomValue || 1;
    
    // Fórmula inversa de calcLeft: ((itemStart - startUnix) / DAY_SECONDS) * dayWidth * zoom
    const dayOffset = (relativeX / (dayWidth * zoomValue)) * DAY_SECONDS;
    const targetUnix = startUnix + dayOffset;
    const dayIndex = Math.floor(dayOffset / DAY_SECONDS);
    
    // Calcular el item del sidebar basado en la posición Y
    const itemHeight = getItemHeight(this.config);
    const itemIndex = Math.floor(relativeY / itemHeight);
    
    // Obtener información del día
    const dayDate = new Date(targetUnix * 1000);
    const dayInfo = {
      dayIndex,
      targetUnix,
      date: dayDate.toISOString().slice(0, 10),
      dayOfWeek: dayDate.toLocaleDateString('es-ES', { weekday: 'long' }),
      dayOfMonth: dayDate.getDate(),
      month: dayDate.toLocaleDateString('es-ES', { month: 'long' })
    };

    // Obtener información del item
    const itemInfo = {
      itemIndex,
      rowData: this.data[itemIndex] || null,
      rowLabel: this.data[itemIndex]?.label || `Fila ${itemIndex + 1}`,
      isWithinBounds: itemIndex >= 0 && itemIndex < this.data.length
    };

    return { dayInfo, itemInfo, relativeX, relativeY };
  }

  private calculateGridHoverPosition(event: MouseEvent, rect: DOMRect) {
    if (!this.config || !this.data) return null;

    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    // Calcular el día completo (número absoluto)
    const { startUnix, dayWidth = DAY_WIDTH } = this.config.options;
    const zoomValue = this.uiState?.zoomValue || 1;
    
    const dayOffset = (relativeX / (dayWidth * zoomValue)) * DAY_SECONDS;
    const dayIndex = Math.floor(dayOffset / DAY_SECONDS);
    
    // Calcular el item completo (número absoluto)
    const itemHeight = getItemHeight(this.config);
    const itemIndex = Math.floor(relativeY / itemHeight);
    
    // Verificar que esté dentro de los límites
    const totalDays = Math.ceil((this.config.options.endUnix - this.config.options.startUnix) / DAY_SECONDS);
    const isWithinBounds = dayIndex >= 0 && dayIndex < totalDays && itemIndex >= 0 && itemIndex < this.data.length;
    
    if (!isWithinBounds) return null;

    // Calcular posiciones absolutas del grid
    const gridX = dayIndex * (dayWidth * zoomValue);
    const gridY = itemIndex * itemHeight;

    return {
      dayIndex,
      itemIndex,
      gridX,
      gridY,
      isWithinBounds
    };
  }

  private lastDayIndex = -1;
  private lastItemIndex = -1;

  private handleGlobalMouseMove = (event: MouseEvent) => {
    if (!this.tableElement || !this.verticalLine || !this.horizontalLine || !this.gridHoverElement) {
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
      
      // Calcular y mostrar información del día e item
      const positionInfo = this.calculateDayAndItem(event, rect);
      if (positionInfo) {
        const { dayInfo, itemInfo } = positionInfo;
        
        // Solo actualizar el store si cambió el día o item
        if (dayInfo.dayIndex !== this.lastDayIndex || itemInfo.itemIndex !== this.lastItemIndex) {
          this.lastDayIndex = dayInfo.dayIndex;
          this.lastItemIndex = itemInfo.itemIndex;
          
          // Actualizar el store con la información
          store.dispatch(updateMouseoverInfo({ dayInfo, itemInfo }));
        }
      }

      // Calcular y posicionar el grid hover
      const gridHoverInfo = this.calculateGridHoverPosition(event, rect);
      if (gridHoverInfo && gridHoverInfo.isWithinBounds) {
        this.gridHoverElement.style.display = 'block';
        this.gridHoverElement.style.left = `${gridHoverInfo.gridX}px`;
        this.gridHoverElement.style.top = `${gridHoverInfo.gridY}px`;
      } else {
        this.gridHoverElement.style.display = 'none';
      }
    } else {
      // Ocultar las líneas y el grid hover
      this.verticalLine.style.display = 'none';
      this.horizontalLine.style.display = 'none';
      if (this.gridHoverElement) {
        this.gridHoverElement.style.display = 'none';
      }
      
      // Resetear índices cuando salimos de la tabla
      this.lastDayIndex = -1;
      this.lastItemIndex = -1;
    }
  };

  private handleGlobalMouseLeave = () => {
    if (this.verticalLine && this.horizontalLine) {
      this.verticalLine.style.display = 'none';
      this.horizontalLine.style.display = 'none';
    }
    
    if (this.gridHoverElement) {
      this.gridHoverElement.style.display = 'none';
    }
    
    // Resetear índices
    this.lastDayIndex = -1;
    this.lastItemIndex = -1;
    
    // Limpiar la información del store
    store.dispatch(updateMouseoverInfo({ 
      dayInfo: null, 
      itemInfo: null 
    }));
  };

  stateChanged(state: RootState) {
    this.mouseoverLightState = state.mousePosition;
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    
    // Actualizar clase show basada en el estado
    if (this.mouseoverLightState.isVisible) {
      this.classList.add('show');
    } else {
      this.classList.remove('show');
    }
    
    // No llamar requestUpdate() para evitar re-renderizados innecesarios
    // Las líneas se manejan directamente en el DOM
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
