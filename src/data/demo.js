// Dados de DEMONSTRAÇÃO. Matrículas, valores, consumos, datas e protocolos
// são fictícios, gerados aqui de forma determinística (sempre os mesmos números).
// As datas são relativas a hoje, para a demo sempre parecer "atual".
import { CONGREGACOES } from "./congregacoes.js";
import { somarDias } from "../lib/formato.js";

export const DOCUMENTO_FICTICIO = "00.000.000/0001-00";

// Gerador de números pseudoaleatórios com semente fixa.
function criarSorteio(semente) {
  let s = semente;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Tarifa simplificada só para a demo: fixa + água + esgoto (mesmo volume).
const FIXA = 92.68;
function valorDaFatura(m3) {
  const variavel = m3 > 10 ? 68.1 + (m3 - 10) * 19.14 : m3 * 6.81;
  return Math.round((FIXA + variavel * 2) * 100) / 100;
}

function mesesAte(hoje, n) {
  const d = new Date(hoje + "T12:00:00");
  d.setDate(1);
  const lista = [];
  for (let i = n; i >= 1; i--) {
    const x = new Date(d);
    x.setMonth(d.getMonth() - i);
    lista.push(x.toISOString().slice(0, 7));
  }
  return lista;
}

export function gerarDemo(hoje) {
  const sortear = criarSorteio(11);
  const meses = mesesAte(hoje, 8); // 8 meses de histórico, o último é a fatura mais recente
  const ultimo = meses[meses.length - 1];

  // Quem tem fatura e em que situação (posições na lista de congregações).
  const comDuasVencidas = [1, 2, 23];
  const comUmaVencida = [9, 13, 21, 31, 44];
  const soAVencer = [0, 3, 5, 6, 7, 10, 11, 14, 18, 26, 37, 42, 53, 57];
  const comPico = new Set([2, 11, 31]);

  const unidades = CONGREGACOES.map((c, i) => {
    const u = { ...c, matricula: String(4100000 + i * 1373) + "-" + (i % 9) };
    const nVencidas = comDuasVencidas.includes(i) ? 2 : comUmaVencida.includes(i) ? 1 : 0;
    if (!nVencidas && !soAVencer.includes(i)) return u;

    const base = 6 + Math.round(sortear() * 18);
    const historico = {};
    meses.forEach((m, j) => {
      const pico = comPico.has(i) && j === meses.length - 1 ? 1.9 : 1;
      historico[m] = Math.max(2, Math.round(base * (0.75 + sortear() * 0.5) * pico));
    });
    const media6 = Math.round(meses.slice(-7, -1).reduce((s, m) => s + historico[m], 0) / 6);

    const fatura = (mes, venc) => {
      const m3 = historico[mes];
      const valor = valorDaFatura(m3);
      const variavel = Math.round(((valor - FIXA) / 2) * 100) / 100;
      return {
        mes, m3, valor, venc, media6, historico, agua: variavel, esgoto: variavel, fixa: FIXA,
        nota: m3 > media6 * 1.3 ? "Alto consumo: passou 30% da média" : undefined,
      };
    };

    u.faturas = [];
    for (let k = nVencidas; k >= 1; k--) {
      u.faturas.push(fatura(meses[meses.length - 1 - k], somarDias(hoje, -12 - (k - 1) * 30 - (i % 5) * 4)));
    }
    u.faturas.push(fatura(ultimo, somarDias(hoje, 3 + (i % 9) * 3)));
    if (i === 2) u.aviso = `Aviso na fatura: 2 faturas vencidas. Sujeito a corte a partir de ${somarDias(hoje, 9)}.`;
    return u;
  });

  const mesesVencidos = (n) => meses.slice(meses.length - 1 - n, meses.length - 1);
  const protocolos = [
    { protocolo: "DEMO0001/2026", congregacao: CONGREGACOES[2].nome, faturas: mesesVencidos(2), tipo: "Parcelamento", abertura: somarDias(hoje, -6), status: "aguardando",
      resumo: "Pedido de parcelamento das duas faturas vencidas para evitar o corte. A resposta chega por e-mail." },
    { protocolo: "DEMO0002/2026", congregacao: CONGREGACOES[1].nome, faturas: mesesVencidos(2), tipo: "Revisão de fatura", abertura: somarDias(hoje, -20), status: "revisao",
      resumo: "Contestação do consumo das duas últimas faturas. A CASAN agendou uma releitura do hidrômetro." },
    { protocolo: "DEMO0003/2026", congregacao: CONGREGACOES[23].nome, faturas: mesesVencidos(1), tipo: "Vazamento", abertura: somarDias(hoje, -35), status: "deferido",
      resumo: "Vazamento consertado e comprovado. A CASAN aceitou recalcular a fatura pela média." },
    { protocolo: "DEMO0004/2026", congregacao: CONGREGACOES[31].nome, faturas: mesesVencidos(1), tipo: "Revisão de fatura", abertura: somarDias(hoje, -28), status: "indeferido",
      resumo: "Revisão negada: a leitura foi considerada correta. Próximo passo: procurar vazamento interno." },
    { protocolo: "DEMO0005/2026", congregacao: CONGREGACOES[9].nome, faturas: [], tipo: "Troca de titularidade", abertura: somarDias(hoje, -50), status: "concluido",
      resumo: "Titularidade transferida para o CNPJ da igreja." },
  ];

  return { unidades, protocolos };
}
