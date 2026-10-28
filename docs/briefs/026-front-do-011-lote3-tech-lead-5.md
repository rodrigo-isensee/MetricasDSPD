Agente destino: forge:tech-lead
Pedido: docs/pedidos/026-front-do-011-lote3.md
Tipo: review
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.4 do pedido 026 (cartão K-111), complemento do re-review já conferido (c72b955a8d373eff99e6c7916634c7eba70461c9): o `forge-check pr` acusa que a versão atual do parecer não tem registro de autoria do papel tech-lead (`.forge/run/autoria.jsonl` só tem a versão de 15:52, sha256 1e342ba8…; a do commit c72b955 tem sha256 d1dcb7741b27c38971145b1cdab9bdf79ae23f119f9aa07a7dbee9ef73358a7f). Sem o registro, o portão de review (R-REVIEW) não fecha e o QA fica fora de ordem. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, branch `feature/026-lote3-operacionais`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md` (o seu parecer, inteiro, para regravá-lo).

## Entregar
- (E1, E1.4) Regravar `docs/reviews/026-lote3-operacionais.md` da worktree com a ferramenta de escrita (Write ou Edit, que o hook registra; não por Bash, sed ou python), com o mesmo conteúdo do commit c72b955, para o hook gravar a autoria desta versão. Sem mudança de texto, sem commit novo, sem push.
- (E2, E1.4) Revisão do E2: nada a revisar de novo; o parecer de c72b955 já a cobre.
- (E3) Nada a entregar aqui: não nesta delegação (a etapa dele está no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · já entregue (dd9a91d)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · cumprida
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel, depois desta
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · outra delegação, em branch própria
- Mudar o veredito ou os achados; código ou testes; rodar suítes de teste; PR; o quadro; ler ou editar o `.env`; as worktrees dos pedidos 041 e 042.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- R-REVIEW: o parecer é escrito pelo tech-lead. R-VERIFY: nunca `--no-verify` nem `--force`. Teste: nenhum.

## Pronto quando
- PQ-1 (cmd): `grep -c '026-lote3-operacionais.md.*d1dcb7741b27c38971145b1cdab9bdf79ae23f119f9aa07a7dbee9ef73358a7f.*tech-lead' /home/rodrigoisensee/MetricasDSPD/.forge/run/autoria.jsonl` · espera: linhas>=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 rev-parse HEAD` · espera: igual 'c72b955a8d373eff99e6c7916634c7eba70461c9'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Diga como o parecer foi gravado na versão anterior, se souber (para a retrospectiva). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
