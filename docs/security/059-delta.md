---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: 2f25c22029492cac8fe00ac6c9eb60a74c58fa2c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: front da aba Apontamento (pedido 059, E2.32, K-193)

Rodada 2, por delta. Intervalo revisado: `4857ad8..2f25c22` (saída do `forge-check delta` sobre a rodada 1; 7 commits da volta do front, E2.35, mais o parecer do review), com releitura do que o delta toca. Referência: ADR 0020 revisão 4 no ramo do discovery (R4-3, R4-4, R4-5, R4-7, R4-8 e o critério de reversão), o parecer da rota `docs/security/059-rota-apontamento.md` e o contrato `packages/contratos/src/apontamento.ts`. Revisão estática: o `.env` não foi lido, nada foi executado, nenhum nome de pessoa neste documento.

**Veredito: aprovado.** Nenhum bloqueante. O recomendado A1 da rodada 1 foi corrigido e sai da lista; nenhum achado novo.

## Gatilhos
Tela que mostra nome real de pessoa (exceção da aba, R4-3), filtro por pessoa na URL, cache do navegador, exclusão da exportação (o4), componente compartilhado alterado. R-SEGURANCA.

## Achados

## O que mudou no delta e foi verificado

**A1 da rodada 1, trava da exportação: corrigido (`web/src/features/apontamento/exportacao-fora.test.ts:1-65`).** O teste lê como texto todos os `.ts` e `.tsx` de `features/exportar/**` e `features/painel/**` (`import.meta.glob` com `?raw`), confere que a varredura enxerga arquivos (mais de 5 e mais de 1, então um glob quebrado não passa vazio) e falha se algum deles importar a aba por alias (`features/apontamento`), por caminho relativo (`../apontamento`), por `export ... from` ou por `import()` dinâmico; o detector tem teste próprio das cinco formas e de um negativo. Também falha se qualquer id ou código do catálogo de cartões, de `METRICA_IDS` ou do catálogo de métricas do web começar com `ap-` (sem diferenciar caixa). É a correção mínima pedida, nos dois braços (import e catálogo). Resíduo aceitável: um import transitivo (exportar importando um módulo neutro que importe a aba) não é pego, mas exigiria montar a aba dentro do PDF por um caminho que o code review vê; não justifica achado.

**Filtros validados pelo schema do contrato (`filtros.ts:24-31`, `filtros.ts:44-59`, `filtros.ts:76-79`).** As regex e tetos locais saíram; cada item da URL passa por `consultaApontamentoSchema.safeParse({ [chave]: [v] })` e a lista pelo mesmo schema (teto). O schema é `.strict()` e é o mesmo que a rota aplica: `pessoa` só `p<n>` (1 a 9 dígitos, sem zero à esquerda) ou `outra-area`; `projeto` e `tipo` só dígitos até 12; `subtarefa` e `subgrupo` só código minúsculo com hífen até 40; `qualidade` da lista fechada; tetos 200, 200, 50, 50, 50 e 6. Conferi contra a rodada 1: o formato aceito é o mesmo (nada foi afrouxado) e as datas ficaram mais estritas (data inexistente recusada pelo `diaCivil`, par obrigatório, fim depois do início e janela máxima, que antes a tela não conferia). O aviso continua levando só o rótulo do filtro, nunca o valor recebido. O custo cresce linear com o número de itens da URL, como antes (um parse por item); só quem abre o link paga, sem efeito na rota, que recusa acima do teto: sem caminho de ataque.

**Nota e exclusão de Outra área (`components/NotaOutraArea.tsx:1-12`, `CartaoDiario.tsx:254-257`, `CartoesCapacidade.tsx:104-106`).** A nota é texto fixo de `textos.ts:35-36` (sem dado da resposta), mostrada quando a chave `outra-area` aparece. O mapa diário e a capacidade por pessoa filtram `outra-area` no front; isso é apresentação (a soma continua a vir da rota) e não expõe nada: `outra-area` não tem nome nem chave de pessoa. A nova linha de ordem nos chips (`BarraFiltrosApontamento.tsx:53-58`) usa constante; o rótulo "Pessoa não identificada" virou constante.

**TabelaDados compartilhado (`web/src/components/ui/TabelaDados.tsx:24`, `:39`, `:43`).** Só a classe do primeiro `th` do cabeçalho ganhou `sticky left-0 z-10 bg-superficie-2`, por índice; nenhuma mudança de dados, de marcação perigosa nem de props. Sem efeito de segurança nos outros painéis.

**Sonda do tipo (`api.ts:97-105`, `useApontamento.ts:24-39`).** Agora só o 422 esconde o filtro; rede ou 5xx lançam `ErroApi` com o código do erro (nunca o corpo) e a consulta tenta de novo (2 vezes, validade de 5 min, refeita no foco). A sonda continua mandando só `tipo=1` e chaves de visão; o erro dela não é exibido. Aumento de chamadas à rota desprezível.

**Demais pontos do delta.** `aria-label` da seção com o aviso de nome real é constante (`ApontamentoPage.tsx:118-124`); o atalho por âncora foca o título por `getElementById` de constante de `textos.ts` (`CartaoAchados.tsx:41-45`); `rolagem.ts` é só geometria sobre o DOM do próprio mapa; a linha de critério vigente lê `criterios[].data` da resposta já validada pelo schema e só a formata (`CartaoApontamento.tsx:53-62`); `rota-falsa.ts` ganhou a falha de sonda e continua só de teste (importa `vitest`). A doc técnica (`docs/tecnica/arquitetura-front.md:321-332`) descreve o que o código faz, inclusive "sem log do corpo" e nada de pessoa em armazenamento. Busca no delta por `localStorage`, `sessionStorage`, `indexedDB`, `cookie`, `persist`, `innerHTML`, `dangerouslySetInnerHTML`, `window.open` e `console.`: nada novo fora de comentários e testes. Nenhuma dependência nova.

## Plano em cartões
Nenhum cartão novo.

## Riscos aceitos
Nenhum novo. Seguem os da rodada 1: nome real na tela de qualquer usuário do painel na rede local, pelas decisões "C" e P-1 do dono (2026-11-01), registrada na R4-5, até o login pelo AD; resposta no cache em memória do React Query enquanto a aba estiver aberta, admitida pela R4-7.

## Ferramentas e lacunas
`forge-check delta` sobre a rodada 1, leitura estática e `grep` sobre o diff. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação e não foram rodados; as varreduras ficam no CI do `devops-engineer`. Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
