---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-dominio-limite-texto
commit: 6a4a95e56a3c31b72351ec7ff64722089c3b1f63
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: K-385, erro de texto acima do limite no domínio do BusinessMap (E7.448)

Escopo: diff da branch contra a `develop` (3 arquivos: `dominio-businessmap.ts`, seu teste e `CHANGELOG.md`). Sem `CA-n` de UX; as obrigações são as do brief do K-385: a mensagem nomeia o campo e o tamanho, nunca o valor; limite e arquivo intactos.

## Achados
- A1 (recomendado) CHANGELOG.md:17 · a `develop` já tem o K-377 (`changelog.d/`, README: "não edite o `CHANGELOG.md`"). Mover a entrada para o fragmento `changelog.d/fix-105-dominio-limite-texto.md` (seção `Corrigido`) e reverter a linha do `CHANGELOG.md`; senão o rebase sobre a `develop` quebra a regra do fragmento.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Texto acima do limite nomeia campo e tamanho, sem o valor | `regra com 3001 caracteres` (espera `campo regra tem 3001 caracteres, limite 3000` e ausência de `xxxxx`) | logo acima do máximo (3001); valor nunca na mensagem | passou |
| Limite intacto | `regra no limite (3000) passa` | máximo exato aceito | passou |
| Rótulo aninhado nomeia o caminho com `#` nos índices | `campo campos.#.valores.#.rotulo tem 121 caracteres, limite 120` | máximo+1 em campo aninhado | passou |
| Arquivo não muda | diff sem tocar `businessmap-dominio.json` nem o esquema | n/a | passou |

## Vermelho antes do verde
Cópia da fonte da base (`12d2c849`) no lugar da fonte nova, só nos 2 testes K-385 (`forge-testes --vermelho` não usado; recuo manual, árvore restaurada):

```
× regra com 3001 caracteres: a mensagem diz o campo e o tamanho, sem o valor
× texto aninhado acima do limite também nomeia o campo; regra no limite (3000) passa
Tests  2 failed | 95 skipped (97)
```

Com a fonte do head: `tests/dominio-businessmap.test.ts` 97 passed (97).

## Prova do autor e CI
Sem PR para a branch: a suíte inteira fica para o CI do PR; cito o `pronto rc=0` do autor (brief) e não afirmo CI verde. Mutação por ferramenta não rodada (stack sem mutante automático nesta passada); o vermelho acima cobre a mudança de comportamento.

## Resultado da execução
Data 2026-11-17, worktree local, head `6a4a95e5`: 97/97 no módulo; nenhum bug aberto.
