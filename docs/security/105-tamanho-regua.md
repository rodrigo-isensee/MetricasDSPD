---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-tamanho-regua
commit: 0ccb21ef34646f49bb4e8085b38d053c77fb567b
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: O8 por tamanho pela régua do time (105, E7.133)

Escopo: `2c56d33b..0ccb21ef` (E7.102, E7.116, E7.128): régua `tamanho_regua` no domínio versionado, carga em `ref_dominio`, projeção do `size` nativo em `tamanho_declarado`, allow-list, contrato do O8 e cartão da tela. Sem dependência nova, sem migração, sem workflow.

## Gatilhos
`R-SEGURANCA`: mexe na allow-list da coleta do BusinessMap e no domínio versionado que alimenta `ref_dominio`; regra inviolável de não comparar times (nada por time na API).

## Achados
- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:68 · linha da régua com time_id fora de ref_time é ignorada em silêncio na projeção; o plano previa recusa no esquema. Contar as linhas descartadas no relatório do ref-sync (só a contagem) para o dono ver régua digitada errado.

## Sondas

## Detalhe dos achados
**Verificações (todas passaram):**
1. **Nada de pessoa entra.** `size` já estava na allow-list do staging (`server/src/modulos/businessmap/allow-list.ts:18`); nenhum campo novo é lido da API. `tamanho_declarado` saiu de `COLUNAS_LISTA` (`allow-list.ts:70`): nenhum campo customizado (texto livre de quadro) pode mais alimentar a coluna; a allow-list aperta. As notas novas (`size_sem_valor`, `size_fora_da_regua`, `time_sem_regua`, `server/src/modulos/businessmap/normalizador.ts:223-231`) são rótulos fixos, sem o valor.
2. **A régua é só configuração.** Esquema estrito (`server/src/modulos/businessmap/dominio-businessmap.ts:44,77,102,106-109`): código `<time_id>:<size>` por expressão ancorada e linear (sem retrocesso catastrófico), rótulo em enum de seis faixas, sem chave extra, sem chave repetida, teto de 1000 linhas. Na leitura do banco (`reguaDeLinhas`, `dominio-businessmap.ts:340-355`) a validação se repete e chave com duas faixas vira sem tamanho. Nenhuma tradução no código. As 63 linhas do arquivo conferem uma a uma com a tabela do plano (`plano-tamanho.md` §2a, 7 times: 26=19, 14=12, 38=7, 6=7, 42=6, 5=6, 18=6). Vigência e versão de critério `105:tamanho-pela-regua-do-time` com `afeta: ["O8"]` no arquivo; histórico em `dim_card_versao` (`server/src/modulos/businessmap/responsaveis.ts:18` já versiona `tamanho_declarado`).
3. **Nada por time na API.** O resultado do O8 só tem faixa, `n` e mediana (`packages/contratos/src/schemas.ts:885,951-953`); o enum só ganhou valores; a régua e o `time_id` não aparecem na resposta. A tela (`web/src/features/complementares/fluxo.tsx:132-161,253-263`) mostra só faixas consolidadas e a nota "sem comparar times". O filtro por equipe já existente continua igual para todas as métricas; não é exposição nova.
4. **Mínimo de 20 e sem M por omissão.** Faixa vazia `n: 0` e mediana nula; abaixo de 20 nula pela biblioteca (`packages/metricas/src/businessmap/o8.ts:93`); size ausente, fora da régua ou time sem régua dá nulo contado.

**A1 (baixa, informativa):** caminho de ataque não há (o arquivo é versionado e revisado em PR); o risco é de integridade por erro de digitação: uma linha `99:3` para time inexistente some sem aviso e os cards do time pretendido vão para "Sem tamanho". Correção mínima: contar no relatório do `bm:ref-sync` as linhas da régua descartadas por time desconhecido (só a contagem). Esforço P. Dono: `node-backend`.

**Sondas executadas (nenhuma prova bloqueante):** `tamanhoPelaRegua` com `1.5` e `"1.50"` dá P; `"1e0"`, `-1.5`, `Infinity`, `NaN`, objeto com `toString` dão nulo com `size_fora_da_regua`; `null` e `""` dão `size_sem_valor`; time 99 dá `time_sem_regua`. O esquema, sobre o arquivo real mais uma linha, recusa `26:1` repetido, rótulo de nome de pessoa, código com nome, `026:1`, `26:1.50` e chave extra; aceita `26:7 → P` (valor novo de time existente, como esperado).

**Suíte:** rodei `server/tests/dominio-businessmap.test.ts` e `server/tests/normalizador-businessmap.test.ts` no head: 169 de 169 passaram. A suíte inteira fica para o CI do PR; este parecer não afirma CI verde.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas de varredura de segredos, SAST e auditoria de dependências ausentes no ambiente (lacuna; sem dependência nova no diff, a varredura fica para o CI). Revisão manual do diff inteiro e sondas locais.
