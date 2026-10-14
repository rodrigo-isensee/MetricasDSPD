# Revisão de UX: espera invisível dentro dos painéis

Branch `feature/espera-invisivel-nos-paineis`. Referência: `especificacao.md` (critérios 1 a 12), heurísticas de Nielsen e WCAG 2.2 AA. Revisão por leitura de código e do spec E2E; nada foi executado (servidor e testes fora, por carga da máquina). O prefixo `sust_` mantido e o alvo de 24px no desktop (44px em 375) são decisões registradas e não entram como achado.

## Veredito: APROVADO, com 4 ajustes de baixa severidade (nenhum bloqueia)

## Veredito por critério

| CA | Resultado | Evidência |
|---|---|---|
| 1 Menu sem "Espera invisível" | Atende | Nenhum item de menu restante em `web/src`; rota só em `web/src/app/router.tsx:37`. E2E `espera-invisivel-nos-paineis.spec.ts:73-79` (375 abre o menu antes, 1280). |
| 2 Redirecionamento | Atende | `web/src/app/RedirecionaEsperaInvisivel.tsx:9-33`: fluxo e `sust_` separados; `sust_` perde o prefixo (L14), `ei_sust` passa (L15), parâmetros do fluxo descartados no destino da Sustentação (L29); `cadencia=semanal` forçada (L21); sem hash vai para `/` (L31); `replace` (L38). E2E L26-67 cobre os quatro hashes, o sem-hash, o Voltar e o chunk. |
| 3 Operacional | Atende | `OperacionalPage.tsx:125` (item no "Ir para", depois de Qualidade) e `:192-198` (seção depois de Qualidade, fora de "Tempo", L174-177). Diária sem EI (L143-147). Respeita ocultos (L132-134). E2E L125-137. |
| 4 Tático, Estratégico, Sustentação | Atende | `TaticoPage.tsx:105-107`, `EstrategicoPage.tsx:63-65`, `SustentacaoPage.tsx:101-103`: mesmo título-pergunta e um só cartão de EI por painel (E2E L89). |
| 5 Botão de evolução | Atende | `CartaoEI.tsx:193-205` (`aria-expanded`, `aria-controls`, texto alterna, só com `temSerie`, ou seja, ≥20 itens); gráfico com tabela própria e marcas de critério (L167-192); estado local, URL intacta; Esc devolve o foco (L109-119). E2E L91-116 e L150-156. |
| 6 Aba atualiza `ei_*` e o gráfico acompanha | Atende | `CartaoEI.tsx:87` e `:170` (`idSeg` na chave do gráfico). E2E L139-148 (só Operacional; Sustentação tem a mesma lógica). |
| 7 Visão geral | Atende | `VisaoGeralPage.tsx:105-130` com os quatro destinos; E2E L160-178 clica e confere o cartão. |
| 8 Catálogo | Atende | `web/src/content/catalogo-metricas.ts:315,326,337,348` (quatro nomes iguais ao `rotulo` do cartão). E2E L180-187 inclui o filtro "Painel". |
| 9 Preferências | Atende, com cobertura fraca | Ids inalterados; seção sai do "Ir para" (`OperacionalPage.tsx:132-134`). A asserção do marcador no E2E (L207) usa `.or(...)` genérico e não prova o marcador do cartão; a gravação `{tatico:['ei-fl2']}` não é exercida na E2E (só em testes unitários, segundo o registro). |
| 10 Exportação | Atende | `exportar/modelo.ts` sem opção "Espera invisível" de painel (só o bloco da Visão geral, L375-410, que não é a opção removida). E2E L216-227. |
| 11 Sem rolagem horizontal | Atende | Rolagem restrita ao bloco do gráfico (`CartaoEI.tsx:171`, `overflow-x-auto`); E2E L106 e L117 nos quatro painéis, 375 e 1280. |
| 12 Rota sem chunk, testes migrados | Atende | Redirecionador síncrono (`router.tsx:37`); E2E L60-66. |

Acessibilidade e layout: `h2` da seção e `h3` do cartão; nome acessível "Ver evolução mensal, <nível>" contém o texto visível (WCAG 2.5.3 ok); alvo `.alvo` com 24px e 44px abaixo de 768px (`web/src/styles/tokens.css:133-142`); foco devolvido ao botão; axe bloqueante verificado com o gráfico aberto; sem animação, então `prefers-reduced-motion` é respeitado.

## Ajustes (todos baixos, acionáveis)

1. **Baixo, Estratégico sem verificação do gráfico aberto.** O E2E (L92-95) só afirma a ausência do botão no Estratégico (amostra insuficiente no mock). O caminho "aberto" com abas por tipo nunca é exercido para FL3 e SUST em 375. Correção: um caso de teste com dado que tenha série (ou unitário do `CartaoEI` com `nivel="FL3"`), com axe e sem rolagem horizontal.
2. **Baixo, `aria-controls` apontando para id inexistente com o gráfico fechado** (`CartaoEI.tsx:198`: o elemento só existe com `aberta`). Passa no axe, mas leitores de tela podem anunciar controle inválido. Correção: aplicar `aria-controls` só quando `aberta`, ou manter o contêiner sempre montado com `hidden`.
3. **Baixo, hash sensível a maiúsculas** (`RedirecionaEsperaInvisivel.tsx:19-31`): `#EI-FL1` cai em `/`. Correção: `hash.toLowerCase()` no `switch`.
4. **Baixo, asserção fraca do marcador de oculto** (E2E L207). Correção: asserir o marcador específico do cartão `ei-fl2` e a ausência do item no índice P3; incluir um caso de ocultar pela UI conferindo `{tatico:['ei-fl2']}` (CA-9). Opcional: o comentário de `web/src/components/ui/PreferenciasPainel.ts:36` ainda cita "Espera invisível" como painel sem cartões; atualizar.

Observação (não é achado): o título do cartão passou a "Espera invisível · Operacional" (via `m.nome`, `CartaoEI.tsx:218`) e, com segmento, "Espera invisível · Operacional · Incidente". A especificação pedia "Espera invisível", mas o catálogo adota o nome com nível (um nome só no app), e o nível dentro de cada painel é redundante. Se o usuário preferir título curto no painel, é decisão de produto; não bloqueia.
