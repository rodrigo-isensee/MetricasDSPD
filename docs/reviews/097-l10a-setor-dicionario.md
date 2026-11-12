---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l10a-setor-dicionario
commit: 977d1484196e59f0a587269b027f2862ef9cd036
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: L10a do 097 (E7), dicionário de setores e `opcoes.setores`

Diff lido: `git diff origin/develop...86a3808f` (12 arquivos, +167 -8). Plano: `docs/analises/097-plano-e5-e7.md`, §1, §2, §5 (linha L10a), §7 e §9. Volta 1 lida pelo delta (abaixo).

## O que foi conferido
- **Escopo:** a lista `setores` entra no esquema fechado do arquivo de domínio (`strict`, código só dígitos, `textoSeguro(80)` com guarda de sobrenome, até 50 itens, sem quadro nem rótulo repetido). `listasDoArquivo` grava a lista como `setor_quadro`. O arquivo versionado nasce com a lista vazia, como manda a P-097-9. `lerSetoresBM` e `opcoes.setores` ficam só no BusinessMap. Sem migração, sem tabela e sem GRANT novo: é a via A do §1.3, ou seja, o mecanismo do 069 reusado.
- **Fora deste lote, ao contrário do que a tabela do §5 dizia:** `FiltrosFluxo.setor` e `FiltroFluxoChave 'setor'`. A entrada `setor` é declarada do L10b em `docs/api/metricas.md`. Aceito, porque o lote fica só com a resposta (A3).
- **Decisão sobre rótulo repetido:** a recusa do autor fica. O §1.3 é a guarda do arquivo, critério do QA e da segurança, e diz "sem rótulo nem código repetido". O §1.4 descreve a consolidação por `slug` no serviço, e essa consolidação continua no código (`servico.ts:49`) como defesa para nomes que só diferem na forma ("Plataformas" e "plataformas") e para linhas gravadas direto no banco. As duas regras convivem. Se a resposta da P-097-9 puser dois quadros num mesmo setor, a recusa de rótulo repetido do arquivo muda no PR das 7 linhas, que já tem parecer de segurança obrigatório pela `regra` do arquivo. Isso não se decide por inferência aqui.
- **Decisão sobre o `openapi.json`:** tem que ser regenerado neste lote. O schema da resposta (`opcoesFiltroFluxoSchema`) ganhou `setores`, e o job `openapi` do CI (`ci.yml:147-161`, `openapi:verificar`) confere o arquivo versionado. Fechado na volta 1 (A1).
- **Contrato:** `setores` é opcional no zod e no tipo (`OpcaoFiltro[] | undefined`, por causa do `exactOptionalPropertyTypes`), assim a resposta de um servidor anterior segue válida. O schema do Acelerato recusa `setores`. Isso é compatível pela política de mudança §2.
- **Segurança:** o parecer do `security-engineer` (aprovado) é citado e não refeito. As recomendações A1 e A2 dele valem para o PR que preencher a lista: rótulo fechado no `z.enum` dos 7 nomes e o teste de fumaça com eles.
- **Regras invioláveis:** setor é recorte e não ranking. Não há contagem por setor, nenhuma coluna de pessoa nem nome de quadro é lido, e BusinessMap e Acelerato continuam separados.
- **Legibilidade e tipos:** `setor.ts` guarda o que o arquivo e a leitura do banco repartem, o que evita guarda duplicada. A consulta é parametrizada (`campo = $1`). `setoresPorSlug` calcula o `slug` três vezes por linha, o que é irrelevante com 7 linhas.

## Comandos (ferramenta)
- Rodada 1, no head 86a3808f: `pnpm --filter @metricas-dspd/server run openapi:verificar` deu `docs/api/openapi.json desatualizado`, saída 1.
- Volta 1, no head 977d1484 (ponta 9aed7350): `pnpm --filter @metricas-dspd/server run openapi:verificar` deu `openapi.json em dia`.

## Testes rodados (`VITEST_MAX_WORKERS=2`)
- Rodada 1, `server/`: `tests/dominio-businessmap.test.ts tests/opcoes-setores.test.ts` deram `Tests 63 passed (63)`; vizinhos (`app.test.ts`, `qa-f6-painel.test.ts`, `painel-real-f6.test.ts`, `ref-sync-businessmap-entrada.test.ts`, `dominio-motivo-bloqueio.test.ts`) deram `Tests 85 passed (85)`; `packages/contratos` `src/referencia.test.ts` deu `Tests 3 passed (3)`.
- Volta 1, `server/`: `tests/opcoes-setores.test.ts tests/dominio-businessmap.test.ts` deram `Test Files 2 passed (2)`, `Tests 64 passed (64)`.
- A suíte completa roda no CI do PR.

## Delta
Volta 1. Lido: `forge-check parecer delta docs/reviews/097-l10a-setor-dicionario.md`, intervalo `86a3808f..9aed7350`; no domínio, só `docs/api/openapi.json` e `server/tests/opcoes-setores.test.ts`. O código revisado é o `977d1484`; o `9aed7350` é o parecer do QA.
- **A1 fechado.** O `openapi.json` ganhou o bloco `setores` (+21 linhas, logo depois de `sistemas`), e o `openapi:verificar` passa.
- **A2 fechado.** O teste novo manda o rótulo `???`, que passa pelo filtro de `lerSetoresBM` (código numérico, rótulo não vazio, sem sobrenome nem arroba) e chega à guarda `slug(nome) !== ''` de `servico.ts:49`. Sem a guarda, a resposta traria `{ id: '', nome: '???' }` e o `toEqual` falharia: o teste prende o ramo de falha.
- **A3** segue como recomendação ao Jarvis, para o brief do L10b; não depende deste código.

## Achados
- A3 (recomendado) docs/analises/097-plano-e5-e7.md:100 · FiltrosFluxo.setor e FiltroFluxoChave 'setor' saíram do L10a. O brief do L10b deve listá-los, para o contrato da entrada não se perder. Dono: Jarvis, no brief.
