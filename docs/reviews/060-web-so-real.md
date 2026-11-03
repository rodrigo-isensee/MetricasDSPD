---
tipo: review
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: bd6d6f239916c31e2e90b31870c76ddc4c819c38
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-03
---
# Review: 060-triagem-dependabot, branch do web com dado real (P4 e a parte de web do P5) (E2.20, K-195)

**Veredito: aprovado em `bd6d6f2`.** Sem bloqueante. Li o diff `b446021..bd6d6f2` (35 arquivos) contra as seções P4 e P5 de `060-sem-mock.md` e o parágrafo "Estado sem dado real" de `docs/api/metricas.md`.

## O que li e concluí
- **Contrato sem-dado-real:** `HttpFonteMetricas.ts` aceita `semDadoRealSchema.or(schema)` e lança `SemDadoRealErro` (motivo e métrica), sem resultado no cache. Resposta `sem-dado-real` com motivo vazio é recusada pelo schema e vira `ErroApi`, não estado. `useMetrica.ts` converte em `sem-dado-real`, que é distinto de `erro` (sem "Tentar de novo").
- **Padrão api e mock só explícito:** `App.tsx:38` usa `api` por padrão; valor inválido falha na partida. O mock exige `VITE_FONTE=mock` no Dockerfile (`ARG VITE_FONTE=api`), no compose de homologação (build arg declarado, decisão Q3), no E2E `@mock` e nos testes. `useModoMock` só vale com a fonte mock, então `?mock=` é ignorado contra a API.
- **Estado no painel:** `EstadoSemDadoReal` tem ícone e texto, sem número, percentil nem histograma. O cartão mostra o motivo da API, ou o genérico do contrato. A faixa de atenção nunca diz "nada pede atenção" sem dado. A nota do cabeçalho conta "N cartões sem dado real". A Visão Geral e o Resumo têm o estado próprio.
- **PDF:** `gerar.ts` captura só `SemDadoRealErro` e sai com bloco "Sem dado real" e motivo, sem número. A Visão Geral sai em duas partes, BusinessMap e Acelerato, sem total geral, como o dono decidiu (P3). Outro erro continua subindo.
- **Testes:** conferi `HttpFonteMetricas.test.ts`, `composicao.test.tsx` e `gerar.test.ts`: 38 de 38 verdes (2 workers). O resto (origem, componentes, apontamento) li no diff. Pronto completo: rodada do dono em `eb4d636`, rc=0; a volta `bd6d6f2` só mexe em docs.
- **Fora do alvo:** Docker e compose têm parecer de devops e de segurança próprios (E2.33 e E2.34), que não refaço.

## Ferramentas e teto
- O `praticas.md` não tem regra por comando que eu possa citar; sem pendência nova.
- Decisão M14: `git diff --numstat --no-renames b446021..bd6d6f2`, sem `.md`, dá **375 linhas** (código e teste). O PR (E2.23) precisa levar no corpo `teto: excedido, <n> linhas, <motivo>`, recontado na abertura; o motivo é que o tipo de estado, o cartão, o Resumo e o PDF não se separam sem quebrar o build. Sem a linha, é bloqueante.

## Nota na `docs/security/041-estabilidade.md:24`
A volta 1 acrescentou "(Nota 060: ...)" num parecer de segurança antigo e datado. Parecer é do `security-engineer` e descreve o estado da época; a nota o torna um híbrido. Recomendo que saia, e que a correção de "o padrão agora é api" fique em doc vivo (`front-via-api.md`, já ajustado). A decisão final é do `security-engineer` (E2.34).

## Achados
- A1 (recomendado) docs/security/041-estabilidade.md:24 · Nota 060 acrescentada em parecer de segurança histórico, que é do security-engineer. Sugestão: reverter a linha ao texto original; o estado atual já está em front-via-api.md.
- A2 (recomendado) web/src/features/exportar/modelo.ts:108 · O comentário de semDadoReal está colado na linha de `tabela` (`tabela: TabelaBloco | null /** ... */`). Sugestão: pôr o campo e o comentário em linhas próprias, junto da próxima mudança.
- A3 (recomendado) PR da branch · 375 linhas de código e teste, acima do teto de 150. Sugestão: a abertura do PR leva a linha `teto: excedido, 375 linhas, <motivo>`; sem ela vira bloqueante.

## Parecer
Aprovado em `bd6d6f2`. O contrato sem-dado-real é seguido de ponta a ponta, o mock só liga por escolha explícita e o PDF não leva número sem fonte. A1 a A3 são recomendações e não devolvem.
