---
tipo: qa
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-m1-frescor
commit: db7a8e19966d1d46963d81d01fa25465c0f56498
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---

# QA: 069 lote M1-a, frescor da aba Apontamento com coleta parcial

Links: desenho `docs/analises/069-desenho.md` (seção "Lote M1-a"), review `docs/reviews/069-m1-frescor.md`, contrato `docs/api/apontamento.md`. O HEAD da branch (b0f597c) só soma o parecer do review sobre o código testado (db7a8e1).

## Veredito
**Aprovado.** Nenhum bug aberto. O código de produção não foi tocado pelo QA. O lote não tem gatilho de segurança (desenho, tabela de gatilhos), então não há casos de abuso a transformar em teste.

## Obrigação → teste → resultado
| Obrigação (desenho M1-a) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Parcial sem coleta ok: selo segue `sem-coleta`, `ultimaColetaOk` nulo, `ultimaTentativa.resultado = 'parcial'` | server `apontamento-rota.test.ts` "última coleta parcial sem sucesso anterior" | parcial não vira ok; sem nenhuma ok | verde |
| Ok depois de parcial: `ultimaTentativa.resultado = 'ok'` | server `apontamento-rota.test.ts` (resposta padrão, `toEqual` do frescor) | status `sucesso` mapeia para `ok` | verde |
| Sem coleta: `ultimaTentativa: null` | server `apontamento-rota.test.ts` "sem coleta do worklog" | vazio | verde |
| Resposta valida no schema (campo aditivo, opcional e nullable) | server, `respostaApontamentoSchema.parse` em cada caso acima; contratos 204 verdes | campo ausente (resposta antiga) e `null` | verde |
| Contrato compatível, API e openapi em dia | `pnpm run docs:check` | n/a | verde |
| Aviso presente: parcial mais nova que a última ok, com data e hora | web `apontamento.test.tsx` "parcial mais nova que a última ok" | texto "31/10 07:05" | verde |
| Aviso presente: parcial sem nenhuma ok | web "parcial sem nenhuma coleta ok" | `ultimaColetaOk` nulo | verde |
| Aviso ausente: parcial mais antiga que a ok, tentativa ok, falha, `null`, campo ausente | web `it.each` com 5 casos | cada valor de resultado e os dois vazios | verde |

## Execução real (db7a8e1, no máximo 2 workers, uma tarefa pesada por vez)
- `packages/contratos`: vitest, 10 arquivos, 204 testes verdes.
- `server`: vitest com cobertura, 80 arquivos verdes e 33 pulados (testes de banco, fora do vitest padrão), 1626 testes verdes, 232 pulados; cobertura 100% (instruções, ramos, funções, linhas).
- `web`: vitest com cobertura, 94 arquivos, 1434 testes verdes; cobertura 100% (5376 instruções, 5003 ramos).
- `tools/docs-contratos`: vitest, 14 arquivos, 102 testes verdes.
- `pnpm exec prettier --check web packages tools`: todos os arquivos conformes.
- `pnpm run docs:check`: "docs:check: ok (931 páginas Markdown, 69 métricas, 2 eventos)."

## Vermelho antes do verde e mutação
Não rodei o teste novo contra o código anterior nem mutação por ferramenta: o brief proíbe tocar código e a stack não traz ferramenta de mutação gratuita configurada para este diff. Conferência por leitura do diff: o teste server de parcial exige `toEqual` com `resultado: 'parcial'`, que o código anterior (campo inexistente) não produz; os testes web do aviso procuram `data-testid="aviso-parcial"`, inexistente antes. Cobertura de ramos 100% nos dois pacotes. Um mutante conhecido sobrevive: ver A1.

## Achados
- A1 (recomendado) web/src/features/apontamento/components/CabecalhoApontamento.tsx:19 · a fronteira "parcial com fim igual à última ok" (`<=` contra `<`) não tem teste; os casos de data cobrem só parcial claramente mais nova ou mais antiga. Sugestão: um caso com `fim` igual a `ultimaColetaOk`, sem aviso.
- A2 (recomendado) web/src/features/apontamento/components/CabecalhoApontamento.tsx:41 · o texto do aviso é provisório (desenho): a revisão de interface (E1.7) fixa a redação final e o teste de texto acompanha.

## Pendências fora do código
- Passo M1-op (carga inicial do worklog com a develop atual, conferência da Q15) e a conferência na base local (aviso de parcial com a Q15) não foram feitos aqui: dependem do dono e da base real.
- E2E de navegador não rodou nesta etapa; o lote muda só um trecho do cabeçalho, coberto por componente, e o CI do PR roda a suíte E2E.
