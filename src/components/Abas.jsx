// Barra de abas fixa no rodapé, pensada para o polegar no celular.
const ABAS = [
  { id: "inicio", rotulo: "Início", icone: <path d="M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12z" fill="none" stroke="currentColor" strokeWidth="2" /> },
  { id: "igrejas", rotulo: "Igrejas", icone: <path d="M12 2v5M9.5 4.5h5M5 21V12l7-5 7 5v9M10 21v-5h4v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { id: "relatorios", rotulo: "Relatórios", icone: <path d="M5 20V11M12 20V5M19 20v-7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /> },
  { id: "protocolos", rotulo: "Protocolos", icone: <><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="2" /></> },
];

export const TELAS = ABAS.map((a) => a.id);

export default function Abas({ atual, aoTrocar, disponiveis = TELAS }) {
  return (
    <nav className="abas" aria-label="Seções">
      <div style={{ gridTemplateColumns: `repeat(${disponiveis.length},1fr)` }}>
        {ABAS.filter((a) => disponiveis.includes(a.id)).map((a) => (
          <button key={a.id} className="aba" aria-pressed={atual === a.id} onClick={() => aoTrocar(a.id)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{a.icone}</svg>
            {a.rotulo}
          </button>
        ))}
      </div>
    </nav>
  );
}
