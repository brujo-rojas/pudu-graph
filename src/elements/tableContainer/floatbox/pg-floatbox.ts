import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import type { PGConfig, PGRowData, PGItemData } from "@/types";
import DragController from "./DragController";
import ResizeController from "./ResizeController";
import { calculateFloatboxPosition } from "./calculateFloatboxPosition";
import type { PositionResult } from "@/utils/positionCache";

/**
 * Componente floatbox que representa un elemento en el timeline.
 * Soporta drag and drop y resize opcionales basados en configuración.
 * 
 * @example
 * ```html
 * <pg-floatbox 
 *   .itemData=${itemData} 
 *   .rowData=${rowData} 
 *   .rowIndex=${index}
 * ></pg-floatbox>
 * ```
 */
@customElement("pg-floatbox")
export class PuduGraphFloatbox extends connect(store)(LitElement) {
  static styles = css`
    .pg-floatbox {
      position: absolute;
      background-color: var(--pg-floatbox-bg-color, #3498db);
      color: white;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 12px;
      cursor: pointer;
      user-select: none;
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.2s ease;
      z-index: 1;
    }

    .pg-floatbox:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      z-index: 2;
    }

    .pg-floatbox.dragging {
      z-index: 1000;
      transform: rotate(2deg);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .pg-floatbox.resizing {
      z-index: 1000;
    }

    .resize-handle {
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.3);
      cursor: ew-resize;
      border-radius: 0 3px 3px 0;
      transition: background-color 0.2s ease;
    }

    .resize-handle:hover {
      background-color: rgba(255, 255, 255, 0.6);
    }

    .resize-handle-left {
      position: absolute;
      top: 0;
      left: 0;
      width: 8px;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.3);
      cursor: ew-resize;
      border-radius: 3px 0 0 3px;
      transition: background-color 0.2s ease;
    }

    .resize-handle-left:hover {
      background-color: rgba(255, 255, 255, 0.6);
    }

    .resize-handle:focus,
    .resize-handle-left:focus {
      outline: 2px solid #3498db;
      outline-offset: 2px;
    }
  `;

  @property({ type: Object })
  itemData?: PGItemData;

  @property({ type: Object })
  rowData?: PGRowData;

  @property({ type: Number })
  rowIndex: number = 0;

  @property({ type: Number })
  overlapLevel: number = 0;

  @property({ type: Object })
  position?: PositionResult;

  private config?: PGConfig;
  private uiState?: any;
  private dragController?: DragController;
  private resizeController?: ResizeController;
  private lastPositionHash = '';
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
    
    // Reinicializar controladores si es necesario
    if (this.config && this.itemData && this.uiState) {
      this.initializeControllers();
    }
    
    this.requestUpdate();
  }

  /**
   * Inicializa los controladores de drag y resize
   */
  private initializeControllers() {
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
      });
      this.dragController.addDragEvents(this);
      this.dragController.onDrop(this.handleDrop);
    }

    if (interactions?.enableResize === true) {
      this.resizeController = new ResizeController({
        itemData: this.itemData,
        config: this.config,
        zoomValue: this.uiState.zoomValue || 1,
        renderRoot: this.renderRoot,
        rowIndex: this.rowIndex,
        onResize: this.handleResize,
        onResizeEnd: this.handleResizeEnd,
      });
      this.resizeController.addResizeEvents();
    }
  }

  /**
   * Limpia los controladores
   */
  private cleanupControllers() {
    if (this.dragController) {
      this.dragController.removeDragEvents(this);
      this.dragController = undefined;
    }
    if (this.resizeController) {
      this.resizeController.removeResizeEvents();
      this.resizeController = undefined;
    }
  }

  /**
   * Maneja el evento de drop
   */
  private handleDrop = (params: { x: number; y: number; newLeft?: number; date?: Date; width?: number; newStartUnix?: number; newEndUnix?: number }) => {
    if (!this.itemData) {
      return;
    }
    
    // Usar newStartUnix y newEndUnix si están disponibles, sino calcular desde date
    const newStartUnix = params.newStartUnix ?? (params.date ? Math.floor(params.date.getTime() / 1000) : this.itemData.startUnix);
    const newEndUnix = params.newEndUnix ?? this.itemData.endUnix;
    
    
    // Actualizar datos con inicio y fin
    const updatedItem = { 
      ...this.itemData, 
      startUnix: newStartUnix,
      endUnix: newEndUnix
    };
    this.itemData = updatedItem;
    
    
    // Actualizar solo los datos de los controladores
    this.updateControllerData();
    
    // Limpiar cache de posición
    this.clearPositionCache();
    
    // Forzar actualización
    this.requestUpdate();
    
    // Emitir evento de cambio
    this.dispatchEvent(new CustomEvent('item-updated', {
      detail: { item: updatedItem, rowIndex: this.rowIndex },
      bubbles: true
    }));
  };

  /**
   * Maneja el evento de resize
   */
  private handleResize = (params: { newWidth: number; newEndUnix?: number; newStartUnix?: number; newLeft?: number }) => {
    if (!this.itemData) {
      return;
    }
    
    const updatedItem = { 
      ...this.itemData, 
      startUnix: params.newStartUnix || this.itemData.startUnix,
      endUnix: params.newEndUnix || this.itemData.endUnix
    };
    this.itemData = updatedItem;
    
    this.updateControllerData();
    this.clearPositionCache();
    
    if (!this.resizeController?.isActive()) {
      this.requestUpdate();
    }
    
    this.dispatchEvent(new CustomEvent('item-updated', {
      detail: { item: updatedItem, rowIndex: this.rowIndex },
      bubbles: true
    }));
  };

  /**
   * Maneja el evento de fin de resize
   */
  private handleResizeEnd = () => {
    this.clearPositionCache();
    this.requestUpdate();
    
    this.dispatchEvent(new CustomEvent('resize-end', {
      detail: { rowIndex: this.rowIndex },
      bubbles: true
    }));
  };

  /**
   * Maneja el inicio de resize
   */
  private onResizeStart = (event: PointerEvent, side: 'left' | 'right') => {
    event.stopPropagation();
    if (this.resizeController) {
      this.resizeController.startResize(event, this, side);
    }
  };

  /**
   * Maneja resize con teclado
   */
  private handleKeyboardResize = (event: KeyboardEvent, side: 'left' | 'right') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Simular evento de pointer para resize
      const fakeEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        button: 0
      });
      this.onResizeStart(fakeEvent, side);
    }
  };

  /**
   * Actualiza los estilos del elemento
   */
  private updateStyles(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    const styleHash = `${left}-${top}-${width}-${height}`;


    // No actualizar estilos si hay un resize o drag activo
    if (this.resizeController?.isActive() || this.dragController?.isActive()) {
      return;
    }

    // Siempre actualizar estilos para evitar problemas de cache
    this.style.setProperty("--pg-floatbox-left", `${left}px`);
    this.style.setProperty("--pg-floatbox-top", `${top}px`);
    this.style.setProperty("--pg-floatbox-width", `${width}px`);
    this.style.setProperty("--pg-floatbox-height", `${height}px`);
    this.lastStyleHash = styleHash;
  }

  /**
   * Actualiza solo los datos de los controladores existentes
   */
  private updateControllerData(): void {
    
    if (this.dragController && this.itemData) {
      this.dragController.updateItemData(this.itemData);
    }
    
    if (this.resizeController && this.itemData) {
      this.resizeController.updateItemData(this.itemData);
    }
  }

  /**
   * Actualiza estilos desde posición pre-calculada
   */
  private updateStylesFromPosition(position: PositionResult): void {
    const positionHash = `${position.left}-${position.top}-${position.width}-${position.height}`;

    // No actualizar si hay un resize o drag activo
    if (this.resizeController?.isActive() || this.dragController?.isActive()) {
      return;
    }

    // Siempre actualizar para evitar problemas de cache
    this.updateStyles(position.left, position.top, position.width, position.height);
    this.lastPositionHash = positionHash;
  }

  /**
   * Limpia el cache de posición para forzar recálculo
   */
  private clearPositionCache(): void {
    this.lastPositionHash = '';
    this.lastStyleHash = '';
  }

  /**
   * Calcula la posición manualmente (fallback)
   */
  private calculatePosition(): PositionResult {
    
    if (!this.config || !this.itemData || !this.uiState) {
      return { left: 0, top: 0, width: 0, height: 0, level: 0 };
    }

    const itemDataWithOverlap = {
      ...this.itemData,
      overlapLevel: this.overlapLevel
    };
    
    const result = calculateFloatboxPosition({
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

  render() {
    
    if (!this.config || !this.itemData || !this.uiState) {
      return html`<div style="color: red; padding: 5px;">Floatbox: Sin datos</div>`;
    }
    
    
    // Usar posición pre-calculada si está disponible
    if (this.position) {
      this.updateStylesFromPosition(this.position);
    } else {
      // Fallback a cálculo manual
      const position = this.calculatePosition();
      this.updateStylesFromPosition(position);
    }
    
    const interactions = this.itemData?.interactions || this.config?.options?.interactions;
    const showResizeHandles = interactions?.enableResize === true;
    const showLeftHandle = showResizeHandles && (interactions?.enableLeftResize === true);
    const showRightHandle = showResizeHandles && (interactions?.enableRightResize === true);
    
    return html`
      <div 
        class="pg-floatbox"
        style="
          left: var(--pg-floatbox-left, 0px);
          top: var(--pg-floatbox-top, 0px);
          width: var(--pg-floatbox-width, 100px);
          height: var(--pg-floatbox-height, 10px);
          background-color: ${this.itemData.color || '#3498db'};
        "
      >
        ${this.itemData.foo}
        
        ${showLeftHandle ? html`
          <div
            class="resize-handle-left"
            style="left: 0px;"
            role="button"
            tabindex="0"
            aria-label="Redimensionar desde la izquierda"
            title="Arrastra para redimensionar desde la izquierda"
            @pointerdown=${(e: PointerEvent) => this.onResizeStart(e, 'left')}
            @keydown=${(e: KeyboardEvent) => this.handleKeyboardResize(e, 'left')}
          ></div>
        ` : ''}
        
        ${showRightHandle ? html`
          <div
            class="resize-handle"
            style="right: 0px;"
            role="button"
            tabindex="0"
            aria-label="Redimensionar desde la derecha"
            title="Arrastra para redimensionar desde la derecha"
            @pointerdown=${(e: PointerEvent) => this.onResizeStart(e, 'right')}
            @keydown=${(e: KeyboardEvent) => this.handleKeyboardResize(e, 'right')}
          ></div>
        ` : ''}
      </div>
    `;
  }
}