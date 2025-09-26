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
  private tooltip: any = null;
  private floatDetail: any = null;
  private mousePosition: any = null;
  private gridSelection: any = null;
  private floatboxSelection: any = null;

  stateChanged(state: RootState) {
    // Limpiar consola
    console.clear();
    
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    this.tooltip = state.tooltip;
    this.floatDetail = state.floatDetail;
    this.mousePosition = state.mousePosition;
    this.gridSelection = state.gridSelection;
    this.floatboxSelection = state.floatboxSelection;
    
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
        <section>
          <h3>Tooltip</h3>
          <pre> ${JSON.stringify(this.tooltip, null, 2)}</pre>
        </section>
        <section>
          <h3>Float Detail</h3>
          <pre> ${JSON.stringify(this.floatDetail, null, 2)}</pre>
        </section>
        <section>
          <h3>Mouse Position</h3>
          <pre> ${JSON.stringify(this.mousePosition, null, 2)}</pre>
        </section>
        <section>
          <h3>Grid Selection (${this.gridSelection?.selections?.length || 0} cells)</h3>
          <pre> ${JSON.stringify(this.gridSelection, null, 2)}</pre>
        </section>
        <section>
          <h3>Floatbox Selection (${this.floatboxSelection?.selections?.length || 0} items)</h3>
          <pre> ${JSON.stringify(this.floatboxSelection, null, 2)}</pre>
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
