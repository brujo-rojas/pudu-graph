import { LitElement, html } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import { unsafeCSS } from "lit";
import type {
  PuduGraphConfig,
  PuduGraphTabConfig,
  PuduGraphUIState,
} from "../../types";

import { connect } from "pwa-helpers";

import cssStyles from "./pudu-graph-header-top.css?inline";

import { store, type RootState } from "../../state/store";
import { setSelectedTab } from "../../state/uiStateSlice";

import "./tab/pudu-graph-tab";
import renderSlotOrDefault from "../../utils/renderSlotOrDefault";

@customElement("pudu-graph-header-top")
export class PuduGraphHeaderTop extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Boolean })
  loading = false;

  private config: PuduGraphConfig | null = null;
  private uiState: PuduGraphUIState | null = null;
  private tabs: PuduGraphTabConfig[] = [];
  private selectedTab: PuduGraphTabConfig | null = null;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.tabs = this.config?.options?.tabs || [];
    this.uiState = state.uiState;
    this.selectedTab = this.uiState?.selectedTab ?? null;
  }

  _handleTabClick(event: MouseEvent, tabConfig: PuduGraphTabConfig) {
    event.preventDefault();
    event.stopPropagation();
    store.dispatch(setSelectedTab(tabConfig));
    this.requestUpdate();
  }

  renderTabs() {
    if (Array.isArray(this.config?.options?.tabs) && this.tabs.length) {
      return this.config.options.tabs.map(
        (tabConfig) => html`
          <pudu-graph-tab
            .tab=${tabConfig}
            .active=${tabConfig === this.selectedTab}
            @click=${(e: MouseEvent) => this._handleTabClick(e, tabConfig)}
          ></pudu-graph-tab>
        `
      );
    } else {
      return "";
    }
  }

  render() {
    return html`
      ${this.loading ? html`<p>Loading header...</p>` : ""}

      <div class="pg-header-top-left">
        <div class="pg-tabs-container">
          ${this.renderTabs()}
          <slot name="headerTopLeft"></slot>
        </div>
      </div>

      <div class="pg-header-top-center">
        ${renderSlotOrDefault(
      this.renderRoot as Element | ShadowRoot,
      "headerTopCenter",
      html`contenido de slot original`,
      this.requestUpdate.bind(this)
    )}
      </div>
      <div class="pg-header-top-right">
        ${renderSlotOrDefault(
      this.renderRoot as Element | ShadowRoot,
      "headerTopRight",
      html`contenido de slot original`,
      this.requestUpdate.bind(this)
    )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-header-top": PuduGraphHeaderTop;
  }
}
