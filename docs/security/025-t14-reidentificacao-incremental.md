---
tipo: revisao-seguranca
contrato: 1
pedido: 025-front-do-011-lote2
branch: develop
commit: c4db73e666e560f2120ab0b0d4cff1307d7710c9
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-23
---
# Review de segurança incremental: T14 (reidentificação) depois da correção L2T-002

Propósito: portão de segurança (R-SEGURANCA, gatilho de reidentificação de pessoas e de comparação entre times) para o delta entre o commit já aprovado (`32a509f`, parecer `docs/security/025-t14-reidentificacao.md`) e o squash na develop (`c4db73e`, PR #140), antes da promoção para a homolog. Etapa E1.4b do pedido 025, cartão K-110. Público: tech-lead, react-frontend, qa-engineer, Jarvis.

**Veredito: aprovado.** O delta não muda o que a T14 revela. Com "outros times" oculto (R-1 = B, T14-M1 = B), a linha do projeto continua mostrando só "Meu time: k" mais o substantivo, agora no singular ou no plural conforme `k`; nada no texto novo depende de `n`, do total do projeto nem da fatia dos outros times, logo não deixa deduzir `n − k`. O mock da API só altera a grafia do fornecedor no seed de teste, sob variável de ambiente própria, e não toca o código da API real.

## Review incremental 32a509f..c4db73e
Escopo: `git diff 32a509f c4db73e -- web/src/features/complementares server/tests/pg/servidor-api-mock.ts` (4 arquivos), lido junto com o estado final de `web/src/features/complementares/taticas.tsx` e `web/src/lib/formatar.ts` em `c4db73e`.

| Item | Resultado | Evidência |
|---|---|---|
| Texto da fatia oculta (L2T-002) | ok: `Meu time: {k} demanda(s)` ou `frente(s)`; o plural é `plural(k, ...)`, que depende só de `k === 1`; nenhum `n`, total, percentual nem "sem time informado" | `taticas.tsx:617-623`; `formatar.ts:10-12` |
| Dedução de `n − k` pelo texto novo | ok: o único dado lido na linha oculta é `p.meuTime.k`, que já era exibido antes; a escolha singular/plural não carrega informação além de `k` | `taticas.tsx:619-622` |
| Base do cartão da T14 | ok, sem mudança: `semBase` continua valendo com algum projeto oculto; o novo `baseDoCartao` só é aplicado dentro do ramo em que `semBase` é falso e a T14 não o passa | `CartaoComplementar.tsx:86-91`; `taticas.tsx` (CartaoT14, `semBase={... \|\| algumOculto}`) |
| Leitura, tabela, barra e DOM da T14 | ok, sem mudança no delta: leitura some com oculto, tabela mostra "não exibido" em outros, sem time e participação | `taticas.tsx` (leituraT14 e TabelaDados da T14) |
| T13 em Frentes (L2T-001) | ok: o selo passa a usar o `n` das frentes em vez do das demandas e descarta o complemento; é contagem de entregas, sem pessoa nem time, sem relação com a T14 | `taticas.tsx:416-422` |
| Teste que trava a regra | ok: o teste novo confere o texto exato "Meu time: 1 demanda" / "2 demandas" / "1 frente" e que os totais (53, 59) e os `n` (47, 43) não aparecem no cartão | `taticas.test.tsx:505-521` |
| Mock da API (`servidor-api-mock.ts`) | ok: arquivo de teste (`server/tests/pg/`), usado só por `scripts/com-api-mock.sh` e pelo projeto E2E `chromium-api-grafias`; sem `MOCK_FORNECEDOR_GRAFIAS` a base é a mesma de antes; com ela, só a grafia de `bm.bloqueios[].fornecedor` muda (empresa, não pessoa). Nenhum arquivo de produção nem código da T14 na API foi tocado | `servidor-api-mock.ts:27-40`; `e2e/playwright.config.ts:60-64` |

Nome de outro time, campo de pessoa e ordenação: nada novo no delta. O K-130 (a API da T14 ainda envia o agregado do projeto oculto, M-1/M-1a do parecer `docs/security/011-fase2-taticas.md`) não piora nem melhora com este delta e segue no cartão próprio, como condição antes de dado real (fase 3). Este aprovado cobre a tela, não a API.

## Achados
- A1 (recomendado) web/src/features/complementares/taticas.tsx:663 · herdado do parecer anterior, sem mudança: a ordem por total (CA-30) dá uma faixa do total do projeto oculto; fechar é decisão do usuário

## Ferramentas
Leitura estática do diff e do estado final. Sem dependência nova nem segredo no escopo; `gitleaks` e `osv-scanner` não rodados, lacuna registrada.

## Riscos aceitos
Nenhum pedido.
