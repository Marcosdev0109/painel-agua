import { useEffect, useMemo, useState } from "react";
import { PainelContext } from "./PainelContext.js";
import { gerarDemo, DOCUMENTO_FICTICIO } from "./data/demo.js";
import { hojeISO } from "./lib/formato.js";
import { prepararUnidades } from "./lib/regras.js";
import { AvisoDemo } from "./components/Comuns.jsx";
import Abas, { TELAS } from "./components/Abas.jsx";
import Inicio from "./components/Inicio.jsx";
import Igrejas from "./components/Igrejas.jsx";
import Ficha from "./components/Ficha.jsx";
import Relatorios from "./components/Relatorios.jsx";
import Protocolos from "./components/Protocolos.jsx";

const telaDoEndereco = () => (TELAS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "inicio");

export default function App() {
  const [tela, setTela] = useState(telaDoEndereco);
  const [aberta, setAberta] = useState(null); // nome da congregação com a ficha aberta
  const [aviso, setAviso] = useState("");

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

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  const contexto = { ...dados, abrir: setAberta };
  const unidadeAberta = dados.unidades.find((u) => u.nome === aberta);

  return (
    <PainelContext.Provider value={contexto}>
      <div className="app">
        <section className="tela">
          <AvisoDemo />
          {tela === "inicio" && <Inicio />}
          {tela === "igrejas" && <Igrejas />}
          {tela === "relatorios" && <Relatorios />}
          {tela === "protocolos" && <Protocolos />}
        </section>
      </div>
      <Abas atual={tela} aoTrocar={trocar} />
      {unidadeAberta && <Ficha key={unidadeAberta.nome} u={unidadeAberta} aoFechar={() => setAberta(null)} avisar={setAviso} />}
      {aviso && <div className="toast" role="status">{aviso}</div>}
    </PainelContext.Provider>
  );
}
