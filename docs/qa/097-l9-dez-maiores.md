---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l9-dez-maiores
commit: 98e3213446edf24f41ab130f1f6c46e7009fa986
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: os 10 maiores do AP-PROJETO (097 L9, E3.3, K-273), volta 1

Links: plano `docs/analises/097-plano-e5-e7.md` §3 (CA-33 a CA-38), pedido `docs/pedidos/097-resumo-filtro-time.md`, base develop d01524d4. Revalidação pelo delta 162404f9..98e32134.

## Veredito
**Aprovado.** A volta corrige o ponto de fundo: `dezMaiores` não reordena mais, corta a ordem do servidor (`distribuicao.ts:33`, `ordenarNeutro` por `-segundos`, rótulo, id), a mesma do "Ver todos", então o empate na 10ª vaga não troca de posição entre as vistas. O 10 dos textos vem de `LIMITE_MAIORES`. O CA-38 ganhou teste e a propriedade passou a comparar por linha (A1 e A2 da rodada anterior atendidos). Só soma inteira de `segundos` do servidor: sem tempo, percentil ou previsão, sem misturar fontes. A suíte inteira é a do check-run `bateria` do mesmo sha; aqui rodei os testes afetados e a mutação.

## Execução
- Delta conferido: `dezMaiores.ts`, `textos.ts` e dois testes; escopo de CA-33 a CA-38 inalterado.
- `VITEST_MAX_WORKERS=2 npx vitest run src/features/apontamento`: 13 arquivos, 180 testes passaram, 0 pulados.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-33 ordem do servidor, empate na 10ª vaga estável | `dezMaiores.test.ts` "corta a ordem recebida..."; `dez-maiores.test.tsx` CA-33/CA-34 e "empate na 10ª vaga" (rótulos `zeta`, `Alfa`, `érico`, `Érico`, `alfa`, mesmo valor) | 10ª vaga empatada: corte e Ver todos com a mesma ordem | passou |
| CA-34 frase, Demais, botão | `dez-maiores.test.tsx` CA-33/CA-34 e "singular com 11" | 11 e 12 projetos | passou |
| CA-35 ver todos | `dez-maiores.test.tsx` CA-35 | região focável, `aria-expanded`, foco | passou |
| CA-36 10 ou menos | `dez-maiores.test.tsx` CA-36; `dezMaiores.test.ts` | exatamente 10 | passou |
| CA-37 filtros já valem | corte sobre as linhas já filtradas pelo servidor | n/a | passou (por construção) |
| CA-38 reabrir volta a 10 | `dez-maiores.test.tsx` CA-38 (abre, `cleanup`, remonta: 11 linhas, Demais, `aria-expanded=false`) | 13 linhas abertas contra 11 reabertas | passou |
| Propriedade | `dezMaiores.test.ts` fast-check: soma, contagem, `visiveis == ordenada.slice(0,10)`, cada demais <= menor visível | 0 a 40 linhas | passou |
| Selo de incompleto | "o selo de incompleto vale..." (agora p11, o menor, fora dos 10) | projeto fora dos 10 | passou |

## Mutação no código alterado (restaurada; `git status` limpo)
- M1 `slice(0, limite)` vira `slice(0, limite + 1)`: morto por 4 testes (CA-33 unitário, CA-33/CA-34, CA-38, empate).
- M2 reintroduz ordenação própria (horas e rótulo) no corte: morto por 5 testes (CA-36 unitário, CA-33 unitário, CA-33/CA-34, singular, empate).

## Bug
Nenhum aberto.

## Achados
