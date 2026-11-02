---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: 4857ad84ae56bf21a9e81793aa83b1d46a462589
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: front da aba Apontamento (pedido 059, E2.32, K-193)

Diff revisado: `origin/feature/059-rota-apontamento...origin/feature/059-aba-front -- web` (o que o front soma à rota; 35 arquivos), na ponta `4857ad8`. Referência: ADR 0020 revisão 4 no ramo `origin/docs/059-apontamento-discovery` (R4-3, R4-4, R4-5, R4-7 e R4-8, e o critério de reversão) e o parecer da rota `docs/security/059-rota-apontamento.md`. Revisão estática: o `.env` não foi lido, nada foi executado, nenhum nome de pessoa neste documento.

**Veredito: aprovado.** Nenhum bloqueante. Uma recomendação que não devolve (A1).

## Gatilhos
Tela que mostra nome real de pessoa (exceção da aba, R4-3), filtro por pessoa na URL, cache do navegador, exclusão da exportação (o4). R-SEGURANCA.

## Achados
- A1 (recomendado) web/src/features/exportar/selecao.ts:24 · a aba fica fora da exportação só por não estar no catálogo; o único guarda é o teste de tela sem botão. Falta uma trava estrutural: `features/exportar` nunca importa `features/apontamento` e nenhum código `AP-` entra no catálogo.

## O que foi verificado e está correto

**Filtros na URL só com chave opaca (`filtros.ts:22-101`).** Cada chave tem formato fechado: `pessoa` só `p<n>` (1 a 9 dígitos, sem zero à esquerda) ou `outra-area`; `projeto` e `tipo` só dígitos; `subtarefa` e `subgrupo` só minúsculas, dígitos e hífen até 40; `qualidade` da lista fechada; datas `AAAA-MM-DD` válidas e em par ordenado; teto de itens por chave. Valor fora do formato é descartado e o aviso leva só o rótulo do filtro, nunca o valor recebido (testes com nome no lugar de `pessoaRef`, em `pessoa=`, `Pessoa=` e `nome=`, ausente da tela, dos avisos e das chamadas). Os seletores gravam ids, não rótulos (`BarraFiltrosApontamento.tsx:105-154`); os únicos campos livres são `input` de data. A query enviada à rota sai só das chaves do contrato (`api.ts:16-40`), então a consulta estrita da rota nunca recebe nome. "Copiar link" (`CabecalhoPainel`) copia a URL, que só tem a chave opaca; o título do documento é fixo (`ApontamentoPage.tsx:191`).

**`no-store` respeitado (`api.ts:60-67`).** O `fetch` da aba usa `cache: 'no-store'`, somado ao `Cache-Control: no-store` da rota; mesma origem, sem credencial nem CORS. Nenhum service worker nem PWA no `web/`. O corpo inválido vira `RESPOSTA_INVALIDA` sem log do corpo (`api.ts:92-94`); o erro mostrado é só o código.

**Nada de pessoa em armazenamento do navegador.** A resposta vive só no cache em memória do React Query (`useApontamento.ts:18-22`), chave = consulta (só chaves opacas), sem persister: a busca por `persist`, `localStorage`, `sessionStorage`, `indexedDB` e `document.cookie` no diff só acha comentários e testes. Os dois usos de `localStorage` do app (tema e preferências) não recebem nada da aba; testes conferem `localStorage` e `sessionStorage` vazios depois de filtrar por pessoa. O nome só é lido de `opcoes.pessoas[].rotulo` (`dados.tsx:188-200`) e só na tela; o aviso de nome real aparece quando a rota diz `nomesReais`.

**Aba fora da exportação (o4).** A página não usa `PainelPagina` nem `BotaoExportar` (`ApontamentoPage.tsx:110-188`); nenhum arquivo fora de `features/apontamento` cita os códigos `AP-` dos cartões, e os níveis da exportação (`selecao.ts:24-29`) não incluem a rota `/operacional/apontamento`; a aba também não é uma `Visao` (`visao.ts:11-15`), fica fora de `resolverVisao`, da cadência e do hash. Teste de tela sem botão nem texto de exportação. Resíduo no A1.

**Mock e fixture sem nome real.** `fixture.ts` usa "Pessoa 1" a "Pessoa 7" e "Pessoa não identificada", iniciativas e tipos genéricos; os testes usam nomes de exemplo genéricos ("Ana Exemplo") e marcadores ("Maria") só para provar ausência. Nenhum e-mail, id do BusinessMap ou comentário. A fixture só é importada por `rota-falsa.ts`, que importa `vitest` e só é usada por testes: não alcança o bundle de produção. O selo de origem da aba é "real" (`ApontamentoPage.tsx:50`), coerente com a leitura da rota.

**Navegação.** Rota própria `operacional/apontamento` com carga preguiçosa; o seletor só troca de rota, sem levar filtros de um lado ao outro (`OperacionalPage.tsx`, `ApontamentoPage.tsx:82-86`). As âncoras de "Achados" são constantes de `textos.ts`, não vêm da resposta; nenhum `dangerouslySetInnerHTML`, `innerHTML` nem `window.open`. A sonda do filtro por tipo (`api.ts:98-105`) manda só `tipo=1` e chaves de visão.

## Detalhe dos achados

### A1 (recomendado): exclusão da exportação sem trava estrutural
Hoje a o4 se cumpre porque o catálogo da exportação não conhece os cartões `AP-` e a página não monta `BotaoExportar`; o único teste olha a tela. Caminho: só por erro de código (alguém registrar um cartão da aba no catálogo ou montar a aba dentro do `PainelPagina`) que passasse no code review; o resultado seria nome real num PDF, que a R4-8 e o critério de reversão da R4 proíbem. Severidade baixa. Correção mínima: um teste estático (ou regra `no-restricted-imports`) que recuse import de `@/features/apontamento` em `web/src/features/exportar/**` e em `web/src/features/painel/**`, e que recuse código `AP-` no catálogo de métricas. Esforço P. Dono: react-frontend.

## Plano em cartões
- A1: react-frontend, no cartão de recomendados da aba ou na próxima volta do front.

## Riscos aceitos
Nenhum novo. O nome real na tela de qualquer usuário do painel na rede local é consequência das decisões "C" e P-1 do dono (2026-11-01), registrada na R4-5, até o login pelo AD; o cache em memória do React Query guarda a resposta enquanto a aba estiver aberta (descartado ao fechar ou recarregar), o que a R4-7 admite.

## Ferramentas e lacunas
Leitura estática e `grep` sobre o diff. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação e não foram rodados; as varreduras ficam no CI do `devops-engineer`. O diff do `web/` não traz dependência nova nem credencial. Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
