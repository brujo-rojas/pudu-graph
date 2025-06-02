import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-header.css?inline";

import "./header-timeline/pudu-graph-header-timeline";
import "./header-inputs/pudu-graph-header-inputs";

@customElement("pudu-graph-header")
export class PuduGraphHeader extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
      <div class="pg-header">
        <pudu-graph-header-timeline></pudu-graph-header-timeline>
        <pudu-graph-header-inputs></pudu-graph-header-inputs>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-header": PuduGraphHeader;
  }
}
