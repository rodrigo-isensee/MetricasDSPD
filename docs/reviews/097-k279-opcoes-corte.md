---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k279-opcoes-corte
commit: c9bfd5f33a6c24a4bb29a552164f9c4b4d7635f0
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-279, opções de filtro do L6 com o corte das listas (E4.2, review E3.2)

Diff lido: `git diff 995caa40..c9bfd5f3` (2 arquivos, +34 -4; código e teste: 38 linhas, dentro do teto): `server/src/modulos/referencia/repositorio.ts` e `server/tests/app.test.ts`. Parecer do QA na mesma branch: `docs/qa/097-k279-opcoes-corte.md` (aprovado, 90bbd5e5).

## O que foi conferido
- **Fecha os achados de origem:** A1 do review do L6 (prioridades sem o corte de `lerChamados`) e A2 (tipos sem `criado_em IS NOT NULL` de `lerCards`), de `docs/reviews/097-l6-tipos-reais.md`; A1 do QA do L6 (base vazia do Acelerato sem teste), de `docs/qa/097-l6-tipos-reais.md`, pelo teste "acelerato com base vazia: prioridades = lista vazia".
- **Condições copiadas batem com as de origem:** `CORTE_CARDS` (`referencia/repositorio.ts:34`) é o texto exato do WHERE de `lerCards` (`metricas/repositorio.ts:59`); `CORTE_CHAMADOS` (`:35`) é o texto exato do WHERE de `lerChamados` (`metricas/repositorio.ts:113`). `lerTiposBM` soma só `granularidade = 'story'`; `lerPrioridadesAC` soma `prioridade IS NOT NULL`.
- **Cópia ou condição única:** a cópia é aceitável nesta entrega (escopo do cartão, comentário de origem com "mudou lá, muda aqui", constantes sem entrada do usuário, logo sem injeção). A condição única (exportar os dois cortes de `metricas/repositorio.ts` e usá-los nos dois módulos) deve virar cartão: hoje nenhum teste pega divergência futura entre as cópias (A1).
- **Papel da API sem coluna de pessoa:** as consultas só leem `tipo`, `granularidade`, `criado_em` (`dim_card`) e `prioridade`, `aberto_em`, `equipe`, `fora_do_recorte` (`dim_chamado`), todas já lidas pelo `dspd_api` em `lerCards` e `lerChamados`; nenhuma coluna de pessoa, nenhuma contagem. Sem GRANT novo.
- **Contrato:** forma da resposta (`{id, nome}`) e enums sem mudança; `docs/api/metricas.md` já diz base vazia = lista vazia. Sem documentação a atualizar.
- **Testes que provam algo:** o dublê devolve a opção fora do corte quando o SQL não traz o corte, então o teste K-279 cai se qualquer das duas constantes sair (o QA matou os dois mutantes). O dublê casa por texto do SQL: prova a presença do corte, não a semântica no banco; a semântica fica com o .pg no CI (job banco). Aceitável para a mudança.
- **Regras invioláveis:** BusinessMap e Acelerato em consultas separadas; nada de pessoa; histórico intocado.

## Execução
`VITEST_MAX_WORKERS=2 npx vitest run tests/app.test.ts` (em `server/`, sobre c9bfd5f3): 17 passam. Nada contra a base real nem `.env*`; a suíte inteira e o .pg rodam no CI.

## Achados
- A1 (recomendado) server/src/modulos/referencia/repositorio.ts:34 · cortes copiados de `metricas/repositorio.ts:59` e `:113`; divergência futura não é pega por teste. Sugestão: cartão para exportar os cortes de `metricas/repositorio.ts` e usá-los nas listas e nas opções (condição única).

## Veredito
Aprovado. O cartão da condição única (A1) não bloqueia esta entrega.
