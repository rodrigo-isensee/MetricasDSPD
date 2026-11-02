---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: 7509a639031079c19338d92bccd7a4ca47ba7204
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: front da aba Apontamento (pedido 059, E2.32, K-193)

Rodada 3, por delta. Intervalo revisado: `3eb64a1..60194ef` no que toca `web` e `docs/tecnica` (2 commits do front: `a1929c9` retira a sonda do tipo, `d2b3d14` liga o filtro por tipo com o id de `opcoes.tipos`; o resto do intervalo é a ponta da rota trazida por merge, com parecer próprio em `docs/security/059-rota-apontamento.md`). A ponta de código é `60194ef`; o `7509a63` por cima só troca `docs/reviews/059-delta.md`. Referência: ADR 0020 revisão 4 (R4-3, R4-4, R4-5, R4-7) e o contrato `packages/contratos/src/apontamento.ts`. Revisão estática: o `.env` não foi lido, nada foi executado, nenhum nome de pessoa neste documento.

**Veredito: aprovado.** Nenhum bloqueante e nenhum achado novo. A rodada 2 segue valendo no que o delta não toca (trava da exportação, filtros validados pelo schema, nota de Outra área, `TabelaDados`).

## Gatilhos
Tela que mostra nome real de pessoa (exceção da aba, R4-3), filtro na URL, cache do navegador, exclusão da exportação (o4), componente compartilhado alterado (rodada 2). R-SEGURANCA.

## Achados

## O que mudou no delta e foi verificado (rodada 3)

**Filtro por tipo ligado, com o id de `opcoes.tipos` (`web/src/features/apontamento/components/BarraFiltrosApontamento.tsx:128-135`; `filtros.ts` sem mudança).** O filtro deixou de ser condicional e manda de volta o `id` da opção. Esse `id` é `z.string()` livre no contrato (`packages/contratos/src/apontamento.ts:167`, `:365`), mas não chega à rota sem passar pela validação do front: cada item entra na URL e na consulta só depois de `consultaApontamentoSchema.safeParse`, cujo campo `tipo` é lista de `idNumerico` (`apontamento.ts:35`, `:141`: só dígitos, 1 a 12, teto 50), e o schema é `.strict()`. Id fora do formato é descartado, e o aviso leva só o rótulo do filtro, nunca o valor. A rota aplica o mesmo schema, então o valor da URL não vira marcação nem consulta sem validação: sem caminho de injeção. O rótulo da opção é texto renderizado pelo React (sem `dangerouslySetInnerHTML`), com teto de tamanho do contrato. O tipo é `type_id` do card e não carrega dado de pessoa, então a URL com `tipo` não expõe nome nem chave de pessoa.

**Sonda do tipo retirada (`api.ts:94-97`, `useApontamento.ts`, `types.ts:58-61`, `ApontamentoPage.tsx:62-63`).** Saíram `filtroTipoDisponivel`, `useFiltroTipoDisponivel` e a validade da sonda. Efeito de segurança: some uma chamada extra à rota (`tipo=1` com `nivelMatriz=tipo`) e some o estado que escondia o filtro; se a rota um dia recusar `tipo` com 422, o erro cai no tratamento de `ErroApi` que já existe, sem corpo exibido nem logado. Nenhuma superfície nova.

**Mock de teste (`rota-falsa.ts:6-30`, `fixture.ts:574`).** O `fetch` falso aplica `tipo` em CSV à fixture com pessoas fictícias, como a rota; continua só de teste (importa `vitest`) e fora do bundle. Os testes da sonda saíram junto com o código.

**Resto do delta.** Busca por `localStorage`, `sessionStorage`, `indexedDB`, `cookie`, `persist`, `innerHTML`, `dangerouslySetInnerHTML`, `window.open` e `console.` no diff de `web`: nada. A trava da exportação (`exportacao-fora.test.ts`) não mudou e a aba segue fora de `features/exportar` e `features/painel`. A doc técnica (`docs/tecnica/arquitetura-front.md`, item do filtro por tipo) descreve o que o código faz. Nenhuma dependência nova no `web`. O servidor trazido pelo merge (rota, coleta, migrações, view de quem é do time) não foi relido aqui: tem parecer próprio nas branches da rota e da coleta.

## Plano em cartões
Nenhum cartão novo.

## Riscos aceitos
Nenhum novo. Seguem os das rodadas anteriores: nome real na tela de qualquer usuário do painel na rede local, pelas decisões "C" e P-1 do dono (2026-11-01), registrada na R4-5, até o login pelo AD; resposta no cache em memória do React Query enquanto a aba estiver aberta, admitida pela R4-7.

## Ferramentas e lacunas
`git diff` e `grep` sobre o intervalo da rodada 3, leitura estática do contrato. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação e não foram rodados; as varreduras ficam no CI do `devops-engineer`. Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
