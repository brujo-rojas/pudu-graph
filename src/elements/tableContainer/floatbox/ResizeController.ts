
interface ResizeStartParams {
  e: PointerEvent;
  initialWidth: number;
}

/**
 * ResizeController: añade funcionalidad de redimensionar a un elemento.
 * Usa eventos pointer para controlar el resize y notifica el nuevo ancho por callback.
 */
class ResizeController {
  private isResizing = false;
  private resizeStartX = 0;
  private initialWidth = 0;
  private activePointerId: number | null = null;
  private onResizeCallback: ((newWidth: number) => void) | null = null;

  /**
   * Inicia el resize y agrega listeners globales.
   */
  onResizeStart = ({ e, initialWidth }: ResizeStartParams) => {
    e.stopPropagation();
    this.isResizing = true;
    this.resizeStartX = e.clientX;
    this.initialWidth = initialWidth;
    this.activePointerId = e.pointerId;
    this.addResizeEvents(e);
  };

  /**
   * Registra el callback que se llama en cada movimiento de resize.
   */
  onResize(callback: (newWidth: number) => void) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be una función");
    }
    this.onResizeCallback = callback;
  }

  /**
   * Agrega listeners globales para el resize.
   */
  private addResizeEvents(e: PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", this.onResizeMove);
    window.addEventListener("pointerup", this.onResizeEnd);
    window.addEventListener("pointercancel", this.onResizeEnd);
  }

  /**
   * Handler para pointermove: calcula y notifica el nuevo ancho.
   */
  private onResizeMove = (e: PointerEvent) => {
    if (!this.isResizing || e.pointerId !== this.activePointerId) return;
    const deltaX = e.clientX - this.resizeStartX;
    const newWidth = Math.max(10, this.initialWidth + deltaX);
    this.onResizeCallback?.(newWidth);
  };

  /**
   * Handler para pointerup/cancel: termina el resize y elimina listeners.
   */
  private onResizeEnd = (e: PointerEvent) => {
    if (!this.isResizing || e.pointerId !== this.activePointerId) return;
    this.isResizing = false;
    this.activePointerId = null;
    this.removeResizeEvents(e);
  };

  /**
   * Elimina listeners globales para el resize.
   */
  private removeResizeEvents(e: PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    window.removeEventListener("pointermove", this.onResizeMove);
    window.removeEventListener("pointerup", this.onResizeEnd);
    window.removeEventListener("pointercancel", this.onResizeEnd);
  }
}

export default ResizeController;
