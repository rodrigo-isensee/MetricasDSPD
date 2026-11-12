---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l6-tipos-reais-web
commit: 1ee4b7cc9ee03fed7b895cfae34e60b527936aaf
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: L6 do 097, parte web (tipos e prioridades reais nos filtros, E3.2)

Diff `origin/develop...1ee4b7cc` (base 233db432): `codec.ts`, `BarraFiltros.tsx`, `taticas.tsx` e os testes `codec.test.ts`, `k039.test.ts`, `taticas.test.tsx`. 103 adições e 24 remoções, dentro da orientação de 150 linhas. Um commit, Conventional Commits, `Cartão: K-273`.

## O que foi conferido
- **Opções pela API:** a lista de Tipo da `BarraFiltros` sai de `opcoes.tipos` (businessmap), as abas do T11 também; as prioridades da Sustentação, de `opcoes.prioridades` (a barra já as lia; agora o codec valida a URL e colapsa "todas" contra as presentes). Cumpre o E4 do 097 (DECISÃO DO DONO de 2026-11-11, "tudo real") e a linha L6 do plano.
- **`TIPO_ID` como mapa de rótulo do contrato:** `TIPO_POR_ID` é montado de `TIPO_ID`; `idsTipo` aceita só ids das opções que o contrato conhece, então um tipo novo vindo da API não vira valor fora do `tipoFiltroSchema`. Sem opções carregadas, valem os ids do contrato (a URL não perde a seleção enquanto as opções carregam).
- **Sem `TIPOS_FILTRO` como fonte em `web/src`:** `git grep TIPOS_FILTRO 1ee4b7cc -- web/src` só acha o mock (`nucleoMock.ts:222`, que gera as opções, como o brief prevê) e um comentário de teste. `PRIORIDADES` segue no codec só como recaída sem opções, e em S3/S4 como vocabulário das séries do dado, fora do escopo do L6.
- **`colapsarTodos`:** com `null` (sem opções) não colapsa, com lista vazia também (`validos.length > 0`); comportamento novo coberto (P1,P2 de 3 não colapsa; P1..P3 colapsa; sem opções não colapsa).
- **Regras invioláveis:** nada mistura BusinessMap e Acelerato (o domínio da opção é conferido em `idsTipo` e `idsPrioridade`); nenhuma métrica nova nem dado de pessoa.
- **Testes dos arquivos tocados:** `VITEST_MAX_WORKERS=2 npx vitest run codec.test.ts k039.test.ts taticas.test.tsx qa-f6-tipo-produto.test.tsx`: 4 arquivos, 58 testes, todos passam. O QA (`docs/qa/097-l6-tipos-reais-web.md`, aprovado no mesmo sha) registra o vermelho antes do verde e dois mutantes no codec mortos; não refeito aqui. E2E e suíte inteira ficam no CI do PR.
- `docs/engineering/praticas.md` não tem regras marcadas "decidida por"; o checklist de leitura da skill foi aplicado ao diff.

## Achados
- A1 (recomendado) web/src/features/complementares/taticas.tsx:273 · as abas do T11 usam `t.nome` como `TipoFiltro` sem passar por `TIPO_ID`, ao contrário do codec, que descarta id desconhecido; um tipo novo na API vira aba cuja consulta falha no schema. Sugestão: mapear pelo id, como `idsTipo`.
- A2 (recomendado) web/src/features/filtros/BarraFiltros.tsx:22 · `tiposDe` refaz o mapa id para rótulo que o `codec.ts` já tem em `TIPO_POR_ID`; dois lugares com a mesma regra. Sugestão: exportar um único conversor do codec.
- A3 (recomendado) web/src/data/mock/nucleoMock.ts:222 · o mock oferece "Incidente" em `tipos`, que a API nunca devolve (`servico.ts:28` o exclui); o mock diverge do contrato real. Sugestão: aplicar o mesmo corte no mock num cartão próprio.
- A4 (recomendado) web/src/features/complementares/taticas.test.tsx:226 · concordo com o A1 do QA: o teste do T11 passa também na base; falta um caso com `opcoes.tipos` parcial provando que a aba ausente some.

## Veredito
Aprovado. Nenhum bloqueante: o comportamento pedido está implementado e coberto no codec; os achados são de robustez e duplicação, para um cartão de acompanhamento.
