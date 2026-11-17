# changelog.d

Um arquivo por PR: `changelog.d/<branch-sem-prefixo>.md` (por exemplo `105-changelog-fragmentos.md`). Formato:

```
### Corrigido

- Texto de uma entrada (pedido NNN, cartão).
```

Tipos: `Adicionado`, `Alterado`, `Corrigido`. Crie com `node scripts/changelog.mjs novo <tipo> "<texto>"` e **não edite o
`CHANGELOG.md`**. Na promoção, `node scripts/changelog.mjs juntar <versão> <data>` funde os fragmentos no `CHANGELOG.md` e
os apaga. Veja `docs/engineering/praticas.md`, seção 9.
