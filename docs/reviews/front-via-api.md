# Code review: front via API (FA-1 a FA-5, FA-001 a FA-005)

- Revisor: tech-lead · Data: 2026-10-13 · Rodada: 1
- Branch: `feature/front-via-api` contra `origin/develop` (14 commits, `18e7f73..11bc4a6`)
- Base lida: `docs/architecture/features/front-via-api.md`, `docs/qa/front-via-api.md`, `docs/qa/bugs/FA-001` a `FA-005`, o diff completo (contratos, `web/src/data/http/`, `VITE_FONTE`, `vite.config.ts`, `docker/web/Dockerfile`, `web/paridade/`, `scripts/com-api-mock.sh`, seed, migração 0014, `lgpd.ts`, S7, E2E `chromium-api` e `perf-api`).

## Parecer
**Ajustes necessários**, por dois itens bloqueantes que não são de lógica: B1 (ordem das migrações 0013 e 0014, uma condição de merge que fica comigo) e B2 (o QA precisa reexecutar o E2E em modo api depois das correções). O código, em si, está aprovado. Os itens recomendados podem ir em cartões próprios, menos R5, que é pré-condição para adotar a D2 (homologação em `VITE_FONTE=api`).

## Verificações executadas
| Verificação | Resultado |
|---|---|
| `flock /tmp/metricas-pesado.lock pnpm run pronto` | verde (exit 0); cobertura 100% em todos os pacotes (web 729, server 279 + 56 pulados de PG, metricas 462, mock 146, contratos 28, docs-contratos 102) |
| `pnpm run docs:check` | ok (340 páginas, 50 métricas, 2 eventos) |
| Paridade `bash scripts/com-api-mock.sh pnpm --dir web run test:paridade` (sob `flock`) | **51/51** verdes, reproduzido nesta revisão |
| E2E `chromium-api` / `perf-api` | não reexecutados por mim (ver B2) |

## Segurança (cyber-security)
| Item | Situação |
|---|---|
| Toda resposta validada pelo contrato | ok: os 6 métodos passam por `buscar()` com schema Zod (`HttpFonteMetricas.ts:47-78`); o O2 usa `resultadoO2PaginadoSchema` |
| Erro sem vazar detalhe | ok: `ErroApi.message` = `API <status> <code>`, e o `message` do servidor nunca chega à tela (`EstadoErro.tsx:39-45` mostra só nome e código); o log de resposta inválida tem só caminho e `requestId`, sem o corpo (`HttpFonteMetricas.ts:74`); coberto por teste e por FA5-10/13/14 |
| Cancelamento e timeout | ok: o `signal` do Query vai até o `fetch` (`useMetrica.ts`), com `AbortSignal.any` e timeout de 15 s. Ressalva em R1 (aborto durante a leitura do corpo) |
| Nenhum token/segredo no front | ok: só `VITE_FONTE` e `VITE_API_BASE`. Observação: `App.tsx` lê `import.meta.env` inteiro, então **todo** `VITE_*` do ambiente de build entra no bundle; a regra "nunca segredo em `VITE_*`" continua valendo |
| Mesma origem, sem CORS | ok: proxy do Vite e do nginx; o servidor não envia `Access-Control-Allow-Origin` (o grep não acha nada, e o FA5-03 assere). Ressalva em R4 (`VITE_API_BASE` absoluta) |
| `com-api-mock.sh` | aceitável: schemas temporários com prefixo `t??????_` no `metricas_test`; o Postgres compartilhado não é recriado (só sobe se a porta estiver livre); o `DROP` de reserva atinge só os schemas com o prefixo desta execução. Ressalvas em R11 |
| Migração 0014 reversível | ok: `down` com `DROP COLUMN IF EXISTS`; entra no up/down/up de `migracoes.pg.test.ts` via `MIGRACOES`; aditiva, sem reescrever a tabela |
| Exceção em `EXCECOES_PESSOA` | justificada: é só booleano, o texto nunca é gravado (o `seed.pg.test.ts` procura o texto em `dim_chamado::text` e não acha); a exceção é nominal (por tabela e coluna) e o data-model §4 e §9 foram atualizados |
| Não usar `.strict()` nos resultados | decisão correta e documentada em `docs/api/metricas.md:46` e no FA-004. O comportamento padrão do Zod (`strip`) mantém a defesa: campo não declarado nunca chega à UI. Ressalva de documentação em R12 |
| Regras invioláveis | ok: nenhuma métrica individual, nenhuma pessoa nas respostas, BM e AC separados (critérios gravados por fonte), cálculo só pela biblioteca (o seed e a API não recalculam), histórico preservado (o seed nunca sobrescreve) |

## Achados

### Bloqueia
**B1. Ordem das migrações: a 0014 entra antes de uma 0013 que ainda não está na develop.** `server/migrations/0014_ac_justificativa_informada.ts`, `server/migrations/checksums.json:14`.
- Problema: a 0013 (pesquisa, `52b61f8`) existe só na branch local `feature/lacuna-de-valor`. O runner usa `checkOrder: true` (`server/src/plataforma/db/migrar.ts:68`). Se esta branch for mesclada e a 0014 for aplicada em algum banco persistente (dev local, homologação) antes da 0013, a 0013 passa a falhar com "migração anterior não aplicada". Além disso, `docs/architecture/auditoria-banco.md:312,329` reserva os nomes `0013_outbox_indice_tipo` e `0014_integridade_checks`, o que gera colisão de numeração.
- Sugestão: mesclar `feature/lacuna-de-valor` na develop **antes** desta. Depois, `git merge origin/develop` aqui, resolver o `checksums.json` e reexecutar `test:pg` e a paridade. Se a ordem não puder ser essa, renumerar antes do merge. Atualizar a numeração reservada da auditoria (arquiteto).
- Responsável: tech-lead (sequência de merge); node-backend (conflito e renumeração, se houver); software-architect (auditoria).

**B2. O parecer do QA não tem o E2E em modo api depois das correções.** `docs/qa/front-via-api.md` (seção "Reexecução").
- Problema: a reexecução cobre paridade, `test:pg` e `pronto`. O último resultado registrado do `chromium-api` é 16/18, com FA5-01 `/sustentacao` e FA5-02 reprovados (FA-001). O `perf-api` mediu Sustentação e Visão geral sem as respostas 503. E os novos asserts de `data-erro-codigo` (FA-005) nunca rodaram (Chromium sem `libnspr4.so`).
- Sugestão: reexecutar `chromium-api` e `perf-api` (com `LD_LIBRARY_PATH` das bibliotecas locais, ou noutra estação), registrar o A1 de Sustentação e da Visão geral e fechar o FA-005 (ou deixá-lo explicitamente parcial, com `data-request-id` em cartão).
- Responsável: qa-engineer.

### Recomendado
**R1. Aborto ou timeout durante a leitura do corpo vira `RESPOSTA_INVALIDA` e `console.error`.** `web/src/data/http/HttpFonteMetricas.ts:70-75`.
- Problema: o `try` cobre só o `fetch` (headers). Se o Query cancelar, ou os 15 s esgotarem, durante `resp.json()`, o `.catch(() => null)` engole o `AbortError`, o `safeParse(null)` falha e o código registra "Resposta fora do contrato", um falso alarme no log. No E2E, a fixture `problemas` pode reprovar o FA5-16 de forma intermitente.
- Sugestão: no `catch` do `json()`, relançar quando `signal?.aborted` e mapear `limite.aborted` para o mesmo código de tempo esgotado de R2. Teste unitário com `fetchImpl` que devolve um corpo cujo `json()` rejeita depois do aborto.
- Responsável: react-frontend.

**R2. Timeout e rede indisponível recebem o mesmo código.** `web/src/data/http/HttpFonteMetricas.ts:55-58`.
- Problema: o tempo esgotado vira `REDE_INDISPONIVEL`, e nenhum teste cobre o timeout. Para o suporte e para o gatilho R2/R8 do plano (servidor lento), as duas causas são diferentes.
- Sugestão: `TEMPO_ESGOTADO` quando `limite.aborted`, sem texto novo na tela, mais um teste com `AbortSignal.timeout` simulado (injetar o tempo-limite por opção).
- Responsável: react-frontend.

**R3. `opcoesFiltro` não confere o domínio devolvido.** `web/src/data/http/HttpFonteMetricas.ts:96-99`.
- Problema: o `as Extract<...>` aceita `dominio: 'acelerato'` numa chamada de `businessmap`, porque o schema é a união.
- Sugestão: validar com `opcoesFiltroFluxoSchema` ou `opcoesFiltroSustentacaoSchema`, conforme o argumento, e remover o cast.
- Responsável: react-frontend.

**R4. `VITE_API_BASE` aceita URL absoluta.** `web/src/app/App.tsx:31`.
- Problema: a mesma origem é garantida por convenção, não por construção. Um valor `https://outro-host/...` faria o front chamar outra origem, e a CSP ainda não existe (ver I1).
- Sugestão: na partida, aceitar só caminho relativo (`/` inicial, sem `//`) e falhar rápido no resto, como já se faz com `VITE_FONTE`.
- Responsável: react-frontend.

**R5. O2: a decisão R3 do plano não foi implementada na tela (pré-condição da D2).** `web/src/features/operacional/components/CartaoO2.tsx:35-36`; `docs/architecture/features/front-via-api.md` (decisão sobre o O2 paginado).
- Problema: a dispersão, o "Ver dados em tabela" e a lista usam só `itens` da página 1 (até 200), e `itensMeta` não é lido em lugar nenhum da UI. Com mais de 200 itens em andamento, a dispersão do tipo escolhido perde pontos sem aviso, enquanto a aba mostra `abertos` completo: um corte silencioso. O mock agora também pagina, então o efeito vale nos dois modos. Hoje fica invisível porque o mock padrão tem 89 itens (medido nesta revisão).
- Sugestão: seguir a decisão do plano. A tela indica o total de `itensMeta` e trata a lista como amostra ("200 de N", texto a validar pelo UX); a tabela e a exportação pedem as páginas seguintes. Cenário de teste com mais de 200 itens (mock com escala maior). Pré-condição para adotar a D2.
- Responsável: react-frontend + ux-designer (texto).

**R6. Duas definições de "justificado" na S7.** `packages/metricas/src/acelerato/s7.ts:11-12` e `server/src/plataforma/db/seed.ts:128`.
- Problema: a biblioteca conta texto `''` ou só com espaços como justificado (`!== null`), e o seed (e, por consequência, o futuro coletor) usa `trim() !== ''`. Hoje a paridade passa porque o mock nunca gera texto vazio, mas é regra de cálculo definida em dois lugares.
- Sugestão: um predicado único exportado pela biblioteca (`justificativaInformada(texto)`), usado pela S7, pelo seed e pelo coletor. Se o briefing não disser se texto só com espaços conta como justificativa, isso vira **pergunta ao usuário**, não escolha no código.
- Responsável: node-backend.

**R7. Falta cartão para o coletor do Acelerato preencher `justificativa_informada`.** `docs/architecture/data-model.md:132` diz "preenchido pelo coletor/seed".
- Problema: só o seed preenche a coluna. Com dado real, o padrão `false` faria a S7 mostrar 0 justificados sem aviso. Nenhum item do `KANBAN.md` cobre isso.
- Sugestão: cartão do WS5 para o coletor derivar o booleano na fronteira, a partir do campo da allow-list, sem gravar o texto, e para registrar como a S7 trata versões coletadas antes da derivação.
- Responsável: Jarvis (quadro) + node-backend.

**R8. `criteriosDaFonte` descarta em silêncio um critério que afete as duas fontes.** `server/src/plataforma/db/seed.ts:164-166`.
- Problema: com `afeta.every(...)`, um critério misto não entra em nenhuma das fontes.
- Sugestão: falhar (ou testar) quando um critério do mock não for gravado em nenhuma fonte; o total gravado deve ser igual ao total distinto do mock.
- Responsável: node-backend.

**R9. A paridade pega o corpo bruto pela "última chave" do `Map`.** `web/paridade/paridade.test.ts:184` (e `:134`).
- Problema: `Map.set` numa chave que já existe não muda a posição dela. Se uma URL se repetir, `at(-1)` devolve o corpo de outra resposta. O `replaceAll` dos ids de critério troca qualquer string do JSON igual ao id do mock.
- Sugestão: montar a URL esperada (ou guardar a última URL numa variável dentro de `fetchGravando`) e trocar o id só nos campos de critério (`criterios[].id`, `marcacoes[].versaoId` etc.).
- Responsável: qa-engineer.

**R10. `test:paridade` sem `API_URL` termina verde com tudo pulado.** `web/paridade/paridade.test.ts:25`, `web/vitest.paridade.config.ts`.
- Problema: essa config existe só para a paridade. Rodá-la fora do script dá uma falsa aprovação, o que pesa quando ela entrar na CI de `homolog` (proposta D2).
- Sugestão: na config da paridade, falhar quando `API_URL` estiver ausente; o `skipIf` só faria sentido se o arquivo entrasse na suíte padrão, e não entra.
- Responsável: qa-engineer.

**R11. `com-api-mock.sh`: a limpeza de reserva depende do nome do container compartilhado, e não há guarda de banco de teste.** `scripts/com-api-mock.sh:24`, `:9`; `server/tests/pg/servidor-api-mock.ts:17`.
- Problema: (a) o `docker exec metricasdspd-postgres-1` fixa o nome do container: com `COMPOSE_PROJECT_NAME` diferente, a limpeza falha calada (`2>/dev/null`), e o script não deveria entrar no container compartilhado; (b) nada impede que `PG_TESTE_URL` aponte para o banco `metricas`. O dano fica limitado aos schemas com prefixo, mas o banco de desenvolvimento seria tocado.
- Sugestão: (a) fazer a limpeza de reserva por conexão (`psql "$PG_TESTE_URL"` ou um pequeno `tsx`) e avisar quando ela falhar; (b) em `servidor-api-mock.ts`, recusar URL cujo database não termine em `_test`.
- Responsável: qa-engineer (script) + node-backend (guarda).

**R12. O plano técnico ainda promete `.strict()` nos DTOs de resultado.** `docs/architecture/features/front-via-api.md:34` e `:57`.
- Problema: o texto contradiz a decisão do FA-004 e `docs/api/metricas.md:46`. Quem ler o plano entende que existe uma defesa que não existe nessa forma (a defesa real é o `strip`).
- Sugestão: corrigir as duas linhas ("campo não declarado é descartado pelo schema, nunca chega à UI; o corpo bruto da paridade detecta divergência") e registrar a regra de compatibilidade (resultado sem `.strict()`, acréscimo opcional compatível) como nota na ADR 0007.
- Responsável: software-architect.

### Informativo
- I1. A CSP com `connect-src 'self'` (S-25) ainda não está no `docker/web/nginx.conf`. É pré-condição para a D2, junto com R5, B2 e a paridade na CI de `homolog`.
- I2. A conferência de `X-Data-Referencia` e `X-Versao-Criterio` prevista no plano não foi implementada, e o `data-request-id` do FA-005 continua aberto. Não bloqueiam.
- I3. `justificativa_informada` fica fora de `ATRIBUTOS_CHAMADO`, e por isso fora das views da 0009 (imutáveis). Está documentado (`migracoes.estatico.test.ts:147`, data-model), e a API lê `dim_chamado` direto. Se algum consumidor passar a ler pela view, será preciso uma migração de view nova.
- I4. O seed grava uma `coleta_incremental` "sucesso" com `versao_coletor = seed-mock-coleta`: correto para a base fictícia, e a versão distingue essa coleta de uma real.
- I5. Commits em Conventional Commits pt-BR, um por mudança coerente; boa rastreabilidade com os cartões FA-x e os bugs.

## Próximos passos
1. qa-engineer: B2, depois R9, R10 e R11(a).
2. tech-lead: B1 (sequência com `feature/lacuna-de-valor`). Depois de B1 e B2 verdes, envio a branch e abro o PR para a `develop`.
3. react-frontend: R1 a R4 (pequenos, podem ir num commit nesta branch ou em cartão logo após); R5 antes da D2.
4. node-backend: R6 (com pergunta ao usuário, se o briefing for omisso), R8, R11(b). Jarvis: cartão de R7.
5. software-architect: R12 e a numeração reservada em B1.
