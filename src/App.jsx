import { useEffect, useMemo, useState } from "react";
import { PainelContext } from "./PainelContext.js";
import { gerarDemo, DOCUMENTO_FICTICIO } from "./data/demo.js";
import { hojeISO } from "./lib/formato.js";
import { prepararUnidades } from "./lib/regras.js";
import { AvisoDemo } from "./components/Comuns.jsx";
import Abas from "./components/Abas.jsx";
import Inicio from "./components/Inicio.jsx";
import Igrejas from "./components/Igrejas.jsx";

const DISPONIVEIS = ["inicio", "igrejas"];
const telaDoEndereco = () => (DISPONIVEIS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "inicio");

export default function App() {
  const [tela, setTela] = useState(telaDoEndereco);

  const dados = useMemo(() => {
    const hoje = hojeISO();
    const demo = gerarDemo(hoje);
    return { unidades: prepararUnidades(demo.unidades, hoje, DOCUMENTO_FICTICIO), protocolos: demo.protocolos };
  }, []);

  useEffect(() => {
    const aoMudar = () => setTela(telaDoEndereco());
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);

  const trocar = (t) => {
    history.replaceState(null, "", "#" + t);
    setTela(t);
    window.scrollTo(0, 0);
  };

  const contexto = { ...dados, abrir: () => {} };

  return (
    <PainelContext.Provider value={contexto}>
      <div className="app">
        <section className="tela">
          <AvisoDemo />
          {tela === "inicio" && <Inicio />}
          {tela === "igrejas" && <Igrejas />}
        </section>
      </div>
      <Abas atual={tela} aoTrocar={trocar} disponiveis={DISPONIVEIS} />
    </PainelContext.Provider>
  );
}
