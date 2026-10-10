# Code review: develop antes do PR (r1)

- Data: 2026-10-10 18:32 (BRT)
- Revisor: tech-lead
- Escopo: `main` (db0819b) até `develop` (2193c78), 46 commits, 324 arquivos (+44.477 / -14.964). Revisão por amostragem guiada pelo risco.
- **Parecer: aprovado com recomendações.** Não há bloqueantes.

## Verificações executadas
| Verificação | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` + `pnpm run pronto` (worktree limpo em 2193c78) | ok. Testes: contratos 22, metricas 343, mock 107, server 233 (+43 pg pulados), web 558. Cobertura 100% em todos os pacotes. Orçamentos F6 184,8 KB (<200), F8 111,6 (<130), F11 132,6 (<150, só sob demanda), F9 8,1 (<120) |
| `pnpm run test:pg` (árvore principal limpa, mesmo commit) | ok, 9 arquivos, 43 testes |
| `gh run list --branch develop --limit 3` | os 3 últimos com sucesso, incluindo 2193c78 |

## O que foi conferido
1. **Server.**
   - `grants.ts` começa com REVOKE geral. `dspd_api` recebe GRANT por coluna e exclui `COLUNAS_PESSOA` (`dim_card.responsaveis`, `dim_card_versao.responsaveis`, `fato_transicao.usuario`); `stg_`, `evt_` e `*_versao` não são liberados para a API.
   - `lgpd.ts` é a fonte única da regra, e os testes estáticos usam o mesmo arquivo.
   - `repositorio.ts` lista as colunas explicitamente, sem `SELECT *`, e cada consulta lê um único schema (BM ou AC). Arquivados e excluídos permanecem na base.
   - Nenhum SQL proibido no código de execução. `DROP SCHEMA` aparece só em `limpar-testes`, restrito ao padrão de teste. O único `DELETE` é a retenção de `processado` da outbox, documentada.
   - Gatilhos de imutabilidade bloqueiam UPDATE, DELETE e TRUNCATE.
   - Webhook: autentica no `onRequest`, antes de ler o corpo; compara o segredo em tempo constante; segredo com mínimo de 16 caracteres; limite de 256 KB; deduplica pelo SHA-256; grava staging e outbox na mesma transação.
   - Cache: separado por domínio e por versão de carga, invalidado pela marca d'água e pela versão de critério; ETag e `private, max-age=60`.
   - O OpenAPI não tem nenhum campo de pessoa. A migração 0012 é nova; as 0001 a 0011 não foram editadas no último commit; existe migração de volta (down).
2. **Pedido 007.** `PREFERENCIAS_PADRAO` não oculta nada. Não há `ocultar` na URL (há teste). O alerta da faixa "Pede atenção" continua aparecendo com o selo "métrica oculta" (`FaixaAtencao.tsx:122`). O aviso de critério alterado em métrica oculta nunca some (`AvisosCriterioOcultas`). A Visão geral fica fora do recorte. Preferência corrompida volta ao padrão.
3. **Pedido 008.** O PDF é gerado no cliente, com jsPDF num chunk sob demanda. `ORDEM_FONTES` põe BusinessMap antes de Acelerato, em seções separadas. "Dados fictícios" aparece no texto e no nome do arquivo. Nenhuma chamada de registro. O gráfico vira tabela (`modelo.ts:248`) por causa do orçamento F11.
4. **pnpm, CI e Dependabot.** Lockfile congelado. O CI roda lint, format, typecheck, cobertura, test:pg (filtrado por caminho), openapi e E2E (em PR e execução manual). O Dependabot agrupa npm e actions. O pre-push bloqueia a `main`.
5. **Regras invioláveis.** Nenhuma métrica por pessoa e nenhuma mistura BM×AC. Todo cálculo passa por `calcularMetrica`. Itens já declarados pelos autores e aceitos: `src/entradas/**` fora do threshold de cobertura (só ligação, sem lógica); convenções provisórias (§11/§12 e `server.md`); S-13, consumidor do webhook, `ref:sync` e coletor ainda não existem.
6. **Documentação.** `docs/architecture/server.md` §S-11/S-12, `docs/api/metricas.md`, `docs/api/fontes.md` e `openapi.json` estão atualizados.

## Bloqueantes
Nenhum.

## Recomendados
| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| R1 | `server/src/plataforma/eventos/outbox.ts:71` e `server/src/entradas/worker.ts:15` | O evento `bm.webhook.recebido` não tem consumidor registrado. Com o webhook ligado e o worker rodando, cada entrega vira `falha` após 8 tentativas e não é retentada. O dado bruto continua em `stg_webhook_evento`, mas a outbox perde o rastro. | Até a S-13: deixar como `pendente` (sem tentativa) evento sem consumidor, ou registrar a restrição "não ligar `WEBHOOK_BM_SEGREDO` antes do consumidor" no `server.md` e no `.env.example`. Teste novo cobrindo o caso. Dono: `node-backend`. |
| R2 | `server/migrations/0012_bm_limite_wip_fluxo_indices.ts:14` | A migração junta uma tabela nova e cinco índices, contra a prática "uma mudança por migração". | Como nada foi aplicado em produção, pode ser dividida agora (0012 tabela, 0013 índices) ou ficar registrada como exceção. Não editar depois da primeira aplicação real. |
| R3 | `web/vite.config.ts:62` | `PlaceholderPainel.tsx` é código morto excluído da cobertura ("remoção pendente de aprovação"). | Remover numa `chore` separada; não depende de produto. |
| R4 | `docker-compose.yml:6` | `container_name: dspd-postgres` fixo faz o `test:pg` falhar a partir de um worktree (conflito de nome com o contêiner da árvore principal). | Tirar o `container_name` ou parametrizá-lo; ajuda quem revisa e o QA em worktree. |
| R5 | `docs/api/openapi.json` | São 21 mil linhas versionadas num commit de feature, o que dificulta a revisão do diff. | Manter (o CI confere se está em dia), mas citar no PR que o arquivo é gerado (`pnpm openapi:gerar`). |

## Commits
O histórico segue Conventional Commits em português, com escopos claros. `2193c78` agrupa S-11 e S-12 (módulo, rotas, webhook e migração); é aceitável porque o CI passou nesse commit, mas o ideal seria separar o webhook.
