---
tipo: review
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-aviso-incompleto
commit: 46933d4ed5baa08d1c5010c81742f4babfbdad74
parecer: aprovado
revisor: tech-lead
data: 2026-11-04
---

# Code review: lote do 063 (coleta lendo todas as páginas, sinal na API e aviso na aba), E2.4

Diff lido: `b446021..7f4a13d` (back `3c3740d` mais front e parecer de interface). Parecer de interface `docs/ux/063-revisao-aviso-incompleto.md` commitado nesta ponta (K-200).

**Veredito (volta 1, ponta `46933d4`): aprovado.** O A1 bloqueante foi corrigido com teste; A2, A3 e A4 atendidos. Na rodada 1 (`7f4a13d`) o veredito foi reprovado pelo A1.

**Ferramentas (citadas, rodada 1):** `vitest run --maxWorkers=2` do server: 80 arquivos passaram, 1612 testes, 232 pulados (os `.pg`; o `test:pg` e o `pronto` de `3c3740d` deram rc=0 com o dono). Do web: 92 arquivos, 1409 testes, todos passaram.

## O que foi conferido

- Paginação e completude (`lotes.ts`): pede `page=1..all_pages` com os mesmos parâmetros; só a folha da última página vem `completo: true`; `all_pages` 0 e 1 tratados; `all_pages` que muda ou some no meio vira `paginacao_instavel`, sem exclusão; falha de página deixa a consulta incompleta e não marca card. Correto, com testes de cada caso.
- `page` na lista fechada (`http.ts`): regex `[1-9]\d{0,3}` casa com `MAX_PAGINAS_CONSULTA` 9999. Correto (ADR 0015).
- Migração 0034: uma mudança, append-only por gatilho, `UNIQUE (card_id, estado, coleta_id)`, índices por card e por coleta, `down` presente, checksum e snapshot atualizados, sem INSERT (ADR 0014). Correta.
- GRANT por coluna: `ctl_apontamento_cobertura` com `cobertura_sk, card_id, estado, detectado_em`; sem pessoa nem horas. Correto.
- Contrato `registroIncompleto`: opcional, estrito, sem pessoa, sem horas, sem contagem de registros; filtros por parâmetro, sem SQL montado com valor da requisição. Correto.
- Aviso nos 3 lugares (faixa, selo, nota nos KPIs): campo ausente ou total 0 vira nada, nunca "completo". Atende a especificação.
- Desvio 1, semeadura no coletor: aceito (ADR 0014 proíbe INSERT em migração); idempotente, copia dado gravado. Desvio 2, sem teto de páginas no worklog: aceito, o limite de execução do cliente já para a coleta. Desvio 3, `ctl_` no GRANT: aceito, as colunas são explícitas.

## Achados

- A1 (bloqueante) server/src/modulos/businessmap/apontamento/coleta.ts:206 · Resolvido em 48de420. `idsValidos` era medido por página: recusa com id inválido em página anterior era esquecida e a última, limpa, marcava o card completo e coberto. Agora `consultaSuja` vale por consulta, com teste.
- A2 (recomendado) server/src/modulos/businessmap/apontamento/coleta.ts:305 · Resolvido em 48de420. Carga inicial com início mais recente que o padrão virava janela cheia; agora só com `desde` menor ou igual ao início padrão. Concordo com o menor ou igual (ver Delta).
- A3 (recomendado) web/src/features/apontamento/components/AvisoRegistroIncompleto.tsx:63 · Resolvido em 46933d4. Os comentários do selo e do `Dica.tsx:6` dizem que abre ao ativar, não por foco simples. O CA-4 da especificação segue na branch de docs (E2.10).
- A4 (recomendado) web/src/features/apontamento/components/AvisoRegistroIncompleto.tsx:92 · Resolvido em 46933d4. "Ir ao aviso" foi para `INCOMPLETO.irAoAviso` (`textos.ts:315`); o teste busca o link pelo nome.

## Delta e revalidação

Rodada 1: diff `b446021..7f4a13d`, reprovado pelo A1.

Volta 1: `forge-check delta --parecer docs/reviews/063-aviso-incompleto.md` listou `7f4a13d..46933d4`: `coleta.ts` 127-128, 206-207, 304-305, 332 e 343; `apontamento-paginas.test.ts` 254-272; `Dica.tsx` 6-7; `aviso-incompleto.test.tsx` 128; `AvisoRegistroIncompleto.tsx` 63 e 92; `textos.ts` 315. Li só esses trechos, mais `lerLote` (`lotes.ts:61-80`) para conferir onde a consulta começa. O resto do lote fica como já lido na rodada 1.

- Correção do A1: `consultaSuja` volta a falso antes de cada `lerLote` (`coleta.ts:343`) e vira verdadeiro com qualquer recusa de id inválido em qualquer página. Quando `lerLote` divide o lote por `limite-bytes`, as metades herdam a marca: fica mais conservador (card incompleto a mais), nunca completo indevido. Aceito. O teste novo põe o id inválido na página 1 com a última limpa e confere zero exclusões e cobertura sem `completo`.
- Menor ou igual do A2: concordo com a DECISÃO TÉCNICA do Jarvis. Início igual ou anterior ao padrão de 12 meses lê a janela inteira, e a retomada da carga em outro dia recalcula o padrão a partir de `hoje`; com igualdade, a retomada perderia a janela cheia sem motivo. A comparação de texto vale porque `desde` é `AAAA-MM-DD` (regex em `comando.ts` e em `ParametrosCarga`). O teste cobre o início recente e o padrão.
- Ferramentas: não rodei vitest, test:pg nem pronto nesta volta (o dono roda test:pg e pronto na ponta `46933d4`); o react-frontend relatou o vitest do web rc=0. Médio 2 do UX (375 px) fica com o QA. Segurança e QA citam a ponta `46933d4`.
