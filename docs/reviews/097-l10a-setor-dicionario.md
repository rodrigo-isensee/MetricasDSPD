---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l10a-setor-dicionario
commit: 86a3808ffcb19a0c2aaae420ce49ab4a51af3d01
parecer: reprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: L10a do 097 (E7), dicionário de setores e `opcoes.setores`

Diff lido: `git diff origin/develop...86a3808f` (12 arquivos, +167 -8). Plano: `docs/analises/097-plano-e5-e7.md`, §1, §2, §5 (linha L10a), §7 e §9.

## O que foi conferido
- **Escopo:** a lista `setores` entra no esquema fechado do arquivo de domínio (`strict`, código só dígitos, `textoSeguro(80)` com guarda de sobrenome, até 50 itens, sem quadro nem rótulo repetido). `listasDoArquivo` grava a lista como `setor_quadro`. O arquivo versionado nasce com a lista vazia, como manda a P-097-9. `lerSetoresBM` e `opcoes.setores` ficam só no BusinessMap. Sem migração, sem tabela e sem GRANT novo: é a via A do §1.3, ou seja, o mecanismo do 069 reusado.
- **Fora deste lote, ao contrário do que a tabela do §5 dizia:** `FiltrosFluxo.setor` e `FiltroFluxoChave 'setor'`. A entrada `setor` é declarada do L10b em `docs/api/metricas.md`. Aceito, porque o lote fica só com a resposta (A3).
- **Decisão sobre rótulo repetido:** a recusa do autor fica. O §1.3 é a guarda do arquivo, critério do QA e da segurança, e diz "sem rótulo nem código repetido". O §1.4 descreve a consolidação por `slug` no serviço, e essa consolidação continua no código (`servico.ts:49`) como defesa para nomes que só diferem na forma ("Plataformas" e "plataformas") e para linhas gravadas direto no banco. As duas regras convivem. Se a resposta da P-097-9 puser dois quadros num mesmo setor, a recusa de rótulo repetido do arquivo muda no PR das 7 linhas, que já tem parecer de segurança obrigatório pela `regra` do arquivo. Isso não se decide por inferência aqui.
- **Decisão sobre o `openapi.json`:** tem que ser regenerado neste lote. O schema da resposta (`opcoesFiltroFluxoSchema`) ganhou `setores`, e o `openapi.json` versionado não acompanhou. O job `openapi` do CI (`ci.yml:147-161`, `openapi:verificar`) reprova. O §2 do plano também o lista. Ver A1.
- **Contrato:** `setores` é opcional no zod e no tipo (`OpcaoFiltro[] | undefined`, por causa do `exactOptionalPropertyTypes`), assim a resposta de um servidor anterior segue válida. O schema do Acelerato recusa `setores`. Isso é compatível pela política de mudança §2.
- **Segurança:** o parecer do `security-engineer` (aprovado, no mesmo commit) é citado e não refeito. As recomendações A1 e A2 dele valem para o PR que preencher a lista: rótulo fechado no `z.enum` dos 7 nomes e o teste de fumaça com eles.
- **Regras invioláveis:** setor é recorte e não ranking. Não há contagem por setor, nenhuma coluna de pessoa nem nome de quadro é lido, e BusinessMap e Acelerato continuam separados.
- **Legibilidade e tipos:** `setor.ts` guarda o que o arquivo e a leitura do banco repartem, o que evita guarda duplicada. A consulta é parametrizada (`campo = $1`). `setoresPorSlug` calcula o `slug` três vezes por linha, o que é irrelevante com 7 linhas.

## Comandos (ferramenta)
- `pnpm --filter @metricas-dspd/server run openapi:verificar` (no head 86a3808f): `docs/api/openapi.json desatualizado: rode pnpm --filter @metricas-dspd/server run openapi:gerar`, saída 1. O `openapi:gerar` produz +21 linhas, o bloco `setores` em `GET /api/v1/filtros/{dominio}`, logo depois de `sistemas` (`openapi.json:294`). A árvore foi restaurada depois disso.

## Testes rodados (`VITEST_MAX_WORKERS=2`)
- `server/`: `tests/dominio-businessmap.test.ts tests/opcoes-setores.test.ts` deram `Test Files 2 passed (2)`, `Tests 63 passed (63)`.
- `server/`, vizinhos que leem as opções e o ref-sync (`app.test.ts`, `qa-f6-painel.test.ts`, `painel-real-f6.test.ts`, `ref-sync-businessmap-entrada.test.ts`, `dominio-motivo-bloqueio.test.ts`): `Test Files 5 passed (5)`, `Tests 85 passed (85)`.
- `packages/contratos`: `src/referencia.test.ts` deu `Test Files 1 passed (1)`, `Tests 3 passed (3)`.
- A suíte completa roda no CI do PR.

## Delta
Primeira rodada; sem delta.

## Achados
- A1 (bloqueante) docs/api/openapi.json:294 · openapi.json não regenerado: o schema de resposta ganhou setores e o job openapi do CI (openapi:verificar) reprova com 'desatualizado'. Rodar pnpm --filter @metricas-dspd/server run openapi:gerar e commitar o arquivo (+21 linhas). Dono: node-backend.
- A2 (recomendado) server/src/modulos/referencia/servico.ts:49 · A guarda slug(nome) !== '' não tem teste do ramo de falha: um rótulo só de pontuação passa pelo textoSeguro e vira slug vazio. Incluir no opcoes-setores.test.ts uma linha com esse rótulo, que deve sumir da resposta. Dono: node-backend.
- A3 (recomendado) docs/analises/097-plano-e5-e7.md:100 · FiltrosFluxo.setor e FiltroFluxoChave 'setor' saíram do L10a. O brief do L10b deve listá-los, para o contrato da entrada não se perder. Dono: Jarvis, no brief.
