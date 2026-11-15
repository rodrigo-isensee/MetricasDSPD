---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-release
commit: 4d89240da40fb458d2c4b607c52b887219e15229
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: release 105 (develop contra main)

Head revisado: `origin/develop` = `4d89240da40fb458d2c4b607c52b887219e15229` (inclui o PR 469, mesclado depois do `Revisar-sha` 0358e417 do brief; esperei o merge). A ponta de `docs/105-release` (`d2a6a658`) já contém esse head (`git merge-base --is-ancestor origin/develop HEAD` = sim), então o merge pedido no brief não mudou nada.

## Achados
- A1 (recomendado) docs/devops/105-roteiro-dono.md:65 · o passo 0.3 ainda chama o `ac:reprojetar-fluxo` de "branch feature/105-ac-reprojetar-fluxo ... precisa estar mesclado"; o 469 já está na develop (mesmo achado A3 do review). A linha 5 também cita a ponta 0358e417, velha. Texto, não afeta comando.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Suíte completa no CI da develop com o 469 | `gh run view 43764517252` (CI, head 4d89240d): build, openapi, filtro, imagem, rapida, seguranca, banco e testes = success; run `completed success` | suíte única; migrações no job `banco` | passou |
| e2e verde no último PR | `gh pr checks 469`: `e2e-parte (1/2)` e `(2/2)` pass | fluxo ponta a ponta (nos runs da develop e2e e perf saem `skipped`, como na 104) | passou |
| Roteiro: comandos e scripts existem | `server/package.json` tem `ac:reprojetar-fluxo`, `ac:ref-sync`, `bm:ref-sync`, `bm:coleta`, `bm:projetar`, `bm:criterios-classe-servico`; raiz tem `db:up`, `db:migrate`, `coleta` | nome de script inexistente | passou |
| Roteiro: argumentos | `bm:coleta carga-inicial --projetar` (`coleta-comando.ts`); `ref-sync-*`: data opcional, mais de um argumento recusa (rc 2); `criterios-classe-servico [AAAA-MM-DD]` recusa data inválida (rc 2) e grava via migrador, idempotente; `ac:reprojetar-fluxo` sem argumento, JSON de contagens, rc 1 em erro; `coleta ac` aceita só `--releitura` e `--reconhecer-mudanca` | argumento inválido, repetição | passou |
| Roteiro: `.env` da pasta original | os programas `bm:*` e `criterios-*` usam `process.loadEnvFile` com ENOENT tolerado (não sobrescreve variável já carregada); `coleta.sh` lê o `.env` só se existir | pasta nova sem `.env` | passou |
| Roteiro: migração 0038 e consultas | `server/migrations/0038_ac_dim_chamado_fluxo.ts` (coluna `fluxo` nula, aditiva); `ref_versao_criterio(vigente_desde, referencia)` e `ref_dominio.vigente_ate` existem; banco `metricas` e serviço `postgres` no Compose; `fase_deteccao_coluna` existe no JSON do dicionário | coluna nula, vigência | passou |
| Prova das árvores (assistente, 15/11) | `git rev-parse origin/homolog^{tree}` = `origin/main^{tree}` = `ae5fbd15…`; `git merge-tree --write-tree` da develop sobre main e sobre homolog dão a mesma árvore `75bddf75…` | main e homolog idênticas; merge pela homolog = merge direto | passou |
| Regras invioláveis | o diff da release não traz ranking individual, filtro por pessoa nem mistura BM e AC (o roteiro mantém "Sustentação só Acelerato") | métrica individual, mistura de fontes | passou |

## Validação manual do dono, na tela (depois do roteiro, não feita por mim: base real fora do meu alcance)
- Operacional: O15 (fase só com 20 bugs ou mais), O18 (mínimo 20 entregas), O24 por classe.
- Tático: T1, T2, T4, T6 e O6 só com as quatro classes (sem Intangível) e a marca de critério na data do passo 4.
- Sustentação: S5, S6 e S7 com números e a nota de chamados fora do fluxo, só se o fluxo estiver preenchido (0.3); "última carga" da tela mostra a hora da reprojeção até a próxima coleta.
- Abaixo do mínimo de itens a tela mostra "sem dado" por regra; não é erro.
- Contagens das conferências: total de cards não cai abaixo de 18879; `com_fluxo` sai de 0; as linhas marcadas "a confirmar" no roteiro (357 vigentes, duração do passo 3) o dono anota.

## Resultado real
- Não rodei a suíte local: o CI do head 4d89240d, run 43764517252, está verde (cito o check-run, não `.verde` local). Banco local não usado.
- Achados novos: só A1, recomendado. Bugs 0. Mutação não se aplica: o diff não toca `bin/`, `hooks/` nem `.githooks/`.
- Tentei o merge de `origin/develop` na ponta antiga da branch (df9eba57): deu conflito só em `CHANGELOG.md` (texto do passo do 469). A ponta atual (d2a6a658) já o resolveu; conferido.
