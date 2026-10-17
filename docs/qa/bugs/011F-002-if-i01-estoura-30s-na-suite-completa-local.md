# 011F-002 - IF-I01 estoura o teto de 30 s na suíte E2E completa local
- Estado: fechado (2026-10-17, pela saída (a): orçamento de tempo próprio no teste, 357936b)
- Severidade: baixa (teste, não produto; a CI está verde no mesmo commit)
- Responsável sugerido: autor do teste (`e2e/tests/intensivo-filtros.spec.ts`, K-083 trouxe o orçamento próprio do IF-A); o QA não corrige a suíte do lote anterior sem pedido
- Ambiente: `feature/011-front-estrategicas` (3d2ee5b), Chromium (Playwright), WSL 8 GB, mock

## Passos para reproduzir
1. Na raiz da worktree, com `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`, rodar `pnpm run e2e` (suíte completa, load abaixo de 4 no início).
2. Ver o `IF-I01 marcar todas (uma a uma) e desmarcar todas, em cada filtro múltiplo` falhar.

## Resultado esperado
704 + 1 testes passando, rc=0.

## Resultado obtido
Duas rodadas completas seguidas: 704 passaram e 1 falhou (IF-I01), rc=1. Erro: `Test timeout of 30000ms exceeded` em `locator.click` de `prioridade-opcao-p5` (linha 516, 5ª rodada do `for` de casos). Rodado sozinho com `--repeat-each=3` (workers padrão): 3 de 3 falharam pelo mesmo motivo. Rodado sozinho com `--workers=1 --timeout=180000`: passou em 15,5 s. Ou seja, o teste faz 5 filtros e dezenas de cliques e fica entre 15 s e mais de 30 s conforme o paralelismo da máquina local; não é travamento.

## Evidência
- Logs das rodadas: `e2e.log` e `e2e2.log` no scratchpad da sessão (704 passed, 1 failed, 19,0 min e 20,4 min).
- A branch não toca `intensivo-filtros.spec.ts` nem o filtro de prioridade (diff contra a develop: `Chips.tsx` ganha só o literal 'sistema', `simulacao.ts` só o ramo do E8).
- Check `e2e` da CI no PR #106 no mesmo commit (3d2ee5b): passou, 21 min 33 s.
- Não confirmei se o mesmo teste falha na develop local (não toquei outras worktrees).

## Fechamento
- Correção do react-frontend em 357936b (`test.setTimeout(120_000)` no IF-I01), aprovada pelo tech-lead na volta 6 (79c3df5).
- Reteste em 79c3df5, load 0,10 no início: `pnpm exec playwright test tests/intensivo-filtros.spec.ts -g "IF-I01" --repeat-each=3` (de `e2e/`): 3 de 3 passaram (25,1 s a 25,7 s, workers em paralelo), rc=0. Antes da correção as mesmas 3 execuções falhavam em 30 s.
- Prova da suíte completa: check `e2e` da CI do PR #106 em 79c3df5: pass (27m28s).
