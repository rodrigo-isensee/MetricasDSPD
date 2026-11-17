---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-changelog-teste-fixture
commit: 8349241cb29c0cb1f36d134bc578b290c443ae44
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: changelog.test.sh com fixture própria (K-401, E7.480)

Diff `4361687f...8349241c`: `scripts/changelog.test.sh` (2+/2-, só o comentário do cabeçalho e o `cp`), `scripts/fixtures/changelog-teste.md` (novo) e o fragmento em `changelog.d/`.

- **Nenhum caso se perdeu.** As linhas `verifica` do teste são idênticas antes e depois (`diff` das linhas `verifica` vazio); a única linha de código mudada é a origem do `cp`. Os 19 casos passam no head.
- **A fixture cobre as âncoras que os casos usam:** `## [Não publicado]`, `### Adicionado` (contraste da seção 6), `### Ações do dono na base real depois da release 105` (ordem da seção nova de ação do dono), `## [0.2.0]` (hash do histórico intacto e posição da 0.3.0) e entradas `- ` existentes (contagem "só acrescenta"). Sem dependência de hora nem de rede.
- **Causa corrigida:** o teste deixa de depender do estado do `CHANGELOG.md` real, que muda ao fechar uma versão; o autor provou numa cópia (juntar 0.3.0 e o teste passa; antes, 3 falhas) e o `pronto` com rc=0 (PQ do autor). Sem guarda nova nem mudada: sem mutante a declarar.
- **Suíte:** sem PR para a branch; a suíte inteira fica para o CI do PR. Cito o PQ do autor e não afirmo CI verde.

## Achados
