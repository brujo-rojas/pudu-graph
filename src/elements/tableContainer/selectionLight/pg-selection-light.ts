import { LitElement, html, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-selection-light.css?inline";

@customElement("pg-selection-light")
export class PuduGraphSelectionLight extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-selection-light": PuduGraphSelectionLight;
  }
}
