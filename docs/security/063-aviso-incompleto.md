---
tipo: revisao-seguranca
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-aviso-incompleto
commit: 27bae585b35733537e68c535746ddda3288e36da
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-04
---
# Review de segurança: lote do 063 (coleta lendo todas as páginas, sinal na API e aviso na aba), E2.5 e E2.13, K-200

Diff lido: `b446021..675ed96` (`server/`, `packages/contratos`, `web/src`, `docs/api/apontamento.md`), mais o review `docs/reviews/063-aviso-incompleto.md` (aprovado em `46933d4`). Revisão estática: nenhum `.env` lido, nenhuma chamada ao BusinessMap, nenhum teste rodado.

**Veredito: aprovado.** Nenhum bloqueante. Uma recomendação de baixa severidade (A1), sem caminho de ataque a partir de usuário do painel.

## Delta 675ed96..27bae58 (E2.13)
Sem alteração em `server/` nem `packages/`: a postura abaixo vale como estava. O delta traz (a) o E2E do QA `e2e/tests/apontamento-incompleto-063.spec.ts` (sem segredo, token nem chamada externa na busca textual; roda contra o build mock) e o ajuste de `e2e/playwright.config.ts` (`VITE_FONTE=mock` explícito, sem dado real); (b) o merge da develop com o 060 web (PR 208, parecer próprio em `docs/security/060-web-so-real.md`) e o PR 203 (só docs). Nenhum achado novo; A1 segue recomendado.

## Gatilhos
Integração externa com credencial (cliente HTTP do BusinessMap e a lista fechada de consulta, ADR 0015), dado de pessoa na fronteira do coletor (ADR 0020), migração e GRANT por coluna (ADR 0014), contrato novo da API lido pelo navegador. Regras do `CLAUDE.md` do projeto como requisito (sem métrica individual, allow-list na fronteira). R-SEGURANCA.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/apontamento/lotes.ts:71 · Sem teto próprio de páginas: `all_pages` até 9999 vira até 9999 GETs por lote; contém o `limitePorHora` do cliente (`http.ts:217`), que interrompe a execução. Registrar isso em teste ou comentário. Dono: node-backend.

## O que foi verificado

**`page` na lista fechada (ADR 0015).** `CONSULTA_WORKLOG` ganha só `page: /^[1-9]\d{0,3}$/` (`server/src/plataforma/http.ts:79`): inteiro de 1 a 9999, ancorado, sem zero à esquerda nem sinal. A validação é por nome e regex em `montarAlvo` (`http.ts:242-246`, `Object.hasOwn` mais `.test` do valor em texto); nome fora da lista é recusado. O valor vem do laço da coleta, nunca de entrada externa, e `paginasDoWorklog` recusa `all_pages` não inteiro, negativo ou acima de `MAX_PAGINAS_CONSULTA` 9999 (`lotes.ts:42,51`), coerente com a regex. Nenhum outro parâmetro entrou (`user_ids` continua fora).

**Fronteira de pessoa e texto livre.** `CAMPOS_WORKLOG` e o tratamento dos registros (`processarFolha`) não mudaram; de `pagination` só se lê `all_pages`, descartado depois. Nenhum campo novo de pessoa ou texto livre atravessa para staging ou tabela. A cobertura grava só `card_id`, estado, coleta e data.

**Migração 0034.** Uma tabela, `estado` em ENUM fechado, `UNIQUE (card_id, estado, coleta_id)`, FK de coleta, `appendOnly` por gatilho (`0034_bm_ctl_apontamento_cobertura.ts:20,26`), sem INSERT (ADR 0014). A semeadura no coletor (`gravacao.ts:149`) é INSERT ... SELECT de dado já gravado, sem parâmetro externo e com `id_origem` filtrado a dígitos.

**GRANT por coluna.** `bm.ctl_apontamento_cobertura` para `dspd_api_apontamento` com `cobertura_sk, card_id, estado, detectado_em` (`grants.ts:25`), sem pessoa nem horas; `ctl_coleta_falha` continua fora. O `dspd_api` geral recebe a tabela pela regra de `ctl_`, sem coluna de pessoa. O coletor tem SELECT e INSERT (append-only).

**Contrato `registroIncompleto`.** Schema estrito (`packages/contratos/src/apontamento.ts`): `cardId` numérico, `titulo` até `MAX_ROTULO`, projeto no formato de `opcoes.projetos`; sem pessoa, sem horas, sem contagem de registros. A consulta (`repositorio.ts:137`) recebe período, projetos e tipos por parâmetro (`$1..$4`, arrays tipados); só o nome do esquema é interpolado, vindo da configuração. O filtro de pessoa não é aplicado ao sinal (`servico.ts:134`), então o aviso não varia por pessoa nem permite inferir quem apontou. Ordem pelo id do card.

**Aviso na aba.** Texto renderizado pelo React (escapado, sem `dangerouslySetInnerHTML`), `cardId · titulo` e projeto (`AvisoRegistroIncompleto.tsx:48`); o título do card já era exibido pela aba (decisão Q-2). Nenhum nome, hora ou ranking. Campo ausente ou total 0 não exibe nada e nunca vira "completo".

## Detalhe dos achados
A1. Evidência: `lotes.ts:71` itera até `todas`, aceita até 9999 (`lotes.ts:51`). Caminho de ataque: só uma resposta adulterada ou defeituosa do BusinessMap (fonte já confiável, TLS) faria a coleta pedir milhares de páginas; o efeito é consumo da cota de requisições, contido pelo limite por hora, que interrompe a execução sem marcar card completo. Severidade: baixa (disponibilidade da coleta). Correção mínima: comentário no laço apontando o `limitePorHora` como teto, ou teste com `all_pages` alto que confirme a interrupção. Esforço: P. Dono: node-backend. O review aceitou o mesmo desvio (desvio 2); não devolve.

## Riscos aceitos e ferramentas
Nenhum risco aceito nesta entrega. Ferramentas: `gitleaks`, `semgrep` e `osv-scanner` ausentes do PATH (lacuna registrada; as varreduras rodam no CI). Busca textual no diff por chave, token, segredo e `innerHTML`: só as chaves fictícias de teste já usadas nos dubles do cliente. Dependências não mudaram no intervalo.
