---
tipo: qa
contrato: 1
pedido: 043-forge-f21-f22
branch: melhoria/MetricasDSPD-f22-release
commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-27
---
# QA: F22, PR de release da homologação para a main (texto)

Entrega no clone de contribuição do Forge (`/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22`), 4 arquivos de texto, 5 linhas, sobre `origin/develop` 41ba611. Sem código, sem teste novo: não há vermelho-antes-do-verde nem mutante a declarar (nada em `bin/`, `hooks/`, `.githooks/` nem `tests/catraca.py`).

## Execução (`PYTHONDONTWRITEBYTECODE=1`)
- `scripts/validar-plugin.sh`: "Validation passed".
- `scripts/verificar-contribuicao.sh`: "ok: nenhum segredo nem caminho pessoal no diff contra origin/develop."
- `python3 -m unittest discover -s tests` (uma vez, sem outra suíte em curso): `Ran 2130 tests in 724.735s`, `FAILED (failures=59, skipped=27)`, rc 1. Mesma contagem do review (2130, 59 falhas, 27 skipped na branch). Das 59, 58 são `test_atualizar` e `test_sugerir` (recusam rodar dentro do Claude) e 1 é `test_sessao_versao_carregada.SaidaDoAtualizar.test_caminho_feliz_cita_o_comando_para_voltar_e_o_aviso_da_sessao`, da mesma família (atualizar). Nenhuma falha toca os 4 arquivos do commit: os testes que leem R-FLUXO, ci-cd, tech-lead.md e `changelog.d` (changelog, modelos_citados, forge, conferir_release etc.) estão entre os que passam. O rc 0 da suíte só se prova na CI do PR (decisão do Jarvis).
- `__pycache__` gerado pela suíte apagado; `git status --porcelain` = 0 linhas; HEAD = 0b59505.

## Critério (obrigação) → verificação → resultado
| Obrigação | Verificação | Fronteira protegida | Resultado |
|---|---|---|---|
| Opção A (só texto em R-FLUXO, ci-cd, tech-lead + fragmento) | `git show` do commit: 4 arquivos, +5 linhas | n/a | ok |
| Listar antes de criar; erro do `gh` não é "sem PR"; mais de um, fork ou autor inesperado: parar | `R-FLUXO.md:15` | vazio vs erro; duplicidade | ok |
| Editar só título e corpo, nunca `--base/--head/--add-reviewer`/estado | `R-FLUXO.md:15` | permissão | ok |
| Corpo por arquivo, sem segredo, dado pessoal, log bruto | `R-FLUXO.md:15`; `verificar-contribuicao.sh` ok | n/a | ok |
| Só com portão verde; pendente espera e reexecuta o mesmo sha; não afrouxar | `ci-cd/SKILL.md:45` | pendente vs falhou | ok |
| Merge, `--auto`, push na main são do usuário | `R-FLUXO.md:15`, `tech-lead.md:33` | permissão (R-MAIN) | ok |
| Neutralidade (R-NEUTRO) | `verificar-contribuicao.sh`, testes de neutralidade na suíte | n/a | ok |
| Estrutura do plugin válida | `validar-plugin.sh` | n/a | ok |
| Fragmento de changelog válido | `test_changelog` na suíte | n/a | ok |

## Medida da seção 6 da análise contra o texto
- "Criação duplicada de PR = 0" (`gh pr list --base main --head homolog --state all` mostra 1 PR por release): o texto cumpre o lado que cabe à fábrica, pois manda listar com `--state open` antes de criar e editar o existente. Coerente.
- "Checks `homolog-aprovada` vermelhos por corrida = 0": o texto cobre o procedimento (abrir só com portão verde; pendente espera e reexecuta o mesmo sha; não recriar). Como a própria análise (seção 5) diz, a corrida só some de vez com a parte do projeto (`aprovacao.ts` devolver `pendente`, K-108 do 041), fora deste commit; não é defeito da entrega.
- A medição (2 releases seguidas; qualquer coisa fora de 0 leva à opção B) é posterior ao merge e não é verificável agora; o critério de reversão está declarado. Medida e texto não se contradizem.

## Achados
- A1 (recomendado) docs/regras/R-FLUXO.md:15 · "autor esperado" não diz quem é; endosso o A2 do review: nomear (o próprio usuário ou a conta do tech-lead do projeto) numa próxima rodada. Não devolve a entrega.
- A2 (recomendado) docs/analises/043-f22-corpo-do-pr.md:23 · endosso o A1 do review: a linha de rótulo `afrouxa-regra` desmarcada confunde; reescrever como "n/a: não afrouxa regra protegida" antes de abrir o PR. Não devolve a entrega.

Veredito: aprovado. Nenhum bug aberto; nenhum bloqueante.
