// Importaciones de librerías externas
import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { connect } from "pwa-helpers";

// Importación de estilos
import scssStyles from "./styles/styles.scss?inline";

// Importaciones de componentes
import "./elements/tableContainer/pg-table-container";
import "./elements/debug/pg-debug";
import "./components/pg-cssvars-controller/pg-cssvars-controller";

// Importaciones de tipos y estado
import type { PGConfig, PGUIState } from "@/types";
import { store } from "@state/store";
import type { RootState } from "@state/store";
import { setConfig } from "./state/configSlice";
import { setRows } from "./state/dataSlice";
import { clearAllSelections, addGridSelection, removeGridSelection, toggleGridSelection } from "./state/gridSelectionSlice";
import debounce from "./utils/debounce";
import { assignUniqueIds } from "./utils/assignIds";

@customElement("pudu-graph")
export class PuduGraph extends connect(store)(LitElement) {
  private config: PGConfig | null = null;
  private data: any[] = [];
  private uiState: PGUIState = {};

  static styles = [unsafeCSS(scssStyles)];

  @property({ type: Boolean })
  loading = false;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
  }

  public initialize(newConfig: PGConfig) {
    // Asignar IDs únicos a todos los elementos
    const configWithIds = {
      ...newConfig,
      data: assignUniqueIds(newConfig.data)
    };
    
    store.dispatch(setConfig(configWithIds));
    store.dispatch(setRows(configWithIds.data));
    this.debouncedRequestUpdate();
  }

  public setLoading(loading: boolean) {
    this.loading = loading;
  }

  // API pública para comunicación externa
  public clearGridSelections() {
    store.dispatch(clearAllSelections());
  }

  public getGridSelectionCount(): number {
    const state = store.getState();
    return state.gridSelection.selections.length;
  }

  public getGridSelections() {
    const state = store.getState();
    return state.gridSelection.selections;
  }

  public addGridSelection(rowIndex: number, dayIndex: number) {
    store.dispatch(addGridSelection({ rowIndex, dayIndex }));
  }

  public removeGridSelection(rowIndex: number, dayIndex: number) {
    store.dispatch(removeGridSelection({ rowIndex, dayIndex }));
  }

  public toggleGridSelection(rowIndex: number, dayIndex: number) {
    store.dispatch(toggleGridSelection({ rowIndex, dayIndex }));
  }

  private debouncedRequestUpdate(delay = 100) {
    debounce(() => this.requestUpdate(), delay);
  }

  render() {
    return html`
      <pg-cssvars-controller class="pg-container">
        <pg-table-container> </pg-table-container>

        ${this.loading ? html`<p>Loading...</p>` : ""}
      </pg-cssvars-controller>

      <pg-debug></pg-debug>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph": PuduGraph;
  }
}
