interface onResizeStartParams {
  e: PointerEvent;
  initialWidth: number;
}

class ResizeController {
  private isResizing = false;
  private resizeStartX = 0;
  private initialWidth = 0;
  private activePointerId: number | null = null;

  private onResizeCallback: ((newWidth: number) => void) | null = null;

  constructor({}: {}) {}

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

    if (this.onResizeCallback) {
      this.onResizeCallback(newWidth);
    }
  };

  private onResizeEnd = (e: PointerEvent) => {
    if (!this.isResizing || e.pointerId !== this.activePointerId) return;
    this.isResizing = false;
    this.activePointerId = null;
    this.removeResizeEvents(e);
  };

  private removeResizeEvents = (e: PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    window.removeEventListener("pointermove", this.onResizeMove);
    window.removeEventListener("pointerup", this.onResizeEnd);
    window.removeEventListener("pointercancel", this.onResizeEnd);
  };

  onResizeStart = ({ e, initialWidth }: onResizeStartParams) => {
    e.stopPropagation();
    this.isResizing = true;
    this.resizeStartX = e.clientX;
    this.initialWidth = initialWidth;
    this.activePointerId = e.pointerId;
    this.addResizeEvents(e);
  };

  onResize(callback: (newWidth: number) => void) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    this.onResizeCallback = callback;
  }
}

export default ResizeController;
