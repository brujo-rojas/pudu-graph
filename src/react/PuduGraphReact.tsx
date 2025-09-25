import * as React from "react";
import { createComponent } from "@lit-labs/react";
// Importar el componente PuduGraph desde el módulo
import { PuduGraph as PuduGraphElement } from "../pudu-graph";

/**
 * Wrapper React para el web component <pudu-graph> usando @lit-labs/react.
 * Permite usarlo como <PuduGraphReact loading={true} ref={ref} /> en React.
 */
export const PuduGraphReact = createComponent({
  react: React,
  tagName: "pudu-graph",
  elementClass: PuduGraphElement,
  events: {},
  displayName: "PuduGraphReact",
  // Puedes mapear más props aquí si tu componente las expone
  // e.g. props: { loading: "loading" }
  //aa
});

export default PuduGraphReact;
