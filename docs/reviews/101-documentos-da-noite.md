---
tipo: review
contrato: 1
pedido: 101-release-filtros-sem-simulado
branch: docs/101-documentos-da-noite
commit: 1628d4b755e34615aec0b438a6ddbdcbb68d620f
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: documentos da noite (E1.8, classe T)

Escopo: `git diff origin/develop...1628d4b7`, 3 commits (0a3503e2 segunda rodada do UX do 097, 761d379a merge dela, 1628d4b7 revisões de UX e análises). 19 arquivos, +1991 −0, todos em `docs/analises/` e `docs/ux/` (18 `.md` e o protótipo `docs/ux/prototipos/097-filtros.html`). Sem código, teste, migração nem configuração; classe T, sem QA e sem suíte a rodar.

## Conferências

- **Só documentos:** `git diff --name-only` filtrado por extensão fora de `.md` e `.html` volta vazio. O `.html` é o protótipo de UX, fora de `web/`.
- **Segredos:** busca no diff por e-mail, `apikey`, `token`, `senha`, `password`, `secret`, `Bearer`, `usuarioKey` e URL. Nenhum segredo nem credencial; os "token" achados são tokens de tema CSS (`tokens.css`).
- **Dado de pessoa real:** nenhum nome, e-mail ou id de usuário. Setores aparecem pelo nome de exibição sem o sobrenome do responsável (decisão do dono de 14:09, CA-41); os nomes de quadro, sistema e projeto do protótipo são unidades ou exemplos fictícios. O roteiro `099-campos-para-configurar.md` proíbe campo de pessoa e só pede contagens ao dono.
- **Versão final da segunda rodada:** `docs/ux/097-filtros-time-busca.md` e o protótipo na branch são idênticos à ponta de `origin/docs/097-ux-recolher-setor` (0a3503e2; `git diff --stat` vazio em `docs/ux/` para esses dois). Os outros 21 documentos são byte a byte iguais às cópias não versionadas da árvore principal (`cmp`).
- **Regras invioláveis:** os documentos reforçam, não afrouxam (sem avaliação individual, abaixo de 20 itens sem estatística, dúvida de regra vira pergunta ao dono: P-097-9, Q-099-8).

## Achados

- A1 (recomendado) docs/ux/097-filtros-time-busca.md:1 · a árvore principal guarda cópias não versionadas da 1ª rodada desta spec e do protótipo, diferentes da branch; depois do merge, apagá-las ali para a cópia antiga não voltar num próximo PR de documentos.
