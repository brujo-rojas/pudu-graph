import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-sidebar.css?inline";

import { connect } from "pwa-helpers";
// Update the import path if the store file is located elsewhere, for example:
import { store } from "../../../../state/store";
// Or, if the file does not exist, create 'store.ts' in the correct directory with the necessary exports.
import type { RootState } from "../../../../state/store";
import type { PGConfig } from "../../../../types";

import "./rowSidebar/pg-row-sidebar";

@customElement("pg-sidebar")
export class PuduGraphSidebar extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];
  private config: PGConfig | null = null;
  private data: any[] = [];
 private uiState: PuduGraphUIState = {};

  stateChanged(state: RootState): void {
    console.log("stateChanged", state);
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  render() {
    return html`
      ${this.data.map(
        (item: any) => html`<pg-row-sidebar .itemRow=${item}></pg-row-sidebar>`
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-sidebar": PuduGraphSidebar;
  }
}
