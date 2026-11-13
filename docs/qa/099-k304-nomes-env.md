---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-k304-nomes-env
commit: 3f2803e2192391aa8d3d72266379e09c3b5cde16
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-13
---
# QA: K-304, nomes das variáveis de ambiente na coleta e no diagnóstico (pedido 099)

Base 9bb72d1f, head 3f2803e2. Classe N, sem especificação de UX nem contrato de API (comando de linha). Obrigação: o cartão K-304 e a regra do CLAUDE.md (credenciais só em `.env`; nada de valor em saída ou log). Suíte inteira: check-run `bateria` do PR (I5).

## Achados
- A1 (recomendado) server/tests/coleta-nomes-env.test.ts:1 · mutantes vivos: `.trim()` do diagnóstico (variável só com espaços) e `e.coluna.split(',')` do Acelerato (duas variáveis do MySQL inválidas juntas) não têm teste; ambos corretos na execução manual. Pede 2 testes do autor.
- A2 (recomendado) server/src/entradas/coleta.ts:21 · `DSPD_SCHEMA_PREFIXO` inválido sai como `erro-interno` (montarEsquemas lança Error fora do ErroConfiguracao), sem nome e sem valor. Só variável de teste: cartão baixo, sem bloqueio.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Coleta Acelerato sem ambiente lista todos os nomes (worker e MySQL), sem erro-interno | coleta-nomes-env.test.ts 1 | ambiente vazio | passou |
| Valores presentes e um ausente: só o nome, sem eco do valor | teste 2 (sentinela) | uma ausente | passou |
| Valor inválido: nome sem eco | testes 3 e 4 | URL e porta inválidas, ordem estável | passou |
| Coleta BusinessMap: nomes, sem valor | teste 5 | vazia e inválida | passou |
| Diagnóstico lista todas as ausentes; singular com uma | testes 6 e 7 | zero, uma, duas ausentes | passou |

## Execução
- `vitest run tests/coleta-nomes-env.test.ts`: 7 passaram. lint-alterados (6 arquivos) rc 0; typecheck-alterados (server) verde.
- Vermelho antes do verde: `forge-testes --vermelho` não serve a TypeScript (saída: "o mapa não sabe (server/src/entradas/coleta-businessmap.ts sem mapa) ... nenhum teste prova a mudança"). Feito à mão numa cópia com os 5 arquivos de src na base 9bb72d1f e o teste novo: 6 falharam e 1 passou (o singular do diagnóstico, comportamento já existente). Ex.: `expected 'bm:coleta falhou: erro-interno' to be 'bm:coleta falhou: configuração: ...'`.
- Cenários próprios (sentinela em valores, LOG_LEVEL=debug no filho, stdout e stderr varridos): TLS_SHA256 inválido; HOST e MAX_EXEC_MS inválidos juntos (lista os dois); NODE_TLS_REJECT_UNAUTHORIZED=0 (nomeia a variável); PG_COLETOR_URL inválida com `--releitura`; LOG_LEVEL inválido; BusinessMap com URL e chave inválidas ou vazias; diagnóstico com URL inválida e com ambas vazias. Em todos: rc 1 (rc 2 no diagnóstico), só nomes, o sentinela nunca apareceu em stdout nem stderr.
- Mutação no diff (cópia descartável, worktree intocada): morreram `config.ts` sem a checagem de `config === undefined` (1 caiu) e coleta-businessmap sem o ramo ErroConfiguracao (1 caiu). Sobreviveram: `!env[nome]?.trim()` para `!env[nome]`; `split(',')` para `[coluna]`; `[...new Set]` para `nomes` (equivalente: nomes do worker e do MySQL são disjuntos); guarda `codigo/coluna` (equivalente: a coluna sempre vem preenchida). Os dois primeiros são o A1.
- Fora de cartão: senha de MySQL só com espaços passa na validação e falha adiante como `tls-configuracao` (código fixo, sem valor). Comportamento anterior, sem vazamento.
- Regras do projeto: sem tocar métrica, sem mistura BusinessMap/Acelerato, credenciais só do ambiente.

## Bugs
- Baixo, aberto (vira cartão, sem aceite do usuário): `DSPD_SCHEMA_PREFIXO` inválido não é nomeado (A2).

Parecer: aprovado, sem bug crítico, alto ou médio.
