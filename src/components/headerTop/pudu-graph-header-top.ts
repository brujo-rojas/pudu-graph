import { LitElement, html } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import { unsafeCSS } from "lit";
import type { PuduGraphConfig, PuduGraphTabConfig } from "../../types";
//import { tabStore } from "/src/state/tab-store";

import cssStyles from "./pudu-graph-header-top.css?inline";

import "../pudu-graph-tab/pudu-graph-tab";

/**
 * Componente de cabecera superior para Pudu Graph.
 * - Renderiza tabs y slots para headerTopLeft, headerTopCenter y headerTopRight.
 * - Permite mostrar contenido por defecto en el slot 'headerTopCenter' incluso si se pasa un elemento vacío.
 */
@customElement("pudu-graph-header-top")
export class PuduGraphHeaderTop extends LitElement {
  static styles = [unsafeCSS(cssStyles)];

  /**
   * Indica si el header está en estado de carga.
   */
  @property({ type: Boolean })
  loading = false;

  /**
   * Configuración general del header, incluyendo tabs.
   */
  @property({ type: Object })
  config: PuduGraphConfig = { tabs: [] };

  //private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();
    //this.unsubscribe = tabStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    //this.unsubscribe?.();
    super.disconnectedCallback();
  }

  /**
   * Handler para el click en tabs (por ahora solo previene propagación).
   */
  _handleTabClick(event: MouseEvent, tabConfig: PuduGraphTabConfig) {
    event.preventDefault();
    event.stopPropagation();
    //tabStore.set(tabConfig.id);
  }

  /**
   * Render principal del componente.
   * - Renderiza tabs si existen.
   * - Renderiza slots para headerTopLeft, headerTopCenter y headerTopRight.
   * - Usa lógica especial para mostrar fallback en headerTopCenter si el slot está vacío.
   */
  render() {
    return html`
      ${this.loading ? html`<p>Loading header...</p>` : ""}

      <div class="pg-header-top-left">
        <div class="pg-tabs-container">
          ${this.config.options && Array.isArray(this.config.options.tabs) &&
          this.config.options.tabs.length
            ? (this.config.options.tabs as PuduGraphTabConfig[]).map(
                (tabConfig: PuduGraphTabConfig) => html`
                  <pudu-graph-tab
                    .tab=${tabConfig}
                    @click=${(e: MouseEvent) =>
                      this._handleTabClick(e, tabConfig)}
                  ></pudu-graph-tab>
                `
              )
            : ""}
          <slot name="headerTopLeft"> </slot>
        </div>
      </div>

      <div class="pg-header-top-center">
        ${this._renderSlotOrDefault('headerTopCenter', html`contenido de slot original`)}
      </div>
      <div class="pg-header-top-right">
        <slot name="headerTopRight"> </slot>
      </div>
    `;
  }

  /**
   * Renderiza un slot y, si está vacío (o solo contiene nodos vacíos), muestra un fallback.
   * @param slotName Nombre del slot a renderizar
   * @param fallback Contenido por defecto a mostrar si el slot está vacío
   */
  private _renderSlotOrDefault(slotName: string, fallback: unknown) {
    // Renderiza el slot y si está vacío, muestra el fallback
    return html`
      <slot name="${slotName}" @slotchange=${(e: Event) => this.requestUpdate()}></slot>
      <span style="display:none;" id="${slotName}-fallback">${fallback}</span>
      ${this._isSlotEmpty(slotName)
        ? html`<span>${fallback}</span>`
        : null}
    `;
  }

  /**
   * Determina si un slot está vacío o solo contiene nodos vacíos (texto en blanco o elementos sin contenido).
   * @param slotName Nombre del slot a verificar
   * @returns true si el slot está vacío o solo tiene nodos vacíos
   */
  private _isSlotEmpty(slotName: string): boolean {
    const slot = this.renderRoot?.querySelector(`slot[name='${slotName}']`);
    if (!slot) return true;
    const assigned = (slot as HTMLSlotElement).assignedNodes({flatten: true});
    // Si no hay nodos asignados o todos son nodos vacíos
    return assigned.length === 0 || assigned.every(n => {
      if (n.nodeType === Node.ELEMENT_NODE) {
        // Si el elemento no tiene contenido visible
        return !(n as HTMLElement).innerHTML.trim();
      }
      if (n.nodeType === Node.TEXT_NODE) {
        // Si el texto está vacío o es solo espacios
        return !n.textContent?.trim();
      }
      return true;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pudu-header-top": PuduGraphHeaderTop;
  }
}
