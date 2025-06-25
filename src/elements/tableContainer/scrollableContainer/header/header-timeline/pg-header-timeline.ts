import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-header-timeline.css?inline";
import type { RootState } from "../../../../../state/store";
import type {
  PuduGraphConfig,
  PuduGraphUIState,
} from "../../../../../types/types";
import { connect } from "pwa-helpers";
import { store } from "../../../../../state/store";
import getISOWeek from "../../../../../utils/getISOWeek";

@customElement("pg-header-timeline")
export class PuduGraphHeaderTimeline extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PuduGraphConfig | null = null;
  private data: any[] = [];
  private uiState: PuduGraphUIState | null = null;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    this.requestUpdate();
  }

  getHeaderItems() {
    if (!this.config || !this.uiState) return [];

    const { startUnix, endUnix } = this.config.options;

    if (!startUnix || !endUnix) {
      console.warn(
        "StartUnix y endUnix no están definidos en las opciones de configuración."
      );
      return [];
    }

    const totalDuration = endUnix - startUnix;
    const hours = Math.floor(totalDuration / 3600);
    const days = Math.floor(hours / 24);

    const headerItems = [];
    for (let i = 0; i < days; i++) {
      const dayStart = startUnix + i * 24 * 3600;
      const dayEnd = dayStart + 24 * 3600;
      const hourLabels = [];
      for (let j = 0; j < 24; j++) {
        const hourStart = dayStart + j * 3600;
        //HH:MM format
        const hourLabel = new Date(hourStart * 1000)
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .padStart(5, "0");
        hourLabels.push(hourLabel);
      }

      headerItems.push({
        localDate: new Date(dayStart * 1000).toLocaleDateString(),
        monthNumber: new Date(dayStart * 1000).getMonth(),
        dayNumber: new Date(dayStart * 1000).getDate(),
        isoWeekNumber: getISOWeek(new Date(dayStart * 1000)),
        show: true,
        hours: hourLabels,
        startUnix: dayStart,
        endUnix: dayEnd,
      });
    }

    // Agrupar por mes, en objetos, con el titulo del mes y los días
    const headerItemsByMonth = headerItems.reduce((acc, item) => {
      const month = item.monthNumber;
      if (!acc[month]) {
        acc[month] = {
          monthName: new Date(item.startUnix * 1000).toLocaleString("default", {
            month: "long",
          }),
          days: [],
        };
      }
      acc[month].days.push(item);
      return acc;
    }, {});
    console.log("Header Items by Month:", headerItemsByMonth);
    // Convertir el objeto a un array
    return Object.values(headerItemsByMonth);
  }

  render() {
    const headerItems = this.getHeaderItems();
    console.log("Header Items:", headerItems);

    return html`
      <div class="pg-header-timeline">
        ${headerItems.map(
          (month) => html`
            <div class="month-header">
              <div class="month-title-container">
              <div class="month-title">
                ${month.monthName}
              </div>
              </div>
              <div class="days-container">
                ${month.days.map(
                  (day) => html`
                    <div class="day-header">
                      <div class="day-title">
                        ${day.dayNumber}
                      </div>
                    </div>
                  `
                )}
              </div>
            </div>
          `
        )}
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-header-timeline": PuduGraphHeaderTimeline;
  }
}
