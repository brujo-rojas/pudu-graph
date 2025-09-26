import type { PGItemData, PGConfig } from "@/types";
import type { BaseControllerParams, RenderRoot } from "./BaseController";

// Extensiones específicas para cada controlador
export interface DragControllerParams extends BaseControllerParams {
  dragHorizontalOnly?: boolean;
}

export interface ResizeControllerParams extends BaseControllerParams {
  resizeSide?: 'left' | 'right';
  onResize?: (params: ResizeCallbackParams) => void;
  onResizeEnd?: () => void;
}

// Interfaces para callbacks y eventos
export interface ResizeCallbackParams {
  newWidth: number;
  newEndUnix?: number;
  newStartUnix?: number;
  newLeft?: number;
}

export interface DropCallbackParams {
  x: number;
  y: number;
  newLeft?: number;
  date?: Date;
  width?: number;
  newStartUnix?: number;
  newEndUnix?: number;
}

export interface DropEventParams {
  x: number;
  y: number;
  newLeft: number;
  date: Date;
  width: number;
  newStartUnix: number;
  newEndUnix: number;
}

// Interfaces para posicionamiento y elementos
export interface DragElementParams {
  floatbox: HTMLElement;
  color: string;
}

export interface DragPositionParams {
  dragElement: HTMLElement;
  x: number;
  y: number;
  dragOffsetX: number;
  dragOffsetY: number;
  dragHorizontalOnly: boolean;
  fixedTop: number;
}

export interface PointerUpParams {
  e: PointerEvent;
  config: PGConfig;
  itemData: PGItemData;
  dragElement: HTMLElement;
  renderRoot: RenderRoot;
  rowIndex: number;
  zoomValue: number;
}

// Enums para mejor type safety
export enum ResizeSide {
  LEFT = 'left',
  RIGHT = 'right'
}

export enum PointerEventType {
  DOWN = 'pointerdown',
  MOVE = 'pointermove',
  UP = 'pointerup',
  CANCEL = 'pointercancel'
}
