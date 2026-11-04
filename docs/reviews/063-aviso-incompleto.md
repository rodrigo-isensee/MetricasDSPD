---
tipo: review
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-aviso-incompleto
commit: 7f4a13d354c046ed49045a1abfd5b7193744b011
parecer: reprovado
revisor: tech-lead
data: 2026-11-03
---

# Code review: lote do 063 (coleta lendo todas as páginas, sinal na API e aviso na aba), E2.4

Diff lido: `b446021..7f4a13d` (back `3c3740d` mais front e parecer de interface). Parecer de interface `docs/ux/063-revisao-aviso-incompleto.md` commitado nesta ponta (K-200).

**Veredito: reprovado, por 1 achado bloqueante** (completude de consulta paginada perde a recusa com id inválido de página anterior). O resto do lote está correto.

**Ferramentas (citadas):** `vitest run --maxWorkers=2` do server: 80 arquivos passaram, 1612 testes, 232 pulados (os `.pg`; o `test:pg` e o `pronto` de `3c3740d` deram rc=0 com o dono). Do web: 92 arquivos, 1409 testes, todos passaram.

## O que foi conferido

- Paginação e completude (`lotes.ts`): pede `page=1..all_pages` com os mesmos parâmetros; só a folha da última página vem `completo: true`; `all_pages` 0 e 1 tratados; `all_pages` que muda ou some no meio vira `paginacao_instavel`, sem exclusão; falha de página deixa a consulta incompleta e não marca card. Correto, com testes de cada caso.
- `page` na lista fechada (`http.ts`): regex `[1-9]\d{0,3}` casa com `MAX_PAGINAS_CONSULTA` 9999. Correto (ADR 0015).
- Migração 0034: uma mudança, append-only por gatilho, `UNIQUE (card_id, estado, coleta_id)`, índices por card e por coleta, `down` presente, checksum e snapshot atualizados, sem INSERT (ADR 0014). Correta.
- GRANT por coluna: `ctl_apontamento_cobertura` com `cobertura_sk, card_id, estado, detectado_em`; sem pessoa nem horas. Correto.
- Contrato `registroIncompleto`: opcional, estrito, sem pessoa, sem horas, sem contagem de registros; filtros por parâmetro, sem SQL montado com valor da requisição. Correto.
- Aviso nos 3 lugares (faixa, selo, nota nos KPIs): campo ausente ou total 0 vira nada, nunca "completo". Atende a especificação.
- Desvio 1, semeadura no coletor: aceito (ADR 0014 proíbe INSERT em migração); idempotente, copia dado gravado. Desvio 2, sem teto de páginas no worklog: aceito, o limite de execução do cliente já para a coleta. Desvio 3, `ctl_` no GRANT: aceito, as colunas são explícitas.

## Achados

- A1 (bloqueante) server/src/modulos/businessmap/apontamento/coleta.ts:204 · `idsValidos` é medido por página (folha). Recusa com id inválido numa página que não é a última é esquecida: a última, limpa, marca o card em `completos` e `cobertos`. Isso abre exclusão e `completo` indevidos. Guarde o taint por consulta e teste.
- A2 (recomendado) server/src/modulos/businessmap/apontamento/coleta.ts:301 · carga inicial com `modo.inicio` mais recente que o do card entra como `janelaCheia: true` e pode marcar `completo` sem ter lido o período antigo. Só vale `janelaCheia` com `desde` igual ao início padrão da carga.
- A3 (recomendado) web/src/features/apontamento/components/AvisoRegistroIncompleto.tsx:70 · o comentário do selo diz que abre por foco, mas o `Dica` não abre por foco simples (médio 1 do UX). Corrija o comentário e o CA-4 para "ao ativar o selo"; o comentário do `Dica.tsx:7` segue a mesma linha.
- A4 (recomendado) web/src/features/apontamento/components/AvisoRegistroIncompleto.tsx:84 · o "Ir ao aviso" está fixo no JSX; leve a frase para `textos.ts`, onde ficam os demais textos do aviso.

## Delta e revalidação

Na volta, rode `forge-check delta --parecer docs/reviews/063-aviso-incompleto.md`; a correção do A1 e o teste novo bastam para aprovar. Médio 2 do UX (375 px) fica com o QA. Segurança e QA citam a ponta `7f4a13d`; se o A1 mudar o código, a ponta muda.
