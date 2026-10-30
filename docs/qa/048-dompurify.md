---
tipo: qa
contrato: 1
pedido: 048-dompurify
branch: feature/048-dompurify
commit: 8e0f8f4e4568dcfb7d5b93223dcda238350453b9
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-29
---

# QA: dompurify 3.4.17 por override (K-178, alerta Dependabot #12)

Links: override em `pnpm-workspace.yaml` (a48aacb), segurança `docs/security/048-dompurify.md` (6c1dc67, aprovado), review (8e0f8f4, aprovado).

## Veredito
**Aprovado.** O dompurify sobe de versão só por override e chega ao build de produção apenas pelo jsPDF (exportação em PDF do `web/`). A exportação segue funcionando e nada regrediu na suíte do `web/`.

## Execução (uma suíte por vez, HEAD 8e0f8f4)
| Comando | Resultado |
|---|---|
| `pnpm --dir web run test` | 80 arquivos, 1228 testes, 1228 aprovados, 0 falhas, 138 s (2m32 de relógio) |
| `playwright test tests/exportar.spec.ts --project=chromium` | 15 aprovados, 0 falhas, 1,7 min; baixa o PDF de verdade e lê o texto com pdfjs-dist; inclui axe do diálogo (EXP-07, EXP-08) e teclado (EXP-06) |
| `grep -c 'dompurify@3.4.16' pnpm-lock.yaml` | 0; o lockfile só tem `dompurify@3.4.17` (2 entradas: pacote e snapshot) |

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Exportação em PDF funciona com o dompurify novo | `e2e/tests/exportar.spec.ts` (conteúdo do PDF, EXP-01 a EXP-06) | download real e conteúdo do PDF | passou |
| Diálogo sem violação de acessibilidade | EXP-07, EXP-08 (axe, 375 e 1280 px, light e dark) | n/a | passou |
| Sem regressão no front | suíte do `web/` | n/a | passou |
| Só a 3.4.17 resta | grep no lockfile | versão vulnerável ausente | passou |

## Limites
Não rodei o E2E completo nem o `pronto` (o E6.1 rodou o `pronto`). Mermaid e @zenuml/core só entram no `e2e/`, fora de produção. Mutação e vermelho-antes-do-verde não se aplicam: não há teste novo nem regra de código.

## Achados
