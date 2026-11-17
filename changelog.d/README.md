# changelog.d

Um arquivo por PR: `changelog.d/<branch>.md`, com o nome inteiro da branch e `/` trocado por `-` (por exemplo
`chore-105-changelog-fragmentos.md`). Formato:

```
### Corrigido

- Texto de uma entrada (pedido NNN, cartão).
```

Seções (lista fechada em `scripts/changelog.mjs`): `Adicionado`, `Alterado`, `Corrigido`, `Desempenho`,
`Mudanças que quebram`, `Mudanças de critério de cálculo` (T2.6, com a data do critério), `Dependências e Forge` e
`Ações do dono na base real depois da release NNN`. Crie com `node scripts/changelog.mjs novo "<seção>" "<texto>"` e
**não edite o `CHANGELOG.md`**. Quem junta é o `tech-lead`, por PR para a `develop` antes da promoção:
`node scripts/changelog.mjs juntar [<versão> <data>]` funde os fragmentos no `CHANGELOG.md` e os apaga. Veja
`docs/engineering/praticas.md`, "CHANGELOG por fragmentos".
