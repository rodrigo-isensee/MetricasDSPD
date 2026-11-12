---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d3-alvo-prioridade
commit: 70836ab6604b6a2fe51cf67c1f7706578c54f861
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: 099 D3, alvos de prioridade com a unidade de cada prazo

Diff de três pontos contra `develop` (31 arquivos): migração 0036, carregador `alvos-acelerato.ts`, `acelerato-alvos.json`, biblioteca (`modelo.ts`, `indice.ts`, `s1.ts`), `mapa.ts`, `ref-sync-ac.ts` e testes. Sem especificação de UX nova; as obrigações são as decisões do dono Q-099-5a e Q-099-11 e o desenho `docs/analises/099-d3-unidade-prazo.md`. Os testes `.pg` ficam com o check-run `bateria` do PR (regra do dono: nada de banco local); não rodei banco.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Os 10 prazos e a unidade de cada célula = decisão do dono | `alvos-acelerato.test.ts` (10 prazos com unidade; texto do PROC confere com as horas); leitura do JSON | prazo em dias úteis em horas (8 h/dia); unidade por célula | passou (conferido à mão: P1 0,25/4 corrido; P2 0,5 corrido e 8 útil; P3 2/16; P4 4/40; P5 8/80 úteis) |
| S1 mede P1 e o 1º atendimento de P2 em corrido, o resto em útil | `acelerato.test.ts` (escolha da medida por célula; mesma amostra 10 h corrido x 9 h útil) | troca de unidade muda o número | passou |
| Pendência descontada no mesmo relógio | `acelerato.test.ts` (32 h − 22 h de pausa corrida = 10 h) | pausa útil subtraída de duração corrida | passou |
| Versão de critério marca S1 e VISAO_GERAL | `alvos-acelerato.test.ts` (METRICAS_ALVOS = S1, VISAO_GERAL); `.pg` (metricas S1, VISAO_GERAL) | S1 e Visão geral | unitário passou (26); `.pg` com a bateria |
| Visão geral não muda de número sem marca | mesmo teste, VISAO_GERAL na lista gravada em `ref_versao_criterio_metrica` | VISAO_GERAL fora do `afeta` | passou na volta 2 (A1 fechado) |
| Unidade fora de corrido/util recusada | `metricas.mapa.test.ts`, `unidadeDe` e CHECK da 0036 | valor inválido | passou (mapa); CHECK com a bateria |

## Execução local
- `packages/metricas`: `vitest run src/acelerato src/visaoGeral.test.ts`: 21 passaram.
- `server`: `alvos-acelerato`, `ref-sync-ac-alvos-entrada`, `metricas.mapa`, `migracoes.estatico`, `seed.estatico`, `calendario-metricas-codigo`: 75 passaram.
- Suíte inteira e `.pg`: check-run `bateria` do sha no PR; não cito `.verde` local.

## Mutação (restaurada a cada uma; árvore limpa)
- M1 `ALVOS_PADRAO` P1 primeiro atendimento corrido para util: caiu `S1 escolhe a medida pela unidade`. Morta.
- M2 `MEDIDAS.restauracao.corrido` aponta para `restauracaoHU`: caiu o teste 10 h x 9 h. Morta.
- M3 pausa corrida medida com `cal` (útil) em vez de `corrido`: caiu o teste 10 h x 9 h. Morta.
- M4 primeira unidade do JSON de corrido para util: caíram 3 testes do arquivo. Morta.
- M5 P4 restauração de 40 para 5 horas no JSON: caíram 2 testes. Morta.
- Vermelho antes do verde: os testes novos exigem `unidade`, `HC` e as colunas novas, ausentes na base; M1 a M5 provam que falham sem a regra.

## Revalidação (volta 2, head 70836ab6)
A1 fechou: METRICAS_ALVOS passou a S1 e VISAO_GERAL, e o carregador grava as duas em ref_versao_criterio_metrica. Delta (forge-check parecer delta): alvos-acelerato.ts e dois testes (unitário e .pg), só essa troca. Prova: alvos-acelerato.test.ts, 26 passaram localmente; cai se a lista voltar a só S1. O .pg ajustado fica com a bateria do sha. Bug médio anterior encerrado.

## Veredito
Aprovado na volta 2. Suíte inteira e .pg pelo check-run bateria do mesmo sha.
