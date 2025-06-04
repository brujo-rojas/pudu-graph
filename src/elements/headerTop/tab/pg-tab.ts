import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { property } from "lit/decorators.js";
import type { PuduGraphTabConfig } from "../types";

import cssStyles from "./pg-tab.css?inline";

@customElement("pg-tab")
export class PgTab extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  tab: PuduGraphTabConfig;

  @property({ type: Boolean, reflect: true })
  active = false;

  updated(changedProps: Map<string, unknown>) {
    super.updated?.(changedProps);
    if (changedProps.has("active")) {
      this.classList.toggle("active", this.active);
    }
  }

  render() {
    return html`
      <div>
        <span>${this.tab.title}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-tab": PgTab;
  }
}
