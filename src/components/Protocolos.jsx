import { usePainel } from "../PainelContext.js";
import { Cabecalho, Vazio } from "./Comuns.jsx";
import { ProtocoloDetalhe } from "./Ficha.jsx";

export default function Protocolos() {
  const { protocolos } = usePainel();
  return (
    <>
      <Cabecalho titulo="Protocolos" subtitulo="Pedidos abertos na CASAN e as respostas por e-mail" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {protocolos.length
          ? protocolos.map((p) => (
              <div className="bloco" key={p.protocolo}>
                <h2 style={{ fontSize: 19 }}>{p.congregacao}</h2>
                <ProtocoloDetalhe p={p} />
              </div>
            ))
          : <div className="bloco"><Vazio>Nenhum protocolo registrado.</Vazio></div>}
      </div>
    </>
  );
}
