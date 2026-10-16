---
tipo: revisao-seguranca
contrato: 1
pedido: 011-fase2-estrategicas
branch: feature/011-fase2-estrategicas
commit: 3aeaa3db1ebc90ec9ba2c18500b558e9effab546
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-16
---
# Review de segurança: back da fase 2 do pedido 011, lote 1 (estratégicas: E6, E7 com R$, E8)

Propósito: portão de segurança (R-SEGURANCA, gatilho de dado pessoal no E8) antes do PR do lote 1. Público: tech-lead, node-backend, software-architect, qa-engineer, Jarvis.

**Veredito: aprovado para a fase 2 (mock).** Nenhum dado de pessoa sai em contrato, agregado, resposta, log ou mock. A R-1 = B está cumprida no E8. As pré-condições da fase 3 estão listadas no fim.

**Escopo revisado:** `git diff f81567e..3aeaa3d` (55 arquivos: contratos, biblioteca, mock, servidor, OpenAPI, fotografias e docs). Base: ADR 0020 da develop `48b909a` (itens 1, 2, 3, 5, 8 e 9, com R-1 = B e R-2 = B), meu parecer `docs/security/adr-0020-protecao-de-pessoa.md`, o pedido 011 (decisões de 2026-10-16 e 2026-10-17) e o parecer de code review `docs/reviews/011-fase2-estrategicas.md` (R1). Leitura estática, sem nada executado contra sistema algum.

## Gatilhos
- **Dados pessoais:** E8 (concentração de conhecimento) é uma contagem que, na coleta real, deriva de responsáveis distintos (`dim_card_versao.responsaveis`).
- Nenhuma migração, GRANT, workflow, dependência nem log novo neste lote.

## Verificações
| Item | Resultado | Evidência |
|---|---|---|
| E8 sem nome de sistema nem de pessoa (R-1 = B) | ok. O contrato só tem `janelaMeses`, `sistemasComEntrega`, `faixas {uma, duas, tresOuMais}` (anulável) e `recortePequeno`. `sistemasUmaPessoa` não existe | `packages/contratos/src/tambem.ts:294-300`; teste `packages/contratos/src/tambem2.test.ts` ("E8, R-1 = B") |
| Recorte pequeno (CA-10) | ok. Com menos de 5 sistemas com entrega, `faixas` é `null` | `packages/metricas/src/businessmap/e8.ts:27,34` |
| Risco residual (a) da ADR 0020 (diferença por filtro de sistema) | **fechado.** `calcularE8` ignora os filtros (`_f`) e a aplicabilidade só declara `periodo`, que também é ignorado (janela fixa). A resposta é a mesma para qualquer combinação de filtros, então não há duas consultas para subtrair | `e8.ts:21`; `packages/contratos/src/metricas.ts` (APLICABILIDADE_FLUXO, E8: `['periodo']`) |
| Cruzamento E7 × E8 | fechado pela R-1 = B. O E7 publica `entregas` e R$ por sistema, mas o E8 não nomeia sistemas | ADR 0020, "Decisões do usuário" |
| E7 com R$ | ok. Rateio do custo total do DSPD por sistema, só com 20 ou mais entregas. Nada por equipe nem por pessoa, e horas apontadas não entram | `packages/metricas/src/businessmap/e7.ts` (custo), `custo.ts` |
| E6 | ok. Lista de projetos com `cardId`, `codigo`, `titulo`, deslize e replanejamentos. Sem pessoa | `tambem.ts:274-286` |
| `ChaveSegmentacao` | ok. E6 e E8 com `segmentacao: []`. Nenhuma chave nova, e a lista não tem `pessoa`, `responsavel` nem `equipe` | `packages/metricas/src/core/regras.ts:12-42`; teste `packages/metricas/src/fase2.regras.test.ts` |
| Coletor fora de `exports` | ok. `faixaConcentracao` fica em `packages/metricas/src/coletor/` e não aparece em `package.json` `exports`, em `src/index.ts` nem em `./businessmap`. Recebe só um inteiro. Teste "não é pública" incluído | `packages/metricas/package.json:7-14`; `packages/metricas/src/coletor/faixaConcentracao.ts:8` |
| Mock (ADR 0020, item 8) | ok. `conhecimentoSistema` é gerado direto como faixa, sem ler `responsaveis`. Um teste confere o texto do arquivo | `packages/mock/src/businessmap/extensaoTambemFase2.ts` (bloco E8) |
| Rota e testes de pessoa | ok. A rota responde no schema e não traz chave de pessoa. Filtro `responsavel=` dá 400. A P6 (`regras.property.test.ts`) roda com a extensão | `server/tests/metricas.test.ts:531-541`; `packages/metricas/src/regras.property.test.ts` |
| Log e erro | nada novo | diff sem `log.`/`console.` acrescentado |
| Segredos | nenhum padrão de credencial no diff (busca por `apikey`, `token`, `senha`, `secret`, chave privada: 0) | diff `f81567e..3aeaa3d` |

## Achados

**B-1 (baixa; pré-condição da fase 3). O E8 lê `entregas`, coluna que o `dspd_api` não lê.**
- Evidência: `packages/metricas/src/businessmap/extensao.ts:66` (`entregas: number`) e `e8.ts:26` (`s.entregas > 0`); ADR 0020, item 5 (GRANT por coluna sem `entregas`); code review R1.
- Caminho: na fase 2 não há caminho, porque o dado é mock e não sai na resposta. Na fase 3 a leitura pela API bateria no GRANT. O risco é alguém "consertar" isso dando o GRANT de `entregas` ao `dspd_api`. Com a faixa 1 ao lado, `entregas` dá a vazão de uma pessoa identificável (M-4 do parecer da ADR).
- Correção mínima: trocar por `temEntrega: boolean` (espelho de `tem_entrega`) no tipo, no gerador e no teste, junto com o K-100. O GRANT de `entregas` continua negado.
- Esforço: P. Dono: node-backend.

**I-1 (informativa). Diferença ao longo do tempo no E8.** Como a janela anda um dia por vez, a contagem de sistemas na faixa 1 pode mudar de um dia para o outro. Sem nome de sistema, isso não aponta sistema nem pessoa. Sem ação.

**I-2 (informativa). `titulo` do projeto no E6.** O título é texto digitado por pessoas (L-2, ADR 0020 4a, provisório). O nível de projeto e o aviso de não escrever nomes no título já valem. Sem ação neste lote.

## Pré-condições da fase 3 (deste lote)
1. B-1: o E8 passa a ler `tem_entrega`, e o teste de grants confirma que o `dspd_api` não lê `entregas` (ADR 0020, item 7).
2. Entrada `./coletor` no `exports`, **só junto com** a regra de lint de import (`**/coletor`, `**/coletor/*`, sem `eslint-disable`) e o teste de bundle de `web/` (ADR 0020, itens 2 e 3, B-2). Hoje não há consumidor e o pacote não expõe a subpasta, por isso o adiamento é aceitável. Mas a entrada sem o lint abriria o import pelo nome do pacote para o front. O cartão vai ao lado do K-100, e o teste `faixaConcentracao.test.ts:25` muda junto.
3. O projetor conta responsáveis distintos só com o papel `dspd_coletor` e grava apenas a faixa (ADR 0020, item 5).
4. R-A (dados antigos = A): repetir a contagem das `stg_` antes da primeira coleta real.
5. Nova leitura da ADR 0020 pelo `security-engineer` se ela mudar (K-112).

## Riscos aceitos e ferramentas
- Nenhum risco aceito por este parecer.
- Ferramentas: leitura estática, `git diff` e `grep`. `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH (lacuna registrada). O lote não muda dependência, lockfile nem workflow. `forge-check` está disponível no plugin.

## Plano em cartões (para o Jarvis)
| Cartão | Achado | Dono | Quando |
|---|---|---|---|
| E8 com `temEntrega` no lugar de `entregas` | B-1 | node-backend | fase 3, com o K-100 |
| `./coletor` no `exports` com lint de import e teste de bundle | pré-condição 2 | tech-lead | fase 3, antes do primeiro módulo `coleta*` |
