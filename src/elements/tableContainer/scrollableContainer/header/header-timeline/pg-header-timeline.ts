import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import cssStyles from "./pg-header-timeline.css?inline";

@customElement("pg-header-timeline")
export class PuduGraphHeaderTimeline extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  render() {
    return html`
      <div class="pg-header-timeline">
        <slot></slot>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "pg-header-timeline": PuduGraphHeaderTimeline;
  }
}
