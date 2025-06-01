import { LitElement, html, unsafeCSS} from "lit-element";
import { customElement } from "lit/decorators.js";
import { property } from "lit/decorators.js";
import type { PuduGraphTabConfig } from "./src/types";

import cssStyles from "./pudu-graph-tab.css?inline";

@customElement("pudu-graph-tab")
export class PuduGraphTab extends LitElement {
  static styles = [ unsafeCSS(cssStyles) ]

  @property({ type: Object })
  tab: PuduGraphTabConfig;

  @property({ type: Boolean })
  active = false;

  render() {
    return html`
      <div>
        <slot>
          <h3>${this.tab.title}</h3>
        </slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-tab": PuduGraphTab;
  }
}
