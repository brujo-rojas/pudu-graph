import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-floatbox-container.css?inline";
import { connect } from "pwa-helpers";
import { store, type RootState } from "@state/store";
import type { PGItemData, PGConfig, PGRowData, PGUIState } from "@/types";

import "../floatbox/pg-floatbox";

@customElement("pg-floatbox-container")
export class PuduGraphFloatboxContainer extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private data: PGRowData[] = [];
  private uiState: PGUIState = {};
  private itemsWithLevels: Array<{
    row: PGRowData;
    index: number;
    items: (PGItemData & { overlapLevel: number })[];
  }> = [];

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    // Prepara los datos con niveles de solapamiento
    const itemHeight = this.config?.options.itemHeight ?? 60;
    const flexBoxHeight = this.config?.options.flexBoxHeight ?? 20;

    const maxLevels = Math.floor(itemHeight / flexBoxHeight);
    this.itemsWithLevels = this.data.map((row, index) => ({
      row,
      index,
      items: this.assignOverlapLevels(row.rowData ?? [], maxLevels),
    }));
    this.requestUpdate();
  }

  /**
   * Asigna niveles de solapamiento a los items de un row (0, 1, 2, ...)
   */
  private assignOverlapLevels(
    items: PGItemData[],
    maxLevels = 5
  ): (PGItemData & { overlapLevel: number })[] {
    const sorted = [...items].sort((a, b) => a.startUnix - b.startUnix);
    const levelEnds: number[] = Array(maxLevels).fill(-Infinity);
    return sorted.map((item) => {
      let level = 0;
      for (; level < maxLevels - 1; level++) {
        if (item.startUnix >= levelEnds[level]) break;
      }
      levelEnds[level] = item.endUnix;
      return { ...item, overlapLevel: level };
    });
  }

  render() {
    return html`
      <slot></slot>
      ${this.itemsWithLevels.map(({ row, index, items }) =>
        items.map(
          (item: PGItemData & { overlapLevel: number }) => html`
            <pg-floatbox
              .itemData="${item}"
              .rowData="${row}"
              .rowIndex=${index}
              .overlapLevel=${item.overlapLevel}
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
