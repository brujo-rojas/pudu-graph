import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-float-details.css?inline";

@customElement("pg-float-details")
export class PuduGraphFloatDetails extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html` <slot> </slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-float-details": PuduGraphFloatDetails;
  }
}
