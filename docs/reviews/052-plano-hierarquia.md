---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: docs/052-plano-hierarquia
commit: 485df6afa3c28bb99053b3f42878526f2fb694e9
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Review: 052-integracao-businessmap (E1.24 e revalidação E1.29, plano revisto da hierarquia e revisão 1 da S-22)

Escopo: `11141d7516b7a71418b3ec069473e3449453fe81..52dfb3051bcd15d5b3ccdf7992c1d6dcd9c95112` (2 commits, 4 documentos, 213 linhas a mais e 38 a menos):
- `2694d42` (E1.22 e a parte do plano da E1.27): `docs/architecture/features/052-integracao-businessmap.md`, `docs/architecture/data-model.md`, `docs/integracao/businessmap-api-configuracao.md`.
- `52dfb30` (E1.27, revisão 1 da S-22): `docs/architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md`.

Lido por leitura: o diff inteiro e as seções 8 e 9 do `docs/engineering/praticas.md`. Só documentação: o teto da decisão M14 não se aplica (zero linha de código ou teste).

## Ferramentas
- `pnpm run docs:check` na worktree, antes dos commits, com os 4 arquivos já alterados: `docs:check: ok (801 páginas Markdown, 69 métricas, 2 eventos).`
- Revalidação (E1.29), sobre `485df6a` com este parecer revisado: `docs:check: ok (802 páginas Markdown, 69 métricas, 2 eventos).` `forge-check docs` sem apontamento neste parecer.

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
- A6 (recomendado) docs/integracao/businessmap-api-configuracao.md:100 · O requisito de rede do webhook ainda diz "suficiente: coleta diária às 06:00"; pela H-20 = C a coleta é por comando até nova liberação. Ajustar na próxima passada do documento.

## Revalidação (E1.29, volta 1)
Delta lido (`forge-check delta --parecer`, intervalo `52dfb30..485df6a`, commit `485df6a` da E1.28): ADR 0015 linhas 50, 106 e 114; data-model linha 121; plano linhas 195, 232 e 337-338; roteiro de configuração linha 140. Já lido na rodada anterior e fora do delta: o resto dos 4 documentos.

- **A1 resolvido:** linha 50 da ADR 0015 cobre o `axios` pelo `fetch` nativo do Node 24 (revisão 1); coerente com a linha 108 e com a S-22.
- **A2 resolvido:** item 8 do roteiro (linha 140) traz o polling por comando até nova liberação (H-20 = C), com remissão ao plano F3.
- **A3 resolvido:** linha 195 registra o selo "Atrasado" nos dias sem coleta por comando, e o R-10 (linha 232) deixa de supor a tarefa das 06:00; mudar a regra do selo fica com o dono.
- **A4 resolvido:** domínio de `papel` na linha 121 do data-model com `homologacao` (H-26 = A) e `NULL`.
- **A5 resolvido:** texto da pergunta da H-26 de volta ao item da H-26; a lista de exceções traz o próprio conteúdo (§10, H-22, conferência pela H-8).
- **Pedido da segurança da F0 (ffa261f, item "Troca de ky e p-throttle"):** atendido na linha 106 da ADR 0015; qualquer volta a biblioteca exige redirect não seguido e erro sem `cause`, e a linha 114 cita o parecer como evidência. Confere com o texto do parecer de segurança.
- **Linha 100 do roteiro de configuração (decisão pedida no brief):** fora do delta e não corrigida; vira A6, recomendado: é texto condicional sobre o webhook (que fica para a F7), não muda regra nem código do recorte, e não devolve a entrega.

`pnpm run docs:check` na worktree, com o parecer revisado: ver Ferramentas.

## Parecer
**Aprovado** na revalidação (E1.29): A1 a A5 resolvidos no commit `485df6a` e o pedido da segurança da F0 registrado no critério de reversão da ADR 0015. A6 é recomendação para a próxima passada do roteiro de configuração e não devolve. Segue para o QA (E1.25). O PR da F0 deixa de esperar este parecer quanto ao A1 (A2 do review da F0).

Rodada anterior (E1.24, commit `52dfb30`): reprovado pelo A1.
