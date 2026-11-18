// Regras do painel. Os dados de cada fatura vêm só do que está impresso nela;
// tudo o que é calculado (situação, atraso, totais) é feito aqui.
import { isoDeBR, diasEntre, semAcento } from "./formato.js";

export function prepararUnidades(lista, hoje, documentoPadrao) {
  return lista.map((original) => {
    const u = { ...original };
    u.fornecedor = u.fornecedor || "CASAN";
    if (u.doc === undefined) u.doc = documentoPadrao;

    u.faturas = (u.faturas || [])
      .map((f) => {
        const vencISO = isoDeBR(f.venc);
        const status = vencISO && vencISO < hoje ? "vencida" : "a-vencer";
        return {
          ...f,
          vencISO,
          status,
          atraso: status === "vencida" ? diasEntre(vencISO, hoje) : 0,
          falta: status === "a-vencer" && vencISO ? diasEntre(hoje, vencISO) : null,
        };
      })
      .sort((a, b) => (a.mes < b.mes ? -1 : 1));

    // Histórico de consumo: junta o que cada fatura traz impresso.
    u.consumo = {};
    u.faturas.forEach((f) => {
      Object.assign(u.consumo, f.historico || {});
      if (f.m3 != null) u.consumo[f.mes] = f.m3;
    });

    u.vencidas = u.faturas.filter((f) => f.status === "vencida");
    u.aVencer = u.faturas.filter((f) => f.status === "a-vencer");
    u.totVencido = soma(u.vencidas);
    u.totAVencer = soma(u.aVencer);
    u.totAberto = u.totVencido + u.totAVencer;
    u.maiorAtraso = Math.max(0, ...u.vencidas.map((f) => f.atraso));
    u.estado = u.vencidas.length ? "vencida" : u.aVencer.length ? "a-vencer" : "sem";
    u.ultima = u.faturas[u.faturas.length - 1] || null;
    u.corte = u.aviso || u.faturas.find((f) => f.corte)?.corte || "";
    return u;
  });
}

const soma = (fs) => fs.reduce((s, f) => s + (f.valor || 0), 0);

// Liga protocolos às unidades pela matrícula (ignorando zeros à esquerda) ou pelo nome.
const digitos = (x) => String(x || "").replace(/\D/g, "").replace(/^0+/, "");
export const protocolosDaUnidade = (u, protocolos) => {
  const d = digitos(u.matricula);
  return protocolos.filter((p) => (d && digitos(p.matricula) === d) || semAcento(p.congregacao) === semAcento(u.nome));
};
export const protocolosDaFatura = (u, mes, protocolos) =>
  protocolosDaUnidade(u, protocolos).filter((p) => (p.faturas || []).includes(mes));

export const STATUS_PROTOCOLO = {
  aguardando: ["Aguardando", "a-vencer"],
  revisao: ["Em revisão", "a-vencer"],
  deferido: ["Deferido", "ok"],
  indeferido: ["Negado", "vencida"],
  concluido: ["Concluído", "ok"],
};

export const ehCorte = (texto) => /cortada/i.test(texto);
