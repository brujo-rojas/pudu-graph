import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-floatbox.css?inline";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import type { PGConfig, PGItemData, PGRowData, PGUIState } from "@/types";

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
  private dragStartX = 0;
  private dragStartY = 0;
  private dragElement: HTMLElement | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private activePointerId: number | null = null;
  private fixedTop = 0;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  /**
   * Calcula la posición y tamaño del floatbox en función de los datos y el zoom.
   */
  private calculateFloatboxPosition() {
    if (!this.itemData || !this.rowData || !this.uiState || !this.config) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    const {
      startUnix = 0,
      dayWidth = 30,
      flexBoxHeight = 10,
    } = this.config.options;
    const floatBoxStartUnix = this.itemData.startUnix || 0;
    const floatBoxEndUnix = this.itemData.endUnix || 0;
    const zoom = this.uiState.zoomValue ?? 1;
    if (!startUnix || !floatBoxStartUnix || !floatBoxEndUnix) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    const DAY_SECONDS = 24 * 3600;
    const left =
      ((floatBoxStartUnix - startUnix) / DAY_SECONDS) * dayWidth * zoom;
    const width =
      ((floatBoxEndUnix - floatBoxStartUnix) / DAY_SECONDS) * dayWidth * zoom;
    const height = flexBoxHeight;
    const overlapLevel = this.itemData.overlapLevel || 0;
    const top = (Number(this.rowIndex) * 50 || 0) + overlapLevel * height;
    return { left, top, width, height };
  }

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

  private onStartDrag(e: PointerEvent) {
    let clientX = e.clientX;
    let clientY = e.clientY;

    const floatbox = this.renderRoot.querySelector(
      ".pg-floatbox"
    ) as HTMLElement;
    if (!floatbox) return;
    const rect = floatbox.getBoundingClientRect();
    // Calcula el offset desde el punto de inicio hasta la esquina del floatbox
    this.dragOffsetX = clientX - rect.left;
    this.dragOffsetY = clientY - rect.top;
    // Guarda el top absoluto para arrastre horizontal
    this.fixedTop = rect.top;

    this.isDragging = true;
    this.activePointerId = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
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
    this.dragElement = dragDiv;
    document.body.appendChild(this.dragElement);
    this.updateDragElementPosition(clientX, clientY);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerCancel);
  }

  private parentRect: { left: number; top: number } = { left: 0, top: 0 };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (!this.isDragging || !this.dragElement) return;
    this.updateDragElementPosition(clientX, clientY);
    e.preventDefault();
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (!this.isDragging) return;
    this.isDragging = false;
    this.activePointerId = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (this.dragElement) {
      this.dragElement.remove();
      this.dragElement = null;
    }
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
    // Calcula la posición relativa dentro del floatbox original
    const floatbox = this.renderRoot.querySelector(
      ".pg-floatbox"
    ) as HTMLElement;
    if (floatbox) {
      const rect = floatbox.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      this.onDrop(x, y);
    }
  };

  private onPointerCancel = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    this.isDragging = false;
    this.activePointerId = null;
    if (this.dragElement) {
      this.dragElement.remove();
      this.dragElement = null;
    }
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
  };

  private updateDragElementPosition(x: number, y: number) {
    if (this.dragElement) {
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
  }

  // Esta función se puede reemplazar por un dispatch de evento personalizado
  private onDrop(x: number, y: number) {
    // Por ahora solo loguea, pero aquí puedes mover el elemento original
    console.log("Drop en:", x, y, "item:", this.itemData);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.onStartDrag as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener("pointerdown", this.onStartDrag as EventListener);
    super.disconnectedCallback();
  }

  render() {
    const { left, top, width, height } = this.calculateFloatboxPosition();
    this.width = width;
    this.height = height;
    this.top = top;
    this.left = left;

    const color = this.itemData?.color || "red";
    this.updateStyles(left, top, width, height, color);
    return html`
      <div class="pg-floatbox" style="touch-action: none;">
        ${this.itemData?.foo}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox": PuduGraphFloatbox;
  }
}
