---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-apontamento-discovery
commit: 03cc8694558be6419190fd4d0393d45e357b045f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA documental: branch do discovery da aba Apontamento (E2.97, K-193)

PR só de documentação, ainda não aberto. Ponta testada: 03cc869 (`pull --ff-only` sem novidade, árvore limpa). Base: `origin/develop` e32ee54, ancestral da ponta (a develop já foi trazida). Nada de código foi lido nem rodado além da checagem de documentação.

## Achados
- A1 (recomendado) docs/architecture/features/059-dicionario-apontamento.md:2 · o frontmatter usa `tipo: apoio-plano-tecnico` e não tem `contrato: 1`; o `forge-check docs` acusa as duas linhas (ADR-0004); as outras 14 acusações são de arquivos antigos fora do diff. Corrigir o frontmatter, sem mudar o corpo.
- A2 (recomendado) docs/architecture/features/059-dicionario-apontamento.md:42 · o arquivo do dicionário está como sugerido em `server/ref/apontamento-dicionario.json`, mas o real na develop é `docs/architecture/fontes/apontamento-dicionario.json` (server.md:224); alinhar na próxima edição.
- A3 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:112 · a revisão 4 segue proposta, mas as condições já valem (parecer de segurança aprovado, exceção na develop) e o código está mesclado; é o A7 do review 059-gama, que fica com o software-architect.
- A4 (recomendado) docs/security/059-adrs.md:5 · o parecer carimba `114c435`, e depois dele a ADR 0025 (itens 4, 5, 9 e 10, A2 e A7) e a R4-5 da ADR 0020 (view definer) mudaram; os portões da coleta e da rota cobrem o código, mas o texto não foi relido; renovar por delta se o PR da E2.98 cobrar.
- A5 (recomendado) docs/reviews/059-gama.md:1 · o diff traz 11 arquivos, não 10: o 11º é a renovação do review da rota (E2.96), documento da aba mas de review; conferido que só soma a rodada 5, sem tocar código.

## Escopo conferido
- `git diff --stat origin/develop..HEAD`: 11 arquivos, todos em `docs/`: ADR 0020 (revisão 4), ADR 0025, plano da aba, dicionário, plano de testes, review de modelagem, review da rota (rodada 5), modelo de ameaças, parecer das ADRs, textos de UX e especificação de UX. O diff fora de `docs/` sai vazio (0 linhas).
- `pnpm -C /home/rodrigoisensee/MetricasDSPD-052c run docs:check`: verde (883 páginas Markdown, 69 métricas, 2 eventos).
- `forge-check pr 059-aba-apontamento --ref HEAD --base origin/develop`: isento de QA (só `.md` fora do controle); review continua exigido.
- `forge-check docs`: 16 linhas de erro, 14 antigas (arquivos sem frontmatter fora do diff) e 2 do dicionário (A1). Nenhum CI nem hook do projeto chama esse comando.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Diff contra a develop só com documentos do discovery da aba | CT-01: `git diff --stat` e `--numstat` fora de `docs/` | nenhum arquivo de código, `CLAUDE.md` ou briefing | passou (A5 anotado) |
| Develop já integrada na branch | CT-02: `merge-base --is-ancestor origin/develop HEAD` | ponta atrás da base | passou |
| `docs:check` verde | CT-03: `pnpm run docs:check` | n/a | passou |
| Caminhos `docs/...md` e links Markdown citados nos 11 documentos existem | CT-04: script em Python sobre os 11 arquivos | caminho renomeado ou inexistente | passou: 4 caminhos ausentes explicados (`docs/constituicao.md` é a frase de que não existe; `DialogoExportar.ts` é o `.tsx` truncado; fixture e dicionário são "sugeridos", ver A2) |
| Plano, ADR 0020 (R4-1 a R4-8), ADR 0025 e especificações coerentes | CT-05: R4-n citados no plano, no parecer de segurança, no modelo de ameaças, no review e no plano de testes contra os R4-1 a R4-8 da ADR | referência a item inexistente | passou: os mesmos oito R4 nos dois lados |
| Todo CA-1 a CA-11 da especificação de UX e CA-AP-1 a CA-AP-13 do modelo de ameaças tem teste no plano de testes | CT-06: contagem por critério em UX, plano técnico e plano de testes | critério sem teste | passou: os 24 aparecem no plano de testes |
| ADRs numeradas e presentes (0020, 0022, 0024, 0025) | CT-07: `ls` da pasta de ADRs contra as citações do plano | número duplicado ou ausente | passou |
| Estado e carimbo dos pareceres vs. texto atual | CT-08: leitura de estados e `commit:` | parecer sobre texto que mudou | passou com ressalva (A3 e A4, recomendados) |

## Resultado
Aprovado. Cinco recomendados, nenhum bloqueante e nenhum bug. A1 e A2 cabem numa edição de texto do `software-architect` antes do PR da E2.98 (A1 é o único que o `forge-check docs` acusa por arquivo do diff); A3 já está encaminhado pelo review; A4 e A5 são informação para o `tech-lead` na abertura do PR.
