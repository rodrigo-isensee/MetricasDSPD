---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-suite-duas-vagas
commit: 1e0ec6f7215516be9395eaafe1ab6b49f667aaba
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: fila de testes com duas vagas (E7.370, review E7.373)

## Escopo lido
`git diff ab12a37f..1e0ec6f7` (Base-sha da develop): `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`, `package.json` (só o `test:pg`) e `docs/engineering/praticas.md` (só a regra da fila). Para medir o alcance, li também `e2e/playwright.config.ts` (portas e `reuseExistingServer`), `server/vitest.config.ts`, `server/tests/pg/global-setup.ts` (só o cabeçalho) e a decisão do dono de 2026-11-16 20:35 no pedido.

Decisão do dono (20:35): "a fila de testes passa a rodar dois `pnpm run pronto` ao mesmo tempo [...]; o test:pg segue com uma vaga até o K-392 entrar".

## O que está certo
- Vagas `flock` em `<base>-<n>.lock`, tentadas sem espera uma a uma; o fd 9 só fica aberto na vaga obtida (`exec 9>&-` nas demais). O rc do comando é repassado e a chamada aninhada segue direta.
- `METRICAS_DSPD_SUITE_VAGAS` validado por `case` (1 a 16, rc=2 fora disso); `METRICAS_DSPD_SUITE_GRUPO` restrito a `[A-Za-z0-9_-]`, sem caminho (rc=2); link simbólico recusado em todas as vagas e no diretório.
- O `test:pg` tem fila própria de uma vaga, que o `METRICAS_DSPD_SUITE_VAGAS` não altera, e não segura a fila da suíte: está como a decisão pede.
- Quem espera lista cada vaga e quem a segura (pid, pasta e comando escritos na vaga).
- `praticas.md` descreve o novo comportamento, o caminho das vagas e a fila do pg.

## Ferramentas e testes
- `bash scripts/suite-unica.test.sh` em 1e0ec6f7: 20 `ok`, "suite-unica.test: tudo certo" (13 s).
- `shellcheck` nos dois scripts: SC2174 em `suite-unica.sh:45` (linha que não mudou), SC2319 em `suite-unica.test.sh:48` (o `$?` do `[` é intencional, mesmo padrão do arquivo) e SC2016 (info) em `suite-unica.test.sh:83` (aspas simples intencionais). Nenhum aponta defeito.
- O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde. O autor declarou que não rodou o `pnpm run pronto` completo; não há PQ do autor para citar.
- Pipeline e segurança: o `devops-engineer` e o QA revisam em paralelo; não refaço os pareceres deles.

## Detalhe dos achados
- A1: duas worktrees com `pnpm run test:e2e` agora rodam juntas (S1). `e2e/playwright.config.ts:44-46` e `:53-57` usam as portas fixas 4173 e 4174 com `reuseExistingServer: !CI`: fora da CI, a segunda execução reaproveita o `vite preview` da outra worktree e testa o build errado (resultado falso, verde ou vermelho); no modo API, a 4175 com `--strictPort` e `reuseExistingServer: false` derruba a segunda por porta ocupada. A trava única impedia isso, e a decisão do dono (20:35) fala de dois `pnpm run pronto`, não do e2e. Sugestão: `"test:e2e": "METRICAS_DSPD_SUITE_GRUPO=e2e bash scripts/suite-unica.sh ..."` (uma vaga própria, como o pg), um caso no `suite-unica.test.sh` e a frase no `praticas.md`.
- A2: os casos "diretório padrão" e "vagas padrão 2" fazem `grep` na fonte. O padrão 2 já está provado pelo caso 1; o diretório `/tmp/claude-<uid>` fica sem teste que o execute.
- A3: a espera deixou de ser bloqueante e passou a tentativas a cada 0,3 s; sem ordem de chegada, quem espera pode perder a vaga para quem chegou depois. Com duas ou três suítes o efeito é pequeno; basta registrar no comentário.
- A4: com `PG_TESTE_URL` exportado, o `cobertura` do server (`vitest run --coverage`, no `pronto`) roda o projeto `pg` numa vaga da suíte, fora da vaga do pg. Os schemas por execução atenuam.
- A5: `git diff --numstat --no-renames ab12a37f...1e0ec6f7` dá 203 linhas (script 79, teste 122, `package.json` 2), acima da orientação de 150 (M14).

## Sondas
- S1 · duas chamadas simultâneas de `suite-unica.sh` no grupo padrão (o do `test:e2e`), vagas em pasta temporária · espera: e2e sem segunda vaga · obtido: as duas começam juntas (+5 ms), nenhuma linha de espera

## Achados
- A1 (bloqueante) package.json:16 · o `test:e2e` ficou nas duas vagas da suíte: duas worktrees rodam o e2e juntas e, pelas portas fixas com `reuseExistingServer`, uma testa o build da outra (S1); a decisão cobre só o `pronto`. Dar ao e2e um grupo de uma vaga.
- A2 (recomendado) scripts/suite-unica.test.sh:83 · o diretório padrão é conferido por `grep` na fonte, não por execução.
- A3 (recomendado) scripts/suite-unica.sh:78 · espera por sondagem de 0,3 s, sem ordem de chegada; registrar no comentário.
- A4 (recomendado) docs/engineering/praticas.md:62 · com `PG_TESTE_URL` exportado, o `pronto` roda o projeto pg fora da vaga do pg; dizer na regra para não exportá-lo.
- A5 (recomendado) scripts/suite-unica.test.sh:1 · 203 linhas de código e teste (M14): o PR traz `teto: excedido, 203 linhas, teste reescrito`.
