---
tipo: qa
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-dompurify
commit: ff26c0e1a526cdb92007f8e205a701a927dbcc81
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-30
---

# QA: dompurify 3.4.17 por override (K-178, alerta Dependabot #12)

Links: override em `pnpm-workspace.yaml` (a48aacb), segurança `docs/security/048-dompurify.md` (6c1dc67, revalidada em ff26c0e, aprovado), review (revalidado em 2ee99f4, aprovado).

## Veredito
**Aprovado.** O dompurify sobe de versão só por override e chega ao build de produção apenas pelo jsPDF (exportação em PDF do `web/`). A exportação segue funcionando e nada regrediu na suíte do `web/`. A conclusão do parecer anterior (HEAD 8e0f8f4) continua valendo no HEAD ff26c0e.

## Revalidação por delta (2026-10-30)
Intervalo do delta: `8e0f8f4e4568dcfb7d5b93223dcda238350453b9..ff26c0e1a526cdb92007f8e205a701a927dbcc81` (`forge-check delta --parecer docs/qa/048-dompurify.md`). Os merges da develop, trazidos pelo `gh pr update-branch`, entraram depois do parecer.

- O delta mexe só em documentação (ADRs, contratos, features, integração, UX, pareceres de outros pedidos), em `CHANGELOG.md`, em `.forge/versao` e na linha de versão do `package.json`.
- `git diff --name-only 8e0f8f4..HEAD -- pnpm-lock.yaml pnpm-workspace.yaml web server e2e tests bin hooks` sai vazio: o lockfile, o override do dompurify 3.4.17, o código e os testes não mudaram.
- Não rodei a suíte nem o E2E de novo: sem código ou dependência no delta, a execução abaixo, sobre 8e0f8f4, segue valendo; a CI do PR roda a suíte no head.

## Execução (uma suíte por vez, HEAD 8e0f8f4, parecer anterior)
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
