---
tipo: review
contrato: 1
pedido: 078-release-noite-2026-11-07
branch: docs/078-release
commit: 8548bc178522c910637a591b5a7cb2b5c30b797d
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-10
---
# Review: 078-release (K-242)

## Parecer
Aprovado. A release é a `develop` em `4388083c` (43 commits, PRs 238 a 280) contra a `homolog`; a branch só acrescenta o CHANGELOG (14 linhas) e este parecer.

- **Reviews:** todo PR da lista tem parecer de review em `docs/reviews/` (069 L9-c zz4 a zz7, 073, 075 L1 a L6, 077 L1 a L8, 079, 080, 081, 083, 085). Sem parecer próprio ficam só os PRs de versão do Forge (#239, #250, #271, #275, cobertos pelo `chore-forge-0442`) e os dois do Dependabot (#255, #256, com a segurança em `073-dependabot-triagem` e `082-conflito-pr-256`). Cada PR entrou na `develop` por squash com o número no título; a conferência de CI foi pela história (PR mesclado), não repeti o portão.
- **Migração:** uma só, `0035_ac_previsao_retorno_booleano` (L9-c). A guarda recusa a troca sem alterar nada se houver valor em `previsao_retorno`; `NULLIF` mantém as linhas nulas; as três views são recriadas com a definição da 0009; o `down` só volta o tipo com a coluna toda nula. Ordem coerente para a homolog: aplicar a 0035 antes de qualquer coleta do Acelerato com o código novo.
- **Primeira coleta do Acelerato:** o `fluxo_sha256` entrou em `CHAVES_COMPARADAS` (`controle.ts`); a coleta anterior sem a chave recusa com `parametros-mudaram` até `pnpm coleta ac --reconhecer-mudanca` (`server/src/entradas/coleta.ts`). Está no CHANGELOG, em "Mudanças que quebram", como passo do operador.
- **Interruptores:** `BLOQUEIOS_COM_DADO_REAL = false` e `AJUSTE_PRIORIDADE_COM_FONTE = false` em `packages/contratos/src/origem.ts:53` e `:58`, e o `servico.ts` só os lê. Seguem desligados.
- **CHANGELOG:** segue o formato da `[Não publicado]` (Adicionado, Corrigido, Mudanças que quebram, Mudanças de critério, Dependências e Forge); a linha "Sem migração" foi trocada pela 0035.

Não rodei a suíte (é do QA e do CI) e não toquei na base real.

## Achados
- A1 (recomendado) CHANGELOG.md:35 · a ordem de aplicação da 0035 (antes da primeira coleta do Acelerato com o código novo) fica só neste parecer; ponha-a no roteiro da migração para a VM oficial.
- A2 (recomendado) CHANGELOG.md:50 · o push informou 6 vulnerabilidades abertas na `develop` (2 altas, 4 moderadas) no Dependabot; confira com a segurança se entram na triagem do 073 antes da main.
