import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-floatbox.css?inline";
import { connect } from "pwa-helpers";
import { store } from "../../../../../../state/store";
import type { RootState } from "../../../../../../state/store";
import type {
  PGConfig,
  PGItemData,
  PuduGraphRowData,
  PuduGraphUIState,
} from "../../../../../../types/types";

@customElement("pg-floatbox")
export class PuduGraphFloatbox extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private uiState: PuduGraphUIState | null = null;

  @property({ type: Object })
  public itemData: PGItemData | null = null;

  @property({ type: Object })
  public rowData: PuduGraphRowData | null = null;

  @property({ type: Number })
  public rowIndex: number = 0;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  /**
   * Calcula la posición y tamaño del floatbox en función de los datos y el zoom.
   */
  private calculateFloatboxPosition(): {
    left: number;
    top: number;
    width: number;
    height: number;
  } {
    if (!this.itemData || !this.rowData || !this.uiState || !this.config) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    const { startUnix = 0 } = this.config.options;
    const floatBoxStartUnix = this.itemData.startUnix || 0;
    const floatBoxEndUnix = this.itemData.endUnix || 0;
    const zoom = this.uiState.zoomValue ?? 1;

    if (!startUnix || !floatBoxStartUnix || !floatBoxEndUnix) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    const DAY_SECONDS = 24 * 3600;
    const DAY_WIDTH = 30;
    const left = ((floatBoxStartUnix - startUnix) / DAY_SECONDS) * DAY_WIDTH * zoom;
    const width = ((floatBoxEndUnix - floatBoxStartUnix) / DAY_SECONDS) * DAY_WIDTH * zoom;
    const top = Number(this.rowIndex) * 50 || 0;
    const height = 10; // Altura por defecto

    return { left, top, width, height };
  }

  render() {
    const { left, top, width, height } = this.calculateFloatboxPosition();
    const color = this.itemData?.color || "red";

    this.style.setProperty("--pg-local-bg-color", color);
    this.style.setProperty("--pg-floatbox-width", `${width}px`);
    this.style.setProperty("--pg-floatbox-height", `${height}px`);
    this.style.setProperty("--pg-floatbox-top", `${top}px`);
    this.style.setProperty("--pg-floatbox-left", `${left}px`);

    return html`<div class="pg-floatbox">${this.itemData?.foo}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox": PuduGraphFloatbox;
  }
}
