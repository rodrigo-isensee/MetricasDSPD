---
tipo: qa
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-m1-frescor
commit: 01f29bc9a5e63e3f8a795120f6ee4862d9066cb7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---

# QA: 069 lote M1-a, frescor da aba Apontamento com coleta parcial

Links: desenho `docs/analises/069-desenho.md` (seção "Lote M1-a"), review `docs/reviews/069-m1-frescor.md`, revisão de UX `docs/ux/069-m1-frescor-revisao.md`, contrato `docs/api/apontamento.md`. Este parecer substitui o de db7a8e1; o HEAD testado é 01f29bc.

## Veredito
**Aprovado.** Nenhum bug aberto. O código de produção não foi tocado pelo QA. O lote não tem gatilho de segurança (desenho, tabela de gatilhos), então não há casos de abuso a transformar em teste.

## Obrigação → teste → resultado
| Obrigação (desenho M1-a) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Parcial sem coleta ok: selo segue `sem-coleta`, `ultimaColetaOk` nulo, `ultimaTentativa.resultado = 'parcial'` | server `apontamento-rota.test.ts` "última coleta parcial sem sucesso anterior" | parcial não vira ok; sem nenhuma ok | verde |
| Ok depois de parcial: `ultimaTentativa.resultado = 'ok'`, selo vindo da coleta ok | server `apontamento-rota.test.ts` "coleta ok depois de uma parcial" e a resposta padrão (`toEqual` do frescor) | status `sucesso` mapeia para `ok` | verde |
| Sem coleta: `ultimaTentativa: null` | server `apontamento-rota.test.ts` "sem coleta do worklog" | vazio | verde |
| Resposta valida no schema (campo aditivo, opcional e nullable) | server, `respostaApontamentoSchema.parse` em cada caso acima; contratos 204 verdes | campo ausente (resposta antiga) e `null` | verde |
| Contrato compatível, API e openapi em dia | `pnpm run docs:check` | n/a | verde |
| Aviso presente: parcial mais nova que a última ok, com data e hora e o texto final | web `apontamento.test.tsx` "parcial mais nova que a última ok" | texto "31/10 às 07:05" | verde |
| Aviso presente: parcial sem nenhuma ok | web "parcial sem nenhuma coleta ok" | `ultimaColetaOk` nulo | verde |
| Aviso ausente: parcial mais antiga, parcial com fim igual à ok, tentativa ok, falha, `null`, campo ausente | web `it.each` com 6 casos | fronteira `<=` (fim igual), cada valor de resultado e os dois vazios | verde |

## Execução real (01f29bc, no máximo 2 workers, uma tarefa pesada por vez)
- `packages/contratos`: vitest, 10 arquivos, 204 testes verdes.
- `server`: vitest com cobertura, 80 arquivos verdes e 33 pulados (testes de banco), 1627 testes verdes, 232 pulados; cobertura 100% (4798 instruções, 3228 ramos, 1085 funções, 3795 linhas).
- `web`: vitest com cobertura, 94 arquivos, 1435 testes verdes; cobertura 100% (5377 instruções, 5003 ramos).
- `tools/docs-contratos`: vitest, 14 arquivos, 102 testes verdes.
- `pnpm exec prettier --check web packages tools`: todos os arquivos conformes.
- `pnpm run docs:check`: "docs:check: ok (932 páginas Markdown, 69 métricas, 2 eventos)."

## Vermelho antes do verde e mutação
Não rodei o teste novo contra o código anterior nem mutação por ferramenta: o brief proíbe tocar código e a stack não traz ferramenta de mutação gratuita configurada para este diff. Conferência por leitura do diff: o teste server de parcial exige `toEqual` com `resultado: 'parcial'`, que o código anterior (campo inexistente) não produz; os testes web do aviso procuram `data-testid="aviso-parcial"`, inexistente antes. O mutante `<=` para `<` em `fimParcialRecente`, que sobrevivia em db7a8e1 (A1 anterior), agora morre pelo caso "parcial com fim igual à última ok (fronteira)", por leitura. Cobertura de ramos 100% nos dois pacotes.

## Achados
- A1 (recomendado) web/src/features/apontamento/components/CabecalhoApontamento.tsx:19 · a comparação de fim usa `Date.parse` de instantes ISO com offset; vale um caso com offsets diferentes entre `fim` e `ultimaColetaOk` se o servidor um dia mudar o offset. Hoje ambos saem de `isoLocal`, sem risco.

## Pendências fora do código
- Passo M1-op (carga inicial do worklog com a develop atual, conferência da Q15) e a conferência na base local (aviso de parcial com a Q15) não foram feitos aqui: dependem do dono e da base real.
- E2E de navegador não rodou nesta etapa; o lote muda só um trecho do cabeçalho, coberto por componente, e o CI do PR roda a suíte E2E.
