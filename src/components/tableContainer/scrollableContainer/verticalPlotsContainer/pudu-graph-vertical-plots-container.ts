import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PuduGraphConfig } from "../../../../types";
import cssStyles from "./pudu-graph-vertical-plots-container.css?inline";

@customElement("pudu-graph-vertical-plots-container")
export class PuduGraphVerticalPlotsContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  config: PuduGraphConfig = { options: {}, data: [] };

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-vertical-plots-container": PuduGraphVerticalPlotsContainer;
  }
}
