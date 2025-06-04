import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-floatbox.css?inline";
import { connect } from "pwa-helpers";
import { store } from "../../../../../../state/store";
import type { RootState } from "../../../../../../state/store";
import type { PuduGraphConfig, PuduGraphUIState } from "../../../../../../types/types";

@customElement("pudu-graph-floatbox")
export class PuduGraphFloatbox extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PuduGraphConfig | null = null;
  private data: any[] = [];
  private uiState: PuduGraphUIState | null = null;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  render() {
    return html`<div class="pudu-graph-floatbox">
                  ${this.uiState?.selectedTab?.id}
                </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-floatbox": PuduGraphFloatbox;
  }
}
