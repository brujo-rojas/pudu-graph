import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-grid-background.css?inline";

@customElement("pudu-graph-grid-background")
export class PuduGraphGridBackground extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-grid-background": PuduGraphGridBackground;
  }
}
