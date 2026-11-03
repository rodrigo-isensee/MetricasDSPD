---
tipo: review
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-spike-paginacao
commit: 95e1dad2e1bbe11ab103106a26ad13e104f94906
parecer: aprovado
revisor: tech-lead
data: 2026-11-03
---

# Code review: script de spike de paginação do /loggedTime (E1.9, K-200)

**Veredito: aprovado.** O script faz o que o pedido manda: 1 GET, só leitura, chave só no cabeçalho, saída reduzida a status, contagem, nomes de chave e números de paginação. Segue o padrão do diagnóstico existente (`bm-diagnostico.sh`, `lerConfig`, módulo, entrada e reexport no `index.ts`). Nenhum bloqueante.

## Achados

- A1 (recomendado) server/src/modulos/businessmap/spike-paginacao.ts:1 · O diff tem 234 linhas de código e teste (acima de 150, M14). Sem PR agora; ao abrir o PR, declarar `teto: excedido, 234 linhas, <motivo>` ou juntar ao PR da E2.1.
- A2 (recomendado) docs/architecture/adr/0025-coleta-do-worklog-businessmap.md:70 · A ADR diz que a saída tem 4 linhas, mas ela tem título, linha em branco e 4 itens (3 em erro). Ajustar o texto na revisão da ADR, sem efeito no script.

## Leitura (regras de leitura que alcançam o diff)

- Escopo: só o script de spike; não toca `.env`, não escreve no BusinessMap, sem métrica por pessoa.
- Segurança de saída: `NOME_SEGURO` filtra nomes de chave; paginação só aceita número finito; corpo e URL nunca são impressos; erro de rede e tempo esgotado usam mensagem fixa; `redirect: 'error'` impede o envio da chave a outro destino. Id de card validado por regex antes da rede; sem retentativa.
- Padrão: shell idêntico ao `bm-diagnostico.sh`; função pura `descreverForma` separada da I/O, com `fetchImpl` injetável.
- ADR 0013: a configuração vem de `lerConfig` (URL https e chave só do ambiente); o script carrega o `.env` no processo, sem exibir.
- Testes (22): 1 GET com URL e cabeçalho exatos, ausência de segredos em sucesso, 403, rede e tempo esgotado, ids inválidos antes da rede, JSON inválido, formas da resposta. Os falsos conferem a mesma regra do código.
- Critério de reversão: não se aplica; o script é descartável.

## Ferramentas (citadas)

- `pnpm --filter @metricas-dspd/server exec vitest run --maxWorkers=6 tests/spike-paginacao-businessmap`: 1 arquivo, 22 testes passaram, rc=0.
- `shellcheck scripts/bm-spike-paginacao.sh`: só SC1091 (info), sobre o `.env` não seguido; igual ao `bm-diagnostico.sh`, aceito.
- O `pronto:interno` e o parecer de segurança (E1.10) e de QA (E1.11) são de outras etapas.
