---
tipo: ux
contrato: 1
pedido: 036-estrategicas-pendentes
branch: feature/036-estrategicas-pendentes
etapa: E1.6
data: 2026-10-20
veredito: aprovado
achados_bloqueantes: 0
achados_recomendados: 0
---
# Revisão de UX do 036: pergunta do E7 ("Entregas por sistema")

Data: 2026-10-20. Revisor: ux-designer. Base: a pergunta do E7 trocada pela opção A do dono (pedido 036), em `web/src/content/catalogo-metricas.ts` (linha 535) contra `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§5 E7, linha 238, e a linha de 2026-10-20 da §11). Leitura na worktree `/home/rodrigoisensee/MetricasDSPD-030` (head 97f8545), sem gravar código lá.

## Mudança 1: pergunta do E7 no catálogo e na especificação
Texto nas duas fontes: "Qual a participação de cada sistema nas nossas entregas?". Igual no catálogo e na §5 da especificação. Conforme.

- Texto: a pergunta responde pelo que o cartão mede (participação por contagem de demandas entregues, sem valor em dinheiro, D2 = A e CA-13). Conforme.
- Cabe no cartão: 57 caracteres, uma frase, renderizada como parágrafo corrido sob o título (`CartaoMetrica.tsx:232`, mesma classe das outras 16 perguntas complementares). Não há truncamento. Conforme.
- Neutralidade: o sujeito é "cada sistema" e o possessivo é "nossas entregas", coletivo. A pergunta não cita pessoa, time nem responsável, e não sugere ranking nem comparação entre times (briefing 7.1; regra 8 e 9 da especificação). Conforme.
- Consistência: o texto da especificação (§5) e a nota de mudança (§5 e §11) batem com o catálogo. O texto antigo ("Quanto da nossa capacidade...") não aparece em `web/src` (busca feita; só o teste de ausência do nome antigo do cartão, `estrategicas.test.tsx:467`).
- WCAG 2.2 AA: texto puro, mesmo estilo e mesmo contraste das demais perguntas; a mudança não altera cor, foco, alvo nem ordem de leitura. Nada a aplicar.
- Veredito: aprovado.

## Observações (não bloqueiam o PR)
1. `docs/ux/metricas-tambem-disponiveis/01-cobertura.md`, linha 47, ainda traz na coluna de cobertura da proposta "Participação de cada sistema na capacidade entregue" e "custo em R$". É a tabela de cobertura do discovery (registro histórico da proposta original), não o texto do cartão, e a §11 da especificação é a fonte que vale. Sem ação para este PR; se o dono quiser a tabela atualizada, é ajuste de documentação em outro pedido.
2. A nota "Leia junto" do E8 cita "entregas por sistema (E7)", já alinhada ao nome do cartão (revisão 024). Nenhuma ação.

## Veredito final
**Aprovado.** A pergunta do E7 é a mesma no catálogo e na especificação, cabe no cartão, é neutra quanto a pessoas e times e não afeta WCAG 2.2 AA. Zero achado bloqueante e zero recomendado; uma observação informativa, sem ação exigida para o PR.
