// Importaciones de librerías externas
import { LitElement, html, unsafeCSS, type PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { connect } from "pwa-helpers";

// Importación de estilos
import scssStyles from "./styles/styles.scss?inline";

// Importaciones de componentes
import "./elements/headerTop/pg-header-top";
import "./elements/tableContainer/pg-table-container";
import "./elements/debug/pg-debug";

// Importaciones de tipos y estado
import type { PuduGraphConfig, PuduGraphUIState } from "./types";
import { store } from "./state/store";
import type { RootState } from "./state/store";
import { setConfig } from "./state/configSlice";
import { setRows } from "./state/dataSlice";
import { setZoom } from "./state/uiStateSlice";

@customElement("pudu-graph")
export class PuduGraph extends connect(store)(LitElement) {
  static styles = [unsafeCSS(scssStyles)];

  @property({ type: Boolean })
  loading = false;

  @state()
  public author: string = "projas";

  private config: PuduGraphConfig | null = null;
  private data: any[] = [];
  private uiState: PuduGraphUIState = {};

  stateChanged(state: RootState): void {
    console.log("stateChanged", state);
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
  }

  public initialize(newConfig: PuduGraphConfig) {
    console.log("initialize", newConfig);
    store.dispatch(setConfig(newConfig));
    store.dispatch(setRows(newConfig.data));
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
      <div class="pg-container" @wheel=${this._onContainerWheel}>
        <pg-header-top .loading=${this.loading}>
          <slot name="headerTopLeft" slot="headerTopLeft"></slot>
          <slot name="headerTopCenter" slot="headerTopCenter"></slot>
          <slot name="headerTopRight" slot="headerTopRight"></slot>
        </pg-header-top>

        <pg-table-container></pg-table-container>

        ${this.loading ? html`<p>Loading...</p>` : ""}

        <slot></slot>

        <pg-debug></pg-debug>
      </div>
    `;
  }
  private _onContainerWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      // Obtiene el valor actual de zoom desde el store
      const prev = this.uiState.zoomValue ?? 1;
      // Ajusta el valor según la dirección del scroll
      let next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
      next = Math.max(0.5, Math.min(next, 3)); // Limita el zoom entre 0.5 y 3
      // Actualiza el store y la variable CSS
      store.dispatch(setZoom(next));
      target.style.setProperty("--pg-zoom-value", `${next}`);
    }
  }

  updated(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    super.updated(changedProperties);
    // Sincroniza el valor de zoom del store con la variable CSS
    const container = this.renderRoot.querySelector(
      ".pg-container"
    ) as HTMLElement;
    if (container && this.uiState.zoomValue !== undefined) {
      container.style.setProperty(
        "--pg-zoom-value",
        `${this.uiState.zoomValue}`
      );
    }
    console.log("PuduGraph updated", changedProperties);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph": PuduGraph;
  }
}
