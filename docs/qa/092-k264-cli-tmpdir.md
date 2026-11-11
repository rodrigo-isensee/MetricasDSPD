---
tipo: qa
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: fix/k264-cli-tmpdir
commit: 6d2e15be27630e6f75d21ddb7876f7b3ed18b074
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: K-264, testes de CLI repassam TMPDIR ao processo filho

**Veredito: aprovado.** Classe T (só `server/tests/`, nenhum arquivo de produção). Sem critérios `CA-n` de UX; as obrigações são as do cartão K-264 e a regra do K-261.

## Execução (no sandbox, `--maxWorkers=2`, R-TETO)
Comando: `npx vitest run --maxWorkers=2` nos cinco arquivos de CLI (apontamento-entradas, ref-sync-ac-entrada, ref-sync-apontamento-entrada, ref-sync-businessmap-entrada, ref-sync-calendario-entrada), com `TMPDIR` do sandbox definido.
Resultado: `Test Files 5 passed (5)`, `Tests 38 passed (38)`, 7,56 s.

## Tabela obrigação, teste e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-264: filho dos testes de CLI roda no sandbox com pasta temporária gravável | os 38 testes dos cinco arquivos | `TMPDIR` repassado ao filho | passou |
| K-261: filho segue sem o `.env` real | `ref-sync-apontamento-entrada.test.ts`, caso "ignora um .env de mentira que define PG_REF_URL" (com controle) | `.env` fora do ambiente do filho | passou |
| Ajudante só repassa PATH e TMPDIR (sem herdar o resto) | leitura do diff de `ajuda-cli-filho.ts` e os testes de "sem configuração" (`PG_REF_URL` ausente) | env mínimo | passou |

## Mutação
Mutante: remover do ajudante as linhas que repassam `TMPDIR` (`server/tests/ajuda-cli-filho.ts`, 2 linhas). Resultado: `Failed Tests 31` (por exemplo `AssertionError: expected 1 to be 2`), ou seja, os testes voltam a cair no sandbox. Arquivo restaurado a partir de cópia e `git status` limpo antes do commit. Mutante morto.

## Vermelho antes do verde
O vermelho é o da mutação acima: sem o repasse, 31 testes caem; com ele, 38 passam. Não há teste novo; o ajudante é código de teste.

## Achados
