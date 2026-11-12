---
tipo: revisao-seguranca
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/k286-mapa-diario-equipe
commit: dfba8a37e6a19ae527b11b81e7468bcb6bd88cad
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: 097 K-286, mapa diário recortado pela Equipe

Propósito: parecer de segurança (gatilho LGPD: o mapa de calor mostra pessoa × dia; `R-SEGURANCA`) do K-286 do pedido 097. Revisado o diff inteiro `origin/develop...dfba8a37` (7 arquivos: `filtros.ts`, `index.ts` e teste em `packages/metricas/src/businessmap/apontamento/`, `CartaoDiario.tsx` e teste em `web/src/features/apontamento/`, `server/tests/apontamento-rota.test.ts`, `docs/api/apontamento.md`). Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Dado de pessoa (LGPD): o mapa diário passa a ser recortado pelo filtro `equipe`, o que estreita o grupo de "Pessoa n" mostrado dia a dia.

## Resultado
- **A resposta continua sem nome nem coluna de pessoa: conforme.** A forma da resposta não muda (`docs/api/apontamento.md`, nota K-286). O mapa continua levando só `pessoaRef` por linha (`diario.ts`, `calcularDiario`); o rótulo `Pessoa ${ref}` vem de `servico.ts:168`, intocado. O modo de nomes reais (`APONTAMENTO_NOMES`, R4-5) é anterior e não muda.
- **Nenhum GRANT novo nem SQL novo: conforme.** O diff não toca `server/src/`, migrações, `grants.ts` nem o contrato; o recorte do mapa é feito em memória (`filtros.ts:51`) sobre as linhas que o papel `dspd_api_apontamento` já lê desde o L2 (coluna `dim_card.equipe`). O valor do filtro segue validado pelo `zod` (slug, até 50 itens) e resolvido pelo banco, como revisado no parecer do L2.
- **Sem comparação entre equipes: conforme.** O filtro só restringe linhas (`passa(f.equipe, l.equipe.id)`); vários times valem como um conjunto, sem agrupar, somar nem ordenar por equipe. O teste da rota (`apontamento-rota.test.ts:614`) confere as somas para `time-alfa`, `time-alfa,sem-time` e um slug inexistente (zero), e `times-sem-comparacao.test.ts` segue passando.
- **O filtro só estreita: conforme.** A mudança move a checagem de equipe para antes do retorno do modo `'diario'` (`filtros.ts:51-52`); o recorte principal não muda de comportamento (a equipe já era checada nele). Um slug desconhecido zera o mapa; lista vazia ou ausente mantém o mapa inteiro, como antes. O parâmetro `pessoa` continua acumulando com a equipe (só estreita).
- **Valor atípico decidido sobre o dia inteiro: informativo.** Com o recorte, uma célula pode mostrar poucas horas no time e vir marcada como atípica, porque a marca vê o dia todo da pessoa (`index.ts:58`, teste K-286). Isso revela que o dia total passou do limite, informação que o mapa sem recorte já mostrava para a mesma `Pessoa n`; não há dado novo. É decisão de produto documentada, não vulnerabilidade.
- **Reidentificação de "Pessoa n" em equipe pequena: o K-286 piora pouco, sem bloqueante.** O `pessoaRef` é estável entre os blocos e entre recortes, e desde o L2 a matriz, a qualidade e a capacidade por pessoa já mostravam, para o time escolhido, quais `Pessoa n` apontaram e quanto. O K-286 acrescenta a granularidade por dia dentro do recorte: num time de 2 ou 3 pessoas, quem conhece a escala (férias, plantão, quem estava em qual card no dia) liga "Pessoa n" a alguém com mais facilidade do que pelos totais do período. Caminho realista: um leitor interno da aba (rede local, sem autenticação por pessoa) que conhece o time; ganho: atribuir horas diárias a uma pessoa nomeada, o que fere o espírito da regra de não avaliação individual. Não é exploração remota nem vazamento de nome, e a aba é a exceção aprovada pelo dono (cláusulas o1 a o4). O risco é o mesmo A1 do L2, ampliado; o mínimo de pessoas por recorte segue com o dono. Recomendação (A1 abaixo): se o dono adotar o piso de pessoas, ele vale também para o mapa e é contado sobre o conjunto do próprio mapa (`doDiario`, janela própria), não sobre o recorte do período, porque as janelas diferem e um time pode ter 5 pessoas no período e 1 na janela do mapa.
- **Testes dos arquivos tocados (`VITEST_MAX_WORKERS=2`):** `packages/metricas` `apontamento.test.ts` 68 passed; `server` `apontamento-rota.test.ts` e `times-sem-comparacao.test.ts` 90 passed; `web` `apontamento.test.tsx` 62 passed. Rodados no head da branch (`91cf609d`, que só acrescenta o parecer de QA sobre `dfba8a37`).
- **Lacunas:** `gitleaks` e `semgrep` não estão no PATH e não rodaram. O diff não traz segredo, configuração nem dependência.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/apontamento/index.ts:66 · mapa diário recortado por equipe expõe Pessoa n dia a dia em time pequeno (piora o A1 do L2); se o dono adotar piso de pessoas por recorte, aplicá-lo também ao mapa, contado sobre doDiario (janela própria), não sobre o recorte do período.

## Plano em cartões
Nenhum bloqueante. A1 segue ao Jarvis como insumo da pergunta já aberta ao dono sobre o mínimo de pessoas por recorte (`R-DECISAO`); se a resposta for um piso, o cartão é do `node-backend` (cálculo em `packages/metricas`) com o `react-frontend` para o estado "recorte pequeno demais" no cartão do mapa.

## Riscos aceitos
Nenhum.
