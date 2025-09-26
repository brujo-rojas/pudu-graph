import type { PGConfig, PGItemData } from "@/types";
import { LitElement } from "lit";

// Tipos base
export type RenderRoot = typeof LitElement.prototype.renderRoot;

// Interface base para todos los controladores
export interface BaseControllerParams {
  itemData: PGItemData;
  config: PGConfig;
  zoomValue: number;
  renderRoot: RenderRoot;
  rowIndex?: number;
}

/**
 * Clase base abstracta para todos los controladores de floatbox.
 * Proporciona funcionalidad común y estructura para DragController y ResizeController.
 */
export abstract class BaseController {
  // Propiedades protegidas para acceso desde clases derivadas
  protected itemData: PGItemData;
  protected config: PGConfig;
  protected zoomValue: number;
  protected readonly renderRoot: RenderRoot;
  protected readonly rowIndex: number;

  // Constantes compartidas
  protected static readonly SECONDS_PER_DAY = 86400;
  protected static readonly MIN_WIDTH = 10;

  constructor(params: BaseControllerParams) {
    this.itemData = params.itemData;
    this.config = params.config;
    this.zoomValue = params.zoomValue;
    this.renderRoot = params.renderRoot;
    this.rowIndex = params.rowIndex ?? 0;
  }

  /**
   * Actualiza los datos del item
   */
  updateItemData(newItemData: PGItemData): void {
    this.itemData = newItemData;
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: PGConfig): void {
    this.config = newConfig;
  }

  /**
   * Actualiza el valor de zoom
   */
  updateZoomValue(newZoomValue: number): void {
    this.zoomValue = newZoomValue;
  }

  /**
   * Obtiene el elemento host del floatbox
   */
  protected getHostElement(): HTMLElement | null {
    return (this.renderRoot as any).host as HTMLElement;
  }

  /**
   * Valida si los parámetros básicos están disponibles
   */
  protected validateBasicParams(): boolean {
    return !!(this.config?.options && this.itemData);
  }

  /**
   * Captura el pointer para un evento
   */
  protected capturePointer(event: PointerEvent): boolean {
    try {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
      return true;
    } catch (error) {
      console.warn("Failed to capture pointer:", error);
      return false;
    }
  }

  /**
   * Libera el pointer capture
   */
  protected releasePointer(event: PointerEvent): void {
    try {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    } catch (error) {
      console.warn("Failed to release pointer:", error);
    }
  }

  // Métodos abstractos que deben implementar las clases derivadas
  abstract isActive(): boolean;
  abstract cleanup(): void;
}
