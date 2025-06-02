import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-float-details.css?inline";

@customElement("pudu-graph-float-details")
export class PuduGraphFloatDetails extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html` <slot> </slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-float-details": PuduGraphFloatDetails;
  }
}
