import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-grid-container.css?inline";

import "./gridBackground/pg-grid-background";
import "./mouseoverLight/pg-mouseover-light";
import "./selectionLight/pg-selection-light";
import "./floatDetails/pg-float-details";
import "./floatboxContainer/pg-floabox-container";

@customElement("pg-grid-container")
export class PuduGraphGridContainer extends LitElement {
  static styles = unsafeCSS(cssStyles);

  render() {
    return html`
      <pg-grid-background></pg-grid-background>
      <pg-mouseover-light></pg-mouseover-light>
      <pg-selection-light></pg-selection-light>
      <pg-float-details></pg-float-details>
      <pg-floatbox-container></pg-floatbox-container>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-grid-container": PuduGraphGridContainer;
  }
}
