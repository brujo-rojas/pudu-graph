import { LitElement, html, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-mouseover-light.css?inline";

@customElement("pudu-graph-mouseover-light")
export class PuduGraphMouseOverLight extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-mouseover-light": PuduGraphMouseOverLight;
  }
}
