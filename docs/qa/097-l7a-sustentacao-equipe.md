---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l7a-sustentacao-equipe
commit: 0f61133b2d3eeb4e6bcd8e4b052aaa83ad974065
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 1
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: L7a, equipe da Sustentação vira slug (097, E3.3)

Base develop 4b1e3122 (anterior ao K-280). Diff de 13 arquivos conferido contra o plano (`docs/analises/097-filtros-plano.md`, linhas 60 a 90): o escopo é o do plano (contrato, biblioteca, schema de consulta, opções do `dim_chamado`, docs/api).

## Veredito
**Reprovado por um defeito de teste da própria entrega.** O código faz o que o plano pede e as provas novas passam, mas o L7a mudou a regra (`equipe=xpto` deixou de ser inválido) sem atualizar o teste que a afirmava: `server/tests/api.sistemico-intensivo.test.ts:44` ainda lista `equipe=xpto` como entrada inválida da Sustentação. Resultado determinístico: 14 falhas na suíte do `server/`, que derrubam o check `bateria` do CI. Corrigir só o teste (ver A1).

## Execução (`VITEST_MAX_WORKERS=2`, em cada pacote, na worktree 052f; nada contra a base real nem `.env*`; `.pg` fica no CI)
- `server/`: 102 arquivos passaram, 1 falhou; 1958 testes passaram, 14 falharam, 276 pulados (os `.pg`). Duas rodadas completas deram as mesmas 14 falhas: não é timeout de carga.
- `packages/contratos`: 12 arquivos, 219 testes passaram.
- `packages/metricas`: 45 arquivos, 1305 testes passaram.
- Classificação das 14 falhas: **defeito** (todas a mesma causa), `api.sistemico-intensivo.test.ts` > "SIS-API: matriz de filtros nas 69 rotas": `EI_SUST`, `O17`, `S1` a `S12`: "filtros inválidos = 400 VALIDATION_ERROR sem eco do valor". `equipe=xpto` agora é slug válido (`^[a-z0-9][a-z0-9-]{0,59}$`), então a rota responde 200 em vez de 400. Nenhuma falha é timeout de carga. (Nota: rodar com `--root server` a partir da raiz dá falhas extras de `tsx` não resolvido em testes que lançam processo; é artefato do cwd e some rodando dentro de `server/`.)
- O `.pg` e a suíte inteira: prova é o check-run `bateria` do CI no mesmo sha (não citado aqui; vai vermelho enquanto o A1 estiver aberto).

## Critério → teste → resultado
| Conferência (brief) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Opções só com equipes do corte de `lerChamados` | `server/tests/app.test.ts` "L7a do 097: equipes da sustentação só as do corte..." (exige `aberto_em IS NOT NULL`, `equipe IS NOT NULL`, `fora_do_recorte = false` no SQL) | corte do recorte | passa |
| Id = slug, sem id repetido, ordem de nome | `app.test.ts` "acelerato: equipes do dado real..." (`Time Novo` e `time-novo` viram um id) | duplicata | passa |
| Base vazia: lista vazia | `app.test.ts` "acelerato com base vazia" | vazio | passa |
| Slug inválido dá 400 `VALIDATION_ERROR` | `metricas.test.ts` (`SSSC%20TOTVS`, `-x`, `a_b`, 61 caracteres; mais `Equipe_Outra`) | limite do padrão e do tamanho (60/61) | passa |
| Slug sem dado dá recorte vazio (200) | `metricas.test.ts` (`time-que-nao-existe`) e `tendencia.test.ts` (`nao-existe` = 0) | slug desconhecido | passa |
| Ids antigos aceitos | `metricas.test.ts` (`totvs,senior,fluig`), `contratos.test.ts` (apelido), `tendencia.test.ts` (`totvs` = `sssc-totvs`) | apelido | passa |
| Equipe nova sem código novo | `tendencia.test.ts` ("Time Novo" = `time-novo`) | equipe fora das 3 | passa |
| Entrada antiga inválida continua recusada onde cabe | `api.sistemico-intensivo.test.ts:44` `equipe=xpto` | n/a | **falha** (teste desatualizado, A1) |

## Mutação no código alterado (todas restauradas; `git status` limpo ao fim)
| Mutação | Teste que caiu | Resultado |
|---|---|---|
| `repositorio.ts`: tirar `${CORTE_CHAMADOS}` de `lerEquipesAC` | `app.test.ts` "equipes da sustentação só as do corte" (1 falhou) | morta |
| `filtros.ts`: apelido `totvs: 'sssc-totvs'` para `'totvs'` | `tendencia.test.ts` (2) e `contratos.test.ts` (1) | morta |
| `acelerato/comum.ts`: `f.equipe.map(idEquipeSustentacao)` para `[...f.equipe]` | `tendencia.test.ts` (2) | morta |
| `servico.ts`: tirar a deduplicação por slug (`new Map`) | `app.test.ts` (1) | morta |

Nenhum sobrevivente.

## Observações (sem bloqueio)
- `web/src/features/filtros/codec.ts:249` (validação do front, citada no plano) não está neste diff; o plano a coloca em etapa do front. Quando o front mudar, os links antigos (`totvs`) dependem do apelido do `codec.ts`, hoje não coberto aqui.
- `docs/api/metricas.md` descreve o 400 e o apelido de forma coerente com o código.

## Achados
- A1 (bloqueante) server/tests/api.sistemico-intensivo.test.ts:44 · `equipe=xpto` ainda é tratado como inválido da Sustentação, mas virou slug válido: 14 falhas determinísticas (`EI_SUST`, `O17`, `S1` a `S12`, 200 em vez de 400). Trocar por forma inválida (`equipe=Equipe_Outra`) e ajustar `ecos` se preciso. Corrige: node-backend.
