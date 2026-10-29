---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: docs/052-businessmap-discovery
commit: c229eea4eec0fd26b58714fe10814622793d7b3c
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-29
---

# Review: discovery do pedido 052, integração real com o BusinessMap (E1.11, K-182)

Escopo: o discovery inteiro, da base `a6e7543` (develop) até `c229eea`, que é o commit da E1.10. São 9 arquivos, todos `.md`: o plano `docs/architecture/features/052-integracao-businessmap.md`, as ADRs 0016, 0020 e 0022, `data-model.md`, `integracao-real.md`, `businessmap-api-configuracao.md`, o modelo de ameaças `docs/security/052-integracao-businessmap-ameacas.md` e o delta de UX `docs/ux/integracao-real/06-delta-2026-10-29.md`. Não há código nem migração, então o teto da M14 não se aplica (0 linhas de código e teste).

## Contra as decisões do dono e as regras invioláveis
- Escopo "i": F6 e F6b cobrem só o painel operacional (18 do FL1, `EI_FL1` e O19 a O26). FL2, FL3, T e E seguem em mock, e Acelerato fica fora. Cumpre.
- Q-2, Q-2b e Q-2c: a F3 (recorte por estado e testes da carga), a ADR 0022 item 4 e o §7 do plano estão coerentes entre si. Q-4 e Q-5 estão no §4, no R-8 e no R-10, e a ADR 0022 item 5 traz a pendência do usuário só leitor. Q-7a/b/c estão na F6, na ADR 0022 item 1 e na N-5 do `data-model.md`. Q-8 está na ADR 0020 revisão 3, no bloco `dim_responsavel` da F3 e em DT-1 a DT-3. U-1 e U-2 estão na ADR 0016 e na F2. P-1 a P-5 estão na F6 e no delta de UX. Cumpre.
- Pessoa: os nomes ficam só em `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`, e nunca em `stg_`, log ou `ctl_coleta_falha`. Nenhuma rota, DTO ou tela é por pessoa. O spike registra só a forma, e o dado de pessoa vindo do MCP não entra em documento. A busca nas linhas adicionadas por e-mail, apikey, `ghp_` e chave privada deu 0 ocorrências.
- BusinessMap e Acelerato não se misturam, o mínimo de 20 fica na biblioteca, o staging é append-only e o cálculo passa por `packages/metricas`. A ordem WS1 → coleta → painéis está na sequência das fatias. Cumpre.
- Mecanismo novo (ADR 0022): a ADR traz alternativas e data de revisão, e a webhook fica condicionada a três fatos observáveis. Cumpre o item 10 do checklist.
- O modelo de ameaças (E1.2 e E1.7) é do `security-engineer` e foi citado, não refeito. O plano incorpora as condições dele (DT-1, casos de abuso de `dim_responsavel`, leituras por fatia na §9).

## A ressalva retirada do §8 na E1.10
A E1.10 apagou do §8 a suposição sobre `archived_from`/`discarded_from`, porque a Q-2c a tornou decisão do dono. Com a linha foi embora também a última frase: "Se o spike F1 mostrar que esses filtros não funcionam combinados com `state`, a fatia volta ao arquiteto antes do código, e a troca de filtro vai ao dono." Essa frase não era suposição. Era o caminho de volta quando uma decisão do dono não pode ser implementada como foi decidida. A F1 continua perguntando se os filtros funcionam com `state` e remete ao "(§8)", só que o §8 não fala mais disso. Hoje o plano diz o que verificar e não diz o que fazer se a verificação falhar. Quem fizer a F3 pode trocar para `last_modified_from` por inferência, e essa é justamente a troca que a Q-2c recusou. A frase precisa voltar ao plano, na F1 ou nos riscos (§6). Ver A1.

## Ferramentas
- `pnpm run docs:check` na raiz da worktree, em `c229eea` mais este parecer: `docs:check: ok (793 páginas Markdown, 69 métricas, 2 eventos).`, rc=0.
- Sem `pnpm run pronto`: não há código no diff.

## Achados
- A1 (bloqueante) docs/architecture/features/052-integracao-businessmap.md:91 · A F1 remete ao "(§8)" para saber se `archived_from` e `discarded_from` filtram junto com `state`, mas a E1.10 tirou do §8 a ressalva e o caminho de volta. O plano não diz mais que, se o filtro falhar no spike, a fatia volta ao arquiteto antes do código e a troca de filtro vai ao dono. Com isso a Q-2c pode virar `last_modified` por inferência, o que vai contra a regra "dúvida de regra de negócio vira pergunta ao dono". Correção (software-architect): pôr a frase na F1, logo depois da pergunta, ou num risco novo em §6, e trocar a referência "(§8)".
- A2 (recomendado) docs/architecture/features/052-integracao-businessmap.md:16 · O texto diz "Este documento é **proposta**: nada de E2 a E6 começa antes da validação do dono", mas o frontmatter já diz `estado: vigente` e a validação aconteceu em 2026-10-29. Sugestão: dizer que o plano foi validado e manter só a dependência da E1.4 (apikey e WS1). A linha 14 ("Decisão nova proposta: ADR 0022") tem o mesmo problema.
- A3 (recomendado) docs/architecture/adr/0016-historico-de-dimensoes-scd-tipo-2.md:131 · O bloco "Decidido pelo dono" foi inserido entre as linhas U-2 e U-3 da tabela. Isso quebra a tabela, e a linha U-3 (136) é renderizada como texto solto. Sugestão: mover o bloco para depois da linha U-3.
