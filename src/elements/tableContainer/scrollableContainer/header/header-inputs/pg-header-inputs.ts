import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-header-inputs.css?inline";

@customElement("pg-header-inputs")
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
    "pg-header-inputs": PuduGraphHeaderInputs;
  }
}
