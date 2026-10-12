# Enxugamento do `jarvis.md`

2026-10-12 · tech-lead · branch `chore/praticas-agentes`. Nenhuma regra foi alterada: o que saiu era duplicado (e aponta para o destino) ou contradizia fonte superior (auditoria C1, C2, C5, C10, C12). Tokens estimados: bytes ÷ 4.

| | Antes | Depois | Variação |
|---|---|---|---|
| Bytes | 12.429 | 7.464 | -40% |
| Tokens (est.) | ≈ 3.100 | ≈ 1.870 | ≈ -1.230 |

("Antes" inclui o prompt-padrão já em stage; a versão do `develop` tinha 11.581 B.) A meta de ≈ 6 KB não foi atingida sem cortar regra que o usuário pediu para preservar: o texto é português UTF-8, e a tabela do time, o fluxo e o prompt-padrão ocupam ≈ 4 KB.

## Contradições resolvidas

| Tema | Antes | Agora |
|---|---|---|
| Quem commita (C1) | "Decisões de commit são do tech-lead; Jarvis não commita" | `praticas.md` §9: devs, UX e QA na `develop`; Jarvis só quadro e config; tech-lead revisa, integra e abre o PR |
| `gh` (C10) | "Não há `gh` instalado" | `gh pr create` permitido; `gh pr merge` do usuário |
| Orçamento (C12) | LCP 2,5 s, bundle 250 KB, filtro 200 ms | Removido; vale a ADR 0003 |
| Branch de PR (C2) | implícito: tech-lead envia a branch | `develop` é a branch de PR para a `main` |
| QA (C5) | "inclusive correções pequenas; revalida depois de qualquer correção" | QA por entrega; revalidação incremental dos bugs corrigidos; documentação não passa por QA |
| Discovery | "pode pular" amplo | Todo pedido começa com discovery completo; só correção técnica sem interface pula, com aviso |
| Cobertura 100% | ausente | No prompt-padrão ("Pronto quando") |

## Removido ou movido

| Regra | Destino |
|---|---|
| Orçamento de performance (front, API, banco, coletas) | ADR 0003 / `praticas.md` §5 (remissão de uma linha na pauta de reunião) |
| Tabela "Quando fazer" e participantes de cada reunião | Resumida em uma linha de momentos; detalhe fica na ata e na skill `kanban-scrum` |
| Detalhe da pauta fixa e do conteúdo da ata | Resumido (mesmos 5 itens e mesmo caminho da ata) |
| Passos 3-4 e 5 do fluxo (entender, registrar, ponto de compromisso, desenho técnico) | Fundidos nos passos 1-3, sem perda de ação |
| "Discovery em dupla" e "tech lead revisando incrementalmente" (parágrafos separados) | Fundidos na seção de paralelismo |
| Detalhe do Kanban (registrar cada movimento, peça ao tech-lead que commite o quadro, acionar agile-coach nas reuniões) | Skill `kanban-scrum`, `economia-de-tokens.md` §3 e `praticas.md` §9 |
| Descrição do PR | `praticas.md` §9 e skill `engineering-practices` (o Jarvis não a escreve; o tech-lead sim) |
| Regras invioláveis de métricas | `CLAUDE.md` (carregado por todos; o Jarvis só aponta) |
| Menção ao Kanban vivo | Não havia no arquivo; acrescentado "status sob demanda" (KANBAN.md, PRs e CI) |
| Precedência de documentos | Acrescentada em uma linha (proposta B3 da auditoria) |

## Conferência
Preservados sem alteração de sentido: identidade e apresentação, tabela do time, fluxo, paralelismo e WIP, portão de QA, reuniões e retrospectiva (resumidos), main do usuário, `pre-push`, sem `--no-verify`/`--force`, "só commita o que está pronto", "todo pedido começa com discovery", prompt-padrão (6 seções), modelo por tarefa, registro de tokens em `docs/kanban/entregas.md`, decisões uma a uma com opções e recomendação.

Regras invioláveis do `CLAUDE.md` (sem avaliação individual, métricas proibidas, BusinessMap x Acelerato, histogramas, percentis e mínimo de 20 itens, carga incremental, biblioteca T2.5, T2.6, dúvida vira pergunta, ordem WS, credenciais em `.env`, main e hook): todas permanecem no `CLAUDE.md`, não editado, e o `jarvis.md` mantém explícitas as de main/hook/`--no-verify`/`--force` e a de dúvida de regra virar pergunta ao usuário.
