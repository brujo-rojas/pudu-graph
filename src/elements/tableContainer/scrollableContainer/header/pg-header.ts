import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-header.css?inline";

import "./header-timeline/pg-header-timeline";
import "./header-inputs/pg-header-inputs";

@customElement("pg-header")
export class PuduGraphHeader extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
      <div class="pg-header">
        <pg-header-timeline></pg-header-timeline>
        <pg-header-inputs></pg-header-inputs>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-header": PuduGraphHeader;
  }
}
