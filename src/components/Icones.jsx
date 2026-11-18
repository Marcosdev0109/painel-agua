// Ícones em SVG (estilo de traço, como o Lucide). Nada de emoji como ícone.
const Svg = ({ children, tamanho, ...resto }) => (
  <svg className="ic-svg" viewBox="0 0 24 24" aria-hidden="true" style={tamanho ? { width: tamanho, height: tamanho } : undefined} {...resto}>
    {children}
  </svg>
);

export const IconeEmail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>;
export const IconeAlerta = (p) => <Svg {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Svg>;
export const IconeCalendario = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Svg>;
export const IconeGota = (p) => <Svg {...p}><path d="M12 2.7s-6 6.5-6 11.3a6 6 0 0 0 12 0c0-4.8-6-11.3-6-11.3z" /></Svg>;
export const IconeTendencia = (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></Svg>;
export const IconeOk = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>;
export const IconeExterno = (p) => <Svg tamanho={16} {...p}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Svg>;
export const IconeFechar = (p) => <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>;

export const IconeBusca = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" fill="none" />
    <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconeSeta = () => (
  <svg className="chev" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>
);

export const GotaMarca = () => (
  <svg className="gota" viewBox="0 0 44 44" aria-hidden="true">
    <path d="M22 4C22 4 8 19 8 28a14 14 0 0 0 28 0C36 19 22 4 22 4z" fill="var(--agua)" />
    <path d="M15 29a7 7 0 0 0 7 7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
  </svg>
);
