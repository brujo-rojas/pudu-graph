// Importaciones de librerías externas
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeCSS } from "lit";

// Importación de estilos
import scssStyles from "./styles/styles.scss?inline";

// Importaciones de componentes
import "./components/headerTop/pudu-graph-header-top";
import "./components/tableContainer/pudu-graph-table-container";

// Importaciones de tipos
import type { PuduGraphConfig } from "./types";
import { configStore } from "./state/config-store";

@customElement("pudu-graph")
export class PuduGraph extends LitElement {
  static styles = [unsafeCSS(scssStyles)];

  @property({ type: Boolean })
  loading = false;

  //TODO test esto, para optimizacion, tal vez hay que cambiart la logica
  // del config como state, para que no refresque todo el plugin
  // al cambiar, considerar usarlo como variable privada solamente
  // y con un store, detectar cambios y replicarlos en los lugares neceasarios
  @state()
  private config: PuduGraphConfig | null = null;

  @state()
  private testVar: string = "test";

  public initialize(newConfig: PuduGraphConfig) {
    configStore.set({ ...newConfig });
    this.config = configStore.value;
    this.debouncedRequestUpdate();
  }

  public updateConfig(partialConfig: PuduGraphConfig) {
    configStore.set({ ...this.config, ...partialConfig });
    this.debouncedRequestUpdate();
  }

  public setLoading(loading: boolean) {
    this.loading = loading; // Cambia estado de carga
  }

  public getData() {
    return this.config?.data || [];
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

  updated(changedProperties) {
    super.updated(changedProperties);
    console.log("PuduGraph updated", changedProperties);
  }

  private _onClick() {
    console.log("PuduGraph clicked");
  }

  private _onMouseOver() {
    console.log("PuduGraph mouse over");
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
      <div
        class="pg-container"
        @click=${this._onClick}
        @mouseover=${this._onMouseOver}
      >
        <pudu-graph-header-top .loading=${this.loading}>
          <slot name="headerTopLeft" slot="headerTopLeft"> </slot>
          <slot name="headerTopCenter" slot="headerTopCenter"> </slot>
          <slot name="headerTopRight" slot="headerTopRight"> </slot>
        </pudu-graph-header-top>

        <pudu-graph-table-container> </pudu-graph-table-container>

        ${this.loading ? html`<p>Loading...</p>` : ""}

        <slot> </slot>

      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph": PuduGraph;
  }
}
