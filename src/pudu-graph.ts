// Importaciones de librerías externas
import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { connect } from "pwa-helpers";

// Importación de estilos
import scssStyles from "./styles/styles.scss?inline";

// Importaciones de componentes
import "./elements/tableContainer/pg-table-container";
import "./elements/debug/pg-debug";
import "./components/pg-cssvars-controller/pg-cssvars-controller";

// Importaciones de tipos y estado
import type { PGConfig, PGUIState } from "@/types";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import { setConfig } from "./state/configSlice";
import { setRows } from "./state/dataSlice";
import debounce from "./utils/debounce";

@customElement("pudu-graph")
export class PuduGraph extends connect(store)(LitElement) {
  private config: PGConfig | null = null;
  private data: any[] = [];
  private uiState: PGUIState = {};

  static styles = [unsafeCSS(scssStyles)];

  @property({ type: Boolean })
  loading = false;

  stateChanged(state: RootState): void {
    
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
  }

  public initialize(newConfig: PGConfig) {
    store.dispatch(setConfig(newConfig));
    store.dispatch(setRows(newConfig.data));
    this.debouncedRequestUpdate();
  }

  public setLoading(loading: boolean) {
    this.loading = loading;
  }

  private debouncedRequestUpdate(delay = 100) {
    debounce(() => this.requestUpdate(), delay);
  }

  render() {
    return html`
      <pg-cssvars-controller class="pg-container">
        <pg-table-container> </pg-table-container>

        ${this.loading ? html`<p>Loading...</p>` : ""}
      </pg-cssvars-controller>

      <pg-debug></pg-debug>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph": PuduGraph;
  }
}
