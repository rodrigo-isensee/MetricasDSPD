---
tipo: review
contrato: 1
pedido: espera-invisivel-nos-paineis
branch: feature/espera-invisivel-nos-paineis
commit: 5fc3a7d6291a43761832898d8cdc0e5ea386d4b1
parecer: aprovado
revisor: tech-lead
data: 2026-10-13
---

# Code review: espera invisível dentro de cada painel

Escopo: `git diff 69db636..7d1bc71` (commits bf7090b a cc9d999, mais o merge de `origin/develop` com o #62, 71f196f, sem conflito). Especificação: `docs/ux/espera-invisivel-nos-paineis/especificacao.md`.

## Veredito

**Aprovado.** Nenhum ajuste bloqueante. Há três recomendações abaixo, que podem entrar nesta branch antes do QA ou ficar para depois.

## Verificação

| Comando | Resultado |
|---|---|
| `pnpm run lint` | verde |
| `pnpm run typecheck` (todos os pacotes e o e2e) | verde |
| `pnpm --filter @metricas-dspd/contratos --filter @metricas-dspd/web test` | contratos: 45/45 testes, 4 arquivos; web: 799/799 testes, 59 arquivos |

Não rodei a suíte E2E: o autor já rodou `pnpm run pronto` (verde, cobertura de 100%) e os specs E2E afetados.

## Checklist

1. **Escopo.** Os 12 critérios da especificação estão implementados no código:
   - a seção com o título em forma de pergunta nos quatro painéis, e no Operacional semanal ela vem depois de Qualidade, com item no "Ir para";
   - o botão de evolução mensal com `aria-expanded`/`aria-controls`, que não aparece com menos de 20 itens;
   - o redirecionador por hash com `replace`;
   - menu, Visão geral, catálogo com 4 linhas (49 no total), filtros, exportação e preferências.

   O código não vai além do pedido. O prefixo `sust_` continua no mecanismo de filtros, por decisão do UX, e foi registrado na especificação.
2. **Regras invioláveis.**
   - BusinessMap e Acelerato não se misturam. `destinoDaEsperaInvisivel` separa os parâmetros por domínio e descarta os do fluxo no destino `#ei-sust`. `Casca` passou a receber um `dominio` só, e o ramo de duas fontes saiu. Cada painel mostra só o nível dele, e um teste unitário confere isso para os quatro.
   - Nenhuma visão individual e nenhuma comparação entre níveis.
   - Nenhum cálculo novo: a série mensal já vinha no resultado e agora só é desenhada.
3. **Legibilidade.** O código ficou mais simples:
   - saíram `Recorte`, `fontes[]`, `variante`, `ALTURA_EI`, o ramo especial de `itensDoNivel` e `filtrosDoItem`;
   - `linhas.ts` perdeu o `ROTULO` próprio e o caso especial de nome.
4. **Tipos e entradas.**
   - `PainelId`, `PainelDaMetrica` e `NIVEIS` ficaram coerentes, e o typecheck garante que nenhum consumidor ficou para trás.
   - As preferências ignoram a chave de painel desconhecida com `z.preprocess` (`packages/contratos/src/cartoes.ts:287`), sem mudar o formato do pedido 007. Os ids `ei-*` não mudaram, então nada precisa de migração.
5. **Segurança.** O redirecionador só monta caminhos de uma lista fechada, sem open redirect: hash desconhecido vai para `/`. A busca é reserializada por `URLSearchParams`. Nenhum dado pessoal está envolvido.
6. **Performance.** A rota antiga não carrega chunk de página, porque `Component` é síncrono e leve no shell. O gráfico só monta quando é aberto. O esqueleto de 300px foi mantido.
7. **Testes.**
   - `redireciona.test.tsx` cobre os quatro destinos, o hash vazio, o hash desconhecido, a remoção do prefixo `sust_` e o `REPLACE`.
   - `espera-invisivel.test.tsx` cobre abrir, fechar, Esc, foco e a troca de aba com o gráfico aberto.
   - Os testes de contrato cobrem as seções e a chave antiga.
   - Os testes antigos da página foram migrados para os painéis.
8. **Acessibilidade.**
   - O nome acessível do botão começa pelo texto visível (WCAG 2.5.3).
   - `aria-controls` aponta para um id ausente só enquanto `aria-expanded="false"`, caso que o axe aceita.
   - O alvo é de 44px em 375, e o E2E com axe está verde segundo o autor.
9. **Commits.** As mensagens são claras e em português. O cc9d999 junta correção, E2E e documentação (ver R3). A PR vai para a `develop` por squash, então isso não afeta o histórico final.

## Revisão dos commits posteriores (a80882a a 3ad62a7)

Aprovado de novo. Os commits 9913c30, 9341ca0 e 130edde atendem R1 (`?.contains`, sem cast) e R2 (caso próprio para Esc fora do cartão, sem a tecla `a`). Também: `aria-controls` só com o gráfico aberto, hash do redirecionamento insensível a maiúsculas (com teste), testes de FL3 e Sustentação e E2E de gravação de `ei-fl2` pela UI. Só código de teste e ajustes pequenos; nada de regra nova. `lint`, `typecheck` e os testes do web estão verdes. R3 segue resolvido pelo squash. O E2E da CI acusou três specs antigos (`complementares`, `lacuna-de-valor`) ainda esperando 46 métricas no catálogo; o commit 5fc3a7d os atualiza para 49 (Núcleo 32, Complementar 17), coerente com as 4 linhas de espera invisível da especificação. Revisado: só valores esperados em teste. O E2E da CI ficou verde nesse commit.

## Recomendações (não bloqueiam)

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R1 | `web/src/features/espera-invisivel/components/CartaoEI.tsx:112` | `document.getElementById(...) as HTMLElement` esconde um `null` possível com um cast. Se o id do cartão mudar, o handler de Esc quebra em tempo de execução em vez de falhar no typecheck. | Usar um `ref` no contêiner da evolução (ou `?.contains`) e sair cedo quando não houver elemento. | recomendado |
| R2 | `web/src/features/espera-invisivel/espera-invisivel.test.tsx:126-131` | A sequência `keyboard('a')`, `blur()` e Esc sem foco existe para cobrir ramos e não descreve comportamento. Isso dificulta a leitura do teste. | Separar em um caso com nome próprio ("Esc com o foco fora do cartão não fecha o gráfico") e tirar a tecla `a`, que não testa nada. | recomendado |
| R3 | commit cc9d999 | Um commit só traz três mudanças: correção do prefixo, ajuste de E2E e documentação. | Nas próximas entregas, um commit por mudança coerente. Nesta, o squash da PR resolve. | recomendado |

## Observações

- `e2e/fixtures/constantes.ts:75` passa da largura do Prettier, mas o `e2e/` está fora do `format:check` e tem estilo próprio. Não exige ação.
- `docs/ux/espera-invisivel-nos-paineis/revisao-ux.md` está sem rastreamento na árvore. É do UX e não entrou neste commit.
