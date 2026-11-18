import { createContext, useContext } from "react";

// Dados já preparados (unidades e protocolos) e a ação de abrir a ficha de uma congregação.
export const PainelContext = createContext(null);
export const usePainel = () => useContext(PainelContext);
