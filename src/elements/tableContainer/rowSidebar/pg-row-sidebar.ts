import { LitElement, html, unsafeCSS, type TemplateResult } from "lit";
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
    this.config = state.config;
    // this.data = state.data;
    this.uiState = state.uiState;
  }

  @property({ type: Object })
  public itemRow!: PGRowData;

  private renderColumnInput(column: PGSidebarColumn, value: string): TemplateResult | null {
    if (!column) return null;
    
    switch (column.type) {
      case "text":
        return html`<span class="row-column-text">${value || ''}</span>`;
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
        // Ensure the return is always a TemplateResult or null
        return column.render
          ? html`${column.render(this.itemRow, column, this)}`
          : null;
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
    if (!column || !this.itemRow) return;
    
    const target = e.target as HTMLInputElement;
    const fieldKey = column.field ?? column.id;
    
    if (this.itemRow.values && fieldKey) {
      this.itemRow.values[fieldKey] = target.value;
    }
    //store.dispatch(setRows([...store.getState().data]));
  }

  render(): TemplateResult | null {
    if (!this.itemRow) {
      return html`<div class="pg-row-sidebar-container">No data</div>`;
    }

    return html`
      <div class="pg-row-sidebar-container">
        <div class="row-title">
          <span> ${this.itemRow.label || 'Untitled'} </span>
        </div>

        <div class="row-content">
          ${this.config?.options?.sidebar?.columns?.map(
            (column: PGSidebarColumn) => {
              if (!column) return null;
              
              const fieldKey = column.field ?? column.id;
              const value = this.itemRow.values?.[fieldKey];
              
              return html`
                <div
                  class="row-column"
                  style="--pg-local-column-width: ${column.width || 100}px;"
                >
                  ${this.renderColumnInput(column, value)}
                </div>
              `;
            }
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
