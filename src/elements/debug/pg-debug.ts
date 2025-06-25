import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "../../state/store";
import type { PGConfig, PuduGraphUIState } from "../../types/types";
import type { RootState } from "../../state/store";
import cssStyles from "./pg-debug.css?inline";


@customElement("pg-debug")
export class PgDebug extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private data: any[] = [];
 private uiState: PuduGraphUIState = {};

  stateChanged(state: RootState) {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  render() {
    return html`<div>
      <h2>Debug</h2>
      <h3>UI State</h3>
      <pre> ${JSON.stringify(this.uiState, null, 2)}</pre>
      <h3>Config</h3>
      <pre> ${JSON.stringify(this.config, null, 2)}</pre>
      <h3>Data</h3>
      <pre> ${JSON.stringify(this.data, null, 2)}</pre>
    </div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-debug": PgDebug;
  }
}
