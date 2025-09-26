import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-floatbox.css?inline";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import type { PGConfig, PGItemData, PGRowData, PGUIState } from "@/types";
import { calculateFloatboxPosition } from "./calculateFloatboxPosition";
import DragController from "./DragController";
import ResizeController from "./ResizeController";

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
  static styles = [unsafeCSS(cssStyles)];

  // Estado del componente
  private config: PGConfig | null = null;
  private uiState: PGUIState | null = null;

  // Dimensiones y posición
  private width = 0;
  private height = 0;
  private top = 0;
  private left = 0;
  private isResizing = false; // Flag para evitar re-render durante resize

  // Controladores opcionales
  private dragController?: DragController;
  private resizeController?: ResizeController;

  @property({ type: Object })
  itemData: PGItemData | null = null;

  @property({ type: Object })
  rowData: PGRowData | null = null;

  @property({ type: Number })
  rowIndex: number = 0;

  @property({ type: Number })
  overlapLevel: number = 0;

  /**
   * Si es true, el arrastre solo será horizontal (X). Si es false, será libre (X/Y).
   * @deprecated Use config.options.interactions.dragHorizontalOnly instead
   */
  @property({ type: Boolean })
  dragHorizontalOnly = true;

  constructor() {
    super();
  }

  /**
   * Actualiza el estado global del componente.
   */
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
   * Calcula la posición y tamaño del floatbox en función de los datos y el zoom.
   */

  private updateStyles(
    left: number,
    top: number,
    width: number,
    height: number,
    color: string
  ) {
    this.style.setProperty("--pg-local-bg-color", color);
    this.style.setProperty("--pg-floatbox-width", `${width}px`);
    this.style.setProperty("--pg-floatbox-height", `${height}px`);
    this.style.setProperty("--pg-floatbox-top", `${top}px`);
    this.style.setProperty("--pg-floatbox-left", `${left}px`);
  }

  /**
   * Inicializa los controladores de drag y resize basado en la configuración.
   */
  private initializeControllers() {
    // Limpiar controladores existentes
    this.cleanupControllers();
    
    // Usar interacciones específicas del item si están definidas, sino usar las globales
    const interactions = this.itemData?.interactions || this.config?.options?.interactions;
    
    // Inicializar DragController solo si está habilitado
    if (interactions?.enableDrag === true) {
      this.dragController = new DragController({
        itemData: this.itemData!,
        config: this.config!,
        zoomValue: this.uiState!.zoomValue || 1,
        renderRoot: this.renderRoot,
        rowIndex: this.rowIndex,
        dragHorizontalOnly: interactions?.dragHorizontalOnly ?? this.dragHorizontalOnly,
      });
      this.dragController.addDragEvents(this);
      this.dragController.onDrop(this.handleDrop);
    }

    // Inicializar ResizeController solo si está habilitado
    if (interactions?.enableResize === true) {
      this.resizeController = new ResizeController({
        itemData: this.itemData!,
        config: this.config!,
        zoomValue: this.uiState!.zoomValue || 1,
        renderRoot: this.renderRoot,
        rowIndex: this.rowIndex,
        onResize: this.handleResize,
        onResizeEnd: this.handleResizeEnd,
      });
      this.resizeController.addResizeEvents();
    }
  }

  /**
   * Limpia los controladores existentes.
   */
  private cleanupControllers() {
    if (this.dragController) {
      this.dragController.removeDragEvents(this);
      this.dragController = undefined;
    }
    if (this.resizeController) {
      this.resizeController.removeResizeEvents();
      this.resizeController.cleanup();
      this.resizeController = undefined;
    }
  }

  /**
   * Inicializa los controladores de drag y resize al conectar el componente.
   */
  connectedCallback() {
    super.connectedCallback();
    // Inicializa controladores solo si hay datos
    if (this.config && this.itemData && this.uiState) {
      this.initializeControllers();
    }
  }

  /**
   * Limpia los eventos al desconectar el componente.
   */
  disconnectedCallback() {
    this.cleanupControllers();
    super.disconnectedCallback();
  }

  /**
   * Callback para manejar el drop del dragController.
   */
  private handleDrop = ({
    x,
    y,
    newLeft,
    date,
    width,
  }: {
    x: number;
    y: number;
    newLeft?: number;
    date?: Date;
    width?: number;
  }) => {
    console.log(
      "Drop en:",
      x,
      y,
      "item:",
      this.itemData,
      "left:",
      newLeft,
      "fecha/hora:",
      date?.toISOString()
    );
    if (typeof newLeft === "number" && typeof width === "number") {
      this.style.setProperty("--pg-floatbox-left", `${newLeft}px`);
      this.style.setProperty("--pg-floatbox-width", `${width}px`);
      this.width = width;
      this.left = newLeft;
      this.requestUpdate();
    }
  };

  /**
   * Maneja el resize y actualiza el estado interno.
   */
  private handleResize = ({ newWidth, newEndUnix, newStartUnix, newLeft }: { 
    newWidth: number; 
    newEndUnix?: number; 
    newStartUnix?: number; 
    newLeft?: number; 
  }) => {
    // Marcar que estamos en proceso de resize
    this.isResizing = true;
    
    // Actualizar estado interno
    this.width = newWidth;
    
    // Si es resize desde la izquierda, actualizar también la posición
    if (newLeft !== undefined) {
      this.left = newLeft;
    }
    
    // Los datos y DOM ya fueron actualizados por el ResizeController
    // No hacer requestUpdate durante resize para evitar re-render
  };

  /**
   * Maneja el fin del resize.
   */
  private handleResizeEnd = () => {
    this.isResizing = false;
    // Forzar re-render para sincronizar con los datos actualizados
    this.requestUpdate();
  };

  /**
   * Inicia el resize cuando se hace click en el handle.
   */
  private onResizeStart = (e: PointerEvent, side: 'left' | 'right' = 'right') => {
    if (!this.resizeController) {
      console.warn("ResizeController not initialized");
      return;
    }
    
    // Verificar si ya hay un resize activo
    if (this.resizeController.isActive()) {
      console.warn("Resize already active, ignoring new resize start");
      return;
    }
    
    e.stopPropagation(); // Evitar que se active el drag
    
    const floatbox = this.renderRoot.querySelector(".pg-floatbox") as HTMLElement;
    if (!floatbox) {
      console.warn("Floatbox element not found");
      return;
    }
    
    this.resizeController.startResize(e, floatbox, side);
  };

  /**
   * Maneja el resize con teclado para accesibilidad.
   */
  private handleKeyboardResize = (e: KeyboardEvent, side: 'left' | 'right') => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    e.preventDefault();
    
    if (!this.resizeController) {
      console.warn("ResizeController not initialized");
      return;
    }
    
    // Simular un evento de pointer para resize con teclado
    const floatbox = this.renderRoot.querySelector(".pg-floatbox") as HTMLElement;
    if (!floatbox) {
      console.warn("Floatbox element not found");
      return;
    }
    
    // Crear un evento sintético
    const syntheticEvent = new PointerEvent('pointerdown', {
      clientX: side === 'left' ? 0 : this.width,
      pointerId: 1,
      bubbles: true,
      cancelable: true
    });
    
    this.resizeController.startResize(syntheticEvent, floatbox, side);
  };

  /**
   * Renderiza el componente floatbox.
   */
  render() {
    if (!this.config || !this.itemData || !this.uiState) return html``;
    
    // Solo recalcular posición si no estamos en proceso de resize
    if (!this.isResizing) {
      // Crear un itemData temporal con el overlapLevel del componente
      const itemDataWithOverlap = {
        ...this.itemData,
        overlapLevel: this.overlapLevel
      };
      
      const { left, top, width, height } = calculateFloatboxPosition({
        config: this.config,
        itemData: itemDataWithOverlap,
        rowIndex: this.rowIndex,
        zoomValue: this.uiState.zoomValue || 1,
      });
      this.width = width;
      this.height = height;
      this.top = top;
      this.left = left;
    }
    
    const color = this.itemData?.color || "red";
    this.updateStyles(this.left, this.top, this.width, this.height, color);
    
    // Usar interacciones específicas del item si están definidas, sino usar las globales
    const interactions = this.itemData?.interactions || this.config?.options?.interactions;
    const showResizeHandles = interactions?.enableResize === true;
    const showLeftHandle = showResizeHandles && (interactions?.enableLeftResize === true);
    const showRightHandle = showResizeHandles && (interactions?.enableRightResize === true);
    
    return html`
      <div
        class="pg-floatbox"
        style="touch-action: none; position: relative; width: ${this.width}px; height: ${this.height}px;"
      >
        ${this.itemData?.foo}
        
        ${showLeftHandle ? html`
          <!-- Handle de resize izquierdo -->
          <div
            class="resize-handle-left"
            style="position: absolute; left: 0; top: 0; width: 8px; height: 100%; cursor: ew-resize; z-index: 10; background: rgba(0, 255, 0, 0.5);"
            role="button"
            tabindex="0"
            aria-label="Redimensionar desde la izquierda"
            title="Arrastra para redimensionar desde la izquierda"
            @pointerdown=${(e: PointerEvent) => this.onResizeStart(e, 'left')}
            @keydown=${(e: KeyboardEvent) => this.handleKeyboardResize(e, 'left')}
          ></div>
        ` : ''}
        
        ${showRightHandle ? html`
          <!-- Handle de resize derecho -->
          <div
            class="resize-handle"
            style="position: absolute; left: ${this.width - 8}px; top: 0; width: 8px; height: 100%; cursor: ew-resize; z-index: 10; background: rgba(255, 0, 0, 0.5);"
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

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox": PuduGraphFloatbox;
  }
}
