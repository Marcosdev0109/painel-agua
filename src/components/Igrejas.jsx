import { useState } from "react";
import { brl, semAcento } from "../lib/formato.js";
import { ehCorte, protocolosDaUnidade } from "../lib/regras.js";
import { usePainel } from "../PainelContext.js";
import { Cabecalho, Vazio } from "./Comuns.jsx";
import { IconeBusca, IconeEmail, IconeSeta } from "./Icones.jsx";

const FILTROS = [["todas", "Todas"], ["vencida", "Vencidas"], ["a-vencer", "A vencer"], ["sem", "Sem fatura"]];
const GRUPOS = [["vencida", "Com fatura vencida"], ["a-vencer", "Só faturas a vencer"], ["sem", "Sem fatura lançada"]];

function ItemIgreja({ u }) {
  const { abrir, protocolos } = usePainel();
  const nProt = protocolosDaUnidade(u, protocolos).length;
  return (
    <button className="item" onClick={() => abrir(u.nome)}>
      <span className={"ponto " + u.estado} />
      <span className="nm">
        <b>
          {u.nome}
          {nProt > 0 && <span className="tag-prot" title="Solicitações na CASAN"><IconeEmail /> {nProt}</span>}
          {u.corte && <span className="selo vencida">{ehCorte(u.corte) ? "cortada" : "corte"}</span>}
        </b>
        <small>{u.matricula ? "UC " + u.matricula : "sem matrícula"}{u.fornecedor !== "CASAN" ? " · " + u.fornecedor : ""}</small>
      </span>
      <span className="vl">
        {u.estado === "sem" ? <small>sem fatura</small> : (
          <>
            <b>{brl(u.totAberto)}</b>
            {u.maiorAtraso ? <small className="atraso">{u.maiorAtraso} dias de atraso</small> : <small>a vencer</small>}
          </>
        )}
      </span>
      <IconeSeta />
    </button>
  );
}

export default function Igrejas() {
  const { unidades: U } = usePainel();
  const [filtro, setFiltro] = useState("todas");
  const [termo, setTermo] = useState("");

  const contagem = { todas: U.length, vencida: 0, "a-vencer": 0, sem: 0 };
  U.forEach((u) => contagem[u.estado]++);

  const t = semAcento(termo), digitos = termo.replace(/\D/g, "");
  const visiveis = U.filter((u) => {
    if (filtro !== "todas" && u.estado !== filtro) return false;
    return !t || semAcento(u.nome).includes(t) || (digitos && String(u.matricula).replace(/\D/g, "").includes(digitos));
  });

  const grupos = GRUPOS.map(([estado, titulo]) => {
    const lista = visiveis.filter((u) => u.estado === estado)
      .sort((a, b) => b.totAberto - a.totAberto || a.nome.localeCompare(b.nome, "pt-BR"));
    return { estado, titulo, lista, soma: lista.reduce((s, u) => s + u.totAberto, 0) };
  }).filter((g) => g.lista.length);

  return (
    <>
      <Cabecalho titulo="Congregações" subtitulo={U.length + " unidades consumidoras"} />
      <label className="busca">
        <IconeBusca />
        <input type="search" value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Nome ou matrícula" aria-label="Buscar congregação ou matrícula" />
      </label>
      <div className="segs">
        {FILTROS.map(([id, rotulo]) => (
          <button key={id} className="seg" aria-pressed={filtro === id} onClick={() => setFiltro(id)}>
            {rotulo}<i>{contagem[id]}</i>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {grupos.length ? grupos.map((g) => (
          <div key={g.estado}>
            <div className="grupo-t"><h3>{g.titulo}</h3><span>{g.lista.length}{g.soma ? " · " + brl(g.soma) : ""}</span></div>
            <div className="lista">{g.lista.map((u) => <ItemIgreja key={u.nome} u={u} />)}</div>
          </div>
        )) : <Vazio>Nenhuma congregação encontrada.</Vazio>}
      </div>
    </>
  );
}
