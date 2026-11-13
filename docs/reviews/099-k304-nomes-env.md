---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-k304-nomes-env
commit: 3f2803e2192391aa8d3d72266379e09c3b5cde16
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: K-304, coleta e diagnóstico dizem os nomes das variáveis de ambiente que faltam (E3.116)

Diff lido: `git diff 9bb72d1f...3f2803e2` (6 arquivos, 1 commit: `3f2803e2`), contra o cartão K-304 (Histórico do pedido, 2026-11-12 22:32: `coleta ac` sem `.env` caía em `erro-interno`).

## Ferramentas (citadas, não refeitas)
- Worktree de review sem `node_modules`: nada rodado aqui. Suíte, typecheck, lint e cobertura ficam com o `pnpm run pronto` do autor (E3.112 conferida pelo Jarvis em 3f2803e2) e com o CI do PR; o teste novo roda no QA (E3.117).
- Tamanho (M14): 132 linhas de código e teste (`git diff --numstat`), abaixo das 150; um comportamento só.

## Conferência
- **Faz o que o cartão pede:** `coleta.ts` e `coleta-businessmap.ts` tratam `ErroConfiguracao` antes do ramo genérico e imprimem `configuração: <nomes>` por `categoriaDoErro`, que já existia e só junta nomes; o `lerConfig` do diagnóstico lista todas as obrigatórias ausentes de uma vez. Antes, as duas coletas davam `erro-interno`.
- **Nunca o valor:** os nomes vêm de `issue.path[0]` do zod (`config.ts:121`, `acelerato/config.ts:64`), nunca de `message`; a mensagem do `ErroConfiguracao` novo só traz nomes. A sentinela `SEGREDO` vai em URL do Postgres, senha do MySQL, porta inválida e apikey, e o teste confere que não sai em `stderr` nem `stdout`. Credenciais seguem só no ambiente (CLAUDE.md).
- **`carregarConfigColetaAcelerato`:** valida worker e MySQL juntos e soma os nomes; o que não é erro de configuração é relançado (as duas guardas `throw e`), então `prepararTls` e o resto seguem pelo `paraLog()` como antes. Ordem estável (worker, depois MySQL) e sem repetição (`Set`), provada no teste em processo.
- **Compatibilidade:** `diagnostico-businessmap.test.ts:318` (uma ausente, singular) continua válido; nenhum doc ou script lê o texto antigo de `coleta ac falhou` (grep em `docs/`, `scripts/`, `server/`).
- **Testes:** 7 casos, 6 por processo filho com `ambienteFilho` (só `PATH` e `TMPDIR`) e 1 em processo; cobrem todas ausentes, uma ausente com as outras presentes, valor inválido, BusinessMap e diagnóstico (plural e singular).
- **Regras invioláveis:** nada de métrica, pessoa nem mistura de fontes; só mensagem de erro de partida.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/config.ts:50 · Com `NODE_TLS_REJECT_UNAUTHORIZED=0` a validação sai antes do resto: a lista da linha 84 fica incompleta e o motivo some da saída. Nada vaza; vale um caso no teste novo que fixe essa saída.
- A2 (recomendado) server/tests/coleta-nomes-env.test.ts:9 · O cabeçalho diz que nada lê o `.env`, mas a entrada do BusinessMap o lê (linhas 62 e 63). Opcionais não definidas (`PESSOA_ELIMINADA_SAL`, `LOG_LEVEL` e afins) vêm dele e mudam o `toBe` da linha 70. Corrigir o texto e defini-las como `''`.
- A3 (recomendado) server/tests/coleta-nomes-env.test.ts:67 · Espaço sobrando no fim da linha; o `format:check` não cobre `server/`, então nada o pega.

## Conclusão
Parecer: aprovado no `3f2803e2`.
