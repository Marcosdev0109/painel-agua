import { useEffect, useRef, useState } from "react";
import { MES, brl, mesCurto, mesLongo, plural } from "../lib/formato.js";
import { STATUS_PROTOCOLO, protocolosDaFatura, protocolosDaUnidade } from "../lib/regras.js";
import { usePainel } from "../PainelContext.js";
import { Alerta } from "./Inicio.jsx";
import { IconeCalendario, IconeEmail, IconeExterno, IconeFechar, IconeGota, IconeOk, IconeTendencia } from "./Icones.jsx";

const ECASAN = "https://ecasan.casan.sc.gov.br/login";

// Uma solicitação feita à CASAN que envolve a fatura: tipo, situação e o e-mail mais recente.
export function CartaoSolicitacao({ p }) {
  const [rotulo, cor] = STATUS_PROTOCOLO[p.status] || ["—", "neutro"];
  const email = (p.emails || []).at(-1);
  return (
    <div className={"solic " + cor}>
      <span className="ico"><IconeEmail /></span>
      <span className="tx">
        <b><span>{p.tipo}</span><span className={"selo " + cor}>{rotulo}</span></b>
        Protocolo {p.protocolo} · aberto em {p.abertura}
      </span>
      {email && <a href={email.url} target="_blank" rel="noopener">E-mail <IconeExterno /></a>}
    </div>
  );
}

function CartaoFatura({ u, f }) {
  const { protocolos } = usePainel();
  const solicitacoes = protocolosDaFatura(u, f.mes, protocolos);
  return (
    <div className={"fat-card " + f.status}>
      <div className="fat-cab">
        <div>
          <h3>{mesLongo(f.mes)}</h3>
          <span className={"selo " + f.status}>{f.status === "vencida" ? `${f.atraso} ${plural(f.atraso, "dia", "dias")} de atraso` : "a vencer"}</span>
        </div>
        <span className="valor">{brl(f.valor)}</span>
      </div>
      <div className="fat-meta">
        <span><IconeCalendario /> vence {f.venc}</span>
        {f.m3 != null && <span><IconeGota /> {f.m3} m³</span>}
        {f.media6 != null && <span><IconeTendencia /> média {f.media6} m³</span>}
      </div>
      {f.nota && <p className="fat-nota">{f.nota}</p>}
      {solicitacoes.length
        ? solicitacoes.map((p) => <CartaoSolicitacao key={p.protocolo} p={p} />)
        : <div className="sem-solic"><IconeOk /> Nenhuma solicitação no e-mail para esta fatura</div>}
    </div>
  );
}

// Colunas de consumo; a última fica em vermelho se passar 50% da média anterior.
function GraficoConsumo({ consumo }) {
  const meses = Object.keys(consumo).sort().slice(-12);
  const valores = meses.map((m) => consumo[m]);
  const max = Math.max(1, ...valores);
  const media = valores.slice(0, -1).reduce((a, b) => a + b, 0) / Math.max(1, valores.length - 1);
  return (
    <>
      <div className="colunas">
        {meses.map((m, i) => {
          const v = consumo[m], ultimo = i === meses.length - 1;
          const alto = ultimo && valores.length > 2 && v >= media * 1.5 && v - media >= 3;
          return (
            <div className="col" key={m}>
              <span className="rt">{v}</span>
              <span className={"b" + (alto ? " vencida" : ultimo ? "" : " fraco")} style={{ height: Math.max(3, (v / max) * 82) + "%" }} />
            </div>
          );
        })}
      </div>
      <div className="eixo">{meses.map((m) => <span key={m}>{MES[+m.slice(5) - 1]}</span>)}</div>
    </>
  );
}

export function ProtocoloDetalhe({ p }) {
  const [rotulo, cor] = STATUS_PROTOCOLO[p.status] || ["—", "neutro"];
  return (
    <div className="prot">
      <div className="prot-cab"><b>{p.protocolo}</b><span className={"selo " + cor}>{rotulo}</span></div>
      <p className="prot-meta">{p.tipo} · aberto em {p.abertura}{(p.faturas || []).length ? " · faturas " + p.faturas.map(mesCurto).join(", ") : ""}</p>
      {p.resumo && <p className="prot-resumo">{p.resumo}</p>}
      {(p.emails || []).length > 0 && (
        <div className="prot-emails">
          {p.emails.map((e) => <a key={e.url} className="selo neutro" href={e.url} target="_blank" rel="noopener"><IconeEmail /> {e.rotulo}</a>)}
        </div>
      )}
    </div>
  );
}

function BotaoCopiar({ rotulo, valor, avisar }) {
  const [ok, setOk] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setOk(true);
      avisar("Copiado: " + valor);
      setTimeout(() => setOk(false), 1500);
    } catch {
      avisar("Segure o texto para copiar");
    }
  };
  return (
    <button className={"copia" + (ok ? " ok" : "")} onClick={copiar}>
      <span><small>{rotulo}</small><b>{valor}</b></span>
      <span className="selo neutro">Copiar</span>
    </button>
  );
}

// Painel que sobe de baixo com tudo de uma congregação.
export default function Ficha({ u, aoFechar, avisar }) {
  const { protocolos } = usePainel();
  const [visivel, setVisivel] = useState(false);
  const botaoFechar = useRef(null);

  useEffect(() => {
    const quadro = requestAnimationFrame(() => setVisivel(true));
    botaoFechar.current?.focus();
    const tecla = (e) => e.key === "Escape" && fechar();
    document.addEventListener("keydown", tecla);
    return () => { cancelAnimationFrame(quadro); document.removeEventListener("keydown", tecla); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fechar = () => { setVisivel(false); setTimeout(aoFechar, 260); };

  const doc = String(u.doc || "");
  const rotuloDoc = doc.includes("/") ? "CNPJ do titular" : "CPF do titular";
  const prots = protocolosDaUnidade(u, protocolos);

  return (
    <>
      <div className={"veu" + (visivel ? " on" : "")} onClick={fechar} />
      <aside className={"ficha" + (visivel ? " on" : "")} role="dialog" aria-modal="true" aria-label={u.nome}>
        <div className="alca" />
        <div className="cab">
          <div>
            <h2>{u.nome}</h2>
            <p>
              {u.vencidas.length > 0 && <span className="selo vencida">{u.vencidas.length} {plural(u.vencidas.length, "vencida", "vencidas")}</span>}
              {u.aVencer.length > 0 && <span className="selo a-vencer">{u.aVencer.length} a vencer</span>}
              {u.estado === "sem" && <span className="selo neutro">sem fatura lançada</span>}
            </p>
          </div>
          <button ref={botaoFechar} className="fechar" aria-label="Fechar" onClick={fechar}><IconeFechar /></button>
        </div>

        <div className="corpo">
          {u.corte && <Alerta u={u} comoBotao={false} />}

          {u.totAberto > 0 && (
            <div className="bloco" style={{ padding: 16 }}>
              <div className="aberto-linha"><span>Em aberto</span><b className="num">{brl(u.totAberto)}</b></div>
              {u.totVencido > 0 && u.totAVencer > 0 && (
                <div className="barra-dupla" style={{ height: 12, marginTop: 10 }}>
                  <span style={{ width: (u.totVencido / u.totAberto) * 100 + "%", background: "var(--vencida)" }} />
                  <span style={{ width: (u.totAVencer / u.totAberto) * 100 + "%", background: "var(--avencer)" }} />
                </div>
              )}
            </div>
          )}

          <div className="copias">
            {u.matricula ? <BotaoCopiar rotulo="Matrícula" valor={u.matricula} avisar={avisar} /> : <div className="copia"><small>Matrícula</small><b>não consta</b></div>}
            {doc ? <BotaoCopiar rotulo={rotuloDoc} valor={doc} avisar={avisar} /> : <div className="copia"><small>Titular</small><b>não consta</b></div>}
          </div>

          {u.fornecedor === "CASAN" && (
            <>
              <a className="botao" href={ECASAN} target="_blank" rel="noopener">Abrir o eCasan</a>
              <p className="dica">Copie a matrícula e o documento e cole no login.</p>
            </>
          )}

          {u.faturas.length > 0 && (
            <div className="bloco">
              <h2>Faturas</h2>
              {[...u.faturas].reverse().map((f) => <CartaoFatura key={f.mes} u={u} f={f} />)}
            </div>
          )}

          {Object.keys(u.consumo).length >= 2 && (
            <div className="bloco">
              <h2>Consumo mês a mês</h2>
              <p className="leg">Em m³, conforme o histórico impresso nas faturas.</p>
              <GraficoConsumo consumo={u.consumo} />
            </div>
          )}

          {prots.length > 0 && (
            <div className="bloco"><h2>Protocolos</h2>{prots.map((p) => <ProtocoloDetalhe key={p.protocolo} p={p} />)}</div>
          )}
        </div>
      </aside>
    </>
  );
}
