import type { PGConfig, PGItemData, PGUIState } from "@/types";
import leftToUnix from "./leftPositionToUnix";
import { LitElement } from "lit";
import { calculateFloatboxPosition } from "./calculateFloatboxPosition";

interface constructorParams {
  itemData: PGItemData;
  config: PGConfig;
  zoomValue: number;
  renderRoot: RenderRoot;
}

interface createDragElemParams {
  floatbox: HTMLElement;
  color: string;
}

interface onStartDragParams {
  event: PointerEvent;
  floatbox: HTMLElement;
  itemData: PGItemData;
}

interface updateDragElementPositionParams {
  dragElement: HTMLElement;
  x: number;
  y: number;
  dragOffsetX: number;
  dragOffsetY: number;
  dragHorizontalOnly: boolean;
  fixedTop: number;
}

interface onPointerUpParams {
  e: PointerEvent;
  config: PGConfig;
  itemData: PGItemData;
  dragElement: HTMLElement;
  renderRoot: RenderRoot;
  rowIndex: number;
  zoomValue: number;
}

interface onDropCallbackParams {
  x: number;
  y: number;
  newLeft?: number;
  date?: Date;
  width?: number;
}

interface onDropEventParams {
  x: number;
  y: number;
  newLeft: number;
  zoomValue: number;
  width: number;
}

type RenderRoot = typeof LitElement.prototype.renderRoot;

class DragController {
  private width = 0;
  private height = 0;
  private top = 0;
  private left = 0;

  private itemData: PGItemData | null = null;

  private config = null as PGConfig | null;

  private isDragging = false;
  private dragElement: HTMLElement | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private activePointerId: number | null = null;
  private fixedTop = 0;
  private renderRoot: RenderRoot;

  private dragStartBoxLeft = 0; // Almacena la posición inicial del floatbox al iniciar el drag
  private dragHorizontalOnly = true;

  private rowIndex = 0;
  private zoomValue = 1;

  private onDropCallback: ((params: onDropCallbackParams) => void) | null =
    null;

  constructor({ itemData, config, zoomValue, renderRoot }: constructorParams) {
    this.itemData = itemData;
    this.config = config;
    this.zoomValue = zoomValue;
    this.renderRoot = renderRoot;
  }

  addDragEvents = (ctx: LitElement) => {
    ctx.addEventListener("pointerdown", this.onPointerDown.bind(this));
  };

  removeDragEvents = (ctx: LitElement) => {
    //TODO test el remove
    ctx.removeEventListener("pointerdown", this.onPointerDown.bind(this));
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

  private onPointerDown(e: PointerEvent) {
    const floatbox = this.getFloatBoxChildElement(this.renderRoot);
    if (!floatbox || !this.itemData) return;
    return this.onStartDrag({
      event: e,
      floatbox,
      itemData: this.itemData,
    });
  }

  private onStartDrag({ event, floatbox, itemData }: onStartDragParams) {
    if (!floatbox) return;

    const clientX = event.clientX;
    const clientY = event.clientY;

    const rect = floatbox.getBoundingClientRect();

    this.dragOffsetX = clientX - rect.left;
    this.dragOffsetY = clientY - rect.top;
    this.fixedTop = rect.top;
    this.dragStartBoxLeft = rect.left;

    this.width = rect.width;
    this.height = rect.height;

    this.isDragging = true;
    this.activePointerId = event.pointerId;

    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    this.dragElement = this.createDragElement({
      floatbox,
      color: itemData?.color || "red",
    });

    document.body.appendChild(this.dragElement);

    this.updateDragElementPosition({
      dragElement: this.dragElement,
      x: clientX,
      y: clientY,
      dragOffsetX: this.dragOffsetX,
      dragOffsetY: this.dragOffsetY,
      dragHorizontalOnly: this.dragHorizontalOnly,
      fixedTop: this.fixedTop,
    });
    this.addPointerEvents();
  }

  private addPointerEvents() {
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerCancel);
  }

  private updateDragElementPosition({
    dragElement,
    x,
    y,
    dragOffsetX,
    dragOffsetY,
    dragHorizontalOnly,
    fixedTop,
  }: updateDragElementPositionParams) {
    if (!dragElement) return;
    // Usa el offset para que el cursor quede en la misma posición relativa (coordenadas absolutas)
    const left = x - dragOffsetX;
    dragElement.style.left = `${left}px`;
    if (dragHorizontalOnly) {
      // Mantiene la posición vertical igual que el original (top absoluto respecto al body)
      dragElement.style.top = `${fixedTop}px`;
    } else {
      const top = y - dragOffsetY;
      dragElement.style.top = `${top}px`;
    }
  }

  private getFloatBoxChildElement(renderRoot: RenderRoot): HTMLElement | null {
    return renderRoot.querySelector(".pg-floatbox") as HTMLElement;
  }

  private createDragElement({
    floatbox,
    color,
  }: createDragElemParams): HTMLElement {
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

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.activePointerId) return;
    if (
      !this.isDragging ||
      !this.dragElement ||
      !this.config ||
      !this.zoomValue ||
      !this.itemData
    )
      return;

    this.isDragging = false;
    this.activePointerId = null;

    this.stopDragging({
      e,
      config: this.config,
      itemData: this.itemData,
      dragElement: this.dragElement,
      renderRoot: this.renderRoot,
      rowIndex: this.rowIndex || 0,
      zoomValue: this.zoomValue || 1,
    });

    this.dragStartBoxLeft = 0;
    this.dragElement.remove();
    this.dragElement = null;
  };

  private stopDragging({
    e,
    config,
    itemData,
    dragElement,
    renderRoot,
    rowIndex,
    zoomValue,
  }: onPointerUpParams) {
    if (!config || !itemData || !dragElement || !renderRoot) return;

    let clientX = e.clientX;
    let clientY = e.clientY;

    const floatbox = this.getFloatBoxChildElement(renderRoot);
    if (!floatbox) return;

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const dragRect = dragElement.getBoundingClientRect();
    const { left: originalLeft } = calculateFloatboxPosition({
      config,
      itemData,
      rowIndex,
      zoomValue,
    });
    const newLeft = originalLeft + (dragRect.left - this.dragStartBoxLeft);

    let x = 0,
      y = 0;
    const rect = floatbox.getBoundingClientRect();
    x = clientX - rect.left;
    y = clientY - rect.top;
    // Actualiza el modelo de datos para reflejar la nueva posición
    const oldStart = itemData.startUnix || 0;
    const oldEnd = itemData.endUnix || 0;
    const newStart = leftToUnix({
      config: config,
      left: newLeft,
      zoomValue: zoomValue,
    });
    itemData.startUnix = newStart;
    itemData.endUnix = oldEnd + (newStart - oldStart);
    // Recalcula el ancho en base a la nueva posición
    const { width } = calculateFloatboxPosition({
      config: config,
      itemData: itemData,
      rowIndex: rowIndex,
      zoomValue: zoomValue,
    });

    this.left = newLeft;
    this.width = width;

    // Llama a onDrop con la nueva posición
    this.onDropEvent({ x, y, newLeft, zoomValue, width });

    // Limpia la referencia de dragStartBoxLeft
    this.removePointerEvents();
  }

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

  private onDropEvent = ({
    x,
    y,
    newLeft,
    zoomValue,
    width,
  }: onDropEventParams): void => {
    if (!newLeft || !this.itemData || !this.config) return;

    const unix = leftToUnix({
      config: this.config,
      left: newLeft,
      zoomValue: zoomValue,
    });
    const date = new Date(unix * 1000);
    // Actualiza el modelo de datos para que el siguiente drag parta de la nueva posición
    if (this.itemData) {
      this.itemData.startUnix = unix;
    }

    this.onDropCallback?.({ x, y, newLeft, date, width });
  };

  onDrop(callBack: ({ x, y, newLeft, date }: onDropCallbackParams) => void) {
    if (typeof callBack !== "function") {
      console.warn("onDrop debe ser una función");
    }
    this.onDropCallback = callBack;
  }
}

export default DragController;
