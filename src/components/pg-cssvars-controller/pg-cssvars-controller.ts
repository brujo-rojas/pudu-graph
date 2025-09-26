import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import { setZoom } from "../../state/uiStateSlice";
import type { PGConfig, PGUIState } from "@/types";
import type { RootState } from "@state/store";

@customElement("pg-cssvars-controller")
export class PuduGraphZoomController extends connect(store)(LitElement) {
  private config: PGConfig | null = null;
  private uiState: PGUIState = {};
  private width: number | null = null;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.uiState = state.uiState;
    this.width = this.calculateInternalWidth(this.config);

    this.style.setProperty(
      "--pg-item-height",
      `${this.config?.options.itemHeight ?? 50}px`
    );
    this.style.setProperty("--pg-zoom-value", `${this.uiState.zoomValue ?? 1}`);
    this.style.setProperty(
      "--pg-internal-width",
      this.width ? `${this.width}px` : "100%"
    );
  }

  private calculateInternalWidth(config: PGConfig): number | null {
    // Validación de fechas
    const { startUnix, endUnix } = config.options;
    if (typeof startUnix !== "number" || typeof endUnix !== "number") {
      return null;
    }

    // Cálculo de días totales
    const DAY = 24 * 3600;
    const totalDays = Math.ceil((endUnix - startUnix) / DAY) + 1;

    // Ancho base por día y zoom
    const DAY_WIDTH = 30;
    const zoom = this.uiState.zoomValue ?? 1;
    const totalWidth = totalDays * DAY_WIDTH * zoom;

    // Suma total
    return totalWidth;
  }

  private _onContainerWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      // Obtiene el valor actual de zoom desde el store
      const prev = this.uiState.zoomValue ?? 1;
      // Ajusta el valor según la dirección del scroll
      let next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
      next = Math.max(0.5, Math.min(next, 6)); // Limita el zoom entre 0.5 y 3
      // Actualiza el store y la variable CSS
      store.dispatch(setZoom(next));
    }
  }

  render() {
    return html`<div @wheel=${this._onContainerWheel}><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-cssvars-controller": PuduGraphZoomController;
  }
}
