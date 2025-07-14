import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-floatbox.css?inline";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import type { PGConfig, PGItemData, PGRowData, PGUIState } from "@/types";
import leftToUnix from "./leftPositionToUnix";
import { calculateFloatboxPosition } from "./calculateFloatboxPosition";

@customElement("pg-floatbox")
export class PuduGraphFloatbox extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private uiState: PGUIState | null = null;

  private width = 0;
  private height = 0;
  private top = 0;
  private left = 0;

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

  private isDragging = false;
  private dragElement: HTMLElement | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private activePointerId: number | null = null;
  private fixedTop = 0;

  private isResizing = false;
  private resizeStartX = 0;
  private initialWidth = 0;

  private dragStartBoxLeft = 0; // Almacena la posición inicial del floatbox al iniciar el drag

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

  private getFloatBoxChildElement(): HTMLElement | null {
    if (!this.renderRoot) return null;
    return this.renderRoot.querySelector(".pg-floatbox") as HTMLElement;
  }

  private onStartDrag(e: PointerEvent) {
    let clientX = e.clientX;
    let clientY = e.clientY;

    const floatbox = this.getFloatBoxChildElement();

    if (!floatbox) return;

    const rect = floatbox.getBoundingClientRect();

    this.dragOffsetX = clientX - rect.left;
    this.dragOffsetY = clientY - rect.top;
    this.fixedTop = rect.top;
    this.dragStartBoxLeft = rect.left;

    this.width = rect.width;
    this.height = rect.height;

    this.isDragging = true;
    this.activePointerId = e.pointerId;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    this.dragElement = this.createDragElement(floatbox);

    document.body.appendChild(this.dragElement);

    this.updateDragElementPosition(clientX, clientY);
    this.addPointerEvents(e);
  }

  private addPointerEvents(e: PointerEvent) {
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerCancel);
  }

  private createDragElement(floatbox: HTMLElement): HTMLElement {
    // Crea un div visual para el drag, con mismo tamaño y color
    const dragDiv = document.createElement("div");
    dragDiv.style.position = "fixed";
    dragDiv.style.pointerEvents = "none";
    dragDiv.style.opacity = "0.7";
    dragDiv.style.zIndex = "9999";
    dragDiv.style.width = `${this.width}px`;
    dragDiv.style.height = `${this.height}px`;
    dragDiv.style.background = this.itemData?.color || "red";
    dragDiv.style.borderRadius = getComputedStyle(floatbox).borderRadius;
    dragDiv.style.border = getComputedStyle(floatbox).border;
    // Borde extra para el arrastre
    dragDiv.style.boxShadow = "0 0 0 2px #333, 0 2px 8px rgba(0,0,0,0.15)";

    return dragDiv;
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (!this.isDragging || !this.dragElement) return;
    this.updateDragElementPosition(clientX, clientY);
    e.preventDefault();
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.config || !this.itemData || !this.uiState || !this.dragElement)
      return;
    if (e.pointerId !== this.activePointerId) return;
    if (!this.isDragging) return;

    let clientX = e.clientX;
    let clientY = e.clientY;

    const floatbox = this.getFloatBoxChildElement();
    if (!floatbox) return;

    this.isDragging = false;
    this.activePointerId = null;

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const dragRect = this.dragElement.getBoundingClientRect();
    const { left: originalLeft } = calculateFloatboxPosition({
      config: this.config,
      itemData: this.itemData,
      rowIndex: this.rowIndex,
      zoomValue: this.uiState?.zoomValue || 1,
    });
    const newLeft = originalLeft + (dragRect.left - this.dragStartBoxLeft);

    this.dragElement.remove();
    this.dragElement = null;

    let x = 0,
      y = 0;
    const rect = floatbox.getBoundingClientRect();
    x = clientX - rect.left;
    y = clientY - rect.top;
    // Actualiza el modelo de datos para reflejar la nueva posición
    const oldStart = this.itemData.startUnix || 0;
    const oldEnd = this.itemData.endUnix || 0;
    const newStart = leftToUnix({
      config: this.config,
      left: newLeft,
      zoomValue: this.uiState?.zoomValue || 1,
    });
    this.itemData.startUnix = newStart;
    this.itemData.endUnix = oldEnd + (newStart - oldStart);
    // Recalcula el ancho en base a la nueva posición
    const { width } = calculateFloatboxPosition({
      config: this.config,
      itemData: this.itemData,
      rowIndex: this.rowIndex,
      zoomValue: this.uiState?.zoomValue || 1,
    });

    this.left = newLeft;
    this.style.setProperty("--pg-floatbox-left", `${newLeft}px`);
    this.width = width;
    this.style.setProperty("--pg-floatbox-width", `${width}px`);

    // Llama a onDrop con la nueva posición
    this.onDrop(x, y, newLeft);

    // Limpia la referencia de dragStartBoxLeft
    this.dragStartBoxLeft = 0;
    this.removePointerEvents();
  };

  private onPointerCancel = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    this.isDragging = false;
    this.activePointerId = null;
    if (this.dragElement) {
      this.dragElement.remove();
      this.dragElement = null;
    }
    this.removePointerEvents();
  };

  private removePointerEvents = () => {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
  };

  private updateDragElementPosition(x: number, y: number) {
    if (!this.dragElement) return;
    // Usa el offset para que el cursor quede en la misma posición relativa (coordenadas absolutas)
    const left = x - this.dragOffsetX;
    this.dragElement.style.left = `${left}px`;
    if (this.dragHorizontalOnly) {
      // Mantiene la posición vertical igual que el original (top absoluto respecto al body)
      this.dragElement.style.top = `${this.fixedTop}px`;
    } else {
      const top = y - this.dragOffsetY;
      this.dragElement.style.top = `${top}px`;
    }
  }

  // Esta función se puede reemplazar por un dispatch de evento personalizado
  // TODO mejorar y enviar datos a padre
  private onDrop(x: number, y: number, newLeft?: number) {
    if (!newLeft || !this.itemData || !this.config || !this.uiState) return;

    // Por ahora solo loguea, pero aquí puedes mover el elemento original
    if (typeof newLeft === "number") {
      const unix = leftToUnix({
        config: this.config,
        left: newLeft,
        zoomValue: this.uiState?.zoomValue || 1,
      });
      const date = new Date(unix * 1000);
      // Actualiza el modelo de datos para que el siguiente drag parta de la nueva posición
      if (this.itemData) {
        this.itemData.startUnix = unix;
        this.requestUpdate();
      }
      console.log(
        "Drop en:",
        x,
        y,
        "item:",
        this.itemData,
        "left:",
        newLeft,
        "fecha/hora:",
        date.toISOString()
      );
    } else {
      console.log("Drop en:", x, y, "item:", this.itemData);
    }
  }

  private onResizeStart = (e: PointerEvent) => {
    e.stopPropagation();
    this.isResizing = true;
    this.resizeStartX = e.clientX;
    this.initialWidth = this.width;
    this.activePointerId = e.pointerId;
    this.addResizeEvents(e);
  };

  private addResizeEvents(e: PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", this.onResizeMove);
    window.addEventListener("pointerup", this.onResizeEnd);
    window.addEventListener("pointercancel", this.onResizeEnd);
  }

  private onResizeMove = (e: PointerEvent) => {
    if (!this.isResizing || e.pointerId !== this.activePointerId) return;
    const deltaX = e.clientX - this.resizeStartX;
    const newWidth = Math.max(10, this.initialWidth + deltaX);
    this.width = newWidth;
    if (this.dragElement) {
      this.dragElement.style.width = `${newWidth}px`;
    }
    // Actualiza el ancho visual del floatbox original
    this.style.setProperty("--pg-floatbox-width", `${newWidth}px`);
  };

  private onResizeEnd = (e: PointerEvent) => {
    if (!this.isResizing || e.pointerId !== this.activePointerId) return;
    this.isResizing = false;
    this.activePointerId = null;
    this.removeResizeEvents(e);
    // TODO Aquí podrías actualizar el dato original si lo deseas
  };

  private removeResizeEvents = (e: PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    window.removeEventListener("pointermove", this.onResizeMove);
    window.removeEventListener("pointerup", this.onResizeEnd);
    window.removeEventListener("pointercancel", this.onResizeEnd);
  };

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.onStartDrag as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener("pointerdown", this.onStartDrag as EventListener);
    super.disconnectedCallback();
  }

  render() {
    if (!this.config || !this.itemData || !this.uiState) return html``;

    const { left, top, width, height } = calculateFloatboxPosition({
      config: this.config || {},
      itemData: this.itemData || {},
      rowIndex: this.rowIndex,
      zoomValue: this.uiState?.zoomValue || 1,
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
        style="touch-action: none; position: relative;"
        style=" width: ${width}px; height: ${height}px; "
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
