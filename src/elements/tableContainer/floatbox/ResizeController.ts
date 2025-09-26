import type { PGConfig, PGItemData } from "@/types";
import { LitElement } from "lit";

// Tipos y interfaces
type RenderRoot = typeof LitElement.prototype.renderRoot;

interface ResizeControllerParams {
  itemData: PGItemData;
  config: PGConfig;
  zoomValue: number;
  renderRoot: RenderRoot;
  rowIndex?: number;
  resizeSide?: 'left' | 'right';
  onResize?: (params: ResizeCallbackParams) => void;
  onResizeEnd?: () => void;
}

interface ResizeCallbackParams {
  newWidth: number;
  newEndUnix?: number;
  newStartUnix?: number;
  newLeft?: number;
}

/**
 * ResizeController: Maneja el redimensionamiento de elementos floatbox.
 * Soporta resize desde ambos lados (izquierdo y derecho) con validaciones de límites.
 */
class ResizeController {
  // Estado interno
  private isResizing = false;
  private resizeStartX = 0;
  private initialWidth = 0;
  private initialLeft = 0;
  private activePointerId: number | null = null;
  private resizeSide: 'left' | 'right' = 'right';

  // Configuración y datos
  private readonly itemData: PGItemData;
  private readonly config: PGConfig;
  private readonly zoomValue: number;
  private readonly renderRoot: RenderRoot;
  private readonly rowIndex: number;

  // Callbacks
  private onResizeCallback: ((params: ResizeCallbackParams) => void) | null = null;
  private onResizeEndCallback: (() => void) | null = null;

  // Constantes
  private static readonly MIN_WIDTH = 10;
  private static readonly SECONDS_PER_DAY = 86400;
  
  // TODO: Performance Optimization - Cache para cálculos frecuentes
  // private static readonly CACHE_SIZE_LIMIT = 100;
  // private static calculationCache = new Map<string, number>();

  constructor(params: ResizeControllerParams) {
    this.itemData = params.itemData;
    this.config = params.config;
    this.zoomValue = params.zoomValue;
    this.renderRoot = params.renderRoot;
    this.rowIndex = params.rowIndex ?? 0;
    this.resizeSide = params.resizeSide ?? 'right';
    
    // Configurar callbacks si se proporcionan
    if (params.onResize) {
      this.onResizeCallback = params.onResize;
    }
    if (params.onResizeEnd) {
      this.onResizeEndCallback = params.onResizeEnd;
    }
  }

  /** Inicia el resize y agrega listeners globales. */
  public startResize(event: PointerEvent, floatbox: HTMLElement, side?: 'left' | 'right'): void {
    if (!this.validateStartResizeParams(event, floatbox)) {
      return;
    }

    this.resizeSide = side ?? this.resizeSide;
    event.stopPropagation();
    
    this.initializeResizeState(event, floatbox);
    this.capturePointer(event);
    this.addPointerEvents();
  }

  /** Configura callbacks para notificar cambios. */
  public onResize(callback: (params: ResizeCallbackParams) => void): void {
    this.onResizeCallback = callback;
  }

  public onResizeEnd(callback: () => void): void {
    this.onResizeEndCallback = callback;
  }

  /** Verifica si hay un resize activo. */
  public isActive(): boolean {
    return this.isResizing;
  }

  /** Limpia el estado y callbacks. */
  public cleanup(): void {
    this.isResizing = false;
    this.activePointerId = null;
    this.removePointerEvents();
    this.onResizeCallback = null;
    this.onResizeEndCallback = null;
  }

  // TODO: Performance Optimization - Métodos de cache
  // /** Limpia el cache de cálculos (método estático) */
  // public static clearCache(): void {
  //   ResizeController.calculationCache.clear();
  // }
  //
  // /** Obtiene un valor del cache o lo calcula y lo cachea */
  // private getCachedCalculation(key: string, calculationFn: () => number): number {
  //   if (ResizeController.calculationCache.has(key)) {
  //     return ResizeController.calculationCache.get(key)!;
  //   }
  //
  //   const result = calculationFn();
  //   
  //   // Limitar el tamaño del cache
  //   if (ResizeController.calculationCache.size > ResizeController.CACHE_SIZE_LIMIT) {
  //     const firstKey = ResizeController.calculationCache.keys().next().value;
  //     ResizeController.calculationCache.delete(firstKey);
  //   }
  //   
  //   ResizeController.calculationCache.set(key, result);
  //   return result;
  // }

  // Métodos de eventos (compatibilidad con interfaz existente)
  public addResizeEvents(): void {
    // Los eventos se manejan directamente en los handles
  }

  public removeResizeEvents(): void {
    // Los eventos se manejan directamente en los handles
  }

  // Handlers de eventos
  private onPointerMove = (e: PointerEvent): void => {
    if (!this.shouldProcessEvent(e)) return;
    
    const deltaX = e.clientX - this.resizeStartX;
    
    if (this.resizeSide === 'left') {
      this.handleLeftResize(deltaX);
    } else {
      this.handleRightResize(deltaX);
    }
    
    e.preventDefault();
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.shouldProcessEvent(e)) return;
    this.finishResize(e);
  };

  private onPointerCancel = (e: PointerEvent): void => {
    if (!this.shouldProcessEvent(e)) return;
    this.cancelResize();
  };

  // Lógica de resize
  private handleLeftResize(deltaX: number): void {
    const rawLeft = this.initialLeft + deltaX;
    const rawWidth = this.initialWidth - deltaX;
    
    const newLeft = this.calculateConstrainedLeft(rawLeft);
    const newWidth = this.calculateConstrainedWidth(rawWidth);
    const newStartUnix = this.calculateNewStartUnix(newLeft);
    
    this.updateDOMLeft(newLeft, newWidth);
    this.notifyResize({ newWidth, newStartUnix, newLeft });
  }

  private handleRightResize(deltaX: number): void {
    const rawWidth = this.initialWidth + deltaX;
    const newWidth = this.calculateConstrainedWidth(rawWidth);
    const newEndUnix = this.calculateNewEndUnix(newWidth);
    
    this.updateDOM(newWidth);
    this.notifyResize({ newWidth, newEndUnix });
  }

  // Cálculos de posición y tamaño
  private calculateNewEndUnix(newWidth: number): number {
    if (!this.config?.options || !this.itemData?.startUnix) {
      return this.itemData?.startUnix || 0;
    }

    const { dayWidth = 30 } = this.config.options;
    const durationSeconds = (newWidth / (dayWidth * this.zoomValue)) * ResizeController.SECONDS_PER_DAY;
    return this.itemData.startUnix + durationSeconds;
  }

  private calculateNewStartUnix(newLeft: number): number {
    if (!this.config?.options) {
      return this.itemData?.startUnix || 0;
    }

    const { startUnix = 0, dayWidth = 30 } = this.config.options;
    const leftOffsetSeconds = (newLeft / (dayWidth * this.zoomValue)) * ResizeController.SECONDS_PER_DAY;
    return startUnix + leftOffsetSeconds;
  }

  private calculateMaxWidth(): number {
    if (!this.config?.options || !this.itemData?.startUnix) {
      return 1000; // Fallback width
    }

    const { endUnix = 0, dayWidth = 30 } = this.config.options;
    const maxDurationSeconds = endUnix - this.itemData.startUnix;
    
    if (maxDurationSeconds <= 0) {
      return 1000; // Fallback width
    }
    
    return (maxDurationSeconds / ResizeController.SECONDS_PER_DAY) * dayWidth * this.zoomValue;
  }

  private calculateConstrainedWidth(rawWidth: number): number {
    if (typeof rawWidth !== 'number' || isNaN(rawWidth)) {
      return ResizeController.MIN_WIDTH;
    }

    const maxWidth = this.calculateMaxWidth();
    return Math.max(ResizeController.MIN_WIDTH, Math.min(maxWidth, rawWidth));
  }

  private calculateMinLeft(): number {
    return 0; // No puede ir más allá del inicio del timeline
  }

  private calculateMaxLeft(): number {
    if (!this.config?.options || !this.itemData?.endUnix) {
      return this.initialLeft;
    }

    const { startUnix = 0, dayWidth = 30 } = this.config.options;
    const maxDurationSeconds = this.itemData.endUnix - startUnix;
    const maxLeft = (maxDurationSeconds / ResizeController.SECONDS_PER_DAY) * (dayWidth * this.zoomValue) - ResizeController.MIN_WIDTH;
    
    return Math.max(0, maxLeft);
  }

  private calculateConstrainedLeft(rawLeft: number): number {
    if (typeof rawLeft !== 'number' || isNaN(rawLeft)) {
      return this.initialLeft;
    }

    const minLeft = this.calculateMinLeft();
    const maxLeft = this.calculateMaxLeft();
    return Math.max(minLeft, Math.min(maxLeft, rawLeft));
  }

  // Actualización del DOM
  private updateDOM(newWidth: number): void {
    if (typeof newWidth !== 'number' || isNaN(newWidth) || newWidth < 0) {
      return;
    }

    const host = this.getHostElement();
    const resizeHandle = this.getResizeHandleElement();
    
    if (host) {
      host.style.setProperty("--pg-floatbox-width", `${newWidth}px`);
    }
    
    if (resizeHandle) {
      resizeHandle.style.left = `${newWidth - 8}px`;
    }
  }

  private updateDOMLeft(newLeft: number, newWidth: number): void {
    if (typeof newLeft !== 'number' || isNaN(newLeft) || typeof newWidth !== 'number' || isNaN(newWidth) || newWidth < 0) {
      return;
    }

    const host = this.getHostElement();
    const leftHandle = this.getLeftResizeHandleElement();
    
    if (host) {
      host.style.setProperty("--pg-floatbox-left", `${newLeft}px`);
      host.style.setProperty("--pg-floatbox-width", `${newWidth}px`);
    }
    
    if (leftHandle) {
      leftHandle.style.left = `0px`;
    }
  }

  // Utilidades
  private validateStartResizeParams(event: PointerEvent, floatbox: HTMLElement): boolean {
    if (!event) {
      console.warn("ResizeController: Invalid event parameter");
      return false;
    }
    
    if (!floatbox) {
      console.warn("ResizeController: Invalid floatbox parameter");
      return false;
    }
    
    if (!this.itemData) {
      console.warn("ResizeController: ItemData not available");
      return false;
    }
    
    if (!this.config?.options) {
      console.warn("ResizeController: Config options not available");
      return false;
    }
    
    if (typeof event.clientX !== 'number' || isNaN(event.clientX)) {
      console.warn("ResizeController: Invalid clientX value");
      return false;
    }
    
    return true;
  }

  private initializeResizeState(event: PointerEvent, floatbox: HTMLElement): void {
    this.isResizing = true;
    this.resizeStartX = event.clientX;
    this.initialWidth = floatbox.getBoundingClientRect().width;
    this.initialLeft = this.getCurrentLeftPosition();
    this.activePointerId = event.pointerId;
  }

  private getCurrentLeftPosition(): number {
    const host = this.getHostElement();
    const currentLeft = host?.style.getPropertyValue("--pg-floatbox-left");
    return parseFloat(currentLeft || "0") || 0;
  }

  private capturePointer(event: PointerEvent): void {
    try {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    } catch (error) {
      console.warn("Failed to capture pointer:", error);
      this.isResizing = false;
      this.activePointerId = null;
    }
  }

  private shouldProcessEvent(e: PointerEvent): boolean {
    return e.pointerId === this.activePointerId && this.isResizing;
  }

  private finishResize(e: PointerEvent): void {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const deltaX = e.clientX - this.resizeStartX;
    
    if (this.resizeSide === 'left') {
      this.finalizeLeftResize(deltaX);
    } else {
      this.finalizeRightResize(deltaX);
    }
    
    this.cleanup();
    this.onResizeEndCallback?.();
  }

  private finalizeLeftResize(deltaX: number): void {
    const rawLeft = this.initialLeft + deltaX;
    const rawWidth = this.initialWidth - deltaX;
    const newLeft = this.calculateConstrainedLeft(rawLeft);
    const newWidth = this.calculateConstrainedWidth(rawWidth);
    const newStartUnix = this.calculateNewStartUnix(newLeft);
    
    this.itemData.startUnix = newStartUnix;
    this.notifyResize({ newWidth, newStartUnix, newLeft });
  }

  private finalizeRightResize(deltaX: number): void {
    const rawWidth = this.initialWidth + deltaX;
    const newWidth = this.calculateConstrainedWidth(rawWidth);
    const newEndUnix = this.calculateNewEndUnix(newWidth);
    
    this.itemData.endUnix = newEndUnix;
    this.notifyResize({ newWidth, newEndUnix });
  }

  private cancelResize(): void {
    this.isResizing = false;
    this.activePointerId = null;
    this.removePointerEvents();
  }

  private notifyResize(params: ResizeCallbackParams): void {
    this.onResizeCallback?.(params);
  }

  // Event listeners
  private addPointerEvents(): void {
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerCancel);
  }

  private removePointerEvents(): void {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
  }

  // Selectores de elementos
  private getHostElement(): HTMLElement | null {
    return (this.renderRoot as any).host as HTMLElement;
  }

  private getResizeHandleElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".resize-handle") as HTMLElement;
  }

  private getLeftResizeHandleElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".resize-handle-left") as HTMLElement;
  }
}

export default ResizeController;