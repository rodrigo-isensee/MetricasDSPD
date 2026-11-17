---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: chore/105-changelog-fragmentos
commit: 206daf0604a3f4a1a640b23bbe9d9690db73ca2d
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-changelog-fragmentos (K-377, E7.440, revalidação E7.445)

Escopo: `scripts/changelog.mjs`, `scripts/changelog.test.sh`, `changelog.d/`, gancho em `test:trava`, seção 9 de `docs/engineering/praticas.md`, §8 de `docs/engineering/fluxo-homologacao.md`. A suíte inteira fica para o CI do PR (sem PR ainda; este parecer não afirma CI verde, e cita só a prova do autor). Sem especificação de UX nem contrato de API: a obrigação é o pedido do K-377 (juntar não perde entrada, histórico intacto, dois fragmentos não conflitam, todas as seções do CHANGELOG aceitas).

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Juntar não perde entrada | CT-02 e CT-06 (cópia do CHANGELOG real) | 235 entradas antes; 242 (CT-02) e 243 (CT-06) depois, só as dos fragmentos; linhas do original ausentes = 0 | passou |
| Histórico antigo igual | CT-02 (`diff` do trecho abaixo de "Não publicado") | byte a byte igual | passou |
| Dois fragmentos não conflitam | `changelog.test.sh` ("traz as entradas das duas branches", contraste do conflito) | duas branches, mesmo tipo | passou |
| Todas as seções do CHANGELOG aceitas (TIPOS e ACOES_DO_DONO) | CT-06 | critério de cálculo (T2.6), quebra, desempenho, dependências, ação do dono de release existente e de release nova | passou |
| Seção que falta é criada na ordem do projeto | CT-06 | "Ações do dono release 106" criada depois da 105 | passou |
| Fechar versão | CT-03 (`juntar 9.9.9 2026-11-17`) | "Não publicado" vazia acima da nova versão, 0 linhas perdidas | passou |
| Gate da promoção | CT-04 e CT-07 (`conferir-release`) | rc 1 com fragmento pendente, nomeia o arquivo; rc 0 depois do juntar | passou |
| Formato inválido, versão repetida, branch protegida | `changelog.test.sh` | tipo inválido, versão/data mal escrita, `novo` em develop | passou |
| Teste isolado do repositório de fora | CT-05 | `unset GIT_DIR GIT_WORK_TREE ...` (linha 7 do teste) | passou |
| Quem junta e por qual PR está dito | CT-08 | praticas.md e fluxo-homologacao.md §8 | passou |

## Cenários e resultado real
- CT-01 (head b6147682, rodada anterior): `bash scripts/changelog.test.sh`, rc 0, "tudo ok".
- CT-02 (rodada anterior): cópia do `CHANGELOG.md` real em `$TMPDIR`, 4 fragmentos; `juntar` rc 0; entradas `- ` 235 → 242; linhas do original ausentes: 0; entradas novas no topo da primeira subseção do tipo, continuação preservada; histórico idêntico; pasta esvaziada.
- CT-03 (rodada anterior): `juntar 9.9.9 2026-11-17` rc 0, 0 linhas perdidas, "Não publicado" vazia acima de `## [9.9.9] - 2026-11-17`.
- CT-04 (rodada anterior): `conferir` e `conferir-release` na branch.

## Revalidação no head 206daf06 (delta, E7.445)
`forge-check parecer delta` lista no domínio: CHANGELOG.md, changelog.d/*, praticas.md, fluxo-homologacao.md, scripts/changelog.mjs e scripts/changelog.test.sh (intervalo b6147682..206daf06). A observação da rodada anterior (seções sem tipo de fragmento) está superada: o script agora aceita a lista fechada completa.
- CT-05: `bash scripts/changelog.test.sh` no head 206daf06: todas as linhas `ok`, "changelog.test.sh: tudo ok", rc 0.
- CT-06: cópia do CHANGELOG real em `$TMPDIR` e 2 fragmentos com as seções: Mudanças que quebram (com linha de continuação), Mudanças de critério de cálculo, Desempenho, Dependências e Forge, Adicionado, Corrigido, Ações do dono release 105 e release 106. `conferir` rc 0 (2 válidos); `juntar` rc 0, "2 fragmento(s) juntado(s) e apagado(s)", pasta vazia. Entradas `- ` 235 → 243 (+8, as dos fragmentos); linhas do original ausentes no resultado: 0; cada texto aparece 1 vez, inclusive a continuação. Cada entrada caiu na subseção do tipo certo; "Ações do dono release 106" foi criada depois da 105; a entrada da 105 entrou na seção existente. `conferir-release` depois do juntar: rc 0.
- CT-07: no head, `conferir` do fragmento real `chore-105-changelog-fragmentos.md` (nome com o prefixo da branch): "1 fragmento(s) válido(s)"; `conferir-release`: rc 1 nomeando o arquivo (esperado até a promoção).
- CT-08: praticas.md e §8 dizem que o `tech-lead` roda o juntar numa branch `chore/changelog-juntar-<data>`, por PR para a `develop`, antes da promoção; `conferir-release` é dito manual, ainda não check de workflow.
- Vermelho antes do verde: `scripts/changelog.test.sh` testa script novo (a base não o tem); projeto, não o Forge, sem `forge-testes`. Mutação: sem ferramenta para shell/mjs na stack; não aplicada.
- Nenhum bug aberto.
