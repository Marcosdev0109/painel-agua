# Painel de Água: faturas da CASAN de 61 congregações

Painel web, feito para o celular, que reúne as faturas de água de 61 congregações da Assembleia de Deus em Florianópolis. Ele mostra o que está vencido, o que vence em seguida, quem está consumindo acima da média e os protocolos abertos na CASAN.

**Demo:** https://marcosdev0109.github.io/painel-agua/

> Esta é a versão de demonstração. Os nomes das congregações são reais. Matrículas, documentos, valores, consumos e protocolos são fictícios, gerados pelo próprio painel.

## O problema

Eu cuido das contas de água e luz das congregações. Antes do painel, o trabalho era manual: entrar no portal da CASAN unidade por unidade, baixar a 2ª via, comparar o consumo com os meses anteriores, perceber qual fatura veio alta, abrir o pedido de revisão e depois procurar a resposta no e-mail. Uma fatura alta só era notada quando alguém da congregação avisava.

**Antes: cerca de 20 horas por mês. Agora: cerca de 4 horas.**

## Como funciona hoje

1. Baixo as faturas pendentes do portal da CASAN em uma pasta do Google Drive, uma subpasta por mês.
2. Peço ao Claude (IA da Anthropic) para ler os PDFs e lançar os dados no painel. A regra é só registrar o que está impresso na fatura. Se faltar informação, ele pergunta em vez de inventar.
3. O painel calcula sozinho o que está vencido ou a vencer, há quantos dias está em atraso, o consumo acima da média dos últimos 6 meses e o custo por m³.
4. Uma tarefa agendada lê o Gmail a cada dois dias e atualiza os protocolos com as respostas da CASAN.

## O que o painel mostra

- **Início:** total em aberto, alertas de corte, próximos vencimentos e maiores valores.
- **Igrejas:** busca por nome ou matrícula, filtro por situação e uma ficha de cada congregação com faturas, gráfico de consumo mês a mês e protocolos.
- **Relatórios:** quanto está em aberto, há quanto tempo, quem deve mais, onde está concentrado, consumo acima da média, tendência, custo por m³, composição da fatura e calendário de pagamentos.
- **Protocolos:** pedidos abertos na CASAN (revisão de fatura, releitura, vazamento) e o andamento de cada um.

## Tecnologias

- HTML, CSS e JavaScript puro, sem framework e sem dependências.
- Gráficos desenhados em SVG direto no código.
- Interface mobile-first, com tema claro e escuro e navegação por abas.
- Dados separados da interface em `dados.js`.
- IA (Claude) para extrair os dados das faturas em PDF e acompanhar os e-mails dos protocolos.

## Como rodar

Abra o `index.html` no navegador. Não precisa instalar nada.

## Autor

João Marcos Rodrigues Barbosa · [GitHub](https://github.com/Marcosdev0109) · [LinkedIn](https://www.linkedin.com/in/joao-marcos01)
