Agente destino: forge:qa-engineer
Pedido: docs/pedidos/026-front-do-011-lote3.md
Tipo: qa
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.3 do pedido 026 (cartão K-111): portão de QA (R-QA) do front do lote 3 (O19 a O26), aprovado no code review (c72b955a8d373eff99e6c7916634c7eba70461c9, já no remoto, com a autoria do parecer registrada pelo tech-lead) e na revisão de UX, com o achado A4 do review (contagens do catálogo nas E2E). Com o parecer aprovado, o tech-lead abre o PR para a develop. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, branch `feature/026-lote3-operacionais`, head c72b955.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md`: achado A4 (linha 96) e o veredito da última revalidação.
- `/home/rodrigoisensee/MetricasDSPD-026/docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, as fichas de O19 a O26 (estados e textos que a E2E confere).
- `git -C /home/rodrigoisensee/MetricasDSPD-026 diff --stat e342a2cd71c46df5acf60b756637ebf5a6c84709 c72b955a8d373eff99e6c7916634c7eba70461c9` (o que mudou na branch).
- `docs/pedidos/041-estabilizar-os-testes.md`, linha do `## Histórico` de 2026-10-27 19:14, "E6.3 entregue pelo qa-engineer" (3 falhas pré-existentes corrigidas no 041, ainda fora da develop).

## Entregar
- (E1, E1.3) A4: atualizar as E2E que afirmam as contagens antigas do catálogo (58 métricas, 26 complementares, "7 de 7") para as do contrato atual da branch (os unitários afirmam 65, 33 e 14; confirme no `CATALOGO_CARTOES` de `packages/contratos/src/cartoes.ts`): `e2e/tests/complementares.spec.ts:81`, `intensivo-sistemico.spec.ts:70` (`toHaveLength(58)`), `lacuna-de-valor.spec.ts:210`, `preferencias.spec.ts:102` e qualquer outra que a busca achar.
- (E1, E1.3) E2E dos 8 cartões do lote 3 em /operacional (O19, O20, O21, O22, O24, O25, O26 e o bloco O23 do O2): presença, estados (carregando, vazio, amostra abaixo de 20 sem estatística, erro) e acessibilidade (axe), O22 e O26 sem nome de pessoa nem ranking; testes novos onde faltar cobertura.
- (E1, E1.3) Local, uma suíte por vez: `pnpm run pronto` completo uma vez; depois a E2E completa, `--retries=0`, 2 workers, com a contagem de passaram e falharam e o comando exato. As 3 falhas conhecidas corrigidas no pedido 041 (COMP-01 de sustentação a 1280 px em `complementares.spec.ts:45`, CLS a 375 px em `perf.spec.ts:174` e `perf.spec.ts:195`), se aparecerem, entram no parecer como pré-existentes, com a referência ao 041, e não bloqueiam; qualquer outra falha é achado.
- (E1, E1.3) Parecer em `docs/qa/026-lote3-operacionais.md`, com frontmatter `commit:` (o sha do último commit testado) e `parecer:` (aprovado ou reprovado), o bloco `## Achados` (até 300 caracteres cada, bloqueantes marcados; falha vira achado com passos para reproduzir). Commits com `Cartão: K-111`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Sem push (o envio é do tech-lead).
- (E2, E1.3) QA do E2 (back em mock): nada a testar à parte; o E2.1 foi entregue sem commit (Histórico do pedido, 2026-10-27 14:25) e as rotas das 8 métricas entram pela E2E do front.
- (E3) Nada a entregar aqui: não nesta delegação (a etapa dele está no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · já entregue (dd9a91d); defeito vira achado e volta ao autor em outra delegação
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · cumprida; os recomendados A12 e A13 do review (documentação da UX) seguem com a UX
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · cumprida (c72b955); o PR para a develop vem depois desta
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outro papel
- Corrigir código do front ou do back (defeito vira achado); aumentar timeout ou ligar retry; trazer a develop para a branch; integrações reais; push; PR; o quadro; ler ou editar o `.env`; as worktrees dos pedidos 041 e 042.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens, não publicar estatística; dúvida de regra de negócio vira pergunta, não inferência (relate e pare naquela métrica).
- ADR 0003: orçamento de performance (CLS < 0,1 em /operacional); o QA mede contra ele, sem mexer em limite.
- Uma suíte por vez: o QA do K-151 roda suítes na worktree -151 agora. Antes de cada rodada (pronto, E2E), `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso, espere ela acabar, e confira de novo logo antes de começar. Nunca dois Playwright ao mesmo tempo. Se um processo for morto por falta de memória, rode com menos workers e tente de novo. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal. R-QA: portão obrigatório. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-026/docs/qa/026-lote3-operacionais.md` · espera: igual '1'
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H` · espera: o sha40 do último commit desta entrega
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%B -- docs/qa/026-lote3-operacionais.md` · espera: contém 'Cartão: K-111'
- PQ-4 (cmd): `grep -rn -e '58 métricas' -e 'de 58' -e '7 de 7' -e 'toHaveLength(58)' /home/rodrigoisensee/MetricasDSPD-026/e2e/tests` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff c72b955a8d373eff99e6c7916634c7eba70461c9 --name-only -- web server packages` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-7 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-026 && pnpm run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui a contagem da E2E completa (passaram, falharam, pré-existentes do 041) e o comando exato. Se o parecer reprovar, PQ-1 fica "não cumprido" com o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
