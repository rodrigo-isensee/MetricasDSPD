---
tipo: review
contrato: 1
pedido: chore-forge-0442
branch: chore/forge-0442
commit: 232bb85
parecer: aprovado
revisor: tech-lead
data: 2026-11-09
---

# Code review: atualizar o Forge para a 0.44.2

**Veredito: aprovado.** O diff é uma linha: `.forge/versao` de 0.42.0 para 0.44.2 (upgrade pelo forge-upgrade). Sem código, teste, migração ou dependência. Teto M14: 2 linhas, sem código.

**Ferramentas (citadas, rodadas por outro agente, logs em pronto3.log e pronto-web.log):** lint, format, spec-check, homolog, contratos, pesquisa, metricas, mock, server (typecheck, lint, 1909 testes), web (1487 testes, build, size) e e2e typecheck passaram. As três falhas abaixo são anteriores ao upgrade e não causadas por ele.

## Achados

- A1 (recomendado) scripts/suite-unica.test.sh:1 · o teste 4 trava porque o `pnpm run pronto` já segura a trava de suíte; abrir pedido próprio.
- A2 (recomendado) eslint.config:1 · o eslint precisa de heap maior para rodar no pronto (NODE_OPTIONS ou ajuste do script); abrir pedido próprio.
- A3 (recomendado) server/src/modulos/businessmap/spike.ts:71 · cobertura do server em 99,97%: o caminho de permissão não ocorre como root; testar com injeção da falha ou excluir com justificativa; abrir pedido próprio.
