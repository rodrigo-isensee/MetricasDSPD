---
tipo: qa
contrato: 1
pedido: 085-suite-unica-trava-no-pronto
branch: feature/085-suite-unica-pronto
commit: bd71848448453830357a0b91207914a1237bfaa6
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: 085 trava da suite-unica sob `pnpm run pronto` (E1.3, K-256)

Código testado: `5369e9cc` (correção), com os pareceres de devops (`bd718484`) e de review (`39c901d9`) por cima; só `scripts/suite-unica.test.sh` mudou em código (+22/-8 linhas). Obrigação: o teste 4 não pode pendurar quando `pnpm run pronto` já segura a trava padrão, e o caso continua provado quando o teste roda sozinho.

## Conferência contra a obrigação
| Obrigação | Teste / execução | Fronteira protegida | Resultado |
|---|---|---|---|
| Sozinho, o teste 4 prova o caminho padrão (2ª chamada espera a 1ª; 1ª termina rc=0) | `bash scripts/suite-unica.test.sh` | trava padrão livre | passou (7 `ok`, "tudo certo", 4,2 s) |
| Dentro do `pronto`, o teste 4 não pendura | `pnpm run pronto` inteiro | trava padrão segurada pelo chamador (`METRICAS_DSPD_SUITE_SEGURA=1`) | passou: saiu `pulado - caminho padrão ...: trava já segurada por uma suíte de fora`, "tudo certo", sem espera |
| Trava ocupada por outra suíte (sem a marca) também pula, não espera | `pnpm run pronto` 2ª cópia, lançada com a 1ª rodando | trava segurada por terceiro (`flock -n` falha) | passou: a 2ª esperou na entrada pela trava e, ao entrar, pulou o teste 4 do mesmo jeito |
| Os testes 1 a 3 e 5 seguem iguais | mesma execução | n/a | passaram |

## Execução
- Sozinho: `bash scripts/suite-unica.test.sh`, 7 `ok`, `suite-unica.test: tudo certo`, real 0m4,19s.
- `pnpm run pronto` inteiro na worktree (dependências já instaladas): saída 0, real 8m58,7s (user 35m39s). Cobertura 100% nas ferramentas vistas; `docs:check: ok (1123 páginas Markdown, 69 métricas, 2 eventos)`.
- Nenhuma falha do `pronto` na develop surgiu neste ambiente (os testes de entrada do server passaram), então não há achado de falha preexistente.
- Vermelho antes do verde: o vermelho é a trava observada do próprio K-256 (a versão anterior do teste 4 esperava sem fim sob o `pronto`, relatado no parecer de devops); não rodei `forge-testes --vermelho` porque o pedido não toca guarda do Forge e a base penduraria por construção. Mutação não aplicada: a mudança é de teste de shell, sem ferramenta de mutação na stack.
- Suíte inteira do PR: vale o check-run `bateria` do mesmo sha no CI; não citado aqui por não existir PR ainda (E1.4).

## Achados
- A1 (recomendado) scripts/suite-unica.test.sh:55 · Dentro do `pronto` o caso do caminho padrão é sempre pulado; ele só é provado em `test:trava` isolado ou na CI. Garanta que a CI rode `test:trava` fora de uma suíte segurando a trava, senão o caso nunca é exercido.
