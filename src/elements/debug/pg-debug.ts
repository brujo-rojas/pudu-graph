import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { PGConfig, PGUIState } from "@/types";
import type { RootState } from "@state/store";
import cssStyles from "./pg-debug.scss?inline";

@customElement("pg-debug")
export class PgDebug extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private data: any[] = [];
  private uiState: PGUIState = {};

  stateChanged(state: RootState) {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  render() {
    return html`<div class="pg-debug">
      <h2>Debug</h2>

      <article>
        <section>
          <h3>UI State</h3>
          <pre> ${JSON.stringify(this.uiState, null, 2)}</pre>
        </section>
        <section>
          <h3>Config</h3>
          <pre> ${JSON.stringify(this.config, null, 2)}</pre>
        </section>
        <section>
          <h3>Data</h3>
          <pre> ${JSON.stringify(this.data, null, 2)}</pre>
        </section>
      </article>
    </div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-debug": PgDebug;
  }
}
