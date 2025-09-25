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

@customElement("pg-floatbox")
export class PuduGraphFloatbox extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private uiState: PGUIState | null = null;

  private width = 0;
  private height = 0;
  private top = 0;
  private left = 0;
  private isResizing = false; // Flag para evitar re-render durante resize

  private dragController!: DragController;
  private resizeController!: ResizeController;

  @property({ type: Object })
  itemData: PGItemData | null = null;

  @property({ type: Object })
  rowData: PGRowData | null = null;

  @property({ type: Number })
  rowIndex: number = 0;

  /**
   * Si es true, el arrastre solo será horizontal (X). Si es false, será libre (X/Y).
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
   * Inicializa los controladores de drag y resize.
   */
  private initializeControllers() {
    // Limpiar controladores existentes
    this.cleanupControllers();
    
    // Inicializar nuevos controladores
    this.dragController = new DragController({
      itemData: this.itemData!,
      config: this.config!,
      zoomValue: this.uiState!.zoomValue || 1,
      renderRoot: this.renderRoot,
      rowIndex: this.rowIndex,
      dragHorizontalOnly: this.dragHorizontalOnly,
    });
    this.dragController.addDragEvents(this);
    this.dragController.onDrop(this.handleDrop);

    this.resizeController = new ResizeController({
      itemData: this.itemData!,
      config: this.config!,
      zoomValue: this.uiState!.zoomValue || 1,
      renderRoot: this.renderRoot,
      rowIndex: this.rowIndex,
    });
    // Agregar eventos de resize
    this.resizeController.addResizeEvents(this);
    // Inicializar callbacks una sola vez
    this.resizeController.onResize(this.handleResize);
    this.resizeController.onResizeEnd(this.handleResizeEnd);
  }

  /**
   * Limpia los controladores existentes.
   */
  private cleanupControllers() {
    if (this.dragController) {
      this.dragController.removeDragEvents(this);
    }
    if (this.resizeController) {
      this.resizeController.removeResizeEvents(this);
      this.resizeController.cleanup();
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
  private handleResize = ({ newWidth, newEndUnix }: { newWidth: number; newEndUnix: number }) => {
    // Marcar que estamos en proceso de resize
    this.isResizing = true;
    
    // Actualizar estado interno
    this.width = newWidth;
    
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
  private onResizeStart = (e: PointerEvent) => {
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
    
    this.resizeController.startResize(e, floatbox);
  };

  /**
   * Renderiza el componente floatbox.
   */
  render() {
    if (!this.config || !this.itemData || !this.uiState) return html``;
    
    // Solo recalcular posición si no estamos en proceso de resize
    if (!this.isResizing) {
      const { left, top, width, height } = calculateFloatboxPosition({
        config: this.config,
        itemData: this.itemData,
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
    return html`
      <div
        class="pg-floatbox"
        style="touch-action: none; position: relative; width: ${this.width}px; height: ${this.height}px;"
      >
        ${this.itemData?.foo}
        <div
          class="resize-handle"
          style="position: absolute; left: ${this.width - 8}px; top: 0; width: 8px; height: 100%; cursor: ew-resize; z-index: 10; background: rgba(255, 0, 0, 0.5);"
          @pointerdown=${this.onResizeStart}
        ></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox": PuduGraphFloatbox;
  }
}
