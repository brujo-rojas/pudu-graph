import type { PGConfig, PGItemData } from "@/types";
import { LitElement } from "lit";
import { calculateFloatboxPosition } from "./calculateFloatboxPosition";

// Tipos y interfaces agrupados para claridad
type RenderRoot = typeof LitElement.prototype.renderRoot;

interface ResizeControllerParams {
  itemData: PGItemData;
  config: PGConfig;
  zoomValue: number;
  renderRoot: RenderRoot;
  rowIndex?: number;
}

interface ResizeStartParams {
  e: PointerEvent;
  initialWidth: number;
}

interface ResizeCallbackParams {
  newWidth: number;
  newEndUnix: number;
}

/**
 * ResizeController: añade funcionalidad de redimensionar a un elemento.
 * Usa composición, no herencia. Recibe el contexto y datos por parámetro.
 */
class ResizeController {
  // Estado interno
  private isResizing = false;
  private resizeStartX = 0;
  private initialWidth = 0;
  private activePointerId: number | null = null;

  // Configuración y datos
  private itemData: PGItemData;
  private config: PGConfig;
  private zoomValue: number;
  private renderRoot: RenderRoot;
  private rowIndex: number;

  // Callbacks para notificar resize
  private onResizeCallback: ((params: ResizeCallbackParams) => void) | null = null;
  private onResizeEndCallback: (() => void) | null = null;

  constructor(params: ResizeControllerParams) {
    this.itemData = params.itemData;
    this.config = params.config;
    this.zoomValue = params.zoomValue;
    this.renderRoot = params.renderRoot;
    this.rowIndex = params.rowIndex ?? 0;
  }

  /** Activa los eventos de resize sobre el componente host. */
  addResizeEvents(host: LitElement) {
    // Ya no es necesario agregar eventos aquí, se manejan directamente en el handle
  }

  /** Desactiva los eventos de resize sobre el componente host. */
  removeResizeEvents(host: LitElement) {
    // Ya no es necesario remover eventos aquí
  }

  /** Inicia el resize y agrega listeners globales. */
  public startResize(event: PointerEvent, floatbox: HTMLElement) {
    if (!event || !floatbox) {
      console.warn("Invalid parameters for startResize");
      return;
    }

    event.stopPropagation();
    this.isResizing = true;
    this.resizeStartX = event.clientX;
    this.initialWidth = floatbox.getBoundingClientRect().width;
    this.activePointerId = event.pointerId;
    
    try {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
      this.addPointerEvents();
    } catch (error) {
      console.warn("Failed to start resize:", error);
      this.isResizing = false;
      this.activePointerId = null;
    }
  }

  /** Agrega listeners globales para el resize. */
  private addPointerEvents() {
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerCancel);
  }

  /** Elimina listeners globales para el resize. */
  private removePointerEvents() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
  }

  /** Handler para pointermove: calcula y notifica el nuevo ancho. */
  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    if (!this.isResizing) return;
    
    const deltaX = e.clientX - this.resizeStartX;
    const rawWidth = this.initialWidth + deltaX;
    const newWidth = this.calculateConstrainedWidth(rawWidth);
    
    // Calcular nueva fecha de fin
    const newEndUnix = this.calculateNewEndUnix(newWidth);
    
    // Actualizar DOM directamente
    this.updateDOM(newWidth);
    
    // Notificar el cambio
    this.notifyResize({ newWidth, newEndUnix });
    
    e.preventDefault();
  };

  /** Handler para pointerup: termina el resize y actualiza datos. */
  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    if (!this.isResizing) return;
    
    this.isResizing = false;
    this.activePointerId = null;
    this.finishResize(e);
  };

  /** Handler para pointercancel: cancela el resize. */
  private onPointerCancel = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    this.isResizing = false;
    this.activePointerId = null;
    this.removePointerEvents();
  };

  /** Termina el resize, actualiza modelo y notifica el cambio. */
  private finishResize(e: PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const deltaX = e.clientX - this.resizeStartX;
    const rawWidth = this.initialWidth + deltaX;
    const newWidth = this.calculateConstrainedWidth(rawWidth);
    const newEndUnix = this.calculateNewEndUnix(newWidth);
    
    // Actualizar el modelo de datos
    this.itemData.endUnix = newEndUnix;
    
    // Notificar el cambio final
    this.notifyResize({ newWidth, newEndUnix });
    
    // Notificar que terminó el resize
    this.onResizeEndCallback?.();
    
    this.removePointerEvents();
  }

  /** Calcula la nueva fecha de fin basada en el nuevo ancho. */
  private calculateNewEndUnix(newWidth: number): number {
    if (!this.config?.options || !this.itemData?.startUnix) {
      console.warn("Invalid config or itemData for calculateNewEndUnix");
      return this.itemData?.startUnix || 0;
    }

    const { dayWidth = 30 } = this.config.options;
    const durationSeconds = (newWidth / (dayWidth * this.zoomValue)) * 86400; // 86400 = segundos por día
    return this.itemData.startUnix + durationSeconds;
  }

  /** Calcula el ancho máximo permitido basado en el timeline. */
  private calculateMaxWidth(): number {
    if (!this.config?.options || !this.itemData?.startUnix) {
      console.warn("Invalid config or itemData for calculateMaxWidth");
      return 1000; // Fallback width
    }

    const { endUnix = 0, dayWidth = 30 } = this.config.options;
    const maxDurationSeconds = endUnix - this.itemData.startUnix;
    
    if (maxDurationSeconds <= 0) {
      console.warn("Invalid duration for calculateMaxWidth");
      return 1000; // Fallback width
    }
    
    return (maxDurationSeconds / 86400) * dayWidth * this.zoomValue;
  }

  /** Aplica límites mínimo y máximo al ancho. */
  private calculateConstrainedWidth(rawWidth: number): number {
    if (typeof rawWidth !== 'number' || isNaN(rawWidth)) {
      console.warn("Invalid rawWidth for calculateConstrainedWidth");
      return 10; // Minimum width
    }

    const minWidth = 10;
    const maxWidth = this.calculateMaxWidth();
    return Math.max(minWidth, Math.min(maxWidth, rawWidth));
  }

  /** Obtiene el elemento floatbox del renderRoot. */
  private getFloatBoxChildElement(renderRoot: RenderRoot): HTMLElement | null {
    return renderRoot.querySelector(".pg-floatbox") as HTMLElement;
  }

  /** Obtiene el handle de resize del renderRoot. */
  private getResizeHandleElement(renderRoot: RenderRoot): HTMLElement | null {
    return renderRoot.querySelector(".resize-handle") as HTMLElement;
  }

  /** Actualiza el DOM durante el resize. */
  private updateDOM(newWidth: number) {
    if (typeof newWidth !== 'number' || isNaN(newWidth) || newWidth < 0) {
      console.warn("Invalid newWidth for updateDOM:", newWidth);
      return;
    }

    const host = (this.renderRoot as any).host as HTMLElement;
    const resizeHandle = this.getResizeHandleElement(this.renderRoot);
    
    try {
      // Actualizar CSS custom properties del host
      if (host) {
        host.style.setProperty("--pg-floatbox-width", `${newWidth}px`);
      }
      
      // Actualizar posición del handle directamente
      if (resizeHandle) {
        resizeHandle.style.left = `${newWidth - 8}px`;
      }
    } catch (error) {
      console.warn("Failed to update DOM during resize:", error);
    }
  }

  /** Notifica el resize al callback externo. */
  private notifyResize(params: ResizeCallbackParams): void {
    this.onResizeCallback?.(params);
  }

  /** Permite registrar un callback para el resize. */
  onResize(callback: (params: ResizeCallbackParams) => void) {
    if (typeof callback !== "function") {
      console.warn("onResize debe ser una función");
      return;
    }
    this.onResizeCallback = callback;
  }

  /** Permite registrar un callback para cuando termine el resize. */
  onResizeEnd(callback: () => void) {
    if (typeof callback !== "function") {
      console.warn("onResizeEnd debe ser una función");
      return;
    }
    this.onResizeEndCallback = callback;
  }

  /** Limpia el estado del resize y remueve eventos. */
  public cleanup() {
    this.isResizing = false;
    this.activePointerId = null;
    this.removePointerEvents();
    this.onResizeCallback = null;
    this.onResizeEndCallback = null;
  }

  /** Verifica si el resize está activo. */
  public isActive(): boolean {
    return this.isResizing;
  }
}

export default ResizeController;
