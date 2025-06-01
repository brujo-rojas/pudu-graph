import { LitElement, html, css } from "lit-element";
import { customElement, property, state } from "lit/decorators.js";
import scssStyles from "./styles/styles.scss?inline";
import { unsafeCSS } from "lit";

import "./components/headerTop/pudu-graph-header-top";

import type {
  PuduGraphConfig,
  PuduGraphTabConfig,
  PuduGraphHeaderConfig,
} from "./types";

@customElement("pudu-graph")
export class PuduGraph extends LitElement {
  static styles = [
    unsafeCSS(scssStyles),
    css`
      :host {}
    `,
  ];

  @property({ type: Boolean })
  loading = false;

  @state()
  private config: PuduGraphConfig = {
    data: [],
    options: {
      header: {} as PuduGraphHeaderConfig,
      tabs: [] as PuduGraphTabConfig[],
    },
  };

  public initialize(config: any) {
    this.config = { ...config }; // Reemplaza referencia => trigger automático
    this.debouncedRequestUpdate();
  }

  public updateConfig(partial: any) {
    this.config = { ...this.config, ...partial }; // Cambia referencia => re-render
    this.debouncedRequestUpdate();
  }

  public setLoading(loading: boolean) {
    this.loading = loading; // Cambia estado de carga
  }

  public getData() {
    return this.config.data || [];
  }

  render() {
    return html`
      <div
        class="pg-container"
        @click=${this._onClick}
        @mouseover=${this._onMouseOver}
      >
        <pudu-graph-header-top .loading=${this.loading} .config=${this.config}>
          <slot name="headerTopLeft" slot="headerTopLeft"> </slot>
          <slot name="headerTopCenter" slot="headerTopCenter"> </slot>
          <slot name="headerTopRight" slot="headerTopRight"> </slot>
        </pudu-graph-header-top>

        <h1>Pudu Graph</h1>
        ${this.loading ? html`<p>Loading...</p>` : ""}
        <slot> </slot>
      </div>
    `;
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
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph": PuduGraph;
  }
}
