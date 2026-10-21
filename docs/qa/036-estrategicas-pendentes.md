---
tipo: qa
contrato: 1
pedido: 036-estrategicas-pendentes
branch: feature/036-estrategicas-pendentes
commit: fe6a50a00c8c4059a56219743d3957288694a201
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
aceite_usuario: nao
data: 2026-10-20
---
# QA das estratégicas pendentes (pedido 036, etapa E1.4)

Cartões K-091 e K-119. Base: `docs/pedidos/036-estrategicas-pendentes.md` (Escopo e Critério de pronto) e review aprovado (`docs/reviews/036-estrategicas-pendentes.md`). Testado sobre cc88922, que acrescenta a fc9ecf2 só a correção do A2 do review (um bug em `docs/qa/bugs`, sem código). Chromium, mock, `pnpm exec playwright test` em `e2e/`, uma suíte por vez, sem playwright concorrente.

## Critério → teste → resultado

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E3: o E7 mostra "Qual a participação de cada sistema nas nossas entregas?" | verificação na tela com Playwright (script descartável, `/estrategico`, seção "mais métricas" aberta, cartão `metrica-E7` contém a pergunta) | texto da decisão do dono (opção A) | passou |
| E3: sem texto antigo e sem valor monetário no E7 | `estrategico-011-lote1.spec.ts` ET-02 (sem R$/custo) | D2 = A | passou |
| E1: reteste do FA-006 registrado | `docs/qa/bugs/FA-006-...md`, seção "Reteste 2026-10-20": api 0,021 em 3 de 3, mock 0,001 em 3 de 3, abaixo de CLS < 0,1 (ADR 0003 F2) | limite do F2 | registrado, não reproduz |
| E2: IF-A de /estrategico passa e verifica ao menos 1 cartão | `intensivo-filtros.spec.ts -g "IF-A"` (`minimo: 1` em `/estrategico`) | lista vazia falha | 4 de 4 passaram (`/operacional` semanal e diária, `/tatico`, `/estrategico`) |
| Regressão do lote 1 das estratégicas | `estrategico-011-lote1.spec.ts` (ET-01 a ET-10, inclui axe AA e reflow 360 px) | n<20, API fora, teclado, 360 px | 10 de 10 passaram |
| Catálogo (unidade) | `vitest run src/features/catalogo` | contagem 53 | 6 de 6 passaram |

Observações: (1) a tela do catálogo `/metricas` mostra só código, título, painel, fonte e unidade; a pergunta do E7 aparece no cartão do E7 em `/estrategico` (a fonte é a mesma, `CATALOGO`), por isso a verificação foi nesse cartão. (2) `getByText(...)` sobre a pergunta não achou o elemento em duas tentativas, mas `toContainText` no cartão passou e o `innerText` do cartão traz a pergunta; tratado como particularidade do localizador, não do produto. (3) Vermelho antes do verde e mutação: sem teste novo de regra neste pedido (o IF-A já teve a mutação `!==` → `===` registrada no IFA-001 e conferida no review); a suíte `pnpm run pronto` foi rodada pelo tech-lead (rc=0) no a711371.

## Achados

- A1 (recomendado) e2e/tests/intensivo-filtros.spec.ts:394 · herdado do review: incluir `Cartão: K-091` e `K-119` na mensagem do squash do PR (E1.5); o `154f43a` não tem a linha. Não bloqueia.
- A2 (recomendado) docs/qa/bugs/IFA-001-nao-afetado-sem-verificacao-em-operacional-e-estrategico.md:36 · corrigido em cc88922: a nota agora diz que o `/operacional` fica para as operacionais (lote 3).

## Parecer

Aprovado, zero bug aberto, sobre o commit cc88922.

## Revalidação (delta)

Data: 2026-10-20. Head revalidado: fe6a50a (cadeia cc88922 → 97f8545 → 90d35a6 → fe6a50a). `forge-check delta --parecer docs/qa/036-estrategicas-pendentes.md` listou só `docs/ux/revisao-036-e7-pergunta.md` (+31 -0): a revisão de UX da pergunta do E7 (E1.6), documento novo, sem código. Confirmado por `git diff cc88922 fe6a50a -- web server e2e`, que deu zero linha. Os demais arquivos do intervalo (`docs/reviews/036-estrategicas-pendentes.md` e `docs/qa/036-estrategicas-pendentes.md`) são pareceres e ficam fora do delta por desenho.

O que mudou: a revisão de UX leu a pergunta do E7 ("Qual a participação de cada sistema nas nossas entregas?") contra a especificação §5 e a §11 e aprovou com zero achado bloqueante e zero recomendado; uma observação informativa (`docs/ux/metricas-tambem-disponiveis/01-cobertura.md`, linha 47, tabela histórica do discovery), sem ação para este PR. A revisão confirma o que o QA já verificou: o texto está no cartão `metrica-E7` e não há valor monetário.

Parecer mantido: aprovado, zero bug aberto. Os achados A1 (recomendado, linha `Cartão: K-091` e `K-119` no squash do E1.5) e A2 (corrigido em cc88922) continuam valendo. Os testes não foram rodados de novo, porque o delta não tem código (regra do pedido).
