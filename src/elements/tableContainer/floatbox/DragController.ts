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
import { calculateFloatboxPosition, calculateFloatIconPosition } from "./calculateFloatboxPosition";

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
  private dragStartTableLeft = 0; // Posición inicial del elemento en la tabla
  private isDragging = false;
  private activePointerId: number | null = null;
  private dragElement: HTMLElement | null = null;
  private dragHorizontalOnly: boolean;
  private animationFrameId: number | null = null;
  
  // Estado para detectar si es un click o drag
  private dragStartX = 0;
  private dragStartY = 0;
  private hasMoved = false;
  private dragThreshold = 5; // píxeles de movimiento para considerar drag

  // Callback para notificar drop
  private onDropCallback: ((params: DropCallbackParams) => void) | null = null;

  /**
   * Determina si el elemento es un icono (sin endUnix) o un floatbox (con endUnix)
   */
  private isIcon(): boolean {
    return !this.itemData?.endUnix;
  }

  /**
   * Calcula la posición del elemento usando la función correcta según su tipo
   */
  private calculateElementPosition(): { left: number; top: number; width: number; height: number } {
    if (this.isIcon()) {
      return calculateFloatIconPosition({
        config: this.config,
        itemData: this.itemData,
        rowIndex: this.rowIndex,
        zoomValue: this.zoomValue,
      });
    } else {
      return calculateFloatboxPosition({
        config: this.config,
        itemData: this.itemData,
        rowIndex: this.rowIndex,
        zoomValue: this.zoomValue,
      });
    }
  }

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

  /** Handler para pointerdown: prepara para drag o click. */
  private onPointerDown = (e: PointerEvent) => {
    const floatbox = this.getFloatBoxChildElement(this.renderRoot);
    if (!floatbox) return;
    
    // Guardar posición inicial para detectar movimiento
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.hasMoved = false;
    this.activePointerId = e.pointerId;
    
    // Preparar para drag pero no iniciar aún
    this.prepareDrag(e, floatbox);
  };

  /** Prepara el drag pero no lo inicia hasta detectar movimiento. */
  private prepareDrag(event: PointerEvent, floatbox: HTMLElement) {
    const rect = floatbox.getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;
    this.fixedTop = rect.top;
    this.dragStartBoxLeft = rect.left;
    
    // Guardar la posición inicial del elemento en la tabla
    const { left: originalLeft } = this.calculateElementPosition();
    this.dragStartTableLeft = originalLeft;
    
    // Agregar listeners para detectar movimiento
    this.addPointerEvents();
  }

  /** Inicia el drag y crea el elemento visual. */
  private startDrag(event: PointerEvent, floatbox: HTMLElement) {
    this.isDragging = true;

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
  }

  /** Agrega listeners globales para el drag. */
  private addPointerEvents() {
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerup", this.onPointerUp, { passive: true });
    window.addEventListener("pointercancel", this.onPointerCancel, { passive: true });
  }

  /** Elimina listeners globales para el drag. */
  private removePointerEvents() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
  }

  /** Handler para pointermove: detecta movimiento y actualiza la posición del drag visual. */
  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    
    // Detectar si ha habido movimiento suficiente para iniciar drag
    if (!this.hasMoved) {
      const deltaX = Math.abs(e.clientX - this.dragStartX);
      const deltaY = Math.abs(e.clientY - this.dragStartY);
      
      if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
        this.hasMoved = true;
        // Iniciar drag
        const floatbox = this.getFloatBoxChildElement(this.renderRoot);
        if (floatbox) {
          this.startDrag(e, floatbox);
        }
      }
    }
    
    if (!this.isDragging || !this.dragElement) return;
    
    // Usar requestAnimationFrame para optimizar el rendimiento
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateDragElementPosition({
        dragElement: this.dragElement!,
        x: e.clientX,
        y: e.clientY,
        dragOffsetX: this.dragOffsetX,
        dragOffsetY: this.dragOffsetY,
        dragHorizontalOnly: this.dragHorizontalOnly,
        fixedTop: this.fixedTop,
      });
    });
    e.preventDefault();
  };

  /** Handler para pointerup: termina el drag y actualiza datos. */
  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    
    // Si no hubo movimiento, no hacer nada (permitir que el click se procese)
    if (!this.hasMoved) {
      this.cleanup();
      return;
    }
    
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
    
    // Si no hubo movimiento, solo limpiar
    if (!this.hasMoved) {
      this.cleanup();
      return;
    }
    
    // Limpiar animation frame pendiente
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
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
    
    // Limpiar animation frame pendiente
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Calcular el delta en píxeles de pantalla
    const dragRect = this.dragElement.getBoundingClientRect();
    const deltaPixels = dragRect.left - this.dragStartBoxLeft;
    
    // Convertir el delta de píxeles de pantalla a píxeles de tabla
    // Esto es necesario porque el zoom y la posición de la tabla pueden afectar la conversión
    const { dayWidth = 30 } = this.config.options;
    const deltaTablePixels = deltaPixels / this.zoomValue;
    
    // Calcular la nueva posición en la tabla usando la posición inicial guardada
    const newLeft = this.dragStartTableLeft + deltaTablePixels;
    
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
    const { width } = this.calculateElementPosition();
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
    // Buscar el elemento específico según el tipo de componente
    const floatbox = renderRoot.querySelector(".pg-floatbox") as HTMLElement;
    const floatIcon = renderRoot.querySelector(".pg-float-icon") as HTMLElement;
    return floatbox || floatIcon;
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

  /** Actualiza los datos del item. */
  updateItemData(newItemData: PGItemData): void {
    this.itemData = newItemData;
  }

  /** Limpia el estado y listeners. */
  public cleanup(): void {
    this.isDragging = false;
    this.activePointerId = null;
    this.hasMoved = false;
    this.dragElement = null;
    this.onDropCallback = null;
    this.removePointerEvents();
  }
}

