---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l3b-historico-acelerato
commit: 92f2683f863efaa14c1231a1885d9460d38f8746
parecer: aprovado
revisor: tech-lead
data: 2026-11-09
---

# Code review: 077, lote 3b (Acelerato sem `historicoDesde`), segunda rodada

**Escopo:** a volta `92f2683f` sobre o merge da develop `3e5f6511`: só `server/tests/metricas.historico-ac.test.ts` (27 adições, 4 remoções). Nenhum código de `server/src` mudou na volta. Teto M14: 31 de 150, dentro.
**Veredito:** aprovado. A1, A2 e A3 estão fechados sem efeito colateral.

## Ferramentas (citadas)
- CI do push no head `92f2683f`: `gh run list`, run 42572803761, `completed success`. Não há PR aberto (esperado).
- `vitest run tests/metricas.historico-ac.test.ts` na worktree limpa: 4 passaram.

## Revalidação por delta
- Lido: o diff `3e5f6511..92f2683f` (um arquivo, o teste). O diff `7a107979..92f2683f` em `server/src` vem só do merge da develop (`3e5f6511`), já conferido pela CI; já lido e sem relação com o 3b.
- Código do 3b (`carregarAC` sem `historicoDesde`, `ctx.ac` sem o campo) segue como no parecer anterior, sem mudança.

## Fecho dos achados
- A1: o teste 2 calcula `VISAO_GERAL` (carrega os dois domínios) e lê o `ctx` capturado: `ctx.bm.historicoDesde` é `2099-01-01` e `ctx.ac.historicoDesde` é indefinido. A mutação S2 refeita foi reprovada (S1 abaixo).
- A2: `incompletos` afirma `meses.length > 0` antes de concluir; o teste não passa mais com série vazia.
- A3: o nome da `TENDENCIA_FLUXO` deixou de prometer o Acelerato carregado e diz o que o teste prova.

## Sondas
- S1 · `servico.ts` com `ac: { ...acelerato.criarContextoAC(...), historicoDesde: bm?.historicoDesde }` (a mutação S2 do parecer anterior) · espera: o teste 2 falha · obtido: 1 falhou, 3 passaram (`expected '2099-01-01' to be undefined`, teste 2).

Árvore restaurada com `git checkout -- server/src` depois da sonda; `git status` limpo.

## Achados
- Nenhum achado aberto nesta rodada.

## Revisão por regra
Regras "leitura" que alcançam o diff: teste de comportamento sem ler a fonte (cumpre), sem `.env` nem base real (cumpre), sem guarda nova em código (não há linha de guarda; mutante declarado dispensado). Sem regra de ferramenta pendente além da CI citada.
