---
tipo: review
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: docs/k121-frontmatter
commit: 80bfc064293fb7511ac5af84488339a4483543db
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---
# Code review: K-121, frontmatter `contrato: 0` em dez documentos antigos (E1.2)

Classe T, só documentação. Lido: `git diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 80bfc064` (10 arquivos, 38 inserções, 0 remoções), commits 32d41e80, b4c5f702 e 80bfc064.

## Parecer
**Aprovado.**

- **Só frontmatter:** cada arquivo ganha apenas o bloco `---` / `contrato: 0` / `---` no topo; os 8 de `docs/qa/` têm também uma linha em branco antes do título (4 linhas), `docs/reviews/front-via-api.md` e `docs/architecture/features/front-via-api.md` não (3 linhas). Nenhuma remoção: o corpo dos dez fica intacto.
- **Campos inventados:** os campos que 32d41e80 pôs nos de `docs/qa/` não existem no diff final contra a base; b4c5f702 os reduziu a `contrato: 0`.
- **`forge-check docs`** (na worktree, ponta 80bfc064): nenhuma linha cita os dez arquivos. As 7 linhas que restam são de outros documentos (`docs/reviews/042-protecao-develop-r1.md`, `docs/reviews/077-l4a-tela-janela-fluxo.md`, `docs/architecture/features/059-dicionario-apontamento.md`), fora do escopo do K-121.
- Commits em Conventional Commits, com o cartão no assunto. Sem código nem teste no diff, logo sem mutação, suíte de arquivos tocados nem teto de tamanho a medir.

## Achados
- A1 (recomendado) docs/qa/011-back-plano.md:4 · os 8 de docs/qa têm linha em branco após o frontmatter e os 2 outros não; inofensivo para o forge-check docs, só uniformidade.
