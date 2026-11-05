---
tipo: qa
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l7-calendario
commit: 025ec57b46016414602e75ca9b7650ca651cd44b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: 069 L7-a, arquivo versionado do calendário e ref:sync-calendario (E1.5, K-220)

Código testado: `025ec57` (o HEAD da worktree soma só o parecer de review). Obrigação: `docs/analises/069-desenho.md` (seção do lote L7-a) e a ADR 0027. Não há especificação de UX com `CA-n`; cada decisão da ADR virou uma linha da tabela. Sem gatilho de segurança.

## Escopo
- Dentro: `docs/architecture/fontes/calendario.json`, `server/src/modulos/referencia/calendario.ts`, entrada `ref:sync-calendario`, export de `textoSeguro` em `dominio-acelerato.ts`, lista `METRICAS_CALENDARIO`.
- Fora: testes `*.pg.test.ts` (escritos pelo autor, não rodam no sandbox por falta de PostgreSQL; ficam para a CI do PR); leitura pelas métricas (L7-b); turnos; etapas sintéticas do Acelerato; E2E (sem mudança de tela). A entrada não foi executada contra a base real.

## Achados
- A1 (recomendado) server/src/entradas/ref-sync-calendario.ts:12 · A entrada em si (argumento inválido, saída 2) não tem teste automatizado; só a validei à mão (data 2026-02-30 sai 2 com a mensagem de uso). Vale um teste de processo se a entrada crescer.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Arquivo inicial = feriados nacionais do código, sem data nova | `calendario-referencia.test.ts` (arquivo real) e conferência manual abaixo | datas do arquivo = `FERIADOS_NACIONAIS` | passou |
| Um calendário por domínio, sem misturar | `calendario-referencia.test.ts` (métricas por domínio; plano puro por domínio) | BusinessMap x Acelerato | passou |
| Arquivo inválido recusado inteiro, sem gravar | testes de JSON e esquema; dublê com ROLLBACK | data inválida, escopo, classe, repetição | passou |
| Idempotente | plano puro e dublê com tudo gravado | segunda carga sem escrita | passou |
| Feriado gravado nunca muda; só INSERT e UPDATE de `vigente_ate` | dublê sem DELETE; divergência só contada | sobrescrita | passou |
| Vigência não retroage | planejarCalendario, datas anterior e igual | data não posterior | passou |
| Versão de critério por domínio e hash, com métricas | dublê, carga inicial e troca de calendário | uma versão por domínio e hash | passou |
| Escrita contra o banco (tabelas, CHECK, GRANT de `dspd_ref`) | `calendario-referencia.pg.test.ts`, `apontamento-rota.pg.test.ts` | integração real | não executado (sem PostgreSQL no sandbox); CI do PR |

## Cenários e resultado real
Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-052d`, vitest com `--maxWorkers=2`, MemAvailable acima de 3000 MB e load abaixo de 4 na largada.

| Comando | Resultado |
|---|---|
| vitest do server com cobertura | 81 arquivos passaram, 34 pulados (os pg); 1652 testes passaram, 237 pulados; cobertura 100% em linhas, ramos, funções e declarações |
| vitest de `packages/contratos` com cobertura | 10 arquivos, 204 testes passaram; cobertura 100% |
| vitest de `packages/metricas` com cobertura | 43 arquivos, 1262 testes passaram; cobertura 100% |
| vitest de `packages/mock` com cobertura | 14 arquivos, 258 testes passaram; cobertura 100% |
| vitest de `tools/docs-contratos` | 14 arquivos, 102 testes passaram |
| `pnpm exec prettier --check web packages tools` | todos os arquivos no estilo |
| `pnpm run docs:check` | ok (936 páginas, 69 métricas, 2 eventos) |
| `pnpm exec tsx src/entradas/ref-sync-calendario.ts 2026-02-30` (a partir de `server`) | saída 2, "uso: ref:sync-calendario [AAAA-MM-DD]" |

Os 34 arquivos pulados do server são os `*.pg.test.ts`: sem PostgreSQL no sandbox, ficam para a CI do PR. O QA não afirma que a escrita real no banco funciona.

## Conferências pedidas
- Datas: `calendario.json` tem 26 datas em `dspd-businessmap` e 26 em `dspd-acelerato`, ambas idênticas, na mesma ordem, às 26 de `FERIADOS_NACIONAIS` em `packages/metricas/src/core/calendario.ts` (comparação por script). Nenhuma data nova. Escopo `nacional`, deslocamento -180 nos dois, descrições iguais entre os dois calendários.
- Nomes x datas (2025 e 2026): Confraternização 01-01; Carnaval segunda e terça (2025-03-03/04; 2026-02-16/17); Sexta-feira Santa (2025-04-18; 2026-04-03); Tiradentes 04-21; Dia do Trabalho 05-01; Corpus Christi (2025-06-19; 2026-06-04); Independência 09-07; Aparecida 10-12; Finados 11-02; Proclamação 11-15; Consciência Negra 11-20; Natal 12-25. Todos correspondem às datas (Páscoa 2025-04-20 e 2026-04-05 conferem com Sexta-feira Santa, Carnaval e Corpus Christi).
- Observação factual, sem achado: 2025-09-07, 2025-10-12, 2025-11-02, 2025-11-15 e 2026-11-15 caem em fim de semana; não alteram dias úteis, e o código já os tinha.
- `METRICAS_CALENDARIO`: conferida contra o código de `packages/metricas/src` (uso direto de `horasUteisEntre`, `diasUteis`, `diasUteisNoIntervalo`, `du`, `cicloHU` e dos auxiliares `estadoEm`/`idadeHUEm`, `blocosDe`, `relogiosDe`). BusinessMap: O1, O2, O3, O5, O9, O16, O19, O20, O22, O24, O25, E1, E6, E9, T1, T2, T3, T7, T10, T13, EI_FL1/2/3 e BLOQUEADOS usam calendário; as demais O, E e T não usam (O10 só lê o papel de `estadoEm`, que não toca calendário). Acelerato: S1, S4, S9, S10 (índice de horas úteis) e EI_SUST; os outros S só usam dia civil. A lista bate, sem faltar nem sobrar id. Os ids `BLOQUEADOS`, `EI_*` existem em `packages/contratos/src/comum.ts`. `apontamento-capacidade` ausente: o id não existe no catálogo, como o código declara.

## Vermelho antes do verde
`forge-testes --vermelho 69e72a7` rodou sem veredito útil: "o mapa não sabe (server/package.json sem mapa)", sem módulos e "nenhum teste prova a mudança". Não vale como prova. Prova por inspeção: na base `calendario.ts` e `ref-sync-calendario.ts` não existem, então `calendario-referencia.test.ts` (que importa o módulo) não carrega na base. O que cada teste exige para falhar: remover a validação do esquema, o `ROLLBACK`, o filtro de datas posteriores ou a checagem de domínio do plano.

## Mutação
Stack sem ferramenta de mutação rodada neste lote; sem mutante declarado. Cobertura 100% de ramos do módulo serve só de piso, não de prova.

## Bugs
Nenhum. Nenhum arquivo em `docs/qa/bugs/`.
