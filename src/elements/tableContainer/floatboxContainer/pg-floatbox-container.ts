import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import { updateRowItem } from "@state/dataSlice";
import type { PGConfig, PGRowData, PGItemData } from "@/types";
import { PuduGraphFloatbox } from "../floatbox/pg-floatbox";

// Verificar que el store se importa correctamente

@customElement("pg-floatbox-container")
export class PuduGraphFloatboxContainer extends connect(store)(LitElement) {
  constructor() {
    super();
  }
  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
  `;

  @property({ type: Object })
  config?: PGConfig;

  @property({ type: Array })
  data: PGRowData[] = [];

  @property({ type: Object })
  uiState?: any;

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
    
    if (this.data && this.data[rowIndex] && this.data[rowIndex].rowData) {
      // Encontrar el item en los datos y actualizarlo
      const rowData = this.data[rowIndex].rowData;
      
      // Buscar por múltiples criterios para encontrar el item original
      const itemIndex = rowData.findIndex(existingItem => {
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
        this.data[rowIndex].rowData[itemIndex] = { ...item };
        
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
    if (!row.rowData?.length) {
      return html``;
    }
    
    // Calcular niveles de solapamiento basados en la altura disponible
    const itemHeight = this.config?.options.itemHeight || 60;
    const floatboxHeight = this.config?.options.floatboxHeight || 20;
    const maxLevels = Math.floor(itemHeight / floatboxHeight); // 60 / 16 = 3.75 → 3 niveles
    
    // Log simplificado solo para verificar datos
    if (rowIndex === 0) {
      console.log('🎯 FloatboxContainer: renderRow', row.label, '|', 
        'rowData:', row.rowData?.length || 0);
    }
    
    return row.rowData.map((item, itemIndex) => {
      // Usar el índice del item módulo el número máximo de niveles disponibles
      const overlapLevel = itemIndex % maxLevels;
      
      // Log simplificado solo para verificar datos
      if (rowIndex === 0 && itemIndex === 0) {
        console.log('🎯 Floatbox Created:', item.label, '|', 
          'Date:', new Date(item.startUnix * 1000).toISOString().split('T')[0]);
      }
      
      return html`
        <pg-floatbox
          .itemData="${item}"
          .rowData="${row}"
          .rowIndex=${rowIndex}
          .overlapLevel=${overlapLevel}
        ></pg-floatbox>
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

