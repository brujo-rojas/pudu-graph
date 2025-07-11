import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import type { PGConfig } from "@/types";
import cssStyles from "./pg-today-line.css?inline";
import { connect } from "pwa-helpers";
import { store } from "@state/store";
import type { RootState } from "@state/store";

@customElement("pg-today-line")
export class PuduGraphTodayLine extends connect(store)(LitElement) {
  static styles = [unsafeCSS(cssStyles)];

  private config: PGConfig | null = null;

  stateChanged(state: RootState): void {
    this.config = state.config;
    this.updateTodayLinePosition();
  }

  private updateTodayLinePosition() {
    const startUnix = this.config?.options.startUnix;
    if (!startUnix) return;
    const DAY = 24 * 3600;
    const todayUnix = Math.floor(Date.now() / 1000);
    const days = Math.max(0, Math.ceil((todayUnix - startUnix) / DAY) - 1);
    this.style.setProperty("--pg-today-line-position", `${days}`);
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-today-line": PuduGraphTodayLine;
  }
}
