import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-row-sidebar.css?inline";
import { connect } from "pwa-helpers";
import { store, type RootState } from "@state/store";
import type { PGConfig, PGRowData, PGSidebarColumn, PGUIState } from "@/types";

@customElement("pg-row-sidebar")
export class PGRowSidebar extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  // private data: any[] = [];
  private uiState: PGUIState = {};

  stateChanged(state: RootState): void {
    console.log("stateChanged", state);
    this.config = state.config;
    // this.data = state.data;
    this.uiState = state.uiState;
  }

  @property({ type: Object })
  public itemRow!: PGRowData;

  private renderColumnInput(column: PGSidebarColumn, value: any) {
    switch (column.type) {
      case "text":
        return html`<span class="row-column-text">${value}</span>`;
      case "number":
        return html`<input
          type="number"
          class="row-column-input"
          .value=${value ?? ""}
          @input=${(e: InputEvent) => this.handleInput(e, column)}
        />`;
      case "hours":
        return html`<input
          type="time"
          class="row-column-input"
          .value=${value ?? ""}
          @input=${(e: InputEvent) => this.handleInput(e, column)}
        />`;
      case "custom":
        return column.render ? column.render(this.itemRow, column, this) : null;
      default:
        return html`<input
          type="text"
          class="row-column-input"
          .value=${value ?? ""}
          @input=${(e: InputEvent) => this.handleInput(e, column)}
        />`;
    }
  }

  private handleInput(e: InputEvent, column: PGSidebarColumn) {
    const target = e.target as HTMLInputElement;
    this.itemRow.values[column.id] = target.value;
    //store.dispatch(setRows([...store.getState().data]));
  }

  render() {
    return html`
      <div class="pg-row-sidebar-container">
        <div class="row-title">
          <span> ${this.itemRow.label} </span>
        </div>

        <div class="row-content">
          ${this.config?.options?.sidebar?.columns?.map(
            (column: PGSidebarColumn) => html`
              <div
                class="row-column"
                style="--pg-local-column-width: ${column.width}px;"
              >
                ${this.renderColumnInput(
                  column,
                  this.itemRow.values[column.field ?? column.id]
                )}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-row-sidebar": PGRowSidebar;
  }
}
