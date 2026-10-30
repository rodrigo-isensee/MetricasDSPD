---
tipo: qa
contrato: 1
pedido: 056-acelerato-mysql
branch: docs/056-acelerato-discovery
commit: 19275cb004b57361a6bf60ba0e654ebee0828ef5
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-10-30
---

# QA: discovery do Acelerato pela tabela MySQL (E2.1, K-189)

Links: plano `docs/architecture/features/056-acelerato-mysql.md`, modelo de ameaças `docs/security/056-acelerato-mysql-ameacas.md`, `docs/integracao/acelerato-dash-atual.md`, `docs/integracao/acelerato-respostas-ciencia-de-dados.md`, review `docs/reviews/056-acelerato-discovery.md`.

## Veredito
**Reprovado** sobre o commit 19275cb por um defeito de formato (A1), de correção de uma linha. A mudança é só de documentação e de uma regra do `CLAUDE.md`; não há código nem interface, então não há E2E nem acessibilidade a rodar.

## Escopo
Diff da E2.1: `CLAUDE.md` (1 linha) e quatro documentos novos (851 inserções, 1 remoção). Fora: ADR 0023 e código (E4.x).

## Critério, teste, resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Linha 23 do `CLAUDE.md` traz a tabela MySQL só leitura | leitura da linha 23: "tabela MySQL mantida pelo time de ciência de dados", "só com SELECT", usuário só leitor, nada escrito | escrita no MySQL e no Acelerato | passou |
| Linha 23 traz a lista fechada de colunas | leitura: allow-list "na própria consulta e na fronteira"; nome, e-mail, `usuarioKey`, ids de agente e solicitante, descrição e título nunca chegam ao staging nem a outra tabela | colunas de pessoa e texto livre | passou |
| Nenhum outro trecho manda ler o Acelerato pela API | `grep` por "api pública", "só com GET", "allow-list" e "acelerato" no `CLAUDE.md`: a única ocorrência de leitura é a linha 23; linhas 3 e 15 não citam a fonte | regra antiga residual | passou |
| Regra "BusinessMap e Acelerato nunca se misturam" (linha 15) e GRANT por coluna do `dspd_api` mantidos | leitura | mistura de fontes | passou |
| Links internos dos quatro documentos abrem | não há link Markdown `](...)`; as referências são caminhos `docs/...md` em texto: todas existem, exceto `docs/constituicao.md` (citada como inexistente, linha 18 do plano) e `docs/integracao/acelerato-mysql-configuracao.md` (documento futuro da E4.1, linha 269 do plano) | link quebrado | passou, com a observação A1 |
| Frase de regra copiada e achado longo | `docs:check` verde | texto de regra copiado | passou |

## docs:check
`nice -n 19 pnpm run docs:check` na worktree: `docs:check: ok (806 páginas Markdown, 69 métricas, 2 eventos).` rc=0.

## Achados
- A1 (bloqueante) docs/architecture/features/056-acelerato-mysql.md:4 · `estado: pronto-para-validacao` é recusado pelo `forge-check docs` (use proposta ou vigente, ADR-0004); trocar por `proposta` e revalidar.
- A2 (recomendado) docs/architecture/features/056-acelerato-mysql.md:269 · `acelerato-mysql-configuracao.md` ainda não existe (nasce na E4.1); manter o ID da etapa citado para não parecer link quebrado.

Nota: o `forge-check docs` sai rc=1 no repositório inteiro por dívida antiga (frontmatter ausente em pareceres antigos); de toda a saída, só a linha de `056-acelerato-mysql.md` vem deste commit.
