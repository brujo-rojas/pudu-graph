import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pg-row-sidebar.css?inline";
import { connect } from "pwa-helpers";
import { store, type RootState } from "./../../../../../state/store";
import type {
  PGConfig,
  PGSidebarColumn,
} from "../../../../../types";

@customElement("pg-row-sidebar")
export class PuduGraphRowSidebar extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  // private data: any[] = [];
 private uiState: PuduGraphUIState = {};

  stateChanged(state: RootState): void {
    console.log("stateChanged", state);
    this.config = state.config;
    // this.data = state.data;
    this.uiState = state.uiState;
  }

  @property({ type: Object })
  public itemRow: any;

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
                ${column.type === "text"
                  ? html`<span class="row-column-text"
                      >${this.itemRow[column.field]}</span
                    >`
                  : html`<input
                      type="text"
                      class="row-column-input"
                      value="${this.itemRow[column.id] || ""}"
                      @input="${(e: InputEvent) => {
                        const target = e.target as HTMLInputElement;
                        this.itemRow[column.id] = target.value;
                        //store.dispatch(setRows([...store.getState().data]));
                      }}"
                    />`}
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
    "pg-row-sidebar": PuduGraphRowSidebar;
  }
}
