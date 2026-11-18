import { brl, brlCurto, plural } from "../lib/formato.js";
import { ehCorte } from "../lib/regras.js";
import { usePainel } from "../PainelContext.js";
import { Agenda, BarrasAberto, Cabecalho, Vazio } from "./Comuns.jsx";
import { GotaMarca, IconeAlerta } from "./Icones.jsx";

function Resumo() {
  const { unidades: U, protocolos: P } = usePainel();
  const vencido = U.reduce((s, u) => s + u.totVencido, 0);
  const aVencer = U.reduce((s, u) => s + u.totAVencer, 0);
  const nIgrejas = U.filter((u) => u.vencidas.length).length;
  const nFaturas = U.reduce((s, u) => s + u.vencidas.length, 0);
  const proxima = U.flatMap((u) => u.aVencer).sort((a, b) => (a.vencISO < b.vencISO ? -1 : 1))[0];
  const andamento = P.filter((p) => p.status === "aguardando" || p.status === "revisao").length;
  const [reais, centavos = "00"] = brl(vencido).replace(/ /g, " ").split(",");

  return (
    <div className="medidor">
      <div className="kpi-top">
        <span className="kpi-rot">Total vencido em aberto</span>
        <span className="kpi-pill">
          {nFaturas} {plural(nFaturas, "fatura", "faturas")} · {nIgrejas} {plural(nIgrejas, "congregação", "congregações")}
        </span>
      </div>
      <div className="kpi-valor" aria-label={brl(vencido)}>{reais}<small>,{centavos}</small></div>
      <div className="kpi-grid">
        <div><span>A vencer</span><b>{brlCurto(aVencer)}</b></div>
        <div><span>Próximo vencimento</span><b>{proxima ? proxima.venc.slice(0, 5) : "—"}</b></div>
        <div><span>Pedidos em andamento</span><b>{andamento}</b></div>
      </div>
    </div>
  );
}

export function Alerta({ u, comoBotao = true }) {
  const { abrir } = usePainel();
  const titulo = ehCorte(u.corte) ? "Água cortada" : "Risco de corte";
  const conteudo = (
    <>
      <span className="ic"><IconeAlerta /></span>
      <span><b>{comoBotao ? `${titulo} · ${u.nome}` : titulo}</b><span>{u.corte}</span></span>
    </>
  );
  return comoBotao
    ? <button className="alerta" onClick={() => abrir(u.nome)}>{conteudo}</button>
    : <div className="alerta" style={{ cursor: "default" }}>{conteudo}</div>;
}

export default function Inicio() {
  const { unidades: U } = usePainel();
  const comAlerta = U.filter((u) => u.corte);
  const vencimentos = U.flatMap((u) => u.faturas.map((f) => ({ u, f })))
    .sort((a, b) => (a.f.vencISO < b.f.vencISO ? -1 : 1));
  const maiores = U.filter((u) => u.totAberto > 0).sort((a, b) => b.totAberto - a.totAberto).slice(0, 5);

  return (
    <>
      <Cabecalho titulo="Painel de Água" subtitulo="61 congregações · CASAN"><GotaMarca /></Cabecalho>
      <Resumo />
      {comAlerta.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {comAlerta.map((u) => <Alerta key={u.nome} u={u} />)}
        </div>
      )}
      <div className="bloco">
        <h2>Vencimentos</h2>
        <p className="leg">Vencidas primeiro, depois as próximas a vencer.</p>
        {vencimentos.length ? <Agenda itens={vencimentos.slice(0, 8)} /> : <Vazio>Nenhuma fatura lançada ainda.</Vazio>}
      </div>
      <div className="bloco">
        <h2>Maiores valores em aberto</h2>
        <p className="leg">Toque numa congregação para ver as faturas.</p>
        {maiores.length ? <BarrasAberto lista={maiores} /> : <Vazio>Nenhuma fatura lançada ainda.</Vazio>}
      </div>
    </>
  );
}
