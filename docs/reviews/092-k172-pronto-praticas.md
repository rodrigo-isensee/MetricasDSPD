---
tipo: review
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: docs/k172-pronto-praticas
commit: 87079bef3a22cd3215d99576fd96a1d38e04f068
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: pronto do autor em `praticas.md` (092, E2.2, K-172)

## Achados
- A1 (recomendado) docs/engineering/guia-do-desenvolvedor.md:44 · a tabela de comandos ainda diz "Rode antes de cada commit" para o `pnpm run pronto`, o texto que o K-172 trocou em praticas.md; alinhar num cartão próprio, fora do diff deste.

## Sondas

## Parecer
Aprovado. Diff lido: `6e42dfb8..87079bef`, uma linha trocada em `docs/engineering/praticas.md:117` (classe T, só documentação; sem QA).

- **Fidelidade à decisão:** o texto novo diz o mesmo que a DECISÃO DO DONO de 2026-10-21 (`docs/pedidos/026-front-do-011-lote3.md:40`): durante o desenvolvimento, testes e typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. A frase "commit só de parecer não é o commit final" reproduz a decisão técnica registrada na linha 143 do mesmo pedido, sem acrescentar regra.
- **Não afrouxa:** troca "antes de cada commit" pela regra que o dono decidiu; o `pronto` completo continua obrigatório antes do commit final, e o §7 (definição de pronto) e a linha 123 ("cada commit compila e passa nos testes") seguem valendo e são coerentes com testes e typecheck do pacote a cada commit.
- **Não contradiz o resto de `praticas.md`:** procurei "cada commit" e "pronto" no arquivo; nenhuma outra passagem exige o `pronto` completo a cada commit. Não há hook `pre-commit` que exija carimbo do `pronto` (`.githooks/` só tem `pre-push`).
- Fora do arquivo, o guia do desenvolvedor ainda carrega o texto antigo (A1, recomendado, não devolve).
- Commit: Conventional Commits em português, um só, escopo correto.
