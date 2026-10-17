---
tipo: qa
contrato: 1
pedido: 024-e7-sem-reais
branch: feature/024-e7-sem-reais
commit: 781e171
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
aceite_usuario: sim
data: 2026-10-17
---

# QA: pedido 024 (E7 sem R$ e participação percentual; E3, E4 e E5)

Links: pedido `docs/pedidos/024-e7-sem-reais-participacao.md`, review `docs/reviews/024-e7-sem-reais.md` (rodada 5, `b390b0c`), contratos `docs/contratos/metricas/E6.md` a `E9.md`, bug `docs/qa/bugs/024-001-e8-test-fora-do-prettier.md`.

## Veredito

**Aprovado, escopo completo.** Zero bug crítico, alto ou médio aberto. Uma ressalva baixa aberta (documental, abaixo), que exige aceite do usuário. As lacunas G1 a G3 achadas no primeiro QA têm teste (`8a4a5a7`); o bug 024-001 (média, Prettier em `e8.test.ts`) está corrigido em `b390b0c`.

## Prova da suíte (CI do push)

Run [39039285614](https://github.com/rodrigo-isensee/MetricasDSPD/actions/runs/39039285614), head `781e171`, conclusão `success`: rapida, testes, banco, build, openapi, seguranca, imagem e filtro verdes; e2e e perf `skipped`. O delta de `b390b0c` a `781e171` é só o parecer de review (documentação); o código e os testes são os de `b390b0c`, cujo run (39038864395) foi cancelado por esse push seguinte, sem falha. Não rodei `pronto` nem E2E local (teto de recursos do pedido, uma tarefa pesada por vez).

Limite do que a CI provou: o job `e2e` só roda em `pull_request`/`workflow_dispatch` (`.github/workflows/ci.yml`, linha 192), portanto não rodou aqui. O delta não altera fluxo nem tela navegável além do título e do catálogo do E7, que têm teste de componente (G1); o E2E roda no PR para a `develop` e deve estar verde antes do merge.

## Critério x teste x resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E1: E7 sem R$ (nenhum campo de dinheiro, schema recusa campo de custo) | `packages/metricas/src/businessmap/e7.test.ts`, "nenhum campo de valor em dinheiro na saída, no mock e em fixture; o schema estrito recusa um campo de custo" | campo proibido na saída e entrada (schema estrito) | passa |
| E1: participação = entregas do sistema ÷ entregas do período, maior volume primeiro | `e7.test.ts`, "participação por contagem de entregas; a de maior volume primeiro; sem R$"; "base do mock: soma das participações fecha 100%" | soma 100%; ordem | passa |
| E1: mínimo de 20 entregas por sistema ("k de n") | `e7.test.ts`, "sistema com menos de 20 entregas tem participação nula"; "com menos de 20 entregas no total toda participação é nula"; "fronteira 19/20 por sistema" | 19 (nulo) e 20 (publica); regra inviolável abaixo de 20 | passa |
| E1: desempate neutro, naturezas, só entregue no período, filtros, vazio | `e7.test.ts`: "desempate pelo nome do sistema", "as quatro naturezas sempre presentes", "só demanda entregue no período", "o filtro de equipe não atua", "sem entregas" | vazio; exclusões; ordem neutra | passa |
| E1: mudança de critério registrada com data (T2.6) e marcada na série/janela (G2) | `e7.test.ts`, "a série traz a versão do período e fora dele não traz"; "a versão de 2026-10-17 afeta o E7, está na biblioteca e aparece na série e na janela sem critérios fictícios" | período fora da versão não a traz | passa |
| E1: contrato, snapshots e cartão sem custo | `packages/contratos/src/tambem.test.ts`, `tambem2.test.ts`, `contratos.test.ts`, `cartoes.test.ts`; `server/tests/metricas.test.ts` | contrato estrito | passa |
| E3: E8/E9 alinhados à janela do cálculo; período não muda o resultado (G3) | `packages/metricas/src/businessmap/e8.test.ts`, "G3: variar o período não muda o resultado (a janela é fixa em 12 meses)"; `fase2.regras.test.ts` | janela fixa de 12 meses | passa |
| E4: `concluidoEm` no contrato do E6 | `packages/metricas/src/businessmap/e6.test.ts`; `packages/contratos/src/tambem2.test.ts`; `web/src/features/estrategico/estrategico.test.tsx` | campo presente e lido pelo front | passa |
| E5: nome "Entregas por sistema" no cartão, catálogo e tela, nunca o nome antigo (G1) | `packages/contratos/src/cartoes.test.ts`, "o cartão E7 se chama 'Entregas por sistema', nunca o nome antigo"; `web/src/features/complementares/estrategicas.test.tsx`, "catálogo e título do cartão dizem 'Entregas por sistema'"; "manda ler junto com o nome vigente do E7" | ausência do nome antigo | passa |

Acessibilidade: o delta de interface é só texto de título e catálogo; os testes de componente e a verificação automática existentes do front rodam no job `testes` (verde). Sem tela nova.

## Vermelho antes do verde e mutação

- Vermelho: não refeito nesta rodada (sem `pronto` local nem `git stash` do código de produção, por restrição de recursos). Os testes G1 a G3 (`8a4a5a7`) nasceram de lacunas (asserção ausente), não de defeito; a falha sem a implementação não foi observada por mim aqui. Registro como limite.
- Mutação: não rodada nesta rodada (mesma restrição). Fica como risco residual baixo: a lógica nova do E7 (contagem, fronteira 19/20, desempate) tem fronteiras explícitas.

## Bugs

| ID | Severidade | Estado |
|---|---|---|
| 024-001 | média | corrigido em `b390b0c`; `format:check` e `lint` verdes na CI |
| ressalva R-1 (abaixo) | baixa | aberta, documental |

**Ressalva baixa R-1 (aceite do usuário):** o registro `docs/qa/bugs/024-001-e8-test-fora-do-prettier.md` diz "`git diff -w` vazio". Isso é impreciso: `-w` não ignora quebra de linha, e o diff real é justamente a quebra de linha da chamada `extDe([...])` (linha 119). A afirmação correta, já conferida no review da rodada 5 por word-diff: mesmos tokens e asserções, só quebra de linha, vírgula final e indentação. Não alterei o registro (commit enviado não se emenda; sem novo commit no registro, conforme o pedido). Sem efeito em código ou comportamento.

## Resultado da execução

Data 2026-10-17, ambiente CI do GitHub (run acima), head `781e171`. Suíte da CI: verde. E2E: não executado nesta etapa (só em PR). Bugs críticos, altos e médios abertos: 0.
