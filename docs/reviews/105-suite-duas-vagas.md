---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-suite-duas-vagas
commit: 0813ca6d4c07d4fa790d29c0dba7a686becd22a8
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: fila de testes com duas vagas (E7.370, review E7.373; revalidação E7.391)

## Revalidação no head 0813ca6d (delta lido)
`forge-check parecer delta docs/reviews/105-suite-duas-vagas.md`, intervalo `1e0ec6f7..0813ca6d`, domínio: `docs/engineering/praticas.md`, `package.json`, `scripts/suite-unica.sh` (só o comentário do cabeçalho) e `scripts/suite-unica.test.sh` (caso 6b e o cabeçalho). Li só esse delta.

- A1 resolvido: `package.json:16` passa o `test:e2e` (e o `e2e`, que o chama) para `METRICAS_DSPD_SUITE_GRUPO=e2e`, uma vaga própria (`metricas-dspd-e2e-1.lock`), pelo mesmo caminho de código do pg. O `pronto` não roda o Playwright (o `pronto` do pacote e2e é só `typecheck`), então duas suítes juntas não disputam as portas 4173, 4174 e 4175.
- Caso 6b do teste: a segunda chamada do e2e espera (rc=124 no `timeout 1`), e o e2e ocupado não segura a fila da suíte nem a do pg. A ligação do `package.json` é conferida por `grep` (texto), mas o comportamento da fila e2e é provado por execução; aceito.
- A4 resolvido: o `praticas.md` diz para não exportar `PG_TESTE_URL` ao rodar o `pronto` ou o `pnpm test`.
- Frase nova sobre vaga presa depois de `kill -9`: correta (o `flock` cai com o processo; `fuser` aponta o filho órfão).
- A2, A3 e A5 seguem recomendados; nenhum bloqueia.

## Ferramentas e testes (no head 0813ca6d)
- `bash scripts/suite-unica.test.sh`: 25 `ok`, "suite-unica.test: tudo certo" (17 s).
- `shellcheck` nos dois scripts: os mesmos três avisos da rodada anterior (SC2174 em `suite-unica.sh:45`, SC2319 em `suite-unica.test.sh:48`, SC2016 em `suite-unica.test.sh:83`), nenhum nas linhas novas.
- `git diff --numstat --no-renames ab12a37f...0813ca6d -- scripts package.json`: 220 linhas (script 79, teste 137, `package.json` 4), acima da orientação de 150 (M14); ver A5.
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde. O brief traz o teste do script e o `pronto` com rc=0 do autor no head; o `pronto` completo de antes não tinha sido rodado.
- Pipeline e segurança: pareceres do `devops-engineer` e do QA, em paralelo; não os refaço.

## Escopo da primeira leitura (1e0ec6f7)
`git diff ab12a37f..1e0ec6f7`: `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`, `package.json` (o `test:pg`) e a regra da fila no `docs/engineering/praticas.md`; mais `e2e/playwright.config.ts` (portas e `reuseExistingServer`) para medir o alcance. Decisão do dono (2026-11-16 20:35): dois `pnpm run pronto` ao mesmo tempo; o test:pg segue com uma vaga até o K-392.

## O que está certo
- Vagas `flock` em `<base>-<n>.lock`, tentadas sem espera uma a uma; o fd 9 só fica aberto na vaga obtida. O rc do comando é repassado e a chamada aninhada segue direta.
- `METRICAS_DSPD_SUITE_VAGAS` validado (1 a 16, rc=2 fora disso); `METRICAS_DSPD_SUITE_GRUPO` restrito a `[A-Za-z0-9_-]` (rc=2); link simbólico recusado.
- `test:pg` e `test:e2e` têm filas próprias de uma vaga, que o `METRICAS_DSPD_SUITE_VAGAS` não altera e que não seguram a fila da suíte.
- Quem espera lista cada vaga e quem a segura.

## Detalhe dos achados
- A1 (resolvido em 0813ca6d): o `test:e2e` estava nas duas vagas da suíte; com as portas fixas e `reuseExistingServer`, um e2e testaria o build de outra worktree (S1).
- A2: o diretório padrão `/tmp/claude-<uid>` é conferido por `grep` na fonte, sem execução.
- A3: a espera é por sondagem de 0,3 s, sem ordem de chegada; registrar no comentário do script.
- A4 (resolvido em 0813ca6d): `PG_TESTE_URL` exportada punha o projeto pg do `pronto` fora da vaga do pg.
- A5: 220 linhas de código e teste; o PR traz `teto: excedido, 220 linhas, teste do script reescrito`.

## Sondas
- S1 · duas chamadas simultâneas de `suite-unica.sh` no grupo padrão (o do `test:e2e` em 1e0ec6f7), vagas em pasta temporária · espera: e2e sem segunda vaga · obtido: as duas começam juntas (+5 ms), nenhuma linha de espera (em 0813ca6d o caso 6b prova a espera no grupo e2e)

## Achados
- A2 (recomendado) scripts/suite-unica.test.sh:83 · o diretório padrão é conferido por `grep` na fonte, não por execução.
- A3 (recomendado) scripts/suite-unica.sh:78 · espera por sondagem de 0,3 s, sem ordem de chegada; registrar no comentário.
- A5 (recomendado) scripts/suite-unica.test.sh:1 · 220 linhas de código e teste (M14): o PR traz `teto: excedido, 220 linhas, teste reescrito`.
