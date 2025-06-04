import { LitElement, html } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import { unsafeCSS } from "lit";
import type {
  PuduGraphConfig,
  PuduGraphTabConfig,
  PuduGraphUIState,
} from "../../types";

import { connect } from "pwa-helpers";

import cssStyles from "./pg-header-top.css?inline";

import { store, type RootState } from "../../state/store";
import { setSelectedTab } from "../../state/uiStateSlice";

import "./tab/pg-tab";
import renderSlotOrDefault from "../../utils/renderSlotOrDefault";

@customElement("pg-header-top")
export class PgHeaderTop extends connect(store)(LitElement) {
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

  _handleLeftClick() {
    console.log("Left button clicked");
    // Implement your logic here
  }

  _handleCenterClick() {
    console.log("Center button clicked");
    // Implement your logic here
  }

  _handleRightClick() {
    console.log("Right button clicked");
    // Implement your logic here
  }

  _handleOptionsClick() {
    console.log("Options button clicked");
    // Implement your logic here
  }

  renderTabs() {
    if (Array.isArray(this.config?.options?.tabs) && this.tabs.length) {
      return this.config.options.tabs.map(
        (tabConfig) => html`
          <pg-tab
            .tab=${tabConfig}
            .active=${tabConfig === this.selectedTab}
            @click=${(e: MouseEvent) => this._handleTabClick(e, tabConfig)}
          ></pg-tab>
        `
      );
    } else {
      return "";
    }
  }

  renderCenterSlot() {
    const slotDefaultContent = html`
      <button
        class="pg-header-button pg-header-button-icon"
        @click=${() => {
          console.log("Botón del centro presionado");
          this._handleLeftClick();
        }}
      >
        prev
      </button>
      <button
        class="pg-header-button pg-header-button-icon"
        @click=${() => {
          console.log("Botón del centro presionado");
          this._handleCenterClick();
        }}
      >
        cal
      </button>
      <button
        class="pg-header-button pg-header-button-icon"
        @click=${() => {
          console.log("Botón del centro presionado");
          this._handleRightClick();
        }}
      >
        next
      </button>
    `;

    return renderSlotOrDefault(
      this.renderRoot as Element | ShadowRoot,
      "headerTopCenter",
      slotDefaultContent,
      this.requestUpdate.bind(this)
    );
  }

  renderRightSlot() {
    const moreOptions = html`
      <button
        class="pg-header-button pg-header-button-icon"
        @click=${() => {
          console.log("Right button clicked");
          this._handleOptionsClick();
        }}
      >
        more
      </button>
    `;

    return renderSlotOrDefault(
      this.renderRoot as Element | ShadowRoot,
      "headerTopRight",
      moreOptions,
      this.requestUpdate.bind(this)
    );
  }

  renderLeftSlot() {
    return renderSlotOrDefault(
      this.renderRoot as Element | ShadowRoot,
      "headerTopLeft",
      html``,
      this.requestUpdate.bind(this)
    );
  }

  render() {
    return html`
      ${this.loading ? html`<p>Loading header...</p>` : ""}

      <div class="pg-header-top-left">
        <div class="pg-tabs-container">
          ${this.renderTabs()} ${this.renderLeftSlot()}
        </div>
      </div>

      <div class="pg-header-top-center">${this.renderCenterSlot()}</div>
      <div class="pg-header-top-right">${this.renderRightSlot()}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-header-top": PgHeaderTop;
  }
}
