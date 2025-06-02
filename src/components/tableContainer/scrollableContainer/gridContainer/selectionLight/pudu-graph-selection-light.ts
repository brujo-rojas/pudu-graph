import { LitElement, html, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-selection-light.css?inline";

@customElement("pudu-graph-selection-light")
export class PuduGraphSelectionLight extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-selection-light": PuduGraphSelectionLight;
  }
}
