import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-header-inputs.css?inline";

@customElement("pudu-graph-header-inputs")
export class PuduGraphHeaderInputs extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
      <div class="pg-header-inputs">
        <slot></slot>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-header-inputs": PuduGraphHeaderInputs;
  }
}
