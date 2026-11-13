---
tipo: review
contrato: 1
pedido: 103-release-2026-11-13
branch: docs/103-release
commit: fa1e81fbc6873b2b925d5adcfbb553b6d0875dfe
parecer: aprovado
revisor: tech-lead
data: 2026-11-13
---

# Code review: release 103 (develop em fa1e81fb contra a homolog)

## Atualização com a ponta da develop (E1.8, 2026-11-13)
Parecer: **aprovado** sobre a develop em fa1e81fb. A release passa a ter 20 PRs: os 18 abaixo mais o #380 (K-313 e K-307, 358a649e) e o #377 (K-286, fa1e81fb), mesclados pelo dono depois da E1.1.

- **Delta lido:** `git diff 6195b23f fa1e81fb`, 19 arquivos (+523 −29), 13 fora de `docs/` e `.md` (+259 −29): biblioteca (`packages/metricas/src/businessmap/apontamento/filtros.ts` e `index.ts`), web (Apontamento, `sustentacao.tsx`, `tokens.test.ts`, `lint.meta.test.ts`), teste de rota do servidor, `docs/api/apontamento.md` e os pareceres próprios dos dois PRs.
- **O que entra.** K-286: `filtrar` troca o booleano `soPessoa` por `modo: 'recorte' | 'diario'`, e o mapa diário passa a aplicar pessoa e equipe; o atípico continua decidido antes dos filtros, sobre o dia inteiro da pessoa. Contrato sem mudança de forma (`docs/api/apontamento.md`). K-313: a G2 casa `new SharedWorker`. K-307: teste de contraste dos tokens nos dois temas e o S12 sem tipo duplicado.
- **Migração:** nenhuma nova; a 0036 continua sendo a única da release.
- **Critério de cálculo (T2.6):** o K-286 muda o recorte do mapa por filtro escolhido por quem lê, não a regra do cálculo, e não pede versão de critério. Nenhuma ação nova do dono na base real.
- **Regras invioláveis:** várias equipes formam um só recorte, sem série, soma nem ordenação por equipe; a resposta segue só com `pessoaRef`. BusinessMap e Acelerato não se cruzam (o Apontamento é só do BusinessMap).
- **Pareceres próprios:** #377 com review aprovado em b0ba260b (`docs/reviews/097-k286-mapa-diario-equipe.md`), QA (`docs/qa/097-k286-mapa-diario-equipe.md`) e segurança aprovada em 62a622ab (`docs/security/097-k286-mapa-diario-equipe.md`; o delta até b0ba260b é só um caso de teste). #380 com review aprovado em 8c92543d (`docs/reviews/099-k313-k307-web.md`) e QA (`docs/qa/099-k313-k307-web.md`). Depois desses heads só entraram junções da develop sem resolução (`git show --cc` vazio em 095d55a5, a60c7154 e 5cae5ae9) e os próprios pareceres; nenhum arquivo do domínio mudou.
- **CI:** `gh pr checks 377` e `gh pr checks 380` todos `pass` (e2e-parte 1/2 e 2/2 inclusos; perf pulado pelo filtro); push na develop em fa1e81fb (run 43478355479) `success`. O A1 abaixo fica resolvido: o run 43474099226 sobre 6195b23f também terminou em `success`.
- **Segurança da release:** o parecer da E1.2 foi dado em 4b41380c e não cobre o #377. O K-286 tem gatilho LGPD (mapa pessoa × dia recortado por equipe), e o A1 do parecer próprio dele ("Pessoa n" reidentificável em equipe pequena) ficou à espera do dono. O dono decidiu 1c, sem piso (12/11), e confirmou na Decisão 28 = 28a (13/11). **A segurança da release precisa revalidar o delta 6195b23f..fa1e81fb** e registrar esse risco como aceito pelo dono, porque o parecer do K-286 diz "Riscos aceitos: nenhum". O #380 não tem gatilho de `R-SEGURANCA`: só teste e tipo no front.
- **Interface:** o K-286 muda o que o mapa diário mostra com o filtro Equipe; a validação manual da release (E1.6) precisa incluir esse cartão.
- **CHANGELOG:** #377 em Adicionado e #380 em Corrigido.

## Parecer anterior (E1.1, develop em 6195b23f)

Escopo: `git log --first-parent origin/homolog..6195b23f`, 18 PRs (#361 a #376, #378 e #379) sobre a homolog em 0528ffbd (release 101, PR 359 na `main`); 194 arquivos, +5197 −606, dos quais 114 fora de `docs/` e `.md` (+2594 −337). Etapa E1.1 do pedido `103-release-2026-11-13`. Ficam fora os PRs 377 (K-286) e 380 (K-313), abertos e fora da `develop`. Cada PR teve review, QA e, quando a classe pediu, segurança próprios (`docs/reviews/099-*`, `docs/reviews/102-*`); este parecer lê a release como um todo e não refaz os itens.

## Conferências

- **Diff por área:** biblioteca (`packages/metricas`: índice do Acelerato também em horas corridas, S1 pela unidade do alvo de cada célula, S12 com volume real, versão de critério do S12), servidor (carregador dos alvos no `ac:ref-sync`, turnos no `ref:sync-calendario`, de-para de severidade no `bm:ref-sync` e no projetor, `data_acordada` do deadline, O25 e S12 no mapa real, nomes exatos da lista fechada do Acelerato, mensagens de variável de ambiente sem valor), contratos (unidade do alvo, `horasPorDiaUtil`, nota do S12, `sem-dado`), web (S1, S9 e textos do dia útil, S12, catálogo), consultas só de leitura (B6-a e Q-RO-1), CI (lint do servidor), testes e documentos.
- **Migrações:** uma, a 0036 (`server/migrations/0036_ac_alvo_prioridade_unidade.ts`), com `checksums.json` atualizado e `down` que recusa sem mudar nada se houver unidade `corrido` gravada. A migração a partir da `main` é do portão da homolog (E1.5).
- **Contrato:** D3 torna obrigatória a `unidade` dos prazos no S1 (incompatível, aceite de uso único no #363 e #364, único consumidor a web deste repositório); D3b, D9 e K-296 são aditivos ou troca de valor do estado de origem sem consumidor externo. Registrado em "Mudanças que quebram".
- **Critério de cálculo (T2.6):** S12 com `criterio-2026-11-12-s12-volume-real` na biblioteca; D3 (S1 e Visão geral), D3b (calendário do Acelerato) e C8a (O16) gravam a versão ao carregar a referência, então a data é a do dia em que o dono roda a carga. Por isso as cargas vão no CHANGELOG como ações do dono, em ordem.
- **Regras invioláveis:** BusinessMap e Acelerato seguem separados (o dia útil de 528 min vale só no calendário do Acelerato; o BusinessMap segue com 8 h; severidade do fluxo vem só do BusinessMap); nenhum cálculo fora da biblioteca; nada simulado volta à web (G1 e G2 ajustadas no K-294); texto livre do Acelerato recusado na fronteira (D1a, K-305). Sem ranking nem comparação entre times.
- **Pessoa e segredo:** K-304 e K-311 imprimem só nomes de variável, nunca valor. Segurança da release é da E1.2; cito, não refaço.
- **Pareceres das junções fora da develop:** o review da junção do K-315 e K-306 (`docs/reviews/099-k315-k306-projetor-pg.md`, revalidado no 33edc8d5) entra nesta branch por cherry-pick de b4803d6e, da branch remota `fix/k315-k306-projetor-pg`; a segurança da junção sobe pela E1.2.
- **CI:** PR 378 com todos os checks verdes no head 33edc8d5 (inclui `e2e`, `e2e-parte` 1/2 e 2/2, `banco`). PR 379 mesclado às 17:34 com `testes`, `banco` e `e2e-parte` pendentes (runs 43474075454 e 43474083748) e o `filtro` do run de push vermelho; o CI do push na `develop` em 6195b23f (run 43474099226) estava na fila no momento deste review.
- **CHANGELOG:** os 18 PRs do range citados em [Não publicado] (conferido por script, número a número), com a seção nova "Ações do dono na base real depois desta release": `db:migrate`, `ref:sync-calendario`, `ac:ref-sync`, `bm:ref-sync`, `coleta ac --reconhecer-mudanca` e a coleta.
- **Quadro:** o `forge-check proximo` aponta o bloqueio "K-315 na develop", mas o K-315 está na `develop` pelo #378 (432dda3d); falta só mover o cartão no `KANBAN.md` (Jarvis).

## Achados
- A1 (recomendado) CHANGELOG.md:73 · O #379 (K-316) foi mesclado com testes, banco e e2e-parte pendentes; o código só muda um teste de tempo, mas o primeiro CI completo sobre 6195b23f é o do push (run 43474099226) ou o QA (E1.3). A E1.5 só segue com esse CI verde.
- A2 (recomendado) CHANGELOG.md:73 · Classe recorrente (merge com checks rodando: release 100 A2 e A4, release 101 A1, agora #379). A linha `AR-<n>` em `docs/engineering/achados-recorrentes.md` fica pendente: o arquivo não existe e está fora da lista do brief.
- A3 (recomendado) CHANGELOG.md:43 · o #377 (K-286, gatilho LGPD) entrou depois do parecer de segurança da release (4b41380c): a E1.2 revalida o delta 6195b23f..fa1e81fb e registra o risco aceito pelo dono (1c, Decisão 28a) antes da E1.5. Não bloqueia o code review.

## Parecer

Aprovado sobre a develop em fa1e81fb (E1.8): o #377 e o #380 não mudam o veredito; a E1.5 espera a revalidação da segurança da release (A3) e o QA da release (E1.3). O A1 está resolvido (run 43474099226 `success`).

Na E1.1: aprovado sobre a develop em 6195b23f. A release pode seguir para a homolog quando o CI do push em 6195b23f estiver verde e os pareceres de QA (E1.3) e segurança (E1.2) desta release estiverem gravados; o meu não depende deles.
