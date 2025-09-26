import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-header-timeline.scss?inline";
import type { RootState } from "@state/store";
import type { HeaderItem, PGConfig, PGUIState } from "@/types";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import getISOWeek from "../../../utils/getISOWeek";

type AccItem = Record<number, { monthName: string; days: HeaderItem[] }>;

@customElement("pg-header-timeline")
export class PuduGraphHeaderTimeline extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;
  private data: any[] = [];
  private uiState: PGUIState | null = null;
  private mousePosition: any = null;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.data = state.data;
    this.uiState = state.uiState;
    this.mousePosition = state.mousePosition;
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

    const DAY = 24 * 3600;
    const totalDays = Math.ceil((endUnix - startUnix) / DAY);


    const headerItems: HeaderItem[] = [];

    for (let i = 0; i <= totalDays; i++) {
      const dayStart = startUnix + i * DAY;
      const dayEnd = dayStart + DAY;

      // Usar Date con 'UTC' para evitar desfases de zona horaria local
      const date = new Date(dayStart * 1000);
      const utcMonth = date.getUTCMonth();
      const utcDate = date.getUTCDate();
      
      if (i < 5 || i > totalDays - 5) { // Log solo los primeros y últimos 5 días
      }

      headerItems.push({
        localDate: date.toISOString().slice(0, 10), // YYYY-MM-DD en UTC
        monthNumber: utcMonth,
        dayNumber: utcDate,
        isoWeekNumber: getISOWeek(
          new Date(Date.UTC(date.getUTCFullYear(), utcMonth, utcDate))
        ),
        show: true,
        hours: [],
        startUnix: dayStart,
        endUnix: dayEnd,
      });
    }

    // Agrupar por mes, en objetos, con el titulo del mes y los días
    const headerItemsByMonth = headerItems.reduce<AccItem>((acc, item) => {
      const month = item.monthNumber;

      if (!acc[month]) {
        const monthName = new Date(item.startUnix * 1000).toLocaleString("es-ES", {
          month: "long",
          timeZone: "UTC"
        });
        acc[month] = {
          monthName,
          days: [],
        };
      }
      acc[month].days.push(item);
      return acc;
    }, {});

    // Ordenar los meses y los días dentro de cada mes
    Object.values(headerItemsByMonth).forEach((monthObj) => {
      monthObj.days.sort((a, b) => a.dayNumber - b.dayNumber);
    });

    
    // Convertir el objeto a un array y ordenar por número de mes
    const sortedMonths = Object.entries(headerItemsByMonth)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([_, monthObj]) => monthObj);
    
    return sortedMonths;
  }

  private isDayHighlighted(day: HeaderItem): boolean {
    if (!this.mousePosition?.dayInfo) return false;
    
    // Comparar por fecha ISO (YYYY-MM-DD)
    return this.mousePosition.dayInfo.date === day.localDate;
  }

  render() {
    const headerItems = this.getHeaderItems();

    return html`
      <div class="pg-header-timeline">
        ${headerItems.map(
          (month) => html`
            <div class="month-header">
              <div class="month-title-container">
                <div class="month-title">${month.monthName}</div>
              </div>
              <div class="days-container">
                ${month.days.map(
                  (day) => html`
                    <div class="day-header ${this.isDayHighlighted(day) ? 'highlighted' : ''}">
                      <div class="day-title">${day.dayNumber}</div>
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
