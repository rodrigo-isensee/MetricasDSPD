---
tipo: plano-tecnico
contrato: 1
pedido: 097-resumo-filtro-time
estado: proposta
ux: docs/ux/097-revisao-l8b.md (resposta ao A2, B1, B2 e B3)
adrs: [0024, 0013, 0026]
agentes: [node-backend, react-frontend, qa-engineer, tech-lead, ux-designer]
gatilhos_seguranca: []
---

# 097, K-324: recolher depois do L8b (E4.67)

Estado: proposta. Data: 2026-11-14. Autor: software-architect. Branch `fix/k324-recolher` (da develop `61286dac`), worktree `MetricasDSPD-052f`.

Fontes lidas: cartão K-324 do `KANBAN.md`; `docs/ux/097-revisao-l8b.md`; `docs/reviews/097-l8b-recolher-paineis.md` (A1, A2); `packages/contratos/src/apontamento.ts`; `packages/metricas/src/businessmap/apontamento/distribuicao.ts` e `tipos.ts`; `server/src/modulos/apontamento/servico.ts` e `repositorio.ts`; `web/src/components/ui/CartaoMetrica.tsx`, `Recolhidos.tsx`, `recolhidos.test.tsx`; `web/src/features/apontamento/components/CartaoDistribuicao.tsx`, `CartaoApontamento.tsx`, `fixture.ts`, `dezMaiores.ts`, `textos.ts`; `docs/api/apontamento.md`; `docs/contratos/politica-de-mudanca.md`; `packages/mock/src` (busca por apontamento).

Conferência com a constituição: o projeto não tem `docs/constituicao.md`; conferido contra as regras invioláveis do `CLAUDE.md`: **conforme**. Nada por pessoa, equipe ou setor no resumo; nenhum cálculo novo de tempo, percentil ou previsão (a soma de `segundos` já calculados no servidor é a mesma de hoje); BusinessMap só.

Segurança: sem gatilho de segurança. Nenhum campo novo na resposta, nenhum dado de pessoa, nenhuma dependência, rota, coluna ou chave de armazenamento nova.

Afrouxa: não. Nenhuma regra de `docs/regras/`, item de `tests/config.json` ou controle muda.

## (a) Marca de sem projeto em `LinhaDistribuicao`

### Fato
A linha sem projeto já existe e já tem id estável: `servico.ts:110` monta `projeto: { id: l.projetoId ?? 'sem-projeto', rotulo: ... 'Sem iniciativa' ... }` e a biblioteca (`distribuicao.ts:21`) agrupa por esse id. O mesmo literal aparece em `servico.ts:192` e `:195` (`registroIncompleto`) e já está documentado como valor do contrato em `docs/api/apontamento.md:62-63` (`id: "sem-projeto"`, `rotulo: "Sem iniciativa"`). Os demais ids de projeto são `card_id` em dígitos (`iniciativa_card_id`), então não há colisão. O que falta não é o dado, é **o nome do valor no pacote de contratos**: hoje o literal está solto no servidor e a web não tem como referenciá-lo sem repetir a string.

### Alternativas
| Opção | Contrato | Prós | Contras |
|---|---|---|---|
| 1. Campo `semProjeto: z.boolean().optional()` em `linhaDistribuicaoSchema`, só em `porProjeto` | aditivo, compatível (§2 da política) | explícito na forma, como `foraDoEscopo` | duplica o que o id já diz (`semProjeto === (id === 'sem-projeto')`): duas fontes que podem divergir; muda o `openapi.json`, a fixture e a fixture E2E; resposta antiga sem o campo |
| **2. Constante `ID_SEM_PROJETO = 'sem-projeto'` exportada de `packages/contratos/src/apontamento.ts`**, usada pelo servidor e pela web | forma igual; só nomeia um valor que já é contrato documentado | uma fonte só; zero mudança de schema, OpenAPI, fixture E2E e mock; a web compara id, não rótulo | a marca é por valor de id, não por campo; quem lê só o JSON Schema não a vê (mitigado pelo JSDoc e por `docs/api/apontamento.md`) |
| 3. Comparar o rótulo "Sem iniciativa" na web | nenhum | nenhum trabalho no servidor | frágil (UX B1 recusa); o rótulo é texto de tela |

### Decisão
**Opção 2.** Nome `ID_SEM_PROJETO`, tipo `'sem-projeto'` (`as const`), exportado de `packages/contratos/src/apontamento.ts` ao lado de `PESSOA_OUTRA_AREA` (o mesmo padrão: valor sentinela nomeado no contrato). O `linhaDistribuicaoSchema` **não muda** (nem `.describe`, que mudaria o `openapi.json`); o JSDoc da linha e o da constante dizem: "em `porProjeto`, a linha com `id === ID_SEM_PROJETO` soma as horas sem projeto identificado; não é um projeto". Nasce no servidor onde já nasce: `servico.ts:110`, `:192` e `:195` trocam o literal pela constante (refatoração sem mudança de comportamento).

Respostas pedidas no brief:
- **Opcional ou não:** não há campo; a resposta é idêntica byte a byte.
- **Quebra a web:** não. Classe da mudança: compatível (nenhuma linha da tabela do §2 da política se aplica; é constante TypeScript). `openapi:verificar` segue igual.
- **`docs/contratos/`:** nada. A rota do Apontamento não tem fotografia em `docs/contratos/snapshots/` (só resultados de métrica e eventos); o contrato legível dela é `docs/api/apontamento.md`, que ganha uma frase em `distribuicao.porProjeto` (o id `sem-projeto` também aparece lá, não só em `registroIncompleto`).
- **`packages/mock/`:** nada, e o hash não muda. O pacote não gera resposta de Apontamento (a busca por `apontamento`/`porProjeto` em `packages/mock/src` só acha o `porProjeto` interno da extensão do 011, outro assunto). A "fixture" do Apontamento é `web/src/features/apontamento/fixture.ts`, só de teste.
- **CHANGELOG:** sim, uma linha em `### Corrigido` na parte da web (o texto do resumo muda para quem usa). A parte do servidor não muda comportamento e não leva linha.
- **Dado de pessoa:** nenhum.

### Comportamento na web (UX, resposta ao A2)
Em `CartaoDistribuicao.tsx:171-175`: `projetos = linhas.filter((l) => l.id !== ID_SEM_PROJETO).length`; `totalSegundos` continua somando **todas** as linhas. Texto:
- sem a linha: igual a hoje (`Recolhido. 5 projetos, 523,5 h no total.`);
- com a linha: `Recolhido. 5 projetos e horas sem projeto, 523,5 h no total.` (texto do UX); singular `1 projeto e horas sem projeto`; só a linha: `0 projetos e horas sem projeto` (aplicação mecânica da fórmula do UX; o `ux-designer` confirma na revisão, ver Q-2).
- `foraDoEscopo` continua contando como projeto (UX).

### Critério de reversão
Trocar pela opção 1 se aparecer um segundo balde que não é projeto em `porProjeto` (outro id sentinela) ou se algum consumidor fora da web (exportação, automação da T4.3) precisar distinguir a linha só pelo JSON Schema.

## (b) Divisão do resto do cartão

Três partes, nenhum arquivo em comum entre elas.

### Parte A, `node-backend`: constante no contrato
- Arquivos: `packages/contratos/src/apontamento.ts` (export `ID_SEM_PROJETO` e JSDoc), `server/src/modulos/apontamento/servico.ts` (três literais pela constante), `server/tests/apontamento-rota.test.ts` (um teste: apontamento sem iniciativa sai em `distribuicao.porProjeto` com `id === ID_SEM_PROJETO`, horas somadas na linha e no `kpis.segundos`), `docs/api/apontamento.md` (frase em `porProjeto`).
- Pacotes: `packages/contratos` (só export), nada em `docs/contratos/`, `packages/mock/`, `CHANGELOG.md`.
- Provas: o teste novo passa; `pnpm --filter @metricas-dspd/server run openapi:verificar` sem diferença (prova de que a forma não mudou); `git grep -n "'sem-projeto'" server/src` vazio.

### Parte B, `react-frontend`: resumo do AP-PROJETO (depois da A)
- Arquivos: `web/src/features/apontamento/components/CartaoDistribuicao.tsx` (contagem e texto), `web/src/features/apontamento/textos.ts` (a frase do resumo recolhido sai do componente para cá, com o singular), `web/src/features/apontamento/fixture.ts` (uma variante com a linha `ID_SEM_PROJETO`, sem mexer na resposta padrão, para não mudar os outros testes), `web/src/features/apontamento/recolher.test.tsx` (casos: sem a linha, texto igual; com a linha, N exclui e horas incluem; só a linha; singular), `CHANGELOG.md` (`### Corrigido`).
- Ordem: começa quando a parte A estiver commitada na branch (importa `ID_SEM_PROJETO`).
- Provas: os casos novos passam; mutante "contar `linhas.length`" morre; resumo continua sem nome de projeto (teste CA-32 existente segue verde).

### Parte C, `react-frontend`: recolher no `CartaoMetrica` (em paralelo com a A)
- Arquivos: `web/src/components/ui/Recolhidos.tsx`, `web/src/components/ui/CartaoMetrica.tsx`, `web/src/components/ui/recolhidos.test.tsx`.
- C1, Restaurar sem AP-KPIS (A1 do review, B2 da UX): `useRecolhido(codigo, ativo)`; só registra em `montados` quando `ativo`; o `CartaoMetrica` passa `p.recolhivel !== false` (linha 152). Teste: memória com `AP-KPIS` e cartão `recolhivel={false}` montado: o "Restaurar" não aparece.
- C2, Tentar de novo recolhido (B3 da UX): no ramo recolhido (linha 315), com `estado === 'erro'` e `p.onTentarDeNovo`, mostrar o `Botao` "Tentar de novo" depois da frase "Não foi possível carregar este cartão.". Tentar de novo **não expande** o cartão (a escolha de recolher é da pessoa e fica na memória). Teste: recolhido em erro com callback mostra o botão e o clique chama o callback; sem callback, não há botão.
- C3, testes do recolher (só teste, sem mudança de código): (i) recolhido com base, a linha `selos-<codigo>` não tem `min-h-6`; expandido com base, tem (A2 do QA do K-285, linha 285); (ii) recolhido, somem `base-<codigo>`, o selo de janela fixa, `p.selos`, o botão "Como ler", `nota-<codigo>` e `notas-cartao-<codigo>` (A1 do QA do K-285; o teste 256 cobre só os selos extras); (iii) em calibração, o `SeloCalibracao` continua visível recolhido e some em `sem-dado-real` (A1 do QA do L8b, mutante sobrevivente da linha 299).
- Provas: os testes novos passam com `VITEST_MAX_WORKERS=2`; os mutantes das linhas 285, 299 e da guarda nova do `useRecolhido` morrem.

### Ordem e paralelismo
1. Em paralelo: A (`node-backend`) e C (`react-frontend`). Sem arquivo em comum.
2. Depois da A e da C: B (`react-frontend`; um cartão por agente, então vem depois da C).
3. `qa-engineer` prepara em paralelo os casos de B e C (o E2E `recolher-097-qa.spec.ts` ganha o caso do Tentar de novo recolhido); `tech-lead` revisa; `ux-designer` revisa a interface (confirma Q-2 e o C2).

Se o `tech-lead` preferir uma worktree só, a ordem vira A, C, B na mesma branch, sem conflito.

## Riscos
- Baixo: resposta antiga ou outra rota com a linha sem projeto sob outro id. Hoje só `servico.ts` gera; a constante única fecha isso.
- Baixo: o C1 muda a assinatura de `useRecolhido`; o único chamador é o `CartaoMetrica.tsx:152` (busca em `web/src` em 2026-11-14).

## Perguntas (não decididas aqui)
- **Q-1 (ao `ux-designer`, texto):** os textos do corte dos dez maiores (`textos.ts:347-350`: "de N", "Mostrando todos os N projetos", "Ver todos os N projetos", "Demais N projetos") também contam a linha sem projeto. Seguem a mesma regra do resumo recolhido? Fora do K-324 até a resposta; se sim, vira cartão.
- **Q-2 (ao `ux-designer`, texto):** caso de só a linha sem projeto: `Recolhido. 0 projetos e horas sem projeto, X h no total.` serve?
- **Observação ao Jarvis, fora do K-324:** (i) o achado `concentracao-em-projeto` (`achados.ts:61`) e a frase de leitura do AP-PROJETO podem escolher a linha sem projeto como "projeto" com mais horas; se isso deve ou não acontecer é **regra de negócio para o dono** (R-DECISAO), não decidida aqui. (ii) `opcoes.projetos` traz a opção `sem-projeto`, mas a consulta `projeto` só aceita dígitos (`idNumerico`); não verifiquei se a web a esconde do filtro.
