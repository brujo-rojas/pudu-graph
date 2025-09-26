import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PGConfig } from "@/types";
import cssStyles from "./pg-horizontal-plots-container.css?inline";

@customElement("pg-horizontal-plots-container")
export class PuduGraphHorizontalPlotsContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  config: PGConfig = { options: {}, data: [] };

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-horizontal-plots-container": PuduGraphHorizontalPlotsContainer;
  }
}
