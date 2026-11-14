---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l4-textos-sem-simulado
commit: 1525bed8cb23d14bd18175a05697695780ff489a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: pedido 099, L4 (textos do catálogo e das 8 notas sem "simulado")

Links: especificação `docs/ux/099-textos-sem-simulado.md`, pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, ADR 0030.

## Veredito
**Aprovado** sobre o HEAD 1525bed8 (base develop 96d9b69f). Nenhum bug aberto. Os textos conferem palavra por palavra com a especificação, a coluna Dados deriva de `origemDaMetrica` (dois estados, sem terceiro) e o spec e2e tocado passou no Playwright local.

## Critério, teste, resultado
| Critério (WB-1 e notas) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Parágrafo de abertura novo do catálogo | `catalogo.test.tsx` "o parágrafo de abertura e a legenda..." (texto exato); conferido no diff contra a spec | texto antigo "dados fictícios" ausente | passa |
| Legenda "situação dos dados (real ou sem dado real)" | mesmo teste (`getByRole('table', { name })`) | nome acessível da tabela | passa |
| Coluna Dados: "Real" ou "Sem dado real" por métrica, via `origemDaMetrica`, sem terceiro estado | `catalogo.test.tsx` (O5 e O3 "Real"; contagem de células Real = métricas reais e Sem dado real = 65 menos reais; nenhum fictíci/simulad/exemplo na tabela); e2e COMP-12 (reais + sem dado = 65, "Fictícios" = 0) | 65 linhas, nenhuma fora dos dois estados | passa |
| OP-21, TA-16, TA-17, TA-18a, TA-18b, ES-11, ES-12a, ES-12b: texto novo exato | `notas-sem-simulado.test.ts` (igualdade com o texto da spec, 8 notas); diff conferido contra a tabela da spec, caractere por caractere | cada frase removida/alterada | passa |
| Nenhum fict, mock ou simulad nas notas e no catálogo | `notas-sem-simulado.test.ts` (regex sobre notas complementares, tático, estratégico e operacional); `grep -rniE "fict\|mock\|simulad" web/src/features/*/notas.ts web/src/features/catalogo/*.ts*` sem teste: zero ocorrências | notas dos 4 painéis | passa |
| Pergunta 1 da spec (métrica em vários cartões): recomendação "Sem dado real se qualquer cartão estiver sem" | a coluna é por métrica (`origemDaMetrica(m.id)`), uma linha por nível usa a mesma regra; o PR deve avisar a regra adotada | n/a | passa (o tech-lead avisa no PR) |

## Execução
- Vermelho antes do verde: com os 5 arquivos de produção do diff trazidos de `origin/develop` (`git checkout origin/develop -- ...`, depois restaurado com `git checkout HEAD -- web`; árvore limpa), `VITEST_MAX_WORKERS=2 npx vitest run src/features/catalogo src/features/complementares/notas-sem-simulado.test.ts` deu `Test Files 2 failed | 1 passed`, `Tests 4 failed | 5 passed`: caem "nenhuma nota dos painéis cita fictício, mock ou simulado", "traz os textos novos...", "o parágrafo de abertura e a legenda falam de dado real" e "mostra a tabela com status escrito...". Com o HEAD: `Test Files 3 passed (3)`, `Tests 9 passed (9)`.
- Playwright: `npx playwright test tests/complementares.spec.ts` em `e2e/` (projeto chromium, fonte mock): 30 passed, incluindo o COMP-12 ajustado do catálogo. Nada contra base real nem `.env*`.
- Mutação: sem ferramenta de mutação para o web nesta stack; o ternário de `linhas.ts` é guardado pela contagem Real × Sem dado real do teste (inverter o ternário troca as contagens e derruba o teste).
- Suíte inteira e cobertura: no CI do PR (check `bateria` ou `testes` do mesmo sha); não citada aqui por não ter sido consultada.
- Fora do escopo L4, só registro: `AvisoDadosFicticios` (AppShell), `components/ui/Ficticios` e o comentário de `CartaoComplementar.tsx:45` ainda usam a palavra "fictício"; a especificação do L4 cobre só o catálogo e as 8 notas, então não é achado.

## Achados
