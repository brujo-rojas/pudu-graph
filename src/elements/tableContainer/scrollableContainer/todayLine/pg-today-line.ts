import { LitElement, html, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PuduGraphConfig } from "../../../../types";
import cssStyles from "./pg-today-line.css?inline";

@customElement("pg-today-line")
export class PuduGraphTodayLine extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  config: PuduGraphConfig = { options: {}, data: [] };

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-today-line": PuduGraphTodayLine;
  }
}
