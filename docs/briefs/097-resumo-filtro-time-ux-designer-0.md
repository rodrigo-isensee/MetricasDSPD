## Objetivo
Discovery da interface do pedido 097 (filtros): o dono quer filtrar por time no Resumo e no Apontamento, digitar para achar a opção nos filtros de lista e ver só opções reais nos filtros. Prints do dono: o filtro "Equipe" do Operacional mostra "Workflow 105", "Workflow 126"... (nomes provisórios, tratados no pedido 098, E4).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/097-resumo-filtro-time.md` (inteiro, com as decisões literais do dono).
- Código atual (só leitura, da develop em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo`): `web/src/features/filtros/FiltroMulti.tsx`, `web/src/features/filtros/BarraFiltros.tsx`, `web/src/features/operacional/resumo/BlocoResumo.tsx` e `web/src/features/apontamento/components/BarraFiltrosApontamento.tsx`.

## Entregar
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." (E1.1)
- (E1) (E2) (E3) (E4) (E1.1) Especificação `docs/ux/097-filtros-time-busca.md` (novo), pela ferramenta Write, no repositório principal: o filtro de time no Resumo (onde fica, como cada bloco usa os times da sua fonte, sem comparar times nem misturar fontes), a troca de Pessoa por Time no Apontamento (capacidade igual), a busca digitando no filtro de lista (teclado, leitor de tela, lista vazia, muitos itens) e o comportamento quando a lista vem do dado real (vazia, carregando, nomes longos); critérios de aceite numerados (CA-1…); um protótipo navegável simples (HTML estático em `docs/ux/prototipos/097-filtros.html`, novo) para o dono abrir no navegador. Sem commit: o Jarvis leva ao dono.
- arquivos: docs/ux/097-filtros-time-busca.md, docs/ux/prototipos/097-filtros.html

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/097-filtros-time-busca.md` · espera: rc=0
