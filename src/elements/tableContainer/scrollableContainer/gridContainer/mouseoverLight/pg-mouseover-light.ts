import { LitElement, html, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-mouseover-light.css?inline";

@customElement("pg-mouseover-light")
export class PuduGraphMouseOverLight extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pg-mouseover-light": PuduGraphMouseOverLight;
  }
}
