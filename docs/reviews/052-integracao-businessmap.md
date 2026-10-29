---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: docs/052-businessmap-discovery
commit: 052a13469b88cab1c9683cf39284a416b5ff61bd
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-29
---

# Review: discovery do pedido 052, integração real com o BusinessMap (E1.11 e E1.13, K-182)

Escopo: o discovery inteiro, da base `a6e7543` (develop) até `c229eea`, que é o commit da E1.10. São 9 arquivos, todos `.md`: o plano `docs/architecture/features/052-integracao-businessmap.md`, as ADRs 0016, 0020 e 0022, `data-model.md`, `integracao-real.md`, `businessmap-api-configuracao.md`, o modelo de ameaças `docs/security/052-integracao-businessmap-ameacas.md` e o delta de UX `docs/ux/integracao-real/06-delta-2026-10-29.md`. Não há código nem migração, então o teto da M14 não se aplica (0 linhas de código e teste).

## Contra as decisões do dono e as regras invioláveis
- Escopo "i": F6 e F6b cobrem só o painel operacional (18 do FL1, `EI_FL1` e O19 a O26). FL2, FL3, T e E seguem em mock, e Acelerato fica fora. Cumpre.
- Q-2, Q-2b e Q-2c: a F3 (recorte por estado e testes da carga), a ADR 0022 item 4 e o §7 do plano estão coerentes entre si. Q-4 e Q-5 estão no §4, no R-8 e no R-10, e a ADR 0022 item 5 traz a pendência do usuário só leitor. Q-7a/b/c estão na F6, na ADR 0022 item 1 e na N-5 do `data-model.md`. Q-8 está na ADR 0020 revisão 3, no bloco `dim_responsavel` da F3 e em DT-1 a DT-3. U-1 e U-2 estão na ADR 0016 e na F2. P-1 a P-5 estão na F6 e no delta de UX. Cumpre.
- Pessoa: os nomes ficam só em `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`, e nunca em `stg_`, log ou `ctl_coleta_falha`. Nenhuma rota, DTO ou tela é por pessoa. O spike registra só a forma, e o dado de pessoa vindo do MCP não entra em documento. A busca nas linhas adicionadas por e-mail, apikey, `ghp_` e chave privada deu 0 ocorrências.
- BusinessMap e Acelerato não se misturam, o mínimo de 20 fica na biblioteca, o staging é append-only e o cálculo passa por `packages/metricas`. A ordem WS1 → coleta → painéis está na sequência das fatias. Cumpre.
- Mecanismo novo (ADR 0022): a ADR traz alternativas e data de revisão, e a webhook fica condicionada a três fatos observáveis. Cumpre o item 10 do checklist.
- O modelo de ameaças (E1.2 e E1.7) é do `security-engineer` e foi citado, não refeito. O plano incorpora as condições dele (DT-1, casos de abuso de `dim_responsavel`, leituras por fatia na §9).

## A ressalva retirada do §8 na E1.10
A E1.10 apagou do §8 a suposição sobre `archived_from`/`discarded_from`, porque a Q-2c a tornou decisão do dono. Com a linha foi embora também a última frase: "Se o spike F1 mostrar que esses filtros não funcionam combinados com `state`, a fatia volta ao arquiteto antes do código, e a troca de filtro vai ao dono." Essa frase não era suposição. Era o caminho de volta quando uma decisão do dono não pode ser implementada como foi decidida. A F1 continua perguntando se os filtros funcionam com `state` e remete ao "(§8)", só que o §8 não fala mais disso. Hoje o plano diz o que verificar e não diz o que fazer se a verificação falhar. Quem fizer a F3 pode trocar para `last_modified_from` por inferência, e essa é justamente a troca que a Q-2c recusou. A frase precisa voltar ao plano, na F1 ou nos riscos (§6). Esse foi o A1 da primeira rodada, em `c229eea`, e está resolvido na revalidação abaixo.

## Primeira rodada (c229eea): achados que voltaram
O parecer foi reprovado por um achado bloqueante e dois recomendados, todos atribuídos ao software-architect:
- A1 (bloqueante, plano, linha 91): a F1 remetia ao "(§8)", mas a ressalva e o caminho de volta tinham saído de lá.
- A2 (recomendado, plano, linhas 14 e 16): o texto ainda chamava o plano de "proposta", embora ele já estivesse validado e com `estado: vigente`.
- A3 (recomendado, ADR 0016, linha 131): o bloco "Decidido pelo dono" estava entre as linhas U-2 e U-3 e quebrava a tabela.

## Revalidação (E1.13): correção da E1.12 em 052a134
Li só o delta que o `forge-check delta --parecer` listou para `c229eea..052a134`: no plano, as linhas 14, 16 e 91; na ADR 0016, as linhas 130 e 136. O resto dos 9 arquivos não mudou e conta como já lido na primeira rodada.
- A1 resolvido. A ressalva voltou à F1 (plano, linha 91), logo depois da pergunta sobre `archived_from` e `discarded_from` com `state`: se o spike mostrar que os filtros falham, a fatia volta ao arquiteto antes do código e a troca de filtro vai ao dono. A referência "(§8)" saiu. O plano ainda cita um "§8" na linha 165, mas é o §8 do roteiro, dentro do R-8, e não tem relação com esse ponto.
- A2 resolvido. As linhas 14 e 16 agora dizem "Decisão nova: ADR 0022" e "Este plano foi validado pelo dono em 2026-10-29", e a dependência da E1.4 continua lá. O texto bate com `estado: vigente`.
- A3 resolvido. A linha U-3 voltou à tabela, logo depois da U-2, e o bloco "Decidido pelo dono" vem depois da tabela, que é renderizada inteira.
- O delta não trouxe achado novo. O que o dono decidiu (Q-2c, U-1, U-2) continua igual: mudaram só a posição e a redação.

## Ferramentas
- Primeira rodada, `pnpm run docs:check` em `c229eea`: `docs:check: ok (793 páginas Markdown, 69 métricas, 2 eventos).`, rc=0.
- Revalidação, `pnpm run docs:check` em `052a134` mais este parecer: `docs:check: ok (793 páginas Markdown, 69 métricas, 2 eventos).`, rc=0.
- Sem `pnpm run pronto`: o diff não tem código.

## Achados
