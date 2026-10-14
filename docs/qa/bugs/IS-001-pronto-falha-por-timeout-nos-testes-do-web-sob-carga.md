# IS-001 - `pnpm run pronto` falha na main por timeout (15 s) de testes do web sob carga
- Severidade: média (o portão "comando de pronto" do projeto não fica verde na estação de referência compartilhada; sem efeito no produto)
- Responsável sugerido: react-frontend (`web/vite.config.ts`, `testTimeout: 15000`, e os testes que somam esperas por cartão)
- Ambiente: main 0af552a em cópia limpa (`git archive`, `pnpm install --frozen-lockfile --offline`), Node 24.21, WSL 8 núcleos/8 GB, estação compartilhada com outros agentes (load 1 min de 5,8 a 13,7)

## Passos para reproduzir
1. Numa cópia limpa da main: `flock /tmp/metricas-pesado.lock pnpm run pronto` (3 vezes).
2. Para isolar o pacote: `cd web && TZ=UTC pnpm exec vitest run --coverage` sozinho, sob o mesmo lock.

## Resultado esperado
Pronto verde quando o código não mudou; teste que reprova por tempo só quando há regressão de desempenho.

## Resultado obtido
| Execução | Load no início | web: falhas / total | Causa das falhas |
|---|---|---|---|
| pronto, worktree compartilhado | 2,07 | 5 / 758 | `Test timed out in 15000ms` (5) |
| pronto, cópia limpa 1 | 3,62 | 6 / 758 | timeout 15 s (6) |
| pronto, cópia limpa 2 | 5,80 | (não rodou: parou no IS-002) | |
| pronto, cópia limpa 3 | 5,80 | 12 / 758 | timeout 15 s (11) e 45 s (1) |
| só o web, cópia limpa | 7,45 | 1 / 758 | timeout 15 s (1) |

17 testes diferentes estouraram o tempo nas rodadas, sempre por timeout e nunca por asserção; os mais frequentes são `preferencias.test.tsx` (ocultar e desfazer), `operacional/diaria.test.tsx` (alternar para Semanal; O4 semana sem entregas) e `operacional/semanal.test.tsx` (O12 D3). A suíte do web leva de 356 s a 484 s e o `pnpm -r` roda os pacotes em paralelo, então a disputa de CPU é do próprio pronto mais a dos outros agentes da estação.

Com o pronto vermelho 3 de 3 vezes na estação de referência, o critério "comando de pronto verde" não é verificável por quem compartilha a estação.

## Evidência
Logs das execuções (trechos): `web pronto: Error: Test timed out in 15000ms.` (5, 6 e 11 ocorrências); `web pronto: Tests  12 failed | 746 passed (758)`; isolado: `Tests  1 failed | 757 passed (758)`, `seção com todos os cartões ocultos mostra a orientação, e o "Ir para" dela some 15652ms`.

## Sugestão (para o dono decidir)
Medir quais testes passam de 5 s sem carga e dividi-los ou trocar a montagem de painel inteiro por montagem do cartão; alternativa é limitar o paralelismo do pronto (`--workspace-concurrency`) em vez de só aumentar o timeout.

## Correção
- Correção: 4000300 (fix(web): timeout de teste calibrado pela medição). Medição: 830 testes, 20 acima de 5 s, pior 11 s; testTimeout 15 s para 45 s.
