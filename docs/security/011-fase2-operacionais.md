---
tipo: revisao-seguranca
contrato: 1
pedido: 011-fase2-operacionais
branch: feature/011-fase2-operacionais-v2
commit: d5b02d8d7f7641620fe241210f99d21c662e93d8
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-17
---
# Review de segurança: back da fase 2 do pedido 011, lote 3 (operacionais: O22, O26)

Propósito: portão de segurança (R-SEGURANCA, gatilho de dado pessoal no O22 e no O26) antes do PR do lote 3. Público: tech-lead, node-backend, software-architect, qa-engineer, Jarvis.

**Veredito: aprovado para a fase 2 (mock), revalidado sobre `d5b02d8` (branch `-v2`, sobre a develop `8516ff8`).** Só o instante do primeiro toque e o inteiro `passagens` chegam à biblioteca. A resposta publica só distribuições e contagens por tipo e faixa, nunca um valor por card ligado a pessoa. `houveTroca` e `contarPassagens` ficam fora dos pontos de entrada públicos. A revalidação (seção no fim) não traz achado novo.

**Escopo revisado:** rodada 1 sobre `git diff ace8db8..aab7a46` (48 arquivos), só o que este lote acrescentava ao lote 2 antigo. Rodada 2 sobre `git diff 8516ff8..d5b02d8` (47 arquivos) e `git range-diff ace8db8..aab7a46 8516ff8..origin/feature/011-fase2-operacionais-v2`. Base: ADR 0020 da develop (itens 2, 3, 4c, 4e, 4g, 7 e 8), `docs/security/adr-0020-protecao-de-pessoa.md`, o pedido 011 (D-9', D-5' = B, Q-a = 1 passagem, Q-b = conta) e `docs/reviews/011-fase2-operacionais.md` (rodadas 1 e 2). Leitura estática.

## Gatilhos
- **Dados pessoais:** O26 (passagens de mão, contadas a partir dos ids de responsável) e O22 (primeiro comentário humano, que compara o autor com as contas de automação).
- Nenhuma migração, GRANT, workflow, dependência nem log novo.

## Verificações
| Item | Resultado | Evidência |
|---|---|---|
| `houveTroca` e `contarPassagens` na subpasta `coletor/` | ok. Recebem conjuntos de ids opacos e devolvem só booleano ou inteiro. Os conjuntos não saem da função, e nada é logado | `packages/metricas/src/coletor/houveTroca.ts:13-41` |
| Coletor fora de `exports` | ok. Não está no `package.json` `exports`, em `src/index.ts` nem em `./businessmap`, e o teste confere isso. Nenhum import de `coletor` fora da própria subpasta (busca em `web/`, `server/src`, `packages/`) | `packages/metricas/package.json:7-14`; `packages/metricas/src/coletor/houveTroca.test.ts:102-109` |
| Property test do `houveTroca` (ADR 0020, item 7) | ok. Os quatro casos da ADR, mais Q-a e Q-b, com semente fixa | `houveTroca.test.ts` |
| O26 sem pessoa | ok. A biblioteca lê só `passagens[card_id]` (inteiro). A resposta traz por tipo e faixa (`0`, `1`, `2`, `3`, `4+`): itens, percentual e P85 do ciclo. Nenhum card nem id sai | `packages/metricas/src/businessmap/o26.ts:37-89`; `packages/contratos/src/tambem.ts` (`resultadoO26`) |
| O22 sem autor nem texto | ok. Só o instante (`primeiroToque`). A resposta traz por tipo a distribuição, o histograma (`null` abaixo de 20) e "sem toque" (contagem e idade do mais antigo) | `o22.ts:46-113`; `tambem.ts` (`resultadoO22`) |
| `ChaveSegmentacao` | ok. A única chave nova é `faixa-passagens`. Não há `pessoa`, `responsavel` nem `equipe` (teste) | `packages/metricas/src/core/regras.ts:42`; `fase2.regras.test.ts` ("a única nova é faixa-passagens") |
| Mock (ADR 0020, item 8) | ok. `passagens` é sorteado direto (Poisson) e `primeiroToque` é só o instante. Não lê `responsaveis` nem `usuario`, e um teste confere o texto do arquivo | `packages/mock/src/businessmap/extensaoTambemFase2.ts` (blocos O22 e O26) |
| Rota | ok. Respostas no schema, sem chave de pessoa; `responsavel=` dá 400 | `server/tests/metricas.test.ts:531-541` |
| Log, erro e segredos | nada novo; nenhum padrão de credencial no diff | diff `ace8db8..aab7a46` e `8516ff8..d5b02d8` |

## Achados

**B-1 (baixa; pré-condição da fase 3). Lint de import e teste de bundle do `coletor/` ainda não existem.**
- Evidência: `eslint.config.js` (na ponta da branch) não tem padrão para `coletor`. ADR 0020, itens 3 e 7 (B-2), e code review R1.
- Caminho: hoje um arquivo de `web/` ou de `server/src/modulos/metricas` conseguiria importar `houveTroca` por caminho relativo profundo sem o lint reclamar. Não há dano possível: fora do coletor não existem ids para passar, e a API não lê `responsaveis` (GRANT). A fronteira forte é o dado, e o lint é defesa em profundidade.
- Correção mínima: no cartão da fase 3 que criar o primeiro `server/src/modulos/coleta*`, entram juntos a regra `no-restricted-imports` (`**/coletor`, `**/coletor/*`, `@metricas-dspd/metricas/coletor`, liberada só em `server/src/modulos/coleta*`), a recusa de `eslint-disable` no escopo, o teste de lint (pacote e relativo), o teste de bundle de `web/` (sem `houveTroca`) e a entrada `./coletor` no `exports`. O teste `houveTroca.test.ts:108-109` muda junto.
- Esforço: P. Dono: tech-lead.

**I-1 (informativa). O O22 e o O26 por card.** O valor por card não sai na resposta, só agregado por tipo e faixa. O "sem toque" mostra a idade do pedido mais antigo, que é um dado do pedido, não de quem atende. Sem caminho de reidentificação pela API. Sem ação.

## Pré-condições da fase 3 (deste lote)
1. B-1 (lint, bundle e `exports ./coletor`, juntos).
2. Allow-lists da ADR 0020 no coletor real: `stg_revision` com `troca_responsavel` calculado em memória e sem `user_id`, `owner_user_id` nem `co_owner_ids` (4c); `stg_comentario_instante` só com `(card_id, comentario_id, criado_em)` (4e); e os testes do item 7 (proibidos escritos no teste, fixture da OpenAPI com chave desconhecida, não vazamento em log e em `ctl_coleta_falha`).
3. `ref_conta_automacao` fora do GRANT do `dspd_api`, só com contas de serviço confirmadas na WS1, com `motivo` e `confirmado_em` (4g). A lista de tabelas fora da API já existe em `server/src/plataforma/db/grants.ts:16`.
4. O spike P-T1: se a troca de responsável não gerar revisão própria no BusinessMap, aplica-se o critério de reversão da ADR (a decisão volta ao usuário).
5. R-A (dados antigos = A): repetir a contagem das `stg_` antes da primeira coleta real.

## Riscos aceitos e ferramentas
- Nenhum risco aceito por este parecer.
- Ferramentas: leitura estática, `git diff`, `git range-diff`, `git grep` e `grep`. `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH (lacuna registrada). O lote não muda dependência nem workflow.

## Plano em cartões (para o Jarvis)
| Cartão | Achado | Dono | Quando |
|---|---|---|---|
| Lint de import do `coletor/`, teste de bundle e `exports ./coletor` | B-1 | tech-lead | fase 3, no cartão do primeiro `coleta*` (ao lado do K-100) |

## Revalidação sobre `d5b02d8` (branch `feature/011-fase2-operacionais-v2`, 2026-10-17)

**Motivo:** a rodada 1 foi escrita sobre `aab7a46` (branch antiga, cortada sobre as táticas antigas `ace8db8`). O tech-lead refez o lote com cherry-pick de `df0b9ed` sobre a develop `8516ff8` (lotes 1 e 2 já mesclados), com 3 conflitos resolvidos a favor da develop. O review dele (rodada 2, `3d234aa`) aprovou.

**Resultado: aprovado, sem achado novo.** B-1 e I-1 seguem como estavam.

| Item | Resultado | Evidência |
|---|---|---|
| Patch igual ao revisado | ok. O `range-diff` só difere nos três trechos de conflito e no parecer de review. A lógica de `o22.ts`, `o26.ts`, `coletor/houveTroca.ts` e os blocos O22 e O26 do mock é idêntica | `git range-diff ace8db8..aab7a46 8516ff8..origin/feature/011-fase2-operacionais-v2` |
| Conflito 1 e 2: `docs/architecture/regras-metricas.md` (tabela e parágrafo da fase 2) | ok. Só documentação: mantém as linhas da develop (T10 com B11-001, O19-pct = B, Q-T14-9 = A, Q-T14-10 = B, T14-M1 = B) e acrescenta O22 (segmentação `tipo`) e O26 (`tipo, faixa-passagens`). Nenhuma dimensão de pessoa nem de equipe como eixo | diff da tabela e do parágrafo no `range-diff` |
| Conflito 3: imports de `packages/mock/src/businessmap/extensaoTambemFase2.ts` | ok. Mantém `chaveOutrosPublicavel` da develop e acrescenta só `lognormal`, `poisson` e `somarHorasUteis` (sorteio e calendário). O arquivo continua sem ler `responsaveis` nem `usuario` | `git grep -E "responsaveis\|usuario"` no arquivo em `d5b02d8`: só o comentário da linha 28 |
| `ExtensaoTambemBM` | ok. Os únicos campos novos são `primeiroToque: Record<string, number \| null>` e `passagens: Record<string, number>`, sem id de pessoa | `packages/metricas/src/businessmap/extensao.ts` (diff `8516ff8..d5b02d8`) |
| Servidor | ok. Só entram `O22` e `O26` em `COM_EXTENSAO_TAMBEM` e comentários. Nenhuma consulta, coluna, GRANT nem migração nova; `grants.ts` inalterado, então o `dspd_api` continua sem ler coluna de pessoa | `server/src/modulos/metricas/servico.ts`; `git diff --quiet 8516ff8 d5b02d8 -- server/src/plataforma/db/grants.ts` |
| Coletor ainda fora da API | ok. `exports` do `package.json` sem `./coletor`; nenhum import de `coletor` em `web/`, `server/src` nem em outro pacote fora da subpasta | `packages/metricas/package.json:7-14`; `git grep coletor d5b02d8` |
| B-1 das táticas (P6 do T14 com equipe no filtro) | ok, intacto. O bloco "P6 (B-1): T14 com equipe no filtro" segue na develop; o lote mexe em `regras.property.test.ts` só num comentário ("seis métricas novas"), e `t14.ts` e `t14.test.ts` não mudam. A varredura de nomes da P6 também cobre O22 e O26 | `packages/metricas/src/regras.property.test.ts:638-659`; diff de 1 linha |
| Arquivos sensíveis | nenhum. O diff não toca migração, GRANT, workflow, `package.json`, lockfile, `eslint.config.js` nem `.env*` | `git diff --name-only 8516ff8 d5b02d8` |
