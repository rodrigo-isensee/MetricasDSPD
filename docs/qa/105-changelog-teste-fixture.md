---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-changelog-teste-fixture
commit: 8349241cb29c0cb1f36d134bc578b290c443ae44
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: K-401, teste do changelog com fixture própria (E7.481)

Diff (3 arquivos): `scripts/changelog.test.sh` passa a copiar `scripts/fixtures/changelog-teste.md` em vez do `CHANGELOG.md` real; fixture nova de 29 linhas; fragmento `changelog.d/fix-105-changelog-teste-fixture.md`. Sem código de produção.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-401: fechar versão no CHANGELOG real não quebra o teste | `changelog.test.sh` com `juntar 0.3.0 2026-11-17` aplicado ao repositório | versão fechada no CHANGELOG real | passou (novo); 3 falhas na base |
| Mesmos casos cobertos (juntar, versão repetida, data inválida, histórico intacto, contraste) | `bash scripts/changelog.test.sh` no head | n/a | passou: "tudo ok" |

## Cenários e resultado real
Vermelho antes do verde, numa cópia descartável (`git archive` do head, juntar 0.3.0 fechou a versão: "7 fragmento(s) juntado(s) e apagado(s); versão 0.3.0 fechada"):
- teste novo: `changelog.test.sh: tudo ok`.
- teste da base (`origin/develop`) na mesma cópia: `FALHOU - seção nova de ação do dono criada no fim da Não publicado, antes da versão fechada`; `FALHOU - juntar com versão roda sem erro` ("CHANGELOG.md já tem a versão 0.3.0."); `FALHOU - versão fechada abaixo de uma Não publicado vazia, com a entrada dentro dela`; `3 falha(s)`.
- head no estado atual: `changelog.test.sh: tudo ok`.

Suíte inteira e `pronto`: sem PR, ficam para o CI do PR; cito o PQ do autor (pronto rc=0) sem afirmar CI verde. Mutação: não se aplica (script de teste e fixture, sem código de produção).
