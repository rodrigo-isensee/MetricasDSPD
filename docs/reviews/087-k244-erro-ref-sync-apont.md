---
tipo: review
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-k244-erro-ref-sync-apont
commit: b98021961ea5bff74e452a3aee831cdc7cc53939
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 087 K-244, categoria do erro em ref-sync-apontamento (E3.4)

Diff lido: `7a44f941...b9802196` (entrada com 1 linha de código e 1 de comentário; teste novo de 77 linhas). Testes do arquivo tocado rodados (`ref-sync-apontamento-entrada.test.ts`): 6 passam.

## Parecer
**Aprovado.** Fecha o achado A2 do review do pedido 081 (`docs/reviews/081-categoria-erro-entradas.md`), nem mais nem menos.

- **Padrão dos outros ref-sync:** a linha do `catch` é idêntica à de `ref-sync-calendario.ts:27`, `ref-sync-ac.ts:26` e `ref-sync-businessmap.ts:28`: `<entrada> falhou: ${ErroDeDominio ? e.message : categoriaDoErro(e)}`. A mensagem do erro de domínio (`ErroDicionario`) já era impressa antes e não muda.
- **Regra do CLAUDE.md:** a saída na falha é só a categoria (configuração com nomes de variável, autenticação, conexão ou outro). Nunca senha, host, string de conexão nem texto cru do driver.
- **Testes de comportamento:** subprocesso com ambiente limpo (`env` só com `PATH`) e servidor TCP falso. Provam as categorias configuração (com o nome `PG_REF_URL`), autenticação (28P01) e conexão (porta fechada), com `stderr` exato, e provam por `not.toMatch` que senha-marcador, "password" e o endereço não saem. O ramo do uso (data inválida, código 2) fica coberto.
- **Falso do teste confere a regra:** o servidor devolve ErrorResponse fatal com SQLSTATE 28P01 real, que `categoriaDoErro` classifica pelo código, não por texto.
- Timer de 60 s do subprocesso é limpo no `close`; servidor fechado no `afterEach`. Sem dependência nova.

## Achados
- A1 (recomendado) server/tests/ref-sync-apontamento-entrada.test.ts:11 · o filho roda com `node --import tsx` sem `-I`; o ambiente já é limpo, então o risco é só o do diretório corrente. Opcional, sem mudar o veredito.
