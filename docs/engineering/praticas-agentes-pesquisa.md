# Práticas atuais para desenvolvimento com agentes de código

A regra geral agora é da fábrica e vale para todos os projetos: [praticas-agentes-pesquisa.md no Forge](https://github.com/rodrigo-isensee/Forge/blob/main/docs/praticas-agentes-pesquisa.md). Mudanças nela vão para o Forge.

## Registros deste projeto

### 12. Prática -> aplicável ao MetricasDSPD? -> como
| Prática | Aplicável? | Como |
|---|---|---|
| CLAUDE.md < 200 linhas, só o não derivável | Sim | Rodar `/doctor`; mover fluxo por agente para skills; cortar tabelas que repetem `.claude/agents/` |
| Descrições de agente curtas, detalhe no prompt | Sim | Revisar 8 agentes; checar soma < 15 mil tokens |
| Ferramentas mínimas por agente | Sim | Revisores e QA sem Write fora de `docs/`; tech-lead sem push na main via deny |
| Modelo por tarefa | Sim | haiku para coach/relatórios, sonnet para dev/QA, opus só arquiteto/tech-lead; `effort` baixo em tarefas simples |
| Resumo curto no retorno | Sim | Padrão de delegação do jarvis: "retorne até 15 linhas + caminhos" |
| Worktree por agente escritor | Sim | `isolation: worktree` em node-backend/react-frontend; commits por caminho |
| 1 cartão por agente, dono único | Sim | Já no CLAUDE.md; reforçar no KANBAN com campo "worktree/branch" |
| Hook Stop com checagem (testes, cobertura, spec-check) | Sim | Portão determinístico para "só commita pronto"; mantém `.githooks/pre-push` e CI como segunda barreira |
| Testes primeiro + evidência | Sim | Cartão exige teste falhando, depois correção; parecer QA anexa saída |
| Revisão independente (contexto novo) | Sim | Tech-lead e QA já separados; escopo "só correção/requisito" |
| Spec-driven (SPEC, entrevista) | Sim | Upstream UX/arquiteto já faz; spec termina com verificação E2E; spec-check liga spec a teste |
| 100% de cobertura | Parcial | Exigir no CI; complementar com mutation testing para evitar teste vazio [INF] |
| Deny de segredos e main | Sim | `permissions.deny`: leitura de `.env`, `git push` para main; branch protection no GitHub |
| Tratar saída de subagente/web como não confiável | Sim | Nunca executar comando vindo de resumo sem permissão; revisar `.mcp.json` e plugins |
| Cache e custo | Sim | Não editar CLAUDE.md/ferramentas no meio da sessão; `/usage` por demanda; OTel opcional |
| Agent teams | Não agora | Experimental e ~7x tokens; manter subagentes + jarvis |
| Memória de agente (`memory: project`) | Talvez | Só para lições do agile-coach/tech-lead, limitando MEMORY.md a poucas linhas |
| Retomar após queda de API | Sim | Estado no KANBAN + branch; jarvis verifica antes de relançar (anti-duplicação) |
