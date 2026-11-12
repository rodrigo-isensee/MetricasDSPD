---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d3-alvo-prioridade
commit: 8f0d669b6d65b1d1864e1b2062dae9b7b9a45acf
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-12
---
# QA: 099 D3, alvos de prioridade com a unidade de cada prazo

Diff de três pontos contra `develop` (31 arquivos): migração 0036, carregador `alvos-acelerato.ts`, `acelerato-alvos.json`, biblioteca (`modelo.ts`, `indice.ts`, `s1.ts`), `mapa.ts`, `ref-sync-ac.ts` e testes. Sem especificação de UX nova; as obrigações são as decisões do dono Q-099-5a e Q-099-11 e o desenho `docs/analises/099-d3-unidade-prazo.md`. Os testes `.pg` ficam com o check-run `bateria` do PR (regra do dono: nada de banco local); não rodei banco.

## Achados
- A1 (bloqueante) packages/metricas/src/visaoGeral.ts:252 · A Visão geral lê calcularS1 (alvos): com a unidade o indicador S1 e o alerta S1_MEDIANA_ACIMA_ALVO mudam de número (reproduzido: valor 1 fora vira 0 dentro), e a versão de critério só marca S1. Volta ao dono: marcar VISAO_GERAL? critério mudou: risco do desenho.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Os 10 prazos e a unidade de cada célula = decisão do dono | `alvos-acelerato.test.ts` (10 prazos com unidade; texto do PROC confere com as horas); leitura do JSON | prazo em dias úteis em horas (8 h/dia); unidade por célula | passou (conferido à mão: P1 0,25/4 corrido; P2 0,5 corrido e 8 útil; P3 2/16; P4 4/40; P5 8/80 úteis) |
| S1 mede P1 e o 1º atendimento de P2 em corrido, o resto em útil | `acelerato.test.ts` (escolha da medida por célula; mesma amostra 10 h corrido x 9 h útil) | troca de unidade muda o número | passou |
| Pendência descontada no mesmo relógio | `acelerato.test.ts` (32 h − 22 h de pausa corrida = 10 h) | pausa útil subtraída de duração corrida | passou |
| Versão de critério marca S1 | `alvos-acelerato.test.ts` (METRICAS_ALVOS = S1); `.pg` (metricas ['S1']) | só S1 | unitário passou; `.pg` com a bateria |
| Visão geral não muda de número sem marca | reproduzido em teste temporário (apagado) | VISAO_GERAL fora do `afeta` | falhou (A1) |
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

## Bug
- Visão geral muda o número do S1 sem marca T2.6 (média: hoje a Visão geral real devolve 503 por 0 linhas em `ref_alvo_prioridade`; passa a divergir quando o carregador rodar). Responsável: node-backend, depois da decisão do dono (marcar VISAO_GERAL na versão ou aceitar a exceção). Não abri arquivo em `docs/qa/bugs/` por estar fora da lista da delegação.

## Veredito
Reprovado por A1 até a decisão do dono. O resto da entrega confere com a decisão.
