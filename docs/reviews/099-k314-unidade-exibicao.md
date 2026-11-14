---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: docs/099-k314-unidade-exibicao
commit: de9622a65c3f91a23b53745393e3ddf68698e8ad
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: plano técnico do K-314, unidade de exibição de cada prazo do S1 (E3.178)

Objeto: `docs/architecture/features/099-k314-unidade-exibicao.md` (E3.177, software-architect), commitado em de9622a6 sobre a `develop` 699af53e. Só documento: sem código, sem suíte a citar.

## Achados
- A1 (recomendado) docs/architecture/features/099-k314-unidade-exibicao.md:128 · sem dono a tabela J2 de `docs/ux/dashboard-metricas/especificacao.md:685-693` (P1 "0,25 h úteis", "nunca minutos"), contrária à Q-099-11; dar ao ux-designer antes do merge do F1.
- A2 (recomendado) docs/architecture/features/099-k314-unidade-exibicao.md:136 · o F1 não lista `web/src/features/sustentacao/notas.ts:9` ("Tempo útil"), falso nos 3 prazos corridos; incluir no F1 ou dar ao UX.

## Sondas

## Conferências
- **Q-099-11 (DECISÃO DO DONO 2026-11-12 07:55, "A"):** cumprida. Cada prazo na unidade escrita no PROC, derivada do `texto_proc` versionado (`docs/architecture/fontes/acelerato-alvos.json:12-33`); os 10 textos de hoje casam com a expressão do §3.1 e as quantidades batem em duas casas (15/60, 30/60, 2, 4, 8, 17,6, 44, 8,8, 88; `10 × 8,8` arredonda para 88). Relógio continua em `unidade_pa`/`unidade_r` (0036).
- **Histórico nunca sobrescrito:** colunas novas nulas, sem DEFAULT nem backfill; mudança só de exibição fecha a vigência (`UPDATE (vigente_ate)`, único UPDATE que o `dspd_ref` tem, `grants.ts:116-117`) e abre outra. O `down` que descarta as colunas é aceitável: o dado se reconstrói do `texto_proc` no histórico do arquivo e não altera número de cálculo.
- **Biblioteca T2.5:** o S1 só repassa `exibirEm`; alvo, estatística, razões e status ficam em horas no `packages/metricas`. A web converte por `horasPorDiaUtil` do resultado, sem conta de percentil nem comparação com o alvo.
- **Decisão técnica 1, sem versão de critério (T2.6) quando só a exibição muda: confirmada.** A regra inviolável fala de critério de cálculo; nenhum número muda. A versão exigida pela Q-099-11 (afeta S1) já está no arquivo (`versao_criterio`, versão 2, D3/D3b). A separação `mudouCriterio`/`mudouExibicao` mantém a guarda de vigência para os dois e a de data da versão só para critério; o QA tem o mutante "registrar versão em `mudouExibicao`".
- **Decisão técnica 2, célula com `exibirEm` nulo em horas com o rótulo do relógio: confirmada.** Não infere unidade (alternativa c recusada com razão) e não volta à J2; o texto exato fica com o UX (§7.2), sem pergunta ao dono.
- **Migração 0037 livre:** `git ls-tree --name-only <ref> server/migrations/` nas 123 refs de `origin` (fetch de 2026-11-13, `origin/develop` = 699af53e) e em todas as branches locais: nenhum arquivo `0037`–`004x`; nenhuma das 21 worktrees tem `0037` sem commit. A última na `develop` é `0036_ac_alvo_prioridade_unidade.ts`. Reconferir antes do merge do B1 (§3.2 já manda).
- **Modelagem:** nomes `snake_case` no padrão da 0036 (`exibir_pa`, `exibir_r`), enum por CHECK, par preenchido junto e "dia corrido" recusado no banco. Sem índice novo (coluna não filtra consulta). Sem GRANT novo, sem dado de pessoa; `texto_proc` continua fora da base.
- **Divisão B1 → segurança, review e QA do B1 → F1:** certa. O F1 depende do campo `exibirEm` no contrato e do PR 399 mesclado; o QA prepara casos em paralelo ao B1; gatilho `banco` pede o `security-engineer` no B1. Fora os itens A1 e A2.
- **Referências de código do plano conferidas:** `formatar.ts:13-19` (J2), `schemas.ts:618-636` (comentário da linha 635 desatualizado), `sustentacao.test.tsx:19-26`, quatro usos de `fmtTempoPrioridade` só no `CartaoS1.tsx` (28, 58, 105, 142), `textoSeguro(80)` em `alvos-acelerato.ts:34`, guardas `hoje <= ultima` e `hoje < ultimaVersao` em `alvos-acelerato.ts:101-109`.
- **Critério de reversão e "Por que o existente não basta":** presentes (§8, §6), com sinal observável.

## Parecer
Aprovado sobre de9622a6. O plano segue a Q-099-11 e as regras do `CLAUDE.md`; as duas decisões técnicas estão confirmadas; 0037 está livre hoje. A1 e A2 são recomendados (donos de texto fora do plano) e não impedem o B1.
