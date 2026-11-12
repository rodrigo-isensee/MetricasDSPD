---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-a3-o25-descarte
commit: 71f8b4f05161b9cae9c6ff0c9a316bbcf7d8999c
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: 099 A3, O25 Descarte com dado real (E3.45)

Diff contra `develop` (`d9f32012`), 6 arquivos, +104 -4: `origem.ts` (O25 em `METRICAS_ORIGEM_REAL`), `docs/api/metricas.md`, `origem.test.ts`, `painel-real-f6.test.ts`, `qa-f6-painel.test.ts` e o `.pg` novo. Sem especificação de UX nova: as obrigações são o molde do §3 (itens 2 a 5), as linhas A3 e OP-9 de `docs/analises/099-dado-real-operacional.md` e a ADR 0030 (G4). O `.pg` roda no check-run `bateria` do PR (regra do dono: nada de banco local); não rodei banco.

## Achados
- A1 (recomendado) server/tests/o25-real-a3.pg.test.ts:79 · o caso (b) só tem n > 0 porque o (a) gravou os 5 descartes antes; rodado sozinho (`-t`), n = 0 e ele cai. Mover o UPDATE para o beforeAll ou declarar a dependência no título.
- A2 (recomendado) packages/contratos/src/origem.ts:63 · os comentários das linhas 63 e 87 ainda dizem "O19 a O26 seguem mock"; o O25 agora é real. Só texto.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Molde 2: O25 entra no mapa real (única fonte de real, ADR 0030) | `origem.test.ts` (conjunto exato de reais); `qa-f6-painel.test.ts` (fictícias menos O25; reais mais O25); `painel-real-f6.test.ts` (O25 calcula, 200, sem `x-estado-dado`, schema do contrato) | O25 dentro/fora do mapa | passou (15 + 45) |
| Molde 2(a): número com dado, descarte no formato que a coleta grava | `o25-real-a3.pg.test.ts` (a): `k` e `n` sobem do mesmo tanto, `pct` > 0 | base real lida por `dspd_api` | `.pg`: com a `bateria` |
| CA-44: sem divisão por motivo | (a): `porMotivo` nulo | motivo nulo | `.pg`: com a `bateria` |
| Percentil por tipo só com 20 itens | (a): `status ok` implica n >= 20, senão n < 20 | n = 19/20 | `.pg`: com a `bateria` |
| Molde 2(b): abaixo de 20 não publica | (b): dia único, 0 < n < 20, `insuficiente`, `minimo` 20, sem `pct` | limite 20 | `.pg`: com a `bateria` |
| Molde 2(c): nenhum campo de pessoa, de motivo ou de comentário | (c): regex de pessoa, marcador `Motivo-sigiloso-A3` ausente, sem `Pessoa N`, em 12m e em dia único | texto do motivo nunca sai | `.pg`: com a `bateria` |
| Molde 3: sem versão de critério (regra e fonte iguais) | diff não toca `packages/metricas` nem `ref_versao_criterio` | n/a | conferido no diff |
| Molde 5: G4 da ADR 0030 verde | `web/src/app/painel-sem-dado-real.test.tsx`: 6 passam (a fonte de teste responde `SemDadoRealErro` em tudo, independe do mapa) | cartão só com `sem-dado-real` | passou |
| `docs/api/metricas.md` descreve fonte, regra e prova | leitura do diff | n/a | conferido |

## Execução local (Revisar-sha 71f8b4f0)
- `packages/contratos`: `vitest run src/origem.test.ts`: `Tests 15 passed (15)`.
- `server`: `vitest run tests/painel-real-f6.test.ts tests/qa-f6-painel.test.ts`: `Tests 45 passed (45)`.
- `web`: `vitest run src/app/painel-sem-dado-real.test.tsx`: `Tests 6 passed (6)`.
- Suíte inteira e `.pg`: check-run `bateria` do sha 71f8b4f0 no PR; não cito `.verde` local. A consulta ao check-run não foi possível daqui (sem rede ao GitHub); o tech-lead confere.

## Vermelho antes do verde (cópia em `$TMPDIR`, O25 fora de `METRICAS_ORIGEM_REAL`)
Mutante único: apagada a linha `'O25',` de `origem.ts` numa cópia da árvore (worktree intacto). Links `@metricas-dspd/*` da cópia refeitos para a própria cópia e cache do vitest limpo; a primeira tentativa, com links para a árvore original e cache velho, não caiu e foi descartada como sem veredito.
- `origem.test.ts`: `Tests 1 failed | 14 passed (15)` (conjunto das reais sem O25).
- `qa-f6-painel.test.ts`: caiu `expected [ 'BLOQUEADOS', 'EI_FL1', 'O1', …(19) ] to deeply equal [ …(20) ]`.
- `painel-real-f6.test.ts`: caíram "T-S1" e "toda métrica fora do mapa real tem motivo" (`O25: expected [ 'avisoPreenchimento', 'base', …(7) ] to deeply equal [ 'estado', 'metrica', 'motivo' ]`) e o S9b (`expected 1 to be null`).
- Total no servidor: `Tests 4 failed | 41 passed (45)`. Mutante morto por 5 testes.
- `.pg` (a), (b), (c): sem o O25 no mapa a API responde o corpo `sem-dado-real` e `corpo.encerrados` fica indefinido, então (a) e (b) caem; a prova é a da `bateria` (limite: não rodei banco).

## Fora do que cobri
Sem E2E nem acessibilidade novos: o DTO não muda e o cartão já desenha o contrato (a G3 usa stub e não depende do mapa; a G4 acima segue verde). Ferramenta de mutação não aplicada: o código de produção alterado é uma linha, coberta pelo mutante manual acima.

## Parecer
Aprovado sobre 71f8b4f0. Nenhum bug. A1 e A2 são recomendados e não bloqueiam.
