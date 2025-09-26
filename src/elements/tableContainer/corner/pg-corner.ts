import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-corner.css?inline";
import { connect } from "pwa-helpers";
import { store, type RootState } from "@state/store";
import type { PGConfig, PGSidebarColumn, PGUIState } from "@/types";

@customElement("pg-corner")
export class PgCorner extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  // private data: any[] = [];
  private uiState: PGUIState = {};

  stateChanged(state: RootState): void {
    this.config = state.config;
    // this.data = state.data;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="columns">
        ${this.config?.options?.sidebar?.columns?.map(
          (column: PGSidebarColumn) => html`
            <div
              class="column"
              style="--pg-local-column-width: ${column.width}px;"
            >
              <span class="column-text">${column.label}</span>
            </div>
          `
        )}
      </div>
      <slot></slot>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-corner": PgCorner;
  }
}
