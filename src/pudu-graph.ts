// Importaciones de librerías externas
import { LitElement, html, unsafeCSS, type PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";

// Importación de estilos
import scssStyles from "./styles/styles.scss?inline";

// Importaciones de componentes
import "./components/headerTop/pudu-graph-header-top";
import "./components/tableContainer/pudu-graph-table-container";
import "./components/debug/pudu-graph-debug";

// Importaciones de tipos y estado
import type { PuduGraphConfig } from "./types";
import { store } from "./state/store";
import type { RootState } from "./state/store";
import { setConfig } from "./state/configSlice";

@customElement("pudu-graph")
export class PuduGraph extends connect(store)(LitElement) {
  static styles = [unsafeCSS(scssStyles)];

  private config: PuduGraphConfig | null = null;
  private data: any[] = [];
  private uiState: any = {};


  @property({ type: Boolean })
  loading = false;

  @state()
  public author: string = "projas";

  stateChanged(state: RootState): void {
    console.log("stateChanged", state)
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
  }

  public initialize(newConfig: PuduGraphConfig) {
    console.log("initialize", newConfig)
    store.dispatch(setConfig(newConfig));
    this.debouncedRequestUpdate();
  }

  public setLoading(loading: boolean) {
    this.loading = loading;
  }

  connectedCallback() {
    super.connectedCallback();
    console.log("PuduGraph connected");
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log("PuduGraph disconnected");
  }

  firstUpdated() {
    console.log("PuduGraph first updated");
  }

  updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    console.log("PuduGraph updated", changedProperties);
  }

  // debounce
  private _debounceTimeout: any = null;

  private debounce(fn: () => void, delay: number) {
    clearTimeout(this._debounceTimeout);
    this._debounceTimeout = setTimeout(fn, delay);
  }

  private debouncedRequestUpdate(delay = 100) {
    this.debounce(() => this.requestUpdate(), delay);
  }

  render() {
    return html`
      <div class="pg-container">
        <pudu-graph-header-top .loading=${this.loading}>
          <slot name="headerTopLeft" slot="headerTopLeft"></slot>
          <slot name="headerTopCenter" slot="headerTopCenter"></slot>
          <slot name="headerTopRight" slot="headerTopRight"></slot>
        </pudu-graph-header-top>

        <pudu-graph-table-container></pudu-graph-table-container>

        ${this.loading ? html`<p>Loading...</p>` : ""}

        <slot></slot>

        <pudu-graph-debug></pudu-graph-debug>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph": PuduGraph;
  }
}
