import { LitElement, html } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import { unsafeCSS } from "lit";
import type { PuduGraphConfig, PuduGraphTabConfig } from "../../types";
import { configStore } from "../../state/config-store";

import cssStyles from "./pudu-graph-header-top.css?inline";

import "./tab/pudu-graph-tab";

@customElement("pudu-graph-header-top")
export class PuduGraphHeaderTop extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Boolean })
  loading = false;

  private unsubscribeConfig?: () => void;

  private config: PuduGraphConfig | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeConfig = configStore.subscribe(() => this.onUpdateConfig());
  }

  onUpdateConfig() {
    this.config = configStore.value;
    console.log("PuduGraphHeaderTop connected with config");
    this.requestUpdate();
  }

  disconnectedCallback() {
    this.unsubscribeConfig?.();
    super.disconnectedCallback();
  }

  _handleTabClick(event: MouseEvent, tabConfig: PuduGraphTabConfig) {
    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    return html`
      ${this.loading ? html`<p>Loading header...</p>` : ""}

      <div class="pg-header-top-left">
        <div class="pg-tabs-container">
          ${this.config &&
          this.config.options &&
          Array.isArray(this.config.options.tabs) &&
          this.config.options.tabs.length
            ? (this.config.options.tabs as PuduGraphTabConfig[]).map(
                (tabConfig: PuduGraphTabConfig) => html`
                  <pudu-graph-tab
                    .tab=${tabConfig}
                    @click=${(e: MouseEvent) =>
                      this._handleTabClick(e, tabConfig)}
                  ></pudu-graph-tab>
                `
              )
            : ""}
          <slot name="headerTopLeft"> </slot>
        </div>
      </div>

      <div class="pg-header-top-center">
        ${this._renderSlotOrDefault(
          "headerTopCenter",
          html`contenido de slot original`
        )}
      </div>
      <div class="pg-header-top-right">
        <slot name="headerTopRight"> </slot>
      </div>
    `;
  }

  private _renderSlotOrDefault(slotName: string, fallback: unknown) {
    return html`
      <slot
        name="${slotName}"
        @slotchange=${(e: Event) => this.requestUpdate()}
      ></slot>
      <span style="display:none;" id="${slotName}-fallback">${fallback}</span>
      ${this._isSlotEmpty(slotName) ? html`<span>${fallback}</span>` : null}
    `;
  }

  private _isSlotEmpty(slotName: string): boolean {
    const slot = this.renderRoot?.querySelector(`slot[name='${slotName}']`);
    if (!slot) return true;
    const assigned = (slot as HTMLSlotElement).assignedNodes({ flatten: true });
    return (
      assigned.length === 0 ||
      assigned.every((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          return !(n as HTMLElement).innerHTML.trim();
        }
        if (n.nodeType === Node.TEXT_NODE) {
          return !n.textContent?.trim();
        }
        return true;
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-header-top": PuduGraphHeaderTop;
  }
}
