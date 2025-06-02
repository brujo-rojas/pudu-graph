import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssStyles from "./pudu-graph-table-container.css?inline";
import type { PuduGraphConfig } from "../../types";
import "./corner/pudu-graph-corner";
import "./scrollableContainer/pudu-graph-scrollable-container";

@customElement("pudu-graph-table-container")
export class PuduGraphTableContainer extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  @property({ type: Object })
  config: PuduGraphConfig = { options: {}, data: [] };

  render() {
    return html`
        <pudu-graph-corner ></pudu-graph-corner></pudu-graph-corner>
        <pudu-graph-scrollable-container  ></pudu-graph-scrollable-container>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-table-container": PuduGraphTableContainer;
  }
}
