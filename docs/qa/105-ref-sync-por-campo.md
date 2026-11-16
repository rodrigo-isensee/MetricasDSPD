---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-ref-sync-por-campo
commit: 20ef77beec16d6788053a0d973db69eb02753e7c
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: bm:ref-sync grava por campo (pedido 105, K-383, E7.305)

Branch `fix/105-ref-sync-por-campo`, head e8258656, base ffc38fe7. Diff: 4 arquivos de código (`dominio-businessmap.ts`, `dominio-acelerato.ts`, `ref-sync-businessmap.ts` só comentário, e os dois testes de domínio) mais `CHANGELOG.md`. Sem UX nova: as obrigações vêm do brief. A suíte inteira fica para o CI do PR (sem PR ainda; este parecer não afirma CI verde).

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Campo igual ao vigente é pulado, sem erro, mesmo com vigência aberta hoje | dominio-businessmap.test.ts, "campo igual ao vigente é pulado" | vigência aberta hoje + conteúdo igual | passou |
| Campo novo grava ao lado de campo igual | "campo novo é gravado ao lado de campo igual" | campo sem vigente | passou |
| Campo mudado com vigência aberta hoje é recusado sozinho, mesma mensagem, os outros gravam | "campo mudado com vigência aberta hoje é recusado ... o outro campo mudado grava"; pg: "mudança no mesmo dia ... só esse campo é recusado" (inclui repetir a carga: igual pulado, recusado segue recusado) | vigente_de == hoje | passou (unit local); pg no CI/autor |
| Data anterior à última vigência recusa só o campo | "campo retirado do arquivo só fecha a vigência; data retroativa é recusada" | hoje < última vigência | passou |
| Saída com `recusados [{campo, mensagem}]`, saída 0 | tipo `ResultadoDominioBm`; `ref-sync-businessmap.ts:26-27` imprime `{vigenteDesde, ...r}` e só o `catch` põe `exitCode = 1`; mensagem só com nome de campo e datas, nunca valor | n/a | passou por leitura (a entrada não tem teste próprio) |
| Acelerato segue tudo ou nada | `dominio-acelerato.test.ts` (data retroativa, vigência aberta hoje, dublê "desfaz e não grava") sem `porCampo` | opção padrão | passou |
| Histórico só INSERT e fechamento de `vigente_ate` | "nunca apaga: nenhuma carga emite DELETE ou TRUNCATE" | DELETE/TRUNCATE | passou |

## Cenários e resultado real
- Local, `vitest run tests/dominio-businessmap.test.ts tests/dominio-acelerato.test.ts`: 2 arquivos, 130 passed (130).
- Vermelho antes do verde: o teste pg alterado e os 4 testes novos do dublê afirmam `recusados`, campo que a base não tem; na base o `toMatchObject`/`toEqual` com `recusados` cai e a recusa antiga lançava `ErroDominio` (o teste antigo esperava `rejects`). Provado por mutação abaixo (M1 devolve o comportamento da base e 3 testes caem), não por `forge-testes --vermelho`, que é do Forge e não existe neste projeto.

## Mutação no diff (6 mutantes, árvore restaurada, `git status` limpo)
| Mutante | Mudança | Resultado |
|---|---|---|
| M1 | `sincronizarDominioBm` sem `{ porCampo: true }` (volta ao tudo ou nada) | morto (3 falham) |
| M2 | `hoje < ultimo` vira `hoje > ultimo` | morto (4 falham) |
| M3 | `vigente_de >= hoje` vira `> hoje` | morto (3 falham) |
| M4 | grava também o campo recusado (`if (true)`) | morto (6 falham) |
| M5 | nunca pula campo igual | morto (10 falham) |
| M6 | `recusados: []` na saída | morto (2 falham) |

## test:pg pela fila única (`pnpm run test:pg` = `suite-unica.sh bash scripts/test-pg.sh`)
Esperei a trava 56 min e rodei no head e8258656: `Test Files 2 failed | 48 passed (50)`, `Tests 12 failed | 330 passed (342)`, 131 s. As 12 falhas se repetem, as mesmas do autor, e não vêm deste diff:
- `apontamento-rota.pg.test.ts`, 11 testes: o de privilégio cai com `password authentication failed for user "dspd_api_apontamento"` (28P01) e os de rota respondem 500 "Erro interno" (mesmo papel; não abri a causa de cada 500, a hipótese é a mesma autenticação). A worktree não tem `.env`, então `ctx.ts:17` usa o padrão `apontamento_dev`, e o papel no banco persistente `metricas_test` tem outra senha. Causa de ambiente.
- `migracoes.pg.test.ts`, 1 teste ("nada foi criado fora dos schemas prefixados"): existem os schemas sem prefixo `dspd_bm`, `dspd_ac`, `dspd_core` em `metricas_test` (conferi no banco), resíduo de outro uso do mesmo Postgres. O teste lista exatamente esses três. Causa de ambiente.
- Total: 11 em apontamento-rota + 1 em migracoes = 12.
- Por que não vêm do diff: nenhum dos dois arquivos importa os módulos alterados (`dominio-businessmap`, `dominio-acelerato`; só `calendario` e `criterios-apontamento`); o diff não toca migração, papel, GRANT nem `ctx.ts`; as mensagens de erro são de autenticação e de schema residual, não de vigência. O arquivo de domínio do BM (`dominio-businessmap.pg.test.ts`) passou. O autor atribuiu a "execuções concorrentes"; a evidência aponta outra causa (senha do papel e schemas residuais no banco compartilhado), reproduzível sem concorrência: a rodada foi a única na fila.
- Limite: não rodei os dois arquivos na base `ffc38fe7` para o contraste direto (nova espera de fila); a atribuição se apoia na leitura acima. Quem quiser a prova direta roda esses dois arquivos na base com o mesmo banco; o CI, com banco limpo e as senhas do ambiente, deve passar.

## Observações (sem bloqueio)
- A entrada `bm:ref-sync` não tem teste que prove "saída 0 com recusados" ponta a ponta; o comportamento vem de leitura (só o `catch` define `exitCode`). Baixo risco; sugestão para cartão, sem aceite do usuário.
- Pergunta de regra: campo recusado hoje só repete depois da data; isso é a regra antiga mantida pelo brief, não mudou.

## Revalidação no head 20ef77be (delta)
O comando forge-check parecer delta (intervalo e8258656..20ef77be) listou 3 arquivos no domínio: docs/architecture/server.md, dominio-businessmap.ts e dominio-acelerato.ts. Li o diff: nos dois .ts só mudaram linhas de comentário (as duas recusas por campo: data anterior à última vigência e vigência já aberta na data); em server.md só o parágrafo do bm:ref-sync (gravação por campo, recusados, saída 0, ac:ref-sync segue tudo ou nada). Nenhuma linha de código executável mudou, então os testes, a mutação (M1 a M6) e o resultado do test:pg do head e8258656 seguem valendo; não rerrodei o test:pg, por instrução do brief. A doc agora descreve o que o código e os testes provam. Achados novos: nenhum. Parecer mantido: aprovado.
