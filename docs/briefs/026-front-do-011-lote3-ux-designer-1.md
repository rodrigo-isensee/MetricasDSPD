Agente destino: forge:ux-designer
Pedido: docs/pedidos/026-front-do-011-lote3.md
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.2 do pedido 026 (cartão K-111): revisão de UX da interface implementada do lote 3 (O19 a O26 no painel Operacional e o O23 como bloco do O2) contra a especificação validada, antes do PR. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, branch `feature/026-lote3-operacionais`, head 78c6fcb12149d61afe91568423d6fca59158e165 (code review aprovado).

## Ler
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: seções O19 a O26 (linhas 54 a 160).
- `/home/rodrigoisensee/MetricasDSPD-026/web/src/features/complementares/operacionais.tsx` e `/home/rodrigoisensee/MetricasDSPD-026/web/src/features/complementares/notas.ts` (entradas O19 a O26).
- `/home/rodrigoisensee/MetricasDSPD-026/web/src/content/catalogo-metricas.ts`, entradas O19 a O26.
- `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md`, bloco `## Achados` (A7, A9, A10 e A11) e a seção "Revalidação (E1.4)".
- Modelo de formato: `docs/ux/revisao-025-front-taticas.md` (lote 2).

## Entregar
- (E1, E1.2) Revisão em `/home/rodrigoisensee/MetricasDSPD-026/docs/ux/revisao-026-front-operacionais.md`, no formato do modelo: textos, estados (carregando, vazio, amostra abaixo de 20, erro), selos e "Leia junto" de cada métrica O19 a O26 contra a especificação; achados (bloqueante, recomendado ou nenhum, até 300 caracteres) e parecer no frontmatter.
- (E1, E1.2) Decisão sobre os recomendados do review: A9 (ligar O13 ou O5 ao O21 e então tirar a exceção da alcançabilidade em `packages/contratos/src/cartoes.test.ts:145`, ou manter o O21 só pela seção e pela página Métricas); A10 (frase de leitura do O26 com a faixa mais comum, sem somar faixas na tela, ou pedir o campo ao contrato); A11 (singular "o grupo com e sem retorno tem" com 'ambos' ou nulo, `operacionais.tsx:346`, herdado do T13); A7 (redação da nota do O25 em `notas.ts:251`, "Nesta fase não há divisão por motivo", hoje correta porque `porMotivo` vem nulo: manter ou dar redação neutra). Para cada um: o texto exato a usar, ou "mantém", com o motivo.
- (E1, E1.2) Sem commit e sem push: você não tem Bash; o tech-lead commita o arquivo. Não edite código.
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outro papel; textos que você mudar voltam a ele numa volta
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel; leva o A4 do review
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · cumprida (78c6fcb, aprovado)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · cumprida (sem commit)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outro papel
- Editar código, testes ou a especificação; mudar regra de cálculo ou contrato; o quadro; PR; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (O22 e O26 sem nome de pessoa nem ranking); abaixo de 20 itens, não publicar estatística; dúvida de regra de negócio vira pergunta ao dono, não inferência (relate e pare naquele ponto).

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-026/docs/ux/revisao-026-front-operacionais.md` · revisão gravada com parecer no frontmatter e decisão de A7, A9, A10 e A11

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
