import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-grid-container.css?inline";

import "./gridBackground/pudu-graph-grid-background";
import "./mouseoverLight/pudu-graph-mouseover-light";
import "./selectionLight/pudu-graph-selection-light";
import "./floatDetails/pudu-graph-float-details";
import "./floatboxContainer/pudu-graph-floabox-container";

@customElement("pudu-graph-grid-container")
export class PuduGraphGridContainer extends LitElement {
  static styles = unsafeCSS(cssStyles);

  render() {
    return html`
      <pudu-graph-grid-background></pudu-graph-grid-background>
      <pudu-graph-mouseover-light></pudu-graph-mouseover-light>
      <pudu-graph-selection-light></pudu-graph-selection-light>
      <pudu-graph-float-details></pudu-graph-float-details>
      <pudu-graph-floatbox-container></pudu-graph-floatbox-container>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-grid-container": PuduGraphGridContainer;
  }
}
