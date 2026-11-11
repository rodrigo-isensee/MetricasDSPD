---
tipo: qa
contrato: 1
pedido: 096-criterios-apontamento-env
branch: fix/k270-criterios-env
commit: 3316cce9582e2c8aeda9180c60fc453aa123f4b0
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: critérios do apontamento carregam o .env da raiz (096, E1.3, K-270)

Links: pedido `docs/pedidos/096-criterios-apontamento-env.md`, base develop eac38a64.

## Veredito
**Aprovado.** Diff `eac38a64..3316cce9`: `server/src/entradas/criterios-apontamento.ts` (carregador do `.env` da raiz), `server/package.json` (script `bm:criterios-apontamento`), teste novo e `CHANGELOG.md`. Nenhum bug.

## Execução
- `npx vitest run tests/criterios-apontamento-entrada.test.ts --maxWorkers=2` (R-TETO): 1 arquivo, 3 testes passaram, 0 pulados.
- Hermético: o filho recebe só PATH e TMPDIR (`ambienteFilho`) e `cwd` em pasta temporária; `process.loadEnvFile` é trocado por um módulo de teste (no-op, ou leitura de um `.env` de teste na pasta temporária). O "banco" é um socket local em 127.0.0.1 que recusa. Nenhum teste lê o `.env` real nem toca base real; eu não abri nenhum `.env`.
- Falha sem `.env`: a saída é `Configuração inválida (variáveis: PG_MIGRADOR_URL)`, só o nome da variável faltante, código não zero. No ramo com `.env`, o teste afirma que o valor plantado (`segredo-de-teste`) não aparece em stdout nem stderr. O ramo de erro que não é ENOENT imprime só o código do erro (`falha ao ler o .env (<código>)`) e sai com 2; esse ramo não tem teste, e o código dele não imprime conteúdo do arquivo.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Script `bm:criterios-apontamento` existe e usa o mesmo carregador dos bm:* | 1º teste (package.json e fonte contra `ref-sync-apontamento.ts`) | script ausente; carregador diferente | passou |
| Sem `.env`, falha honesta sem vazar nada | 2º teste | `.env` ausente | passou |
| Com `.env`, lê o da raiz e usa o `PG_MIGRADOR_URL` dele, sem imprimi-lo | 3º teste | caminho da raiz; segredo fora da saída | passou |

## Mutação no código alterado
- Mutação 1: trocar a linha `process.loadEnvFile(join(raiz, '.env'));` por comentário. Resultado: 2 falharam (1º: `expected ... to contain "process.loadEnvFile(join(raiz, '.env'))"`; 3º: `expected ... not to contain 'Configuração inválida'`), 1 passou. Mutante morto.
- Mutação 2: trocar a pasta raiz `new URL('../../../', import.meta.url)` por `'../../'`. Resultado: o 3º teste falhou (`expected '/home/.../MetricasDSPD-052...' to be '/home/.../MetricasDSPD-052...'`, caminho lido diferente da raiz), 2 passaram. Mutante morto.
- Os dois arquivos foram restaurados por `git checkout`; `git status` limpo antes do commit.

Vermelho antes do verde: o teste é novo e a mutação 1 é o equivalente a rodar sem a implementação do carregador (falha); o teste de caminho só falha pela mutação 2.

## CHANGELOG (E2)
Linha do pedido 089 no `CHANGELOG.md` (56): os dois passos do roteiro (gravação do critério e item 2 da ordem de implantação) usam `pnpm --filter @metricas-dspd/server run bm:criterios-apontamento <data>`; não sobrou a forma antiga `criterios-apontamento <data>` solta.

## Achados
