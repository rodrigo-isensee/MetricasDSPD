---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k280-corte-unico
commit: 3a8cb7876e9b749efe1d9c3e82bf5cc6ff401aa7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: K-280, condição única do corte de cards e chamados (097, E3.3)

Base develop 167f3a13. Diff de 5 arquivos: `cortes.ts` (novo, exporta `CORTE_CARDS` e `CORTE_CHAMADOS`), `referencia/index.ts` (reexporta), `referencia/repositorio.ts` (apaga as constantes locais e importa), `metricas/repositorio.ts` (usa as constantes em `lerCards` e `lerChamados`) e `server/tests/corte-unico.test.ts` (novo). Refatoração sem mudança de SQL nem de contrato; CA-n próprio não há, a obrigação é "listas e opções usam a mesma condição" (K-280).

## Veredito
**Aprovado.** Sem bug aberto. A suíte inteira fica com o check-run `bateria` do mesmo sha no CI do PR (não citado aqui; passada local só dos afetados).

## SQL igual ao da base
- `CORTE_CARDS` e `CORTE_CHAMADOS` têm texto idêntico às constantes que já existiam em `referencia/repositorio.ts` na base (`criado_em IS NOT NULL AND granularidade IS NOT NULL AND tipo IS NOT NULL`; `aberto_em IS NOT NULL AND equipe IS NOT NULL AND fora_do_recorte = false`).
- `lerTiposBM` e `lerPrioridadesAC`: a linha de SQL não mudou (já interpolavam a constante); só a origem dela.
- `lerCards` e `lerChamados`: o literal do WHERE foi trocado pela interpolação do mesmo texto; a linha gerada é `WHERE <mesmo texto>`, igual à da base (leitura do diff, sem consulta ao banco). Colunas, ORDER BY e esquemas intocados. Nenhuma coluna de pessoa; BusinessMap e Acelerato continuam em consultas separadas.
- Constantes fixas, sem entrada do usuário (sem injeção).

## Execução
- `VITEST_MAX_WORKERS=2 npx vitest run tests/corte-unico.test.ts`, em `server/` da worktree 056d: 1 arquivo, 2 testes passaram.
- Mutação (cada uma restaurada antes do commit, árvore limpa):
  - M1: `lerPrioridadesAC` com o corte copiado sem `equipe IS NOT NULL`: "lerChamados e lerPrioridadesAC usam o mesmo corte" falhou (1 falhou, 1 passou).
  - M2: `lerTiposBM` com o corte copiado sem `granularidade IS NOT NULL`: "lerCards e lerTiposBM usam o mesmo corte" falhou.
  - M3: `lerCards` com o corte copiado sem `granularidade IS NOT NULL`: o teste de cards falhou.
  - Limite do teste: copiar o literal inteiro, idêntico à constante, em vez de usá-la não derruba o teste (provado: M0, troca por literal igual, 2 passam). É mutante equivalente: o SQL é o mesmo byte a byte, e a obrigação (as listas não divergirem) segue cumprida. O que o teste pega é a divergência, que é o risco do K-280. Não bloqueia.
- Cobertura do teste: `lerCards`, `lerChamados`, `lerTiposBM` e `lerPrioridadesAC`, as quatro funções do brief.

## Critério → teste → resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Cards e opções de tipo no mesmo corte | `lerCards e lerTiposBM usam o mesmo corte` | passou; M2 e M3 derrubam | corte de cards (criado_em, granularidade, tipo nulos) |
| Chamados e opções de prioridade no mesmo corte | `lerChamados e lerPrioridadesAC usam o mesmo corte` | passou; M1 derruba | corte de chamados (aberto_em, equipe, fora_do_recorte) |

Vermelho antes do verde: teste novo de refatoração, sem regra nova; a prova de que cai é a mutação acima (não rodei `forge-testes --vermelho`, comando do Forge, não deste projeto).

## Achados
