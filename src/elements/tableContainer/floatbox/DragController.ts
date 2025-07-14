import type { PGConfig, PGItemData } from "@/types";
import leftToUnix from "./leftPositionToUnix";
import { LitElement } from "lit";
import { calculateFloatboxPosition } from "./calculateFloatboxPosition";

// Tipos y interfaces agrupados para claridad
type RenderRoot = typeof LitElement.prototype.renderRoot;

interface DragControllerParams {
  itemData: PGItemData;
  config: PGConfig;
  zoomValue: number;
  renderRoot: RenderRoot;
  rowIndex?: number;
  dragHorizontalOnly?: boolean;
}

interface DragElementParams {
  floatbox: HTMLElement;
  color: string;
}

interface DragPositionParams {
  dragElement: HTMLElement;
  x: number;
  y: number;
  dragOffsetX: number;
  dragOffsetY: number;
  dragHorizontalOnly: boolean;
  fixedTop: number;
}

interface PointerUpParams {
  e: PointerEvent;
  config: PGConfig;
  itemData: PGItemData;
  dragElement: HTMLElement;
  renderRoot: RenderRoot;
  rowIndex: number;
  zoomValue: number;
}

interface DropCallbackParams {
  x: number;
  y: number;
  newLeft?: number;
  date?: Date;
  width?: number;
}

interface DropEventParams {
  x: number;
  y: number;
  newLeft: number;
  zoomValue: number;
  width: number;
}

/**
 * DragController: añade funcionalidad de drag & drop a un componente LitElement.
 * Usa composición, no herencia. Recibe el contexto y datos por parámetro.
 */
class DragController {
  // Estado interno
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private fixedTop = 0;
  private dragStartBoxLeft = 0;
  private isDragging = false;
  private activePointerId: number | null = null;
  private dragElement: HTMLElement | null = null;

  // Configuración y datos
  private itemData: PGItemData;
  private config: PGConfig;
  private zoomValue: number;
  private renderRoot: RenderRoot;
  private rowIndex: number;
  private dragHorizontalOnly: boolean;

  // Callback para notificar drop
  private onDropCallback: ((params: DropCallbackParams) => void) | null = null;

  constructor(params: DragControllerParams) {
    this.itemData = params.itemData;
    this.config = params.config;
    this.zoomValue = params.zoomValue;
    this.renderRoot = params.renderRoot;
    this.rowIndex = params.rowIndex ?? 0;
    this.dragHorizontalOnly = params.dragHorizontalOnly ?? true;
  }

  /** Activa los eventos de drag sobre el componente host. */
  addDragEvents(host: LitElement) {
    host.addEventListener("pointerdown", this.onPointerDown);
  }

  /** Desactiva los eventos de drag sobre el componente host. */
  removeDragEvents(host: LitElement) {
    host.removeEventListener("pointerdown", this.onPointerDown);
  }

  /** Handler para pointerdown: inicia el drag. */
  private onPointerDown = (e: PointerEvent) => {
    const floatbox = this.getFloatBoxChildElement(this.renderRoot);
    if (!floatbox) return;
    this.startDrag(e, floatbox);
  };

  /** Inicia el drag y crea el elemento visual. */
  private startDrag(event: PointerEvent, floatbox: HTMLElement) {
    const rect = floatbox.getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;
    this.fixedTop = rect.top;
    this.dragStartBoxLeft = rect.left;
    this.isDragging = true;
    this.activePointerId = event.pointerId;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.dragElement = this.createDragElement({ floatbox, color: this.itemData?.color || "red" });
    document.body.appendChild(this.dragElement);
    this.updateDragElementPosition({
      dragElement: this.dragElement,
      x: event.clientX,
      y: event.clientY,
      dragOffsetX: this.dragOffsetX,
      dragOffsetY: this.dragOffsetY,
      dragHorizontalOnly: this.dragHorizontalOnly,
      fixedTop: this.fixedTop,
    });
    this.addPointerEvents();
  }

  /** Agrega listeners globales para el drag. */
  private addPointerEvents() {
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerCancel);
  }

  /** Elimina listeners globales para el drag. */
  private removePointerEvents() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
  }

  /** Handler para pointermove: actualiza la posición del drag visual. */
  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    if (!this.isDragging || !this.dragElement) return;
    this.updateDragElementPosition({
      dragElement: this.dragElement,
      x: e.clientX,
      y: e.clientY,
      dragOffsetX: this.dragOffsetX,
      dragOffsetY: this.dragOffsetY,
      dragHorizontalOnly: this.dragHorizontalOnly,
      fixedTop: this.fixedTop,
    });
    e.preventDefault();
  };

  /** Handler para pointerup: termina el drag y actualiza datos. */
  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    if (!this.isDragging || !this.dragElement) return;
    this.isDragging = false;
    this.activePointerId = null;
    this.finishDrag(e);
    this.dragStartBoxLeft = 0;
    this.dragElement.remove();
    this.dragElement = null;
  };

  /** Handler para pointercancel: cancela el drag. */
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

  /** Termina el drag, actualiza modelo y notifica el drop. */
  private finishDrag(e: PointerEvent) {
    const floatbox = this.getFloatBoxChildElement(this.renderRoot);
    if (!floatbox || !this.dragElement) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    const dragRect = this.dragElement.getBoundingClientRect();
    const { left: originalLeft } = calculateFloatboxPosition({
      config: this.config,
      itemData: this.itemData,
      rowIndex: this.rowIndex,
      zoomValue: this.zoomValue,
    });
    const newLeft = originalLeft + (dragRect.left - this.dragStartBoxLeft);
    const rect = floatbox.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Actualiza el modelo de datos para reflejar la nueva posición
    const oldStart = this.itemData.startUnix || 0;
    const oldEnd = this.itemData.endUnix || 0;
    const newStart = leftToUnix({ config: this.config, left: newLeft, zoomValue: this.zoomValue });
    this.itemData.startUnix = newStart;
    this.itemData.endUnix = oldEnd + (newStart - oldStart);
    // Recalcula el ancho en base a la nueva posición
    const { width } = calculateFloatboxPosition({
      config: this.config,
      itemData: this.itemData,
      rowIndex: this.rowIndex,
      zoomValue: this.zoomValue,
    });
    this.notifyDrop({ x, y, newLeft, zoomValue: this.zoomValue, width });
    this.removePointerEvents();
  }

  /** Actualiza la posición del elemento visual de drag. */
  private updateDragElementPosition(params: DragPositionParams) {
    const { dragElement, x, y, dragOffsetX, dragOffsetY, dragHorizontalOnly, fixedTop } = params;
    if (!dragElement) return;
    const left = x - dragOffsetX;
    dragElement.style.left = `${left}px`;
    dragElement.style.top = dragHorizontalOnly ? `${fixedTop}px` : `${y - dragOffsetY}px`;
  }

  /** Obtiene el elemento floatbox del renderRoot. */
  private getFloatBoxChildElement(renderRoot: RenderRoot): HTMLElement | null {
    return renderRoot.querySelector(".pg-floatbox") as HTMLElement;
  }

  /** Crea el elemento visual para el drag. */
  private createDragElement(params: DragElementParams): HTMLElement {
    const { floatbox, color } = params;
    const dragDiv = document.createElement("div");
    const { borderRadius, border } = getComputedStyle(floatbox);
    const { width, height } = floatbox.getBoundingClientRect();
    dragDiv.style.position = "fixed";
    dragDiv.style.pointerEvents = "none";
    dragDiv.style.opacity = "0.7";
    dragDiv.style.zIndex = "9999";
    dragDiv.style.width = `${width}px`;
    dragDiv.style.height = `${height}px`;
    dragDiv.style.background = color;
    dragDiv.style.borderRadius = borderRadius;
    dragDiv.style.border = border;
    dragDiv.style.boxShadow = "0 0 0 2px #333, 0 2px 8px rgba(0,0,0,0.15)";
    return dragDiv;
  }

  /** Notifica el drop al callback externo. */
  private notifyDrop(params: DropEventParams): void {
    const { x, y, newLeft, zoomValue, width } = params;
    if (!newLeft || !this.itemData || !this.config) return;
    const unix = leftToUnix({ config: this.config, left: newLeft, zoomValue });
    const date = new Date(unix * 1000);
    this.itemData.startUnix = unix;
    this.onDropCallback?.({ x, y, newLeft, date, width });
  }

  /** Permite registrar un callback para el drop. */
  onDrop(callback: (params: DropCallbackParams) => void) {
    if (typeof callback !== "function") {
      console.warn("onDrop debe ser una función");
      return;
    }
    this.onDropCallback = callback;
  }
}

export default DragController;
