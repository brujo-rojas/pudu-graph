import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { store } from '@/state/store';
import type { RootState } from '@/state/store';
import type { PGConfig, PGRowData, PGUIState } from '@/types';
import { updateRowItem, updateRowIcon } from '@/state/dataSlice';
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

  private lastDataHash = '';

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    
    // Crear hash de los datos para detectar cambios reales
    const dataHash = JSON.stringify({
      dataLength: this.data.length,
      config: this.config?.options,
      uiState: this.uiState
    });
    
    // Solo actualizar si realmente cambiaron los datos
    if (dataHash !== this.lastDataHash) {
      this.lastDataHash = dataHash;
      this.updateVisibleRange();
      this.requestUpdate();
    }
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
      
      // Buscar por ID único
      const itemIndex = iconData.findIndex(existingItem => existingItem.id === item.id);
      
      if (itemIndex !== -1) {
        // Actualizar el item en el store global
        store.dispatch(updateRowIcon({
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
      
      // Log simplificado solo para verificar datos
      if (rowIndex === 2 && itemIndex === 0) {
        console.log('🎯 Icon Created:', item.label, '|', 
          'Date:', item.startUnix ? new Date(item.startUnix * 1000).toISOString().split('T')[0] : 'N/A');
      }
      
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
