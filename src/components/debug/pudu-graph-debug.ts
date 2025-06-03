import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { tabStore } from "../../state/tab-store";
import { configStore } from "../../state/config-store";

@customElement("pudu-graph-debug")
export class PuduGraphDebug extends LitElement {

  private unsubscribeConfig?: () => void;
  private unsubscribeTabSelected?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeConfig = configStore.subscribe(() => this.requestUpdate());
    this.unsubscribeTabSelected = tabStore.subscribe(() =>
      this.requestUpdate()
    );
  }

  disconnectedCallback() {
    this.unsubscribeConfig?.();
    this.unsubscribeTabSelected?.();
    super.disconnectedCallback();
  }

  render() {
    return html`<div>
      <pre> ${JSON.stringify(tabStore.value, null, 2)}</pre>
      <pre> ${JSON.stringify(configStore.value, null, 2)}</pre>
    </div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-graph-debug": PuduGraphDebug;
  }
}
