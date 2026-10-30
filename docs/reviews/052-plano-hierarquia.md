---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: docs/052-plano-hierarquia
commit: 52dfb3051bcd15d5b3ccdf7992c1d6dcd9c95112
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Review: 052-integracao-businessmap (E1.24, plano revisto da hierarquia e revisão 1 da S-22)

Escopo: `11141d7516b7a71418b3ec069473e3449453fe81..52dfb3051bcd15d5b3ccdf7992c1d6dcd9c95112` (2 commits, 4 documentos, 213 linhas a mais e 38 a menos):
- `2694d42` (E1.22 e a parte do plano da E1.27): `docs/architecture/features/052-integracao-businessmap.md`, `docs/architecture/data-model.md`, `docs/integracao/businessmap-api-configuracao.md`.
- `52dfb30` (E1.27, revisão 1 da S-22): `docs/architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md`.

Lido por leitura: o diff inteiro e as seções 8 e 9 do `docs/engineering/praticas.md`. Só documentação: o teto da decisão M14 não se aplica (zero linha de código ou teste).

## Ferramentas
- `pnpm run docs:check` na worktree, antes dos commits, com os 4 arquivos já alterados: `docs:check: ok (801 páginas Markdown, 69 métricas, 2 eventos).`

## Conferência
- **Decisões do dono H-1 a H-17 e a lista de times no banco** (Histórico do pedido, 2026-10-30 16:16 a 16:53): conferem. H-1 substitui o nível por tipo da leitura da H-2 (plano §F2); H-6 em arquivo superada pela decisão de 16:44 (`ref_time`, `ref_time_workflow` no banco, sem `ref:sync`); H-6 (ii) "C" registrada como suposição com base no 057 E3 (plano §8); H-7 nos 6 workflows; H-8 a H-12, H-13 (7 fictícias), H-15, H-16 (field 36 fora, nenhuma chave cruza `dspd_bm` e `dspd_ac`) e H-17 (mapa de tipos) aplicadas nas fatias; H-14 sai pela H-13.
- **H-20 a H-26, H-4 e a lista de exceções** (19:21 e 19:33): conferem no §10 e no §11 do plano e na F3 (tarefa das 06:00 sem registro na agenda). A soma da carga inicial bate: 3 + 6 + 6 + 47 + 1 = 63 workflows de time ou fora, mais 15 de iniciativa = 78, o número do diagnóstico E1.20; a lista dos 47 tem 9 + 13 + 12 + 4 + 7 + 2.
- **Recorte de 2026-11-02:** só o painel operacional do BusinessMap (FL1 e O19 a O26) com dado real; FL2, FL3 e as complementares T e E em mock; Acelerato no pedido 056. Confere.
- **Regras invioláveis:** a tabela de times é filtro, com teste de que nenhuma view ou rota agrupa por time para comparar; BusinessMap e Acelerato não se cruzam; staging e `ref_` sem sobrescrita (vigências e T2.6 em toda mudança da tabela de times); nomes de pessoa só em `COLUNAS_PESSOA` (ADR 0020 revisão 3); `registrado_por` fora da API (proposta, forma final no 057 E1.3); dúvidas viraram perguntas ao dono (§11, todas respondidas). Conforme.
- **Nome de pessoa e endereço de servidor:** nenhum no diff (busca por URL, IP, `localhost` e arroba nas linhas novas sem resultado; quadros e workflows citados pelo id e por nome de time ou de projeto).
- **ADR 0015 contra o código da F0** (`feature/052-f0-fundacoes`, `server/src/plataforma/http.ts`): confere. O cliente importa só `zod`; `fetchImpl` injetável com `fetch` nativo como padrão; janela móvel de 60 s (`JANELA_MS`); `AbortSignal.timeout`; `redirect: 'manual'`; 429 por `retry_after`; 401 e 403 interrompem. A revisão traz motivo, alcance (só BusinessMap) e critério de reversão com fato observável. Falta só a linha do "Não adotar" (A1).

## Achados
- A1 (bloqueante) docs/architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md:50 · O "Não adotar" ainda diz que axios está coberto "pelo ky", o que contradiz a Revisão 1 (linha 108) e o código da F0; trocar a cobertura do axios pelo fetch nativo do Node 24.
- A2 (recomendado) docs/integracao/businessmap-api-configuracao.md:140 · O item 8 do roteiro ainda diz "polling agora (coleta diária às 06:00)"; pela H-20 = C a coleta roda por comando até nova liberação. Ajustar o texto.
- A3 (recomendado) docs/architecture/features/052-integracao-businessmap.md:195 · Com a coleta por comando (H-20 = C), o selo vira "Atrasado" todo dia em que o dono não rodar a coleta antes das 12:00, e o R-10 (linha 232) ainda supõe a tarefa das 06:00; registrar a consequência como risco.
- A4 (recomendado) docs/architecture/data-model.md:121 · O domínio de `papel` da `ref_coluna` lista backlog, compromisso, trabalho e entrega e não traz `homologacao` da H-26, que o plano aplica na F2 (linha 148); acrescentar ao data-model.
- A5 (recomendado) docs/architecture/features/052-integracao-businessmap.md:338 · O texto da pergunta da H-26 (opções A, B e C sobre homologação) está no item da lista de exceções, e o item da H-26 (linha 337) ficou sem a pergunta; mover o texto para a H-26.

## Parecer
**Reprovado** pelo A1: a correção é uma linha da ADR 0015 e volta ao software-architect na worktree 052. A2 a A5 são recomendações: não devolvem sozinhas, e cabem na mesma volta se o arquiteto quiser. Na revalidação, leio só o delta que o `forge-check delta` listar. O PR da F0 segue esperando este (A2 do review da F0).
