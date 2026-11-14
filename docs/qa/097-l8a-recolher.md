---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l8a-recolher
commit: 78c80ecee71ea6361578bf97e9d53015bfe132b3
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: 097 L8a, mecanismo de recolher cartão

**Veredito: aprovado**, com um achado recomendado (lacuna de teste, sem defeito provado). Classe N com interface. Diff: `CartaoMetrica.tsx`, `Recolhidos.tsx` (novo), `index.ts`, `recolhidos.test.tsx` (novo). Os CA-25 a CA-32 foram lidos do plano `docs/analises/097-plano-e5-e7.md` (§2 e tabela de lotes), que é onde o texto deles está.

## Execução
`VITEST_MAX_WORKERS=2 npx vitest run src/components/ui/recolhidos.test.tsx` (web, sem `.env`, sem base real): `Test Files 1 passed (1)`, `Tests 18 passed (18)`. A suíte inteira roda no CI do PR (check-run `bateria` do mesmo sha); não a rodei localmente.

## Tabela critério, teste e resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-25 botão Recolher com estado e nome acessível | "CA-25" (aria-expanded, aria-controls, aria-label; sem provedor, sem botão) | fora do provedor | passou |
| CA-26 recolhido oculta o corpo e mostra o resumo | "CA-26 e CA-27" | corpo não renderizado | passou |
| CA-27 expandir devolve o corpo | "CA-26 e CA-27" | alternância | passou |
| CA-28 foco permanece no botão (mouse e Enter) | "CA-28" | teclado | passou |
| CA-29 lembrado por cartão e painel, sem URL, só códigos | "CA-29" e "expandir apaga o painel e preserva os outros" | painel vizinho | passou |
| CA-30 Restaurar: só com recolhido, expande, apaga, anuncia, foco no título | "CA-30" e "Restaurar sem cartões" | vazio; fora do provedor | passou |
| CA-31 erro mostra "Não foi possível carregar este cartão." | "CA-31" | estado de erro | passou |
| CA-32 resumo neutro, nunca a frase de leitura | "CA-32" (leitura com nome de pessoa não aparece) | sem dado por pessoa | passou |
| Memória corrompida | 5 casos: JSON quebrado, forma, versão 2, código inválido, painel inválido | entrada inválida | passou (ver A1 sobre os dois últimos) |
| Teto de 100 códigos | "acima do teto" (O3 repetido e 120 códigos; regrava 99) | teto, duplicados | passou |
| Armazenamento bloqueado | getItem/setItem lançando; removeItem lançando | sem armazenamento | passou |
| KPI `recolhivel={false}` | "recolhivel={false}" | cartão de número único | passou |

Nada de pessoa no armazenamento: o que se grava é `{versao:1, paineis:{<painel>:[<código>]}}` (conferido nos testes de CA-29), sem nome, e-mail, filtro ou valor. Os únicos usos de `localStorage` novos estão em `Recolhidos.tsx`.

## Mutação (na validação da chave, restaurada com `git checkout`; árvore limpa depois)
| Mutante | Resultado |
|---|---|
| `versao: z.literal(1)` vira `z.number()` | morreu: cai "versão desconhecida" (`Tests 1 failed | 17 passed`) |
| remove `.slice(0, TETO_RECOLHIDOS)` da leitura | morreu: cai "acima do teto" |
| remove `CODIGO_CARTAO.test(c)` do filtro de códigos | sobreviveu (A1) |
| remove `ID_PAINEL.test(painel)` do filtro de painéis | sobreviveu (A1) |

## Vermelho antes do verde
O arquivo de teste importa `ProvedorRecolhidos`, `RestaurarRecolhidos`, `CHAVE_RECOLHIDOS` e `TETO_RECOLHIDOS`, que não existem na base (`develop`); contra ela o módulo não carrega. Não rodei a base separadamente. A prova de que os testes caem sem a regra são os dois mutantes mortos acima.

## Achados
- A1 (recomendado) web/src/components/ui/recolhidos.test.tsx:140 · Os casos "código fora do formato" e "painel com id inválido" não provam os filtros: a leitura só consulta o painel `operacional` e o código `O3`, então tirar `CODIGO_CARTAO` ou `ID_PAINEL` não derruba nada. Afirmar o que a regravação mantém na chave.
