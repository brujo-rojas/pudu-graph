import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-floatbox.css?inline";
import { connect } from "pwa-helpers";
import { store } from "../../../../../../state/store";
import type { RootState } from "../../../../../../state/store";
import type { PuduGraphConfig, PuduGraphItemData, PuduGraphRowData, PuduGraphUIState } from "../../../../../../types/types";

@customElement("pg-floatbox")
export class PuduGraphFloatbox extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PuduGraphConfig | null = null;
  // private data: PuduGraphRowData[] = [];
  private uiState: PuduGraphUIState | null = null;

  stateChanged(state: RootState): void {
    this.config = state.config;
    // this.data = state.data;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  @property({ type: Object })
  public itemData: PuduGraphItemData | null = null;

  @property({ type: Object })
  public rowData: PuduGraphRowData | null = null;

  render() {
    return html`<div class="pg-floatbox">
                  ${this.uiState?.selectedTab?.id}
                  ${this.itemData?.date} - ${this.itemData?.value}
                </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox": PuduGraphFloatbox;
  }
}
