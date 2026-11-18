// As 61 unidades consumidoras acompanhadas pelo painel.
// Nesta versão pública só os nomes são reais; o resto é gerado em demo.js.
export const CONGREGACOES = [
  "AD Rio Tavares", "AD Rio Vermelho", "AD Serrinha", "Alto da Felicidade",
  { nome: "Armação Pântano do Sul", fornecedor: "Nascente da Ilha" },
  "Barra da Lagoa", "Barra do Sambaqui", "Betânia", "Betel", "Bom Abrigo",
  "Caeira Saco dos Limões", "Campeche", "Canaã", "Canasvieiras", "Carianos",
  "Casa Beco 1", "Casa Beco 2", "Coloninha", "Coqueiros",
  { nome: "Costa de Cima", fornecedor: "Nascente da Ilha" },
  "Costeira", "Estreito", "Filadélfia", "Gilgal", "Igreja Ebenezer", "Itacorubi",
  "Jardim Atlântico", "Jerusalém", "João Paulo", "José Valério de Souza", "Jurerê",
  "Lagoa da Conceição", "Lagoinha", "Lírio dos Vales", "Monte Carmelo", "Monte Cristo",
  "Monte do Senhor", "Monte Hermom", "Monte Horebe", "Monte Serrat", "Morro do 25",
  "Nova Canaã", "Nova Vida", "Pantanal", "Paz no Vale", "Pedregal", "Praia Comprida",
  "Ratones", "Refidim", "Ribeirão da Ilha", "Rosa de Saron", "Saco dos Limões",
  "Santinho", "Sede", "Sítio do Capivari", "Sonho Dourado", "Tapera", "Trindade",
  "Vargem Bom Jesus", "Vargem Grande", "Vargem Pequena",
].map((c) => (typeof c === "string" ? { nome: c } : c));
