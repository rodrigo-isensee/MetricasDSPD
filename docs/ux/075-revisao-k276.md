# 075: revisão de UX do K-276 implementado (O1 e O2)

Autor: ux-designer, 2026-11-14. Etapa E3.10. Base: worktree `/home/rodrigoisensee/MetricasDSPD-052f` (branch `fix/k276-o1-o2-ux`), contra os achados 2 a 6 de `docs/ux/075-revisao-l9a.md`. Método: leitura do código (sem shell; todo item de acessibilidade é `lido`, nenhuma medição de ferramenta). Arquivos lidos: `CartaoO1.tsx`, `CartaoO2.tsx`, `Dispersao.tsx`, `MotivoBloqueio.tsx` (apoio) e `ux-o1-o2.test.tsx`. Os testes não foram executados por mim; o QA mede e roda.

## Veredito
**Aprovado.** Os achados 2 a 6 estão resolvidos no código, cada um com teste em `ux-o1-o2.test.tsx`. Nenhum achado novo crítico, alto ou médio. Achados 1 e 7 seguem com o dono e não foram cobrados aqui.

## Conferência dos achados
| Achado (gravidade) | Resultado | Evidência (lido) |
|---|---|---|
| 2 (baixo): O1 calava a coluna com `null` quando `hoje` tinha número | Resolvido | `CartaoO1.tsx:36-37` calcula `colunaSemBloqueio` (cobre `porColuna` e `porTipoColuna`); `:114-118` mostra "Há colunas sem dado real de bloqueio: nelas a barra mostra só o que está em progresso." Não duplica o aviso do ramo `semBloqueio` (exclusão mútua em `:37`). Testes: 3 casos do bloco "O1: coluna sem dado de bloqueio". |
| 3 (baixo): anel substituía a forma da situação | Resolvido | `Dispersao.tsx:60-70`: `Marca` desenha a forma da situação e põe o anel (r=11) por cima; `CartaoO2.tsx:75-80,115` passa `forma` pela situação e `bloqueado` à parte. Item bloqueado e acima do P95 mantém o triângulo. Tabela de apoio do gráfico descreve "triângulo com anel (bloqueado)" (`Dispersao.tsx:151-154`). Teste "achados 3 e 4" confere o `circle r=11` e o `path` juntos. |
| 4 (baixo): legenda "anel" sempre presente | Resolvido | `CartaoO2.tsx:130` só inclui `anel` quando `doTipo.some(bloqueioMotivo)`. Teste "sem item bloqueado, a legenda não traz anel". |
| 5 (baixo): apoio do O2 em `text-xs` | Resolvido | `CartaoO2.tsx:217` usa `text-sm text-texto-2` no contêiner; o `<p>` do apoio não define tamanho próprio. Contraste do token `text-texto-2`: `lido`, não medido; o QA mede (`@axe`). |
| 6 (baixo): "—" lido de forma irregular | Resolvido | `CartaoO2.tsx:208-211`: "—" com `aria-hidden="true"` e `<span class="sr-only">não bloqueado</span>`. O leitor de tela lê "não bloqueado" (`lido`, sem leitor de tela real). |

## Observações (sem exigir correção)
- Baixo. A lista "Significado das marcas" da `Dispersao` segue em `text-xs` (`Dispersao.tsx:162`). É anterior ao lote e a informação também está na tabela equivalente; se houver oportunidade, alinhar a `text-sm` como o apoio do achado 5.
- Baixo. O texto "anel (bloqueado)" na legenda sai como "**anel (bloqueado)**: bloqueado" (`ROTULO_FORMA.anel` + descrição `bloqueado`, `Dispersao.tsx:109,167`): redundante. Sugestão: descrição "item parado por bloqueio" ou rótulo só "anel".

## Acessibilidade (WCAG 2.2 AA), todos `lido`
- Não depender só de cor: forma, anel, hachura e texto carregam o significado. Conforme.
- Texto alternativo e equivalentes: gráfico denso com tabela equivalente que descreve a marca. Conforme.
- Contraste 4,5:1 do texto neutro e do anel (`--texto`) sobre a superfície: não medido; QA mede.

## Pendências para o dono (inalteradas)
- Achado 1 (manter ou remover o texto nulo no O1; o teste "hoje nulo segue no ramo sem dado real" registra o comportamento atual) e achado 7 (série de bloqueados no O1).
