# Revisão de UX do K-336 (filtro Setor) - pedido 097, E4.141

Revisor: ux-designer. Sem commit. Tudo abaixo é `lido` (pelo código); nada foi `medido`: o papel não tem shell e não rodou ferramenta.

## Onde li
O brief manda ler a worktree `/home/rodrigoisensee/MetricasDSPD-056` no head 220f57c3. Essa worktree já não está nele: o HEAD dela é fbb90d95 (checkout de `origin/fix/k347-log-5xx-sem-erro-cru`, `logs/HEAD` linha 115) e nela não há Setor. O 220f57c3 (`feature/097-k336-setor-tela`) está na worktree `/home/rodrigoisensee/MetricasDSPD-052f`. Li lá: `web/src/features/filtros/` (`codec.ts`, `paineis.ts`, `BarraFiltros.tsx`, `FiltroMulti.tsx`, `useFiltros.ts`), `web/src/features/operacional/resumo/` (`FiltroSetorBloco.tsx`, `BlocoFluxo.tsx`, `BlocoSustentacao.tsx`, `consultas.ts`) e `packages/contratos/src/{referencia,filtros}.ts`. Escrevo o parecer no caminho pedido.

## Veredito por critério (spec: `docs/ux/097-filtros-time-busca.md`)

| CA | Veredito | Evidência (lido) |
|---|---|---|
| CA-41 sem sobrenome do responsável | Atendido no front | A web só exibe `o.nome` vindo de `opcoes.setores`. O contrato diz "setores sem sobrenome" e `id` = slug do nome sem sobrenome (`filtros.ts:66`, `referencia.ts:14`). `FiltroMulti.tsx` não usa `title`. Os `aria-label` e o `role="status"` usam só `rotulo` ("Setor") e `nome`. O chip usa `rotuloDe(setores, id)` (`useFiltros.ts:124`), e a URL leva o slug. A garantia de que `nome` e `id` nunca tragam sobrenome é do servidor (E7); o front não filtra. |
| CA-43 sem Setor na Sustentação nem no Acelerato | Atendido | `FiltroSetorBloco` só é montado em `BlocoFluxo.tsx:110`. `BlocoSustentacao.tsx:24` monta o filtro só com `equipe`. O painel `sustentacao` em `paineis.ts:68` não lista `setor` nem `params`. As opções só vêm de `dominio === 'businessmap'` (`codec.ts:97`). |
| CA-45 aviso consolidado com 2 ou mais setores | Atendido | O texto é literal: "Resultado consolidado de {N} setores. O sistema não compara setores." Aparece com `selecionados.length >= 2` (`FiltroSetorBloco.tsx:80-87`, `BarraFiltros.tsx:308`). Não há números, série nem linha por setor no código lido. |
| CA-49 setor no Resumo altera só o Fluxo | Atendido | `BlocoFluxo.tsx:28-52` inclui `setor` nos filtros do bloco e da tendência. `BlocoSustentacao.tsx:24` e `consultas.ts` não recebem `setor`. Sem seleção, o objeto de filtros não ganha a chave, então o cache e as consultas ficam como antes. |

## Achados

Nenhum crítico, alto ou médio.

- Baixo, `FiltroSetorBloco.tsx:68`: o botão "Limpar filtros" tem `aria-label="Limpar filtros de Setor do bloco Fluxo"`, diferente do texto visível. Com o texto visível dentro do nome acessível (WCAG 2.5.3, rótulo no nome), o nome acessível contém o visível e a regra passa. Correção opcional: nenhuma.
- Baixo, CA-41: não existe teste de front que alimente uma opção com sobrenome e confirme que ele não vai para `aria-label` nem para a URL. O risco real está no servidor, onde o E7 cobre. Se o QA quiser fechar o critério ponta a ponta, o teste fica no teste do endpoint de opções.
- Observação, não verificada: este parecer cobre o Resumo e a barra comum, como o brief pede. Não li as telas de Sustentação dentro do Operacional (`s3`...`s6`) para confirmar que ali o `setor` da URL não vira filtro. Pelo `paineis.ts`, o `operacional` aceita `setor` nos `params` e a `BarraFiltros` do Operacional mostra o filtro (por desenho, CA-44). Quem testa a visão Sustentação deve conferir que ela ignora `setor`.

## Estados (CA-48, fora do pedido, confirmado de passagem)
Carregando, vazio e erro com "Tentar de novo" existem no bloco do Resumo (`FiltroSetorBloco.tsx:24-52`), com `role="alert"` no erro e `role="status"` nos outros. Busca e teclado vêm de `FiltroMulti`, o mesmo componente da Equipe.

## Conclusão
CA-41, CA-43, CA-45 e CA-49 estão atendidos no código do 220f57c3. Atenção: o CA-41 depende do servidor entregar `nome` sem sobrenome.
