import { brl, brl0, mesCurto, n1, plural } from "../lib/formato.js";
import { usePainel } from "../PainelContext.js";
import { Agenda, BarrasAberto, Cabecalho, Vazio } from "./Comuns.jsx";

const Bloco = ({ titulo, legenda, children }) => (
  <div className="bloco"><h2>{titulo}</h2>{legenda && <p className="leg">{legenda}</p>}{children}</div>
);
const Insight = ({ children }) => <div className="insight"><span>{children}</span></div>;

// Gráfico de rosca em SVG, sem biblioteca.
function Anel({ fatias, total }) {
  const R = 54, C = 2 * Math.PI * R;
  let deslocamento = 0;
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Concentração do valor em aberto">
      <circle cx="75" cy="75" r={R} fill="none" stroke="var(--fundo)" strokeWidth="22" />
      {fatias.map((f) => {
        const comprimento = (f.v / total) * C;
        const el = (
          <circle key={f.n} cx="75" cy="75" r={R} fill="none" stroke={f.c} strokeWidth="22"
            strokeDasharray={`${Math.max(0, comprimento - 2)} ${C}`} strokeDashoffset={-deslocamento} transform="rotate(-90 75 75)" />
        );
        deslocamento += comprimento;
        return el;
      })}
      <text x="75" y="72" textAnchor="middle" fontFamily="Lexend, sans-serif" fontWeight="600" fontSize="14.5" fill="var(--tinta)">
        {total >= 1000 ? "R$ " + n1(total / 1000) + " mil" : brl0(total)}
      </text>
      <text x="75" y="92" textAnchor="middle" fontSize="12.5" fill="var(--tinta2)">em aberto</text>
    </svg>
  );
}

function Spark({ valores, alto }) {
  const W = 120, H = 36, max = Math.max(...valores), min = Math.min(...valores), amplitude = max - min || 1;
  const pts = valores.map((x, i) => [4 + (i * (W - 8)) / (valores.length - 1), H - 4 - ((x - min) / amplitude) * (H - 8)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const cor = alto ? "var(--vencida)" : "var(--agua)", fim = pts[pts.length - 1];
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={`${d} L${fim[0]} ${H - 4} L4 ${H - 4} Z`} fill={cor} opacity=".14" />
      <path d={d} fill="none" stroke={cor} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={fim[0]} cy={fim[1]} r="3.6" fill={cor} />
    </svg>
  );
}

const somaValor = (lista) => lista.reduce((s, x) => s + (x.f.valor || 0), 0);
const media = (v) => v.reduce((s, x) => s + x, 0) / v.length;

export default function Relatorios() {
  const { unidades: U, abrir } = usePainel();
  const F = U.flatMap((u) => u.faturas.map((f) => ({ u, f })));
  if (!F.length) return (<><Cabecalho titulo="Relatórios" /><Vazio>Os relatórios aparecem quando houver faturas lançadas.</Vazio></>);

  const vencido = somaValor(F.filter((x) => x.f.status === "vencida"));
  const aVencer = somaValor(F.filter((x) => x.f.status === "a-vencer"));
  const total = vencido + aVencer || 1;

  // Envelhecimento das faturas vencidas.
  const faixas = [["Até 30 dias", 0, 30], ["31 a 60", 31, 60], ["61 a 90", 61, 90], ["Mais de 90", 91, Infinity]].map(([n, de, ate]) => {
    const l = F.filter((x) => x.f.status === "vencida" && x.f.atraso >= de && x.f.atraso <= ate);
    return { n, v: somaValor(l), q: l.length };
  });
  const maxFaixa = Math.max(1, ...faixas.map((x) => x.v));
  const antigo = faixas[2].v + faixas[3].v;

  // Ranking e concentração.
  const ranking = U.filter((u) => u.totAberto).sort((a, b) => b.totAberto - a.totAberto);
  const totalAberto = ranking.reduce((s, u) => s + u.totAberto, 0) || 1;
  const top3 = ranking.slice(0, 3).reduce((s, u) => s + u.totAberto, 0);
  const cores = ["var(--vencida)", "var(--avencer)", "var(--agua)", "var(--agua-vivo)", "var(--ok)"];
  const fatias = ranking.slice(0, 5).map((u, i) => ({ n: u.nome, v: u.totAberto, c: cores[i] }));
  const resto = totalAberto - fatias.reduce((s, x) => s + x.v, 0);
  if (resto > 0.005) fatias.push({ n: "Demais", v: resto, c: "var(--neutro-bg)" });

  // Última fatura comparada com a média de 6 meses impressa nela.
  const picos = U.filter((u) => u.ultima?.m3 != null && u.ultima.media6)
    .map((u) => ({ u, f: u.ultima, r: u.ultima.m3 / u.ultima.media6 }))
    .sort((a, b) => b.r - a.r);
  const acimaDaMedia = picos.filter((x) => x.r >= 1.3);

  // Tendência: metade recente do histórico contra a metade antiga.
  const tendencias = U.map((u) => {
    const meses = Object.keys(u.consumo).sort();
    if (meses.length < 4) return null;
    const v = meses.map((m) => u.consumo[m]), meio = Math.floor(v.length / 2);
    const antes = media(v.slice(0, meio)), depois = media(v.slice(meio));
    return { u, v, meses, d: antes ? (depois - antes) / antes : 0 };
  }).filter(Boolean).sort((a, b) => b.d - a.d);

  // Custo por m³ da última fatura.
  const custo = U.filter((u) => u.ultima?.m3 > 0 && u.ultima.valor)
    .map((u) => ({ u, f: u.ultima, c: u.ultima.valor / u.ultima.m3 }))
    .sort((a, b) => b.c - a.c);
  const acima10 = U.filter((u) => u.ultima?.m3 > 10).length;

  // Composição do valor.
  const comp = F.reduce((c, { f }) => ({ agua: c.agua + (f.agua || 0), esgoto: c.esgoto + (f.esgoto || 0), fixa: c.fixa + (f.fixa || 0), outros: c.outros + (f.outros || 0) }), { agua: 0, esgoto: 0, fixa: 0, outros: 0 });
  const totalComp = comp.agua + comp.esgoto + comp.fixa + comp.outros;

  const calendario = [...F].sort((a, b) => (a.f.vencISO < b.f.vencISO ? -1 : 1));
  const comFatura = U.filter((u) => u.faturas.length).length;

  return (
    <>
      <Cabecalho titulo="Relatórios" subtitulo="O que as faturas lançadas mostram" />

      <Bloco titulo="Quanto está em aberto" legenda="Soma de todas as faturas pendentes lançadas.">
        <div className="num" style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 600 }}>{brl(vencido + aVencer)}</div>
        <div className="barra-dupla" style={{ marginTop: 10 }}>
          <span style={{ width: (vencido / total) * 100 + "%", background: "var(--vencida)" }} />
          <span style={{ width: (aVencer / total) * 100 + "%", background: "var(--avencer)" }} />
        </div>
        <div className="legenda">
          <span><i style={{ background: "var(--vencida)" }} />Vencido <b className="num">{brl(vencido)}</b></span>
          <span><i style={{ background: "var(--avencer)" }} />A vencer <b className="num">{brl(aVencer)}</b></span>
        </div>
        <Insight><b>{Math.round((vencido / total) * 100)}%</b> do valor em aberto já passou do vencimento.</Insight>
      </Bloco>

      <Bloco titulo="Há quanto tempo está vencido" legenda="Quanto mais tempo, maior o risco de corte e de negativação.">
        {vencido ? (
          <>
            <div className="colunas">
              {faixas.map((x, i) => (
                <div className="col" key={x.n}>
                  <span className="rt">{x.v ? brl0(x.v) : "—"}</span>
                  <span className="b vencida" style={{ height: Math.max(x.v ? 4 : 0, (x.v / maxFaixa) * 80) + "%", opacity: 0.45 + i * 0.18 }} />
                </div>
              ))}
            </div>
            <div className="eixo">{faixas.map((x) => <span key={x.n}>{x.n}<br /><b>{x.q}</b> fat.</span>)}</div>
            <Insight>{antigo ? <><b>{brl(antigo)}</b> está vencido há mais de 60 dias. É o que mais pesa no risco de corte.</> : "Nada vencido há mais de 60 dias."}</Insight>
          </>
        ) : <Vazio>Nenhuma fatura vencida.</Vazio>}
      </Bloco>

      <Bloco titulo="Quem deve mais" legenda="Valor em aberto por congregação. Vermelho é vencido, âmbar é a vencer.">
        <BarrasAberto lista={ranking.slice(0, 10)} />
      </Bloco>

      <Bloco titulo="Onde está concentrado" legenda="Fatia de cada congregação no total em aberto.">
        <div className="anel">
          <Anel fatias={fatias} total={totalAberto} />
          <div className="lst">
            {fatias.map((x) => <div key={x.n}><span><i style={{ background: x.c }} />{x.n}</span><b className="num">{Math.round((x.v / totalAberto) * 100)}%</b></div>)}
          </div>
        </div>
        {ranking.length > 3 && <Insight>As <b>3 maiores</b> somam <b>{Math.round((top3 / totalAberto) * 100)}%</b> do total. Resolver essas resolve a maior parte do problema.</Insight>}
      </Bloco>

      <Bloco titulo="Consumo acima da média" legenda="Última fatura comparada com a média de 6 meses impressa na própria fatura. A CASAN avisa quando passa de 30%.">
        {picos.length ? (
          <>
            <div className="hb">
              {picos.slice(0, 8).map((x) => (
                <button key={x.u.nome} className="hb-l hb-btn" onClick={() => abrir(x.u.nome)}>
                  <span className="n">{x.u.nome}</span>
                  <span className="v" style={{ color: x.r >= 1.3 ? "var(--vencida)" : "var(--tinta)" }}>{x.r >= 1 ? "+" : ""}{Math.round((x.r - 1) * 100)}%</span>
                  <span className="t"><span className={x.r >= 1.3 ? "vencida" : ""} style={{ width: Math.min(100, (x.r / Math.max(2, picos[0].r)) * 100) + "%" }} /></span>
                  <span className="s">{x.f.m3} m³ em {mesCurto(x.f.mes)} · média {x.f.media6} m³</span>
                </button>
              ))}
            </div>
            <Insight>
              {acimaDaMedia.length
                ? <><b>{acimaDaMedia.length}</b> {plural(acimaDaMedia.length, "congregação está", "congregações estão")} 30% ou mais acima da própria média. Vale procurar vazamento antes de pagar ou contestar.</>
                : "Nenhuma congregação passou 30% da própria média."}
            </Insight>
          </>
        ) : <Vazio>Aparece quando as faturas trouxerem a média dos 6 meses.</Vazio>}
      </Bloco>

      <Bloco titulo="Para onde o consumo está indo" legenda="Compara a metade mais recente do histórico com a mais antiga.">
        {tendencias.length ? (
          <table className="tbl"><tbody>
            {tendencias.slice(0, 8).map((x) => (
              <tr key={x.u.nome}>
                <td style={{ width: "45%" }}><b>{x.u.nome}</b><small>{x.meses.length} meses</small></td>
                <td><Spark valores={x.v} alto={x.d > 0.3} /></td>
                <td className="r" style={{ color: x.d > 0.3 ? "var(--vencida)" : x.d < -0.2 ? "var(--ok)" : "var(--tinta)" }}>
                  {x.d > 0 ? "▲ " : x.d < 0 ? "▼ " : ""}{Math.abs(Math.round(x.d * 100))}%
                </td>
              </tr>
            ))}
          </tbody></table>
        ) : <Vazio>Aparece quando houver histórico de consumo nas faturas.</Vazio>}
      </Bloco>

      <Bloco titulo="Quanto custa cada m³" legenda="Valor da última fatura dividido pelo consumo. Acima de 10 m³ a tarifa sobe de faixa, e o esgoto vem junto com a água.">
        {custo.length ? (
          <>
            <table className="tbl"><tbody>
              {custo.slice(0, 8).map((x) => (
                <tr key={x.u.nome}><td><b>{x.u.nome}</b><small>{x.f.m3} m³ · {brl(x.f.valor)}</small></td><td className="r">{brl(x.c)}/m³</td></tr>
              ))}
            </tbody></table>
            <Insight><b>{acima10}</b> {plural(acima10, "congregação passou", "congregações passaram")} de 10 m³ na última fatura e já {plural(acima10, "paga", "pagam")} a faixa mais cara.</Insight>
          </>
        ) : <Vazio>Aparece quando as faturas tiverem valor e consumo.</Vazio>}
      </Bloco>

      <Bloco titulo="Do que é feito o valor" legenda="Soma das linhas impressas nas faturas lançadas.">
        {totalComp ? (
          <>
            <div className="barra-dupla">
              <span style={{ width: (comp.agua / totalComp) * 100 + "%", background: "var(--agua)" }} />
              <span style={{ width: (comp.esgoto / totalComp) * 100 + "%", background: "var(--agua-vivo)" }} />
              <span style={{ width: (comp.fixa / totalComp) * 100 + "%", background: "var(--avencer)" }} />
              <span style={{ width: (comp.outros / totalComp) * 100 + "%", background: "var(--neutro)" }} />
            </div>
            <div className="legenda">
              <span><i style={{ background: "var(--agua)" }} />Água {brl0(comp.agua)}</span>
              <span><i style={{ background: "var(--agua-vivo)" }} />Esgoto {brl0(comp.esgoto)}</span>
              <span><i style={{ background: "var(--avencer)" }} />Tarifa fixa {brl0(comp.fixa)}</span>
              {comp.outros > 0 && <span><i style={{ background: "var(--neutro)" }} />Parcelas e outros {brl0(comp.outros)}</span>}
            </div>
            <Insight>O esgoto é cobrado em cima do mesmo volume da água. Cada m³ economizado reduz <b>as duas linhas</b>.</Insight>
          </>
        ) : <Vazio>Aparece quando as faturas tiverem o detalhamento de água, esgoto e tarifa fixa.</Vazio>}
      </Bloco>

      <Bloco titulo="Calendário de pagamentos" legenda="Todas as faturas pendentes por data de vencimento.">
        <Agenda itens={calendario} />
      </Bloco>

      <Bloco titulo="Levantamento do mês" legenda="Quantas congregações já têm fatura lançada.">
        <div className="barra-dupla"><span style={{ width: (comFatura / U.length) * 100 + "%", background: "var(--agua)" }} /></div>
        <div className="legenda">
          <span><i style={{ background: "var(--agua)" }} /><b>{comFatura}</b> com fatura</span>
          <span><i style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }} /><b>{U.length - comFatura}</b> sem fatura lançada</span>
        </div>
      </Bloco>
    </>
  );
}
