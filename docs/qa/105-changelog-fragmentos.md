---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: chore/105-changelog-fragmentos
commit: b6147682212f3600fdf055fd12327ff1411c217d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-changelog-fragmentos (K-377, E7.440)

Escopo: `scripts/changelog.mjs`, `scripts/changelog.test.sh`, `changelog.d/`, gancho em `test:trava`, seção 9 de `docs/engineering/praticas.md`. A suíte inteira fica para o CI do PR (sem PR ainda; este parecer não afirma CI verde). Sem especificação de UX nem contrato de API: a obrigação é o pedido do K-377 (juntar não perde entrada, histórico intacto, dois fragmentos não conflitam).

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Juntar não perde entrada | CT-02 (cópia do CHANGELOG real, 4 fragmentos) | 235 entradas antes, 242 depois (+7 dos fragmentos); `comm -23` das linhas originais = 0 | passou |
| Histórico antigo igual | CT-02 (`diff` do trecho após a 1ª seção) | tudo abaixo de "Não publicado" byte a byte igual | passou |
| Dois fragmentos não conflitam | `changelog.test.sh` ("traz as entradas das duas branches", contraste do conflito) | duas branches, mesmo tipo | passou |
| Fechar versão | CT-03 (`juntar 9.9.9 2026-11-17`) | "Não publicado" vazia acima da nova versão, 0 linhas perdidas | passou |
| Gate da promoção | CT-04 (`conferir-release`) | rc 1 com fragmento pendente, nomeia o arquivo | passou |
| Formato inválido, versão repetida, branch protegida | `changelog.test.sh` | tipo inválido, versão/data mal escrita, `novo` em develop | passou |

## Cenários e resultado real
- CT-01: `bash scripts/changelog.test.sh` no head b6147682: todas as linhas `ok`, final "changelog.test.sh: tudo ok", rc 0.
- CT-02: cópia do `CHANGELOG.md` real em `$TMPDIR`, 4 fragmentos (a: Corrigido com linha de continuação e 2 entradas + Adicionado; b: Alterado + Corrigido; c: Adicionado; d: o fragmento real do K-377). `juntar` rc 0, "4 fragmento(s) juntado(s) e apagado(s)"; entradas `- ` 235 → 242; linhas do original ausentes no resultado: 0; entradas novas no topo da primeira subseção do tipo, a continuação `  continuacao A` preservada; histórico abaixo de "Não publicado" idêntico; pasta de fragmentos esvaziada.
- CT-03: sobre o CHANGELOG real, `juntar 9.9.9 2026-11-17` rc 0, linhas perdidas 0, `## [Não publicado]` vazia acima de `## [9.9.9] - 2026-11-17`.
- CT-04: `conferir` na branch: "1 fragmento(s) válido(s)"; `conferir-release`: rc 1 com `105-changelog-fragmentos.md` pendente (esperado, o fragmento do próprio PR só é juntado na promoção).
- Prova do autor (PQ do autor, repositório temporário) não rerrodada além dos casos acima; nenhum bug aberto.
- Vermelho antes do verde: `scripts/changelog.test.sh` é teste de um script novo (a base não tem o script); sem `forge-testes` por ser projeto, não o Forge. Mutação: sem ferramenta de mutação para shell/mjs na stack; não aplicada.

## Observação (não bloqueante)
`juntar` só aceita os tipos Adicionado, Alterado e Corrigido; as subseções "Desempenho" e "Mudanças que quebram" do histórico não têm tipo de fragmento (decisão de formato do autor, documentada no cabeçalho do script).
