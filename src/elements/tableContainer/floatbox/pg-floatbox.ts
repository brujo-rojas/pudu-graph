import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-floatbox.css?inline";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import type { PGConfig, PGItemData, PGRowData, PGUIState } from "@/types";

@customElement("pg-floatbox")
export class PuduGraphFloatbox extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private uiState: PGUIState | null = null;

  @property({ type: Object })
  itemData: PGItemData | null = null;

  @property({ type: Object })
  rowData: PGRowData | null = null;

  @property({ type: Number })
  rowIndex: number = 0;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  /**
   * Calcula la posición y tamaño del floatbox en función de los datos y el zoom.
   */
  private calculateFloatboxPosition() {
    if (!this.itemData || !this.rowData || !this.uiState || !this.config) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    const {
      startUnix = 0,
      dayWidth = 30,
      flexBoxHeight = 10,
    } = this.config.options;
    const floatBoxStartUnix = this.itemData.startUnix || 0;
    const floatBoxEndUnix = this.itemData.endUnix || 0;
    const zoom = this.uiState.zoomValue ?? 1;
    if (!startUnix || !floatBoxStartUnix || !floatBoxEndUnix) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    const DAY_SECONDS = 24 * 3600;
    const left =
      ((floatBoxStartUnix - startUnix) / DAY_SECONDS) * dayWidth * zoom;
    const width =
      ((floatBoxEndUnix - floatBoxStartUnix) / DAY_SECONDS) * dayWidth * zoom;
    const height = flexBoxHeight;
    const overlapLevel = this.itemData.overlapLevel || 0;
    const top = (Number(this.rowIndex) * 50 || 0) + overlapLevel * height;
    return { left, top, width, height };
  }

  private updateStyles(
    left: number,
    top: number,
    width: number,
    height: number,
    color: string
  ) {
    this.style.setProperty("--pg-local-bg-color", color);
    this.style.setProperty("--pg-floatbox-width", `${width}px`);
    this.style.setProperty("--pg-floatbox-height", `${height}px`);
    this.style.setProperty("--pg-floatbox-top", `${top}px`);
    this.style.setProperty("--pg-floatbox-left", `${left}px`);
  }

  render() {
    const { left, top, width, height } = this.calculateFloatboxPosition();
    const color = this.itemData?.color || "red";
    this.updateStyles(left, top, width, height, color);
    return html`<div class="pg-floatbox">${this.itemData?.foo}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox": PuduGraphFloatbox;
  }
}
