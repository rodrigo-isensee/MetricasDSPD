---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/k286-mapa-diario-equipe
commit: dfba8a37e6a19ae527b11b81e7468bcb6bd88cad
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: 097 K-286, mapa diário do Apontamento recortado pela Equipe (E3.2)

Diff `origin/develop...dfba8a37` (base f3dd14c3): biblioteca em 7c5277e2 e tela em dfba8a37. São 7 arquivos, +49/-12, abaixo do teto de 150 linhas.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem banco)
- `packages/metricas`, `vitest run src/businessmap/apontamento`: 68 passaram.
- `server`, `vitest run tests/apontamento-rota.test.ts`: 83 passaram.
- `web`, `vitest run src/features/apontamento/apontamento.test.tsx`: 62 passaram.
- `eslint` nos arquivos tocados: sem erro. O teste do servidor está fora do lint pelo padrão de ignore do projeto.

## Leitura
- **Modo diário na biblioteca.** O `soPessoa: boolean` virou `modo: 'recorte' | 'diario'` (`filtros.ts:46`). Agora a equipe é aplicada antes do retorno do modo diário, e o modo diário aplica só pessoa e equipe. Projeto, tipo, subtarefa, subgrupo, qualidade e anômalos continuam ignorados. No recorte principal, a equipe só mudou de posição dentro de um E lógico, então o resultado é o mesmo. `filtrar` tem dois chamadores, ambos em `index.ts:64,66`. Nenhum outro uso do parâmetro antigo ficou para trás.
- **Cálculo pela biblioteca.** O recorte acontece em `filtrar`, no pacote `metricas`. O servidor não faz conta própria. O atípico continua vindo de `diasAtipicos(e.linhas, …)` sobre todas as linhas, antes de qualquer filtro (`index.ts:58`), e é repassado ao `calcularDiario` (`index.ts:72`).
- **Pessoa e comparação.** A forma da resposta não muda. O único dado de pessoa continua sendo o `pessoaRef`, que já existia. Não há série por equipe: vários times valem como um só conjunto (teste `time-alfa,sem-time` na rota). Nenhuma regra inviolável foi tocada.
- **Contrato e docs/api.** `docs/api/apontamento.md` registra a mudança sem alterar a forma, então a versão do contrato segue 1. O `CartaoDiario.tsx` passa `aplicaveis={['equipe']}`, e o rodapé deixa de dizer "Não afetado por: Equipe". Com isso também fica resolvido o A2 do review do L3 (`docs/reviews/097-l3-apontamento-equipe-web.md`): o encolhimento do mapa com `equipe` passa a corresponder ao que o servidor faz.
- **Testes.** Há casos de borda na biblioteca e na rota: lista vazia, `sem-time`, equipe sem linhas, conjunto de times, equipe junto com pessoa e `tipo`/`projeto` inexistentes que não zeram o mapa. Na mutação do QA, M1 e M2 morreram.
- **A1 do QA não bloqueia o merge.** O código está certo (`index.ts:58,72`) e nenhum defeito foi provado. O que falta é uma guarda contra uma regressão futura, porque o M3 sobreviveu. Fica como recomendado, num cartão próprio ou no PR do lote.
- **Commits.** São dois, `feat(apontamento): …` para a biblioteca e para a tela, com mensagens claras.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/apontamento/apontamento.test.ts:350 · mesmo achado do A1 do QA (M3 sobreviveu): falta um teste via `calcularApontamento` ou rota afirmando que `diario.linhas[].celulas[].atipico` não muda com `equipe`. Código correto; não bloqueia.
