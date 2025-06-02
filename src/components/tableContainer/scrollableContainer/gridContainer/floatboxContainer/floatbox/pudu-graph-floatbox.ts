import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pudu-graph-floatbox.css?inline";

@customElement("pudu-graph-floatbox")
export class PuduGraphFloatbox extends LitElement {
  static styles = [unsafeCSS(cssStyles)];
  render() {
    return html`<div class="pudu-graph-floatbox"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-floatbox": PuduGraphFloatbox;
  }
}
