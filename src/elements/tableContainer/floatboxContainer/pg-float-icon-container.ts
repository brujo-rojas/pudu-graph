import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { store } from '@/state/store';
import type { RootState } from '@/state/store';
import type { PGConfig, PGRowData, PGUIState } from '@/types';
import { updateRowItem } from '@/state/dataSlice';
import '../floatbox/pg-float-icon';

@customElement("pg-float-icon-container")
export class PuduGraphFloatIconContainer extends connect(store)(LitElement) {
  @property({ type: Object }) config?: PGConfig;
  @property({ type: Array }) data: PGRowData[] = [];
  @property({ type: Object }) uiState?: PGUIState;

  private visibleRange = { start: 0, end: 0 };
  private containerElement?: HTMLElement;

  connectedCallback() {
    super.connectedCallback();
    this.containerElement = this;
    this.setupEventListeners();
    
    // Forzar actualización del rango visible después de que el elemento esté en el DOM
    setTimeout(() => {
      this.updateVisibleRange();
      this.requestUpdate();
    }, 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
  }

  stateChanged(state: RootState): void {
    console.log('🎯 Icon Container: stateChanged llamado', {
      hasConfig: !!state.config,
      hasData: !!state.data,
      dataLength: state.data?.length || 0,
      hasUIState: !!state.uiState,
      state: state
    });
    
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    
    this.updateVisibleRange();
    this.requestUpdate();
  }

  private setupEventListeners(): void {
    if (this.containerElement) {
      this.containerElement.addEventListener('scroll', this.handleScroll.bind(this));
      this.containerElement.addEventListener('item-updated', this.handleItemUpdated.bind(this));
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  private cleanupEventListeners(): void {
    if (this.containerElement) {
      this.containerElement.removeEventListener('scroll', this.handleScroll.bind(this));
      this.containerElement.removeEventListener('item-updated', this.handleItemUpdated.bind(this));
      window.removeEventListener('resize', this.handleResize.bind(this));
    }
  }

  private handleScroll(): void {
    this.updateVisibleRange();
    this.requestUpdate();
  }

  private handleResize(): void {
    this.updateVisibleRange();
    this.requestUpdate();
  }

  public handleItemUpdated(event: Event): void {
    const customEvent = event as CustomEvent;
    const { item, rowIndex } = customEvent.detail;
    
    if (this.data && this.data[rowIndex] && this.data[rowIndex].iconData) {
      // Encontrar el item en los datos y actualizarlo
      const iconData = this.data[rowIndex].iconData!;
      
      // Buscar por múltiples criterios para encontrar el item original
      const itemIndex = iconData.findIndex(existingItem => {
        // Si tienen el mismo label (identificador único)
        if (existingItem.label === item.label) return true;
        
        // Si tienen el mismo color y startUnix similar (para items sin label)
        if (existingItem.color === item.color && 
            Math.abs((existingItem.startUnix || 0) - (item.startUnix || 0)) < 3600) { // 1 hora de diferencia
          return true;
        }
        
        return false;
      });
      
      if (itemIndex !== -1) {
        // Actualizar el item en el store global
        store.dispatch(updateRowItem({
          rowIndex,
          itemIndex,
          itemData: { ...item }
        }));
        
        // También actualizar localmente para consistencia inmediata
        this.data[rowIndex].iconData![itemIndex] = { ...item };
        
        // Forzar re-render
        this.requestUpdate();
      }
    }
  }

  private updateVisibleRange(): void {
    // Simplificar temporalmente - renderizar todas las filas
    this.visibleRange = { start: 0, end: this.data.length };
  }

  private renderRow(row: PGRowData, rowIndex: number) {
    console.log(`🎯 Icon Container: renderRow llamado para fila ${rowIndex}`, {
      hasIconData: !!row.iconData,
      iconDataLength: row.iconData?.length || 0,
      iconData: row.iconData,
      hasConfig: !!this.config,
      hasUIState: !!this.uiState
    });
    
    if (!row.iconData?.length) {
      return html``;
    }
    
    // Calcular niveles de solapamiento basados en la altura disponible
    const itemHeight = this.config?.options.itemHeight || 60;
    const floatboxHeight = this.config?.options.floatboxHeight || 20;
    const maxLevels = Math.floor(itemHeight / floatboxHeight);
    
    return row.iconData.map((item, itemIndex) => {
      // Usar el índice del item módulo el número máximo de niveles disponibles
      const overlapLevel = itemIndex % maxLevels;
      
      console.log(`🎯 Icon Container: Renderizando icono ${itemIndex}`, {
        item,
        overlapLevel,
        rowIndex,
        config: this.config,
        uiState: this.uiState
      });
      
      return html`
        <pg-float-icon
          .itemData="${item}"
          .rowData="${row}"
          .rowIndex=${rowIndex}
          .overlapLevel=${overlapLevel}
        ></pg-float-icon>
      `;
    });
  }

  render() {
    if (!this.config || !this.data.length) {
      return html``;
    }
    
    return html`
      <slot></slot>
      ${this.data.map((row, index) => {
        return this.renderRow(row, index);
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-float-icon-container": PuduGraphFloatIconContainer;
  }
}
