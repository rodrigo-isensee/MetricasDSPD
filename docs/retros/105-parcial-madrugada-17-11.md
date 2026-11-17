# Retrospectiva parcial do pedido 105 — madrugada de 17/11 (03:00 a 06:45)

Escopo: E7.475. Parcial (a do pedido inteiro fica para o fechamento). Fonte: `## Histórico` do pedido 105 (linhas de 2026-11-17 03:05 a 06:41) e as linhas "Melhoria vista" dos agentes. Cartões do período: K-385, Táticas (inventário), K-375, K-366, K-373, K-378, K-399, K-400. Sem regra nova; tudo abaixo é candidata (R-DECISAO). Processo, não pessoas.

## 1. Dados do período (marca de R-DECISAO)
- Briefs selados: 29. `medido`: `grep -c 'brief selado'` nas linhas do Histórico de 03:05 em diante.
- `ERRO-JARVIS:` no Histórico: 2 linhas (K-375 às 04:44, K-373 às 05:24). Um terceiro (brief de merge do K-399 sem o commit esperado da worktree) veio na delegação desta etapa e não achei linha própria no Histórico até 06:41: contado como 3 por informação do Jarvis, `estimado`. Contagem oficial por classe (`forge-check conferencia classes`) `não medido`.
- Entregas mescladas na develop no período: #526 (K-385), #528 (K-373), #529 (K-378) `medido` no Histórico; #527 (K-366, cde162fd) visto no `git log` da base. K-399 (#530) e K-400 sem merge até 06:41.
- Voltas: K-400 teve 1 volta (A1 de review, QA e UX no mesmo ponto: div mt-2 vazio com n = 0; revalidado 06:40 e 06:41). K-399 teve 1 integração da develop sem invalidar parecer (`parecer delta`, 06:29). K-375 sem entrega (já estava na develop). `medido` pelo Histórico.
- Lead time, cycle time, DORA e retrabalho em %: `não medido` (pedido por etapas E7.x; amostra de cartões do período abaixo de 20; sem `gh pr list` rodado). Dado ausente não vira zero.
- `forge-placar`: sem dado na janela [2026-11-10, 2026-11-17) nesta worktree (vereditos=0, delegacoes=0). `resumo: os erros de forma do time: sem dado para comparar; os defeitos que escaparam: sem dado para comparar`. `forge-placar propostas` falhou: "a tabela de melhorias.md não tem as colunas: critério de reversão" (a tabela de docs/kanban/melhorias.md está fora do formato esperado).

## 2. O que funcionou
- Pareceres de UX, review e QA em paralelo apontaram o mesmo defeito do K-400 (div vazio com n = 0) e geraram uma volta única, em vez de três.
- Triagem por Explore (04:50) separou 16 recomendados já resolvidos de 5 que valiam, evitando 16 briefs.
- Inventário das Táticas (04:42) separou pronta, parcial esperando o dono e bloqueada por dado, com a lista levada ao assistente.
- `parecer delta` (06:29) manteve os pareceres do K-399 após a integração da develop.
- Vermelho provado nas aprovações do QA e do review (K-366, K-373, K-378, K-399, K-400).

## 3. O que atrapalhou (fatos)
- K-375 delegado com a correção já na develop desde o #489 (04:44): um agente gasto sem entrega. Faltou `git log -S` antes de selar.
- Brief do K-373 declarou `ui/` e `data/`; o conserto exigia `web/src/features`: conferência "não cumpriu só por escopo" (05:24). Repete o padrão da parcial anterior (pastas à mão).
- K-399 sobre a branch do K-373: conferência "só por escopo" de novo (arquivos herdados da base) e conflito add/add no teste ao mesclar o K-373 antes (06:14).
- Parecer de UX gravado depois do review fica sem commit (K-366, K-373, K-378, K-399, K-400): precisa de passo extra do tech-lead em cada cartão.
- Brief de merge do K-399 sem o commit esperado da worktree (informado na delegação).
- 3 testes instáveis sob carga no QA do K-366 (passam sozinhos); custo `não medido`.

## 4. Causa nova (no máximo 1; sem abrir proposta)
Causa escolhida: a declaração de arquivos e o estado da base são montados à mão no brief (ERRO-JARVIS K-375, K-373 e o do K-399), e a conferência só pega isso depois da entrega. Não abro proposta: `forge-placar propostas` falhou por formato da tabela, então a vaga (0 abertas) não é verificável; a parcial anterior contou 12 abertas. Antes de qualquer proposta: corrigir/confirmar o formato de `melhorias.md` (ação do coach, medida: `forge-placar propostas` rc=0).

Prevenção dos ERRO-JARVIS (dado, não regra):
| Erro | Prevenção |
|---|---|
| K-375 delegado já na develop | `eval/trava:` brief de achado confere `git log -S` na base; candidata, sem eval hoje |
| arquivos do K-373 estreitos | sem trava possível hoje; candidata F6 da parcial anterior (pastas padrão no gerador) |
| brief de merge do K-399 sem commit da worktree | candidata F4 anterior (conferência por comando de commit alcançável) |

## 5. Melhoria vista (candidatas; R-DECISAO)
| # | Candidata | Evidência | Como medir | Classe |
|---|---|---|---|---|
| M1 | `forge-check docs` aceitar "Nenhum." em Achados e existir `_modelo.md` | Melhoria vista dos agentes (madrugada) | docs recusados por forma, alvo 0 | código (Forge) |
| M2 | `forge-testes` no PATH | idem | execuções por caminho completo, alvo 0 | código (Forge) |
| M3 | hook aceitar `rc=$?` | idem | comandos recusados pelo hook por essa forma, alvo 0 | código (Forge) |
| M4 | parecer de UX gravado depois do review sem commit: gravar a UX antes do review ou commitar junto | 5 cartões, 05:07 a 06:12 | cartões com passo extra de commit de UX, alvo 0 | texto, com métrica |
| M5 | `git log -S` na base antes de selar brief de achado (K-375) | Histórico 04:44 | ERRO-JARVIS classe base já entregue, alvo 0 | código |

Classificação: M1 a M3 e M5 fábrica (PR no Forge via tech-lead); M4 fábrica, ordem do fluxo. Nenhuma implementada.

## 6. Pendências e limites
- Não rodados: `forge-check metricas`, `esperas`, `transcricao custo`/`avisos`, `conferencia classes`, DORA por `gh pr list`.
- Decisões do dono com `versão:` nomeada: não conferidas nesta parcial; ficam para o fechamento.
- `forge-check proximo` excedeu 120 s e foi para segundo plano; não usei seu resultado.
- O modelo `105-parcial-noite-16-11.md` não está na worktree (não commitado na base); li do checkout principal.

Melhoria vista: o brief é montado à mão sobre estado da base e declara pastas à mão (K-375 já na develop, K-373 estreito, K-399 sem commit esperado, 3 ERRO-JARVIS em 3h45); evidência Histórico 04:44, 05:24 e 05:55; medir ERRO-JARVIS por classe e entregas "só por escopo", alvo 0.
