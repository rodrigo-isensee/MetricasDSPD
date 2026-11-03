---
tipo: review
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-api-so-real
commit: 110e4678705dfd44eb72d647c4b2a49d3ebe1981
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 060-triagem-dependabot, branch da API (P2, P3 e a parte de servidor do P5) (E2.14, K-195)

**Rodada 1. Veredito: reprovado em `110e467`.** O código faz o que os itens P2, P3 e P5 (servidor) de `docs/architecture/060-sem-mock.md` e a ADR 0026 pedem, e não achei defeito de lógica. Reprovo por um bloqueante só, de forma do PR (A1): a branch leva dois comportamentos. A divisão é por arquivo e não muda nenhuma linha de código (ver "Como sair do A1").

## O que foi lido
Diff `3c284ff...110e467` (commits `0ea6246`, `45db69a` e o merge `110e467`), sem o `docs/api/openapi.json`, que é gerado (`openapi:gerar`; o job `openapi` da CI o confere).

- **P2, recusa na partida:** `config.ts:651-659`. `DADOS_FONTE` e `DSPD_SCHEMA_PREFIXO_SEED` recusam a partida mesmo vazias (`env[nome] !== undefined`), antes do `validar`. A mensagem leva só os nomes das variáveis, sem valor, e o teste prova isso com um valor-sentinela. `DSPD_MODO_MOCK` aceita só o literal `homologacao`, e qualquer outro valor reprova pelo nome da variável.
- **Mock só explícito:** `app.ts:194-202`. `modoMock` é `true` só com `deps.modoMock === true`. A entrada `api.ts:18` liga o modo só com `DSPD_MODO_MOCK === 'homologacao'`, e os testes ligam por injeção. As fontes fictícias só são carregadas por `import` dinâmico no modo mock, e `x-dados-ficticios: 1` vai em toda resposta pelo `onSend`. As extensões aceitam `null` para o caso "modo mock sem extensão". O compose de homologação passa a variável. Devops cita e confere isso, e eu não refaço.
- **P3, portão:** `servico.ts:579-592`. Fora do mapa e fora do modo mock, a métrica responde `corpoSemDadoReal(id)` antes de qualquer leitura: sem carga, sem `versaoCriterio`, sem cálculo. O aquecimento pula essas métricas. `rotas.ts` faz o schema de saída virar `união(resultado, SemDadoReal)`, tira a paginação do O2 no estado sem dado e marca `x-estado-dado`. A ETag e o 304 seguem iguais aos das outras métricas, e a data futura segue 400.
- **Contrato:** `origem.ts`. `semDadoRealSchema` é `strict`, com `motivo` `min(1)`. PV1 e BLOQUEADOS entram no mapa. `motivoSemDadoReal` usa o motivo do mapa ou o genérico. O id `SemDadoReal` sai como `$ref` na OpenAPI. A doc `docs/api/metricas.md` (estado, cabeçalhos, 503 só no modo mock) e o `docs/architecture/server.md` foram atualizados na entrega.
- **VISAO_GERAL sem 503:** cai no portão antes do `METRICAS_COM_ALVOS`. O 503 `REFERENCIA_AUSENTE` só existe no modo mock, e o comentário de `servico.ts:434-437` diz isso.
- **Fim das duas bases:** `SMock`, `ehReal`, `esquemasDe` e as chaves `real|base` saíram. A carga, a versão e o cache passam a ser por domínio, e BusinessMap e Acelerato continuam com carga e cache próprios. `times: !modoMock` em `rotasReferencia` mantém a lista de times ativos na base real.
- **A1, A2 e A4 do review do P1:** a trava `dspd:seed` (`guarda-seed.ts:676-679`) é tomada pela guarda da coleta (`exigirEsquemaSemSeedNoPool`, numa transação curta) e pela do projetor (na transação dele). A guarda do Acelerato fica dentro de `comTravaDaFonte` e, quando recusa, vai ao log com o código, sem registrar falha (`coletor.ts:269-281`). `cards` passou a se chamar `itensReais`.
- **Webhook (A3 da ADR 0026):** `contarEventosDeWebhook` só no esquema do BusinessMap, com o identificador validado. A mensagem do seed acrescenta a tabela e a contagem. O receptor do webhook não ganhou guarda, como decide a ADR.
- **Merge `110e467`:** a develop (`3c284ff`) é o squash do P1 da própria branch. `git diff 95e18de 3c284ff` só mostra o frontmatter de `docs/devops/060-seed-recusa-real.md`, e o merge ficou com a versão da develop. `git diff 45db69a 110e467` é só essa linha. A resolução pela versão da branch não perdeu nada da develop, e a árvore de código do `110e467` é a do `45db69a`.
- **Testes:** `painel-real-f6.test.ts` cobre o portão sem nenhuma leitura (todos os ids fora do mapa, VISAO_GERAL sem alvos, cache e ETag, aquecimento sem o seed), o selo só no modo mock e o O8 calculado no modo mock. `plataforma2.test.ts` cobre a recusa das variáveis e o literal. `origem.test.ts` cobre o contrato. `esquema-com-seed.test.ts` cobre a ordem trava → guarda → `ROLLBACK` e a trava da fonte ocupada. `seed-recusa-real.pg.test.ts` e `seed.duble.test.ts` cobrem o webhook. `qa-sust-real.pg.test.ts` passou a afirmar que nunca vem o número do seed.
- Práticas (`docs/engineering/praticas.md`, seções 2 e 3, no que o diff alcança): sem `any` novo, sem `catch` vazio, erro de domínio tipado. Não há migração, então não há revisão de modelagem. As regras invioláveis estão preservadas: nenhum cálculo fora da biblioteca, os dois domínios separados e a regra dos 20 itens intocada nas métricas reais.

## Ferramentas, teto e outros pareceres
- O `praticas.md` não tem regra "decidida por: `<comando>`", e a pendência com o arquiteto continua a mesma do `060-seed-recusa-real.md`. Cito o autor, sem refazer: `pronto` rc=0 em `0ea6246` e em `45db69a`, `test:pg` com 225 de 232 em `45db69a` e as 7 falhas só no `apontamento-rota.pg` (autenticação do `dspd_api_apontamento`, exceção prevista). Em `110e467`, typecheck e lint verdes no pre-push. A suíte desse commit fica para a CI do PR (decisão técnica do Jarvis de 22:00). Como a árvore de código é a mesma do `45db69a`, a prova do autor vale para ela.
- Decisão M14, `git diff --numstat --no-renames 3c284ff...110e467`, sem `.md` e sem a OpenAPI gerada: **648 linhas** no total. São 128 das guardas do seed (A1 desta lista) e 520 da API. Para a parte da API, **aceito a exceção ao teto**. P2 e P3 não se separam: sem o portão, tirar o modo mock faz as métricas fora do mapa calcularem sobre a base real sem extensão. Uns 300 dos 520 são a troca mecânica de `SMock`/`fonteDados` por `modoMock` em 20 arquivos de teste. Condição: o PR da API leva no corpo `teto: excedido, <n> linhas, P2 e P3 do 060-sem-mock: a API sem modo mock e o portão do mapa real não se separam; troca mecânica de SMock por modoMock nos testes`, com o `<n>` recontado na abertura. Sem essa linha, vira achado bloqueante.
- Segurança: `docs/security/060-api-so-real.md`, **reprovado** em `110e467`. O A1 dele (o modo mock sobe sobre base com coleta real) é bloqueante e devolve à parte. O A2 dele é a janela da trava curta da coleta, que também vi e não repito como achado meu. Não refaço nenhum dos dois. Devops: `docs/devops/060-api-so-real.md`, aprovado, que cito sem refazer.

## Como sair do A1
A divisão é por arquivo, sem mudar código. Os 11 arquivos das guardas são `server/src/plataforma/db/guarda-seed.ts`, `server/src/plataforma/db/seed.ts`, `server/src/modulos/acelerato/{coletor,erros}.ts`, `server/src/modulos/businessmap/coleta.ts`, `server/src/modulos/businessmap/apontamento/coleta.ts`, `server/tests/{esquema-com-seed,guarda-seed,seed.duble}.test.ts`, `server/tests/seed-recusa-real.pg.test.ts` e `server/tests/acelerato-duble.ts`. Nenhum toca a API, e nenhum arquivo da API toca as guardas.

1. Uma branch nova a partir da develop recebe esses 11 arquivos, no estado de `110e467`, num commit só. O PR dela fica com 128 linhas, abaixo do teto. Precisa de QA próprio. Este review vale para ela no conteúdo, e o `forge-check` aponta o que revalidar.
2. Depois que esse PR for mesclado, `feature/060-api-so-real` traz a develop. O conteúdo das guardas é igual nos dois lados e não dá conflito, e o diff da branch contra a develop fica só com a API. O alcance da revalidação dos pareceres desta branch sai do `forge-check pr`.

A correção do A1 de segurança vai na branch da API, no mesmo passo.

## Achados
- A1 (bloqueante) server/src/modulos/acelerato/coletor.ts:269 · A branch tem dois comportamentos: a API só com dado real (P2, P3, P5) e o reforço das guardas do seed (A1, A2 e A4 do P1, A3 da ADR 0026; 128 linhas em 11 arquivos). A M14 exige dois PRs. Sugestão: dividir por arquivo, como na seção acima.
- A2 (recomendado) server/src/plataforma/config.ts:651 · O `.env.example` ainda cita `DADOS_FONTE` e `DSPD_SCHEMA_PREFIXO_SEED` (relato do autor; agentes não leem `.env*`), e um `.env` copiado dele faz a API recusar a partida. Sugestão: o dono tira as duas linhas, e o PR da API lista isso como ação do dono.

## Parecer
Reprovado só pelo A1, que é de forma do PR: dois comportamentos numa branch. O conteúdo de P2, P3, P5 (servidor), A1, A2, A4 e da guarda do webhook está correto e coberto por testes. A volta é a divisão por arquivo da seção "Como sair do A1", junto com o A1 de segurança na branch da API. Na revalidação, leio só o delta pelo `forge-check delta`. O A2 é recomendação e não devolve.
