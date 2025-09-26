import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { store } from '@/state/store';
import type { RootState } from '@/state/store';
import { showTooltip, hideTooltip, updateTooltipPosition, updateTooltipPositionFromElement } from '@/state/tooltipSlice';
import { showFloatDetail, hideFloatDetail, updateFloatDetailPosition } from '@/state/floatDetailSlice';
import { updateRowItem, updateRowIcon } from '@/state/dataSlice';
import type { PGConfig, PGItemData, PGUIState } from '@/types';
import { calculateFloatIconPosition } from './calculateFloatboxPosition';
import { DragController } from './DragController';

interface PositionResult {
  left: number;
  top: number;
  width: number;
  height: number;
  level: number;
}

@customElement("pg-float-icon")
export class PuduGraphFloatIcon extends connect(store)(LitElement) {
  static styles = css`
    .pg-float-icon {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      z-index: 10;
      user-select: none;
    }

    .pg-float-icon:hover {
      transform: scale(1.2);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      z-index: 11;
    }

    .pg-float-icon.dragging {
      opacity: 0.7;
      z-index: 1000;
      transform: scale(1.2) rotate(2deg);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
  `;

  @property({ type: Object }) itemData?: PGItemData;
  @property({ type: Object }) rowData?: any;
  @property({ type: Number }) rowIndex = 0;
  @property({ type: Number }) overlapLevel = 0;

  @state() private config?: PGConfig;
  @state() private uiState?: PGUIState;
  @state() private isDragging = false;

  private dragController?: DragController;
  private lastStyleHash = '';

  connectedCallback() {
    super.connectedCallback();
    this.initializeControllers();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupControllers();
  }

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.uiState = state.uiState;
    this.updateStyles();
    
    // Re-inicializar controllers cuando cambie el estado
    this.initializeControllers();
  }

  private initializeControllers(): void {
    this.cleanupControllers();
    
    if (!this.config || !this.itemData || !this.uiState) {
      return;
    }
    
    const interactions = this.itemData?.interactions || this.config?.options?.interactions;

    if (interactions?.enableDrag === true) {
      this.dragController = new DragController({
        itemData: this.itemData,
        config: this.config,
        zoomValue: this.uiState.zoomValue || 1,
        renderRoot: this.renderRoot,
        rowIndex: this.rowIndex,
        dragHorizontalOnly: interactions.dragHorizontalOnly ?? true
      });
      this.dragController.addDragEvents(this);
      this.dragController.onDrop(this.handleDrop);
    }
  }

  private cleanupControllers(): void {
    if (this.dragController) {
      this.dragController.removeDragEvents(this);
      this.dragController = undefined;
    }
  }

  /**
   * Maneja el evento de drop
   */
  private handleDrop = (params: { x: number; y: number; newLeft?: number; date?: Date; width?: number; newStartUnix?: number; newEndUnix?: number }) => {
    if (!this.itemData) {
      return;
    }
    
    // Para iconos, solo actualizamos startUnix
    const newStartUnix = params.newStartUnix ?? (params.date ? Math.floor(params.date.getTime() / 1000) : this.itemData.startUnix);
    
    console.log('🎯 Drag End:', this.itemData.label, '|',
      'Original:', new Date(this.itemData.startUnix * 1000).toISOString().split('T')[0], '|',
      'New:', new Date(newStartUnix * 1000).toISOString().split('T')[0]);
    
    // Actualizar datos
    const updatedItem = { 
      ...this.itemData, 
      startUnix: newStartUnix
    };
    this.itemData = updatedItem;
    
    // Actualizar solo los datos de los controladores
    this.updateControllerData();
    
    // Limpiar cache de posición
    this.clearPositionCache();
    
    // Forzar actualización
    this.requestUpdate();
    
    // Emitir evento de cambio
    const event = new CustomEvent('item-updated', {
      detail: { item: updatedItem, rowIndex: this.rowIndex },
      bubbles: true
    });
    
    // Intentar llamar directamente al contenedor
    let container = this.closest('pg-float-icon-container') as any;
    
    // Si no se encuentra, buscar en el document
    if (!container) {
      container = document.querySelector('pg-float-icon-container') as any;
    }
    
    if (container && container.handleItemUpdated) {
      container.handleItemUpdated(event);
    } else {
      // Actualizar el store directamente
      this.updateStoreDirectly(updatedItem, this.rowIndex);
      
      // También emitir el evento por si acaso
      this.dispatchEvent(event);
    }
  };


  /**
   * Actualiza el store directamente
   */
  private updateStoreDirectly(item: PGItemData, rowIndex: number): void {
    // Obtener el estado actual del store
    const state = store.getState();
    const iconData = state.data[rowIndex]?.iconData;
    
    if (iconData && item.id) {
      // Buscar el item por ID único
      const itemIndex = iconData.findIndex(existingItem => existingItem.id === item.id);
      
      if (itemIndex !== -1) {
        console.log('🎯 Store Update:', item.label || 'Sin label', '|', 
          'ID:', item.id, '|',
          'Row:', rowIndex, 'Index:', itemIndex, '|',
          'OldDate:', new Date(iconData[itemIndex].startUnix * 1000).toISOString().split('T')[0], '|',
          'NewDate:', new Date(item.startUnix * 1000).toISOString().split('T')[0]);
        
        store.dispatch(updateRowIcon({
          rowIndex,
          itemIndex,
          itemData: { ...item }
        }));
      } else {
        console.warn('🎯 Store Update Failed: No se encontró el item con ID', item.id, 'en row', rowIndex);
      }
    } else {
      console.warn('🎯 Store Update Failed: Item sin ID o iconData no disponible', item);
    }
  }

  /**
   * Actualiza solo los datos de los controladores existentes
   */
  private updateControllerData(): void {
    if (this.dragController && this.itemData) {
      this.dragController.updateItemData(this.itemData);
    }
  }

  /**
   * Limpia el cache de posición para forzar recálculo
   */
  private clearPositionCache(): void {
    this.lastStyleHash = '';
  }

  private calculatePosition(): PositionResult {
    if (!this.config || !this.itemData || !this.uiState) {
      return { left: 0, top: 0, width: 0, height: 0, level: 0 };
    }

    const itemDataWithOverlap = {
      ...this.itemData,
      overlapLevel: this.overlapLevel
    };
    
    const result = calculateFloatIconPosition({
      config: this.config,
      itemData: itemDataWithOverlap,
      rowIndex: this.rowIndex,
      zoomValue: this.uiState.zoomValue || 1,
    });
    
    return {
      ...result,
      level: this.overlapLevel
    };
  }

  private updateStyles(): void {
    if (!this.config || !this.itemData || !this.uiState) {
      return;
    }

    const position = this.calculatePosition();
    const styleHash = `${position.left}-${position.top}-${position.width}-${position.height}`;
    
    if (styleHash === this.lastStyleHash) {
      return;
    }
    
    this.lastStyleHash = styleHash;
    
    // Usar variables CSS como en pg-floatbox
    this.style.setProperty("--pg-float-icon-left", `${position.left}px`);
    this.style.setProperty("--pg-float-icon-top", `${position.top}px`);
    this.style.setProperty("--pg-float-icon-width", `${position.width}px`);
    this.style.setProperty("--pg-float-icon-height", `${position.height}px`);
  }

  private handleMouseEnter = (event: MouseEvent) => {
    if (this.itemData?.label) {
      // Calcular posición del elemento interno (div con clase .pg-float-icon)
      const innerElement = this.shadowRoot?.querySelector('.pg-float-icon') as HTMLElement;
      const rect = innerElement ? innerElement.getBoundingClientRect() : this.getBoundingClientRect();
      
      // Siempre usar las coordenadas del elemento para posicionar el tooltip
      // Si el elemento no tiene dimensiones, usar las coordenadas del mouse como fallback
      let elementX, elementY;
      if (rect.width === 0 || rect.height === 0) {
        // Element has no dimensions, using mouse position as fallback
        elementX = event.clientX;
        elementY = event.clientY - 20; // 20px arriba del mouse
      } else {
        // Posicionar alineado a la izquierda y más arriba del elemento
        elementX = rect.left; // Alineado a la izquierda
        elementY = rect.top - 30; // 30px arriba del elemento
      }
      
    
      // Dispatch al store para tooltip con posición del elemento
      store.dispatch(showTooltip({ 
        x: elementX, 
        y: elementY, 
        text: this.itemData.label, 
        targetElementId: this.id || `float-icon-${this.rowIndex}-${this.overlapLevel}`
      }));
      
      // Dispatch al store para float detail
      store.dispatch(showFloatDetail({ x: event.clientX, y: event.clientY, content: this.itemData.label }));
      
      // Agregar listener para actualizar posición
      this.addEventListener('mousemove', this.handleMouseMove);
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    // Solo actualizar la posición del float detail (que sí sigue el mouse)
    // El tooltip se posiciona sobre el elemento, no sigue el mouse
    store.dispatch(updateFloatDetailPosition({ x: event.clientX, y: event.clientY }));
  };

  private handleMouseLeave = () => {
    // Remover listener de mousemove
    this.removeEventListener('mousemove', this.handleMouseMove);
    
    // Pequeño delay para evitar que se oculte inmediatamente
    setTimeout(() => {
      store.dispatch(hideTooltip());
      store.dispatch(hideFloatDetail());
    }, 100);
  };

  render() {
    if (!this.config || !this.itemData || !this.uiState) {
      return html``;
    }

    // Actualizar estilos antes de renderizar
    this.updateStyles();

    const color = this.itemData.color || '#3498db';
    const label = this.itemData.label || '';

    return html`
      <div 
        class="pg-float-icon ${this.isDragging ? 'dragging' : ''}"
        style="
          left: var(--pg-float-icon-left, 0px);
          top: var(--pg-float-icon-top, 0px);
          width: var(--pg-float-icon-width, 12px);
          height: var(--pg-float-icon-height, 12px);
          background-color: ${color};
        "
        @mouseenter="${this.handleMouseEnter}"
        @mouseleave="${this.handleMouseLeave}"
        @mousemove="${this.handleMouseMove}"
        title="${label}"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-float-icon": PuduGraphFloatIcon;
  }
}
