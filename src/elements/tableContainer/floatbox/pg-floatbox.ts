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
   * Inicializa los controladores de drag y resize al conectar el componente.
   */
  connectedCallback() {
    super.connectedCallback();
    // Inicializa controladores solo si hay datos
    if (this.config && this.itemData && this.uiState) {
      this.dragController = new DragController({
        itemData: this.itemData,
        config: this.config,
        zoomValue: this.uiState.zoomValue || 1,
        renderRoot: this.renderRoot,
        rowIndex: this.rowIndex,
        dragHorizontalOnly: this.dragHorizontalOnly,
      });
      this.dragController.addDragEvents(this);
      this.dragController.onDrop(this.handleDrop);

      this.resizeController = new ResizeController();
    }
  }

  /**
   * Limpia los eventos al desconectar el componente.
   */
  disconnectedCallback() {
    this.dragController?.removeDragEvents(this);
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
   * Inicia el resize y actualiza el ancho visual.
   */
  onResizeStart = (e: PointerEvent) => {
    if (!this.resizeController) return;
    this.resizeController.onResizeStart({ e, initialWidth: this.width });
    this.resizeController.onResize((newWidth) => {
      this.style.setProperty("--pg-floatbox-width", `${newWidth}px`);
      this.width = newWidth;
    });
  };

  /**
   * Renderiza el componente floatbox.
   */
  render() {
    if (!this.config || !this.itemData || !this.uiState) return html``;
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
    const color = this.itemData?.color || "red";
    this.updateStyles(left, top, width, height, color);
    return html`
      <div
        class="pg-floatbox"
        style="touch-action: none; position: relative; width: ${width}px; height: ${height}px;"
      >
        ${this.itemData?.foo}
        <div
          class="resize-handle"
          style="position: absolute; right: 0; top: 0; width: 8px; height: 100%; cursor: ew-resize; z-index: 10; background: rgba(255, 0, 0, 0.5);"
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
