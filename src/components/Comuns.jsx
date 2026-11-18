import { MES, brl, mesCurto, plural } from "../lib/formato.js";
import { usePainel } from "../PainelContext.js";

export const Vazio = ({ children }) => <div className="vazio">{children}</div>;

export const AvisoDemo = () => (
  <div className="prevbar" role="note">Demonstração com números fictícios</div>
);

export function Cabecalho({ titulo, subtitulo, children }) {
  return (
    <header className="marca">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {children}
    </header>
  );
}

// Lista de faturas por data de vencimento (vencidas primeiro).
export function Agenda({ itens }) {
  const { abrir } = usePainel();
  return (
    <div className="agenda">
      {itens.map(({ u, f }) => {
        const [, m, d] = f.vencISO.split("-");
        const perto = f.falta != null && f.falta <= 7;
        const cls = f.status === "vencida" ? "vencida" : perto ? "perto" : "";
        let quando;
        if (f.status === "vencida") quando = <span className="selo vencida">{f.atraso} {plural(f.atraso, "dia", "dias")} de atraso</span>;
        else if (f.falta === 0) quando = <span className="selo a-vencer">vence hoje</span>;
        else quando = <span className={"selo " + (perto ? "a-vencer" : "neutro")}>em {f.falta} {plural(f.falta, "dia", "dias")}</span>;
        return (
          <button key={u.nome + f.mes} className="dia dia-btn" onClick={() => abrir(u.nome)}>
            <span className={"cal " + cls}><b>{d}</b><small>{MES[+m - 1]}</small></span>
            <span className="q"><b>{u.nome}</b><small>fatura de {mesCurto(f.mes)} · {quando}</small></span>
            <span className="v">{brl(f.valor)}</span>
          </button>
        );
      })}
    </div>
  );
}

// Barras horizontais: vermelho é vencido, âmbar é a vencer.
export function BarrasAberto({ lista }) {
  const { abrir } = usePainel();
  const max = Math.max(1, ...lista.map((u) => u.totAberto));
  return (
    <div className="hb">
      {lista.map((u) => (
        <button key={u.nome} className="hb-l hb-btn" onClick={() => abrir(u.nome)}>
          <span className="n">{u.nome}</span>
          <span className="v">{brl(u.totAberto)}</span>
          <span className="t" style={{ display: "flex" }}>
            <span className="vencida" style={{ width: (u.totVencido / max) * 100 + "%", borderRadius: "6px 0 0 6px" }} />
            <span className="a-vencer" style={{ width: (u.totAVencer / max) * 100 + "%", borderRadius: "0 6px 6px 0" }} />
          </span>
          <span className="s">
            {u.totVencido ? brl(u.totVencido) + " vencido" : ""}
            {u.totVencido && u.totAVencer ? " · " : ""}
            {u.totAVencer ? brl(u.totAVencer) + " a vencer" : ""}
          </span>
        </button>
      ))}
    </div>
  );
}
