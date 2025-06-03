import { LitElement, html } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import { unsafeCSS } from "lit";
import type { PuduGraphConfig, PuduGraphTabConfig } from "../../types";
import { configStore } from "../../state/config-store";

import cssStyles from "./pudu-graph-header-top.css?inline";

import "./tab/pudu-graph-tab";
import renderSlotOrDefault from "../../utils/renderSlotOrDefault";
import { tabStore } from "../../state/tab-store";

@customElement("pudu-graph-header-top")
export class PuduGraphHeaderTop extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Boolean })
  loading = false;

  private unsubscribeConfig?: () => void;
  private unsubscribeTabSelected?: () => void;

  private config: PuduGraphConfig | null = null;
  private tabs: PuduGraphTabConfig[] = [];
  private tabSelected: PuduGraphTabConfig | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeConfig = configStore.subscribe(() => this.onUpdateConfig());
    this.unsubscribeTabSelected = tabStore.subscribe(() => this.onUpdateTabSelected());
  }

  disconnectedCallback() {
    this.unsubscribeConfig?.();
    this.unsubscribeTabSelected?.();
    super.disconnectedCallback();
  }

  onUpdateConfig() {
    this.config = configStore.value;
    this.tabs = this.config?.options?.tabs || [];
    this.requestUpdate();
  }
  onUpdateTabSelected() {
    this.tabSelected = tabStore.value;
    this.requestUpdate();
  }


  _handleTabClick(event: MouseEvent, tabConfig: PuduGraphTabConfig) {
    tabStore.set(tabConfig);

    event.preventDefault();
    event.stopPropagation();
  }

  renderTabs() {
    if (
      Array.isArray(this.config?.options?.tabs) &&
      this.tabs.length
    ) {
      return this.config.options.tabs.map(
        (tabConfig) => html`
          <pudu-graph-tab
            .tab=${tabConfig}
            .active=${tabConfig === this.tabSelected}
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
