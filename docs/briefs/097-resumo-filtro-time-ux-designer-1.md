Agente destino: forge:ux-designer
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Discovery da interface do pedido 097 (filtros): o dono quer filtrar por time no Resumo e no Apontamento, digitar para achar a opção nos filtros de lista e ver só opções reais nos filtros. Prints do dono: o filtro "Equipe" do Operacional mostra "Workflow 105", "Workflow 126"... (nomes provisórios, tratados no pedido 098, E4).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/097-resumo-filtro-time.md` (inteiro, com as decisões literais do dono).
- Código atual (só leitura, da develop em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo`): `web/src/features/filtros/FiltroMulti.tsx`, `web/src/features/filtros/BarraFiltros.tsx`, `web/src/features/operacional/resumo/BlocoResumo.tsx` e `web/src/features/apontamento/components/BarraFiltrosApontamento.tsx`.

## Entregar
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." (E1.1)
- (E1) (E2) (E3) (E4) (E1.1) Especificação `docs/ux/097-filtros-time-busca.md` (novo), pela ferramenta Write, no repositório principal: o filtro de time no Resumo (onde fica, como cada bloco usa os times da sua fonte, sem comparar times nem misturar fontes), a troca de Pessoa por Time no Apontamento (capacidade igual), a busca digitando no filtro de lista (teclado, leitor de tela, lista vazia, muitos itens) e o comportamento quando a lista vem do dado real (vazia, carregando, nomes longos); critérios de aceite numerados (CA-1…); um protótipo navegável simples (HTML estático em `docs/ux/prototipos/097-filtros.html`, novo) para o dono abrir no navegador. Sem commit: o Jarvis leva ao dono.
- arquivos: docs/ux/097-filtros-time-busca.md, docs/ux/prototipos/097-filtros.html

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até e28647fab9d18483def9b665b17265dcb54f834330ed89c36080a03aed3a72a1 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.1 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/097-filtros-time-busca.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
