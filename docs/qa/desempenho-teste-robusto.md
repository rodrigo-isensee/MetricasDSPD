# Parecer (review + QA) - teste de desempenho robusto

Commit revisado: f8b67d0 (branch fix/desempenho-teste-robusto). Escopo: `packages/mock/src/desempenho.test.ts` e ADR 0003. Sem E2E.

## Verificações
| Item | Resultado |
|---|---|
| (a) Fator 1 (ociosa) = limite 150 ms | OK. `LIMITE_BASE_MS = 150`, fator = `min(2, max(1, ref/3.3))`; piso 1 garante que nunca fica abaixo de 150 ms. |
| (b) Teto 2 (máx. 300 ms), mutação real | OK. Busy-loop de CPU de 300 ms em O1: falha ("O1 a frio: 333 >= 250"). Busy-loop de 160 ms: falha (p95 379 >= 242). Busy-loop de +120 ms em O1 (custo base 24 ms, total ~144 ms): NÃO é pego (abaixo de 150 ms, é o comportamento esperado do limite 3x, ver A1). Código restaurado, árvore limpa. |
| (c) CPU time vs I/O/espera | Ver A2. |
| (d) Hashes das bases do mock | OK. Só o arquivo de teste mudou; `mock.test.ts` (hashes 924448d4 e b2bfd4c0) passou. |
| (e) `flock ... pnpm --filter ./packages/mock run pronto` | Verde: exit 0, 8 arquivos, 146 testes, typecheck e cobertura ok. |

Linha de base medida (máquina com outros agentes ativos): maior métrica T6 = 42 ms; demais <= 30 ms; VISAO_GERAL 113 ms (limite 900); gerador 274 ms (limite 1500).

## Achados
- A1 (baixa, informativo): a folga é 3x o orçamento. Uma regressão que leve uma métrica de 24 ms a 144 ms passa com a máquina ociosa; T6 (42 ms) tolera ~108 ms extras. O teste pega regressão grosseira (>= ~110-150 ms), não deriva fina; o orçamento de 50 ms segue só como alerta impresso. Coerente com a ADR (limite de CI = 3x), sem ação.
- A2 (média, risco aceito e a documentar): `process.cpuUsage` não vê tempo bloqueado em I/O ou espera (await, sleep, rede, leitura de disco, fila). O cálculo atual é síncrono, em memória e puro, então hoje não há ponto cego; mas uma regressão que introduza I/O síncrono bloqueante (ex.: fs/rede por métrica) ou espera passaria sem acusar. Mitigação existente: o relógio de parede continua coberto no front/E2E (C2/F-series da ADR). Sugestão (tech-lead): deixar escrito na ADR que o C3 só vale para cálculo puro e que um teste de relógio de parede seguirá nos medidores da máquina de referência; opcionalmente, um teste que falhe se o módulo de métricas importar fs/net/child_process.
- A3 (baixa): sob carga a calibração oscila (ref 5.0 ms contra 3.0 ocioso, fator 1.5-1.7 observado nas mutações com outros agentes rodando), o que alarga o limite para ~250 ms nesses momentos. O teto 2 limita o efeito; a mutação de 300 ms foi pega mesmo assim. `REF_OCIOSA_MS = 3.3` é uma constante da máquina de referência; se o CI for mais lento de forma constante, o fator ficará fixo em 2 (limite 300 ms) sem falhar, o que é seguro.

## Parecer
Aprovado, sem defeito aberto crítico ou alto. A proteção não ficou frouxa: limite 150 ms ocioso, teto 300 ms, lentidão real de 160 e 300 ms detectada. Riscos A1/A2 aceitos e registrados.
