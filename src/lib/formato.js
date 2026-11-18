// Formatação em português do Brasil e contas com datas.

export const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MES_LONGO = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const brl0 = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const n1 = (v) => Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// "2026-10" -> "out/26" e "outubro de 2026"
export const mesCurto = (k) => { const [a, m] = k.split("-"); return MES[+m - 1] + "/" + a.slice(2); };
export const mesLongo = (k) => { const [a, m] = k.split("-"); return MES_LONGO[+m - 1] + " de " + a; };

// Busca sem diferenciar acentos nem maiúsculas.
export const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export const plural = (n, um, varios) => (n === 1 ? um : varios);

// Datas no fuso de Florianópolis, no formato ISO (AAAA-MM-DD).
export const hojeISO = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
export const isoDeBR = (br) => { const p = String(br || "").split("/"); return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : ""; };
export const diasEntre = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
export const somarDias = (iso, n) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("pt-BR");
};
