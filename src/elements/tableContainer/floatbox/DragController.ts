import { BaseController, type RenderRoot } from "./shared/BaseController";
import type { 
  DragControllerParams, 
  DropCallbackParams, 
  DropEventParams,
  DragElementParams,
  DragPositionParams,
  PointerUpParams
} from "./shared/types";
import type { PGConfig, PGItemData } from "@/types";
import { LitElement } from "lit";
import leftToUnix from "./leftPositionToUnix";
import { calculateFloatboxPosition } from "./calculateFloatboxPosition";

/**
 * DragController: añade funcionalidad de drag & drop a un componente LitElement.
 * Usa composición, no herencia. Recibe el contexto y datos por parámetro.
 */
export class DragController extends BaseController {
  // Estado interno específico del drag
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private fixedTop = 0;
  private dragStartBoxLeft = 0;
  private isDragging = false;
  private activePointerId: number | null = null;
  private dragElement: HTMLElement | null = null;
  private dragHorizontalOnly: boolean;

  // Callback para notificar drop
  private onDropCallback: ((params: DropCallbackParams) => void) | null = null;

  constructor(params: DragControllerParams) {
    super(params);
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
    this.dragElement = this.createDragElement({
      floatbox,
      color: this.itemData?.color || "red",
    });
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
    // Calcula la nueva posición sin modificar el objeto original
    const oldStart = this.itemData.startUnix || 0;
    const oldEnd = this.itemData.endUnix || 0;
    const newStart = leftToUnix({
      config: this.config,
      left: newLeft,
      zoomValue: this.zoomValue,
    });
    const newEnd = oldEnd + (newStart - oldStart);
    // Recalcula el ancho en base a la nueva posición
    const updatedItemData = { ...this.itemData, startUnix: newStart, endUnix: newEnd };
    const { width } = calculateFloatboxPosition({
      config: this.config,
      itemData: updatedItemData,
      rowIndex: this.rowIndex,
      zoomValue: this.zoomValue,
    });
    this.notifyDrop({ 
      x, 
      y, 
      newLeft, 
      date: new Date(newStart * 1000),
      width,
      newStartUnix: newStart,
      newEndUnix: newEnd
    });
    this.removePointerEvents();
  }

  /** Actualiza la posición del elemento visual de drag. */
  private updateDragElementPosition(params: DragPositionParams) {
    const {
      dragElement,
      x,
      y,
      dragOffsetX,
      dragOffsetY,
      dragHorizontalOnly,
      fixedTop,
    } = params;
    if (!dragElement) return;
    const left = x - dragOffsetX;
    dragElement.style.left = `${left}px`;
    dragElement.style.top = dragHorizontalOnly
      ? `${fixedTop}px`
      : `${y - dragOffsetY}px`;
  }

  /** Obtiene el elemento floatbox del renderRoot. */
  private getFloatBoxChildElement(renderRoot: RenderRoot): HTMLElement | null {
    // Buscar tanto floatbox como float-icon
    return renderRoot.querySelector(".pg-floatbox, .pg-float-icon") as HTMLElement;
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
    const { x, y, newLeft, date, width, newStartUnix, newEndUnix } = params;
    if (!newLeft || !this.itemData || !this.config) return;
    
    // No modificar itemData directamente, solo notificar
    this.onDropCallback?.({ x, y, newLeft, date, width, newStartUnix, newEndUnix });
  }

  /** Permite registrar un callback para el drop. */
  onDrop(callback: (params: DropCallbackParams) => void) {
    if (typeof callback !== "function") {
      console.warn("onDrop debe ser una función");
      return;
    }
    this.onDropCallback = callback;
  }

  /** Verifica si hay un drag activo. */
  isActive(): boolean {
    return this.isDragging;
  }

  /** Limpia el estado y listeners. */
  cleanup(): void {
    this.isDragging = false;
    this.activePointerId = null;
    this.dragElement = null;
    this.onDropCallback = null;
  }
}

