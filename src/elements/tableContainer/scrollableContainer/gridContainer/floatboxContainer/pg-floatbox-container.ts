import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-floatbox-container.css?inline";
import { connect } from "pwa-helpers";
import { store, type RootState } from "../../../../../state/store";
import type {
  PGItemData,
  PGConfig,
  PuduGraphRowData,
  PuduGraphUIState,
} from "../../../../../types";

import "./floatbox/pg-floatbox";

@customElement("pg-floatbox-container")
export class PuduGraphFloatboxContainer extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private data: PuduGraphRowData[] = [];
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
      <slot></slot>
      ${this.data.flatMap((row: PuduGraphRowData) =>
        (row.rowData ?? []).map(
          (item: PGItemData, index: number) => html`
            <pg-floatbox
              .itemData="${item}"
              .rowData="${row}"
              .rowIndex=${index}
            ></pg-floatbox>
          `
        )
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-floatbox-container": PuduGraphFloatboxContainer;
  }
}
