import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-corner.css?inline";

@customElement("pudu-graph-corner")
export class PuduGraphCorner extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
      <div class="pg-corner">
        <slot></slot>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-corner": PuduGraphCorner;
  }
}
