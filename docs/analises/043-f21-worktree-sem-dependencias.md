# 043 / F21: worktree nova sem dependências barra o push só na hora do push

Pedido 043, etapa E1.1 (cartão K-152). Autor: software-architect. Data: 2026-10-27.
Base lida: clone local do Forge em `develop` 363ceee (o delta até a develop remota não toca os caminhos citados).
Destino: insumo da E1.2 (modelo de ameaças) e da E1.3 (PR à develop do Forge pelo tech-lead). Nada aqui foi alterado no Forge.

## 1. Problema e evidência
- Problema (F21, `docs/kanban/prompt-jarvis-forge-2026-10-21.md`): numa worktree recém-criada não há dependências instaladas; a checagem do pre-push (lint e typecheck) falha com "eslint: not found" e o agente só descobre no push.
- Evidência (local, não vai ao PR): QA da promoção, 2026-10-23, worktree `-promo`; primeira tentativa de push barrada, resolvida com `pnpm install --frozen-lockfile`.
- Por que barra e não só avisa, neste projeto: `.githooks/pre-push` roda `pnpm run lint && pnpm run typecheck`; com falha, só avisa se a árvore está suja (`git status --porcelain`), e uma worktree recém-criada está limpa, então sai com 1.
- Observação: este projeto **não** usa o `pre-push` do modelo do Forge com `pre-push.local`; tem um `pre-push` próprio com o lint inline (o `.githooks/pre-push.local` não existe). A correção no modelo só chega aqui se o projeto migrar para o modelo (ver "Melhoria vista" no relatório).

## 2. Onde as worktrees nascem no fluxo da fábrica
Não existe um roteiro único de "criar worktree" para projetos. Os pontos encontrados (busca por `worktree` em `agents/`, `skills/`, `docs/regras/`, `templates/`, `hooks/`, `scripts/`):

| Onde | Quem roda `git worktree add` | Passo |
|---|---|---|
| `docs/regras/R-WIP.md` (l. 10-11) e `agents/jarvis.md` (l. 47) | a instância paralela do agente (o Jarvis só nomeia `worktree: <nome>` no cartão e no brief, `jarvis.md` l. 58) | gargalo: instância extra de um agente, cada uma na sua worktree |
| `docs/regras/R-TETO.md` (l. 15) | idem | limite de cópias de trabalho; remoção depois do merge |
| `skills/contribuir-com-o-forge/SKILL.md` §2 (l. 22) | sessão de projeto que contribui ao Forge | `git worktree add --no-track -b <branch> <dir> origin/develop` em `~/.forge-contrib/<projeto>-wt/<nome>` (repositório do Forge, Python, sem dependências a instalar) |
| `skills/qa-testing/SKILL.md` (l. 78), `skills/ci-cd/SKILL.md` (l. 48) | QA, devops | "use um clone ou uma worktree com as refs remotas" (sem comando) |
| Claude Code (isolamento de subagente) | o próprio harness, em `.claude/worktrees/<n>` (o Forge já o reconhece: `hooks/vigia.py` l. 40, `hooks/conformidade.py` l. 1669) | delegação com isolamento em worktree; nenhum texto do Forge roda antes |
| `scripts/ci-local` (l. 453) | script, worktree temporária no sha do PR | CI local do próprio Forge; fora do alcance do F21 |

Conclusão: a criação é espalhada e parte dela (o harness) não passa por nenhuma instrução do Forge. Um passo só no "roteiro" não cobre todos os casos; o único ponto por onde **todo** push de projeto passa é o `pre-push` do modelo (`templates/projeto/.githooks/pre-push`, que chama o `.githooks/pre-push.local` do projeto, l. 33-37).

## 3. Opções

### A. Passo de preparação depois do `git worktree add` (texto)
- O que muda: a stack declara o comando de preparação de uma cópia de trabalho nova (`stacks/node-react/pronto.md`: `pnpm install --frozen-lockfile`, que já aparece ali como insumo de CI, l. 50); a regra de cópias de trabalho (`docs/regras/R-TETO.md`, l. 15, texto único citado por ID) diz que a worktree nova roda o comando de preparação da stack antes da primeira checagem; `skills/qa-testing` e `skills/ci-cd` passam a citar a regra onde mandam usar worktree.
- Arquivos do Forge: `stacks/node-react/pronto.md`, `docs/regras/R-TETO.md`, `skills/qa-testing/SKILL.md`, `skills/ci-cd/SKILL.md`, fragmento em `changelog.d/`.
- Custo: baixo (só texto, ~10 linhas).
- Risco: não cobre a worktree criada pelo harness nem o agente que não leu a regra; não é verificável por máquina; ataca a causa (o push passa a não falhar), mas só quando seguido.
- R-NEUTRO: neutro, porque o comando vem do arquivo da stack (outra stack declara o seu; stack sem dependências declara "nenhum").

### B. Diagnóstico no `pre-push` do modelo (hook)
- O que muda: em `templates/projeto/.githooks/pre-push`, quando o `pre-push.local` falha **e** a cópia é uma worktree vinculada (`git rev-parse --git-dir` diferente de `git rev-parse --git-common-dir`), o hook acrescenta uma linha antes de sair com 1: "pre-push: a checagem do projeto falhou numa worktree; se ela foi criada agora, prepare as dependências (comando de preparação da stack) e envie de novo." Sem nomear ferramenta: não supõe node nem pnpm. Opcional, a confirmar na E1.3 por execução: código 127 (comando não encontrado) como sinal mais forte; não confio nele sem prova, porque o executor de scripts (ex.: `pnpm run`) pode trocar o 127 por 1.
- Arquivos do Forge: `templates/projeto/.githooks/pre-push`, `tests/test_forge.py` (classe `HookPrePush`: caso "worktree vinculada + pre-push.local falhando imprime a dica" e "clone principal não imprime"), fragmento em `changelog.d/`.
- Custo: baixo (~8 linhas de shell e ~30 de teste).
- Risco: o push continua barrado (corretamente: sem dependências não há lint), só que com a causa dita; falso positivo possível (lint falhou por motivo real numa worktree), mitigado pelo "se ela foi criada agora". Não executa nada novo no hook: só lê o git e imprime. Hook é gatilho de R-SEGURANCA (E1.2).
- R-NEUTRO: neutro por construção.
- Limite: não chega a projeto com `pre-push` próprio fora do modelo (caso deste projeto).

### C. A + B (recomendada)
- A ataca a causa onde há instrução; B cobre o que A não alcança (harness, esquecimento) e torna o caso visível e contável.
- Arquivos do Forge: a soma de A e B.
- Custo: baixo; cabe num PR bem abaixo do teto M14 (o texto `.md` não conta; código e teste ~40 linhas).

### Descartada: D. O `pre-push` instala as dependências sozinho
Rodar instalador dentro do hook executa scripts de ciclo de vida de pacotes a cada push, pode usar rede e estourar o teto de tempo do push (o tech-lead já roda o push em segundo plano pelo teto de 600 s), e o hook passaria a escrever na árvore enquanto o `pre-push` anota a prova com a árvore igual no início e no fim (`agents/tech-lead.md` l. 21). Custo de segurança e de confiabilidade alto para pouco ganho.

## 4. Recomendação
**Opção recomendada: C (A + B)**, com B como a garantia e A como a prevenção. Nenhum mecanismo novo: B muda a mensagem de um hook que já existe, A acrescenta texto a uma regra e a um arquivo de stack que já existem (sem campo novo em `.forge/config.json`), então a seção "Por que o existente não basta" não se aplica. Se o PR precisar ficar menor, B sozinho primeiro (é o que cobre a worktree do harness), A num segundo PR.

Arquivos do Forge que a recomendada muda:
- `templates/projeto/.githooks/pre-push`
- `tests/test_forge.py` (classe `HookPrePush`)
- `docs/regras/R-TETO.md` (l. 15, cópias de trabalho)
- `stacks/node-react/pronto.md` (comando de preparação da cópia de trabalho)
- `skills/qa-testing/SKILL.md` e `skills/ci-cd/SKILL.md` (citam a regra onde mandam usar worktree)
- `changelog.d/<branch>.md` (`bin/forge-changelog novo Corrigido "..."`)

## 5. Como medir
- Medida do F21: pushes barrados por dependência ausente em worktree nova = 0.
- Contagem: com B, a dica tem texto fixo; o número de ocorrências dela (e de "not found" na saída do pre-push) nas transcrições dos agentes por pedido é o indicador, contado por busca nas transcrições locais. Linha de base: 1 ocorrência no pedido de promoção de 2026-10-23.
- Leitura: ocorrências da dica que caem a 0 depois de A em vigor mostram a prevenção funcionando; ocorrências que persistem apontam onde a worktree nasce sem passar pela regra (provavelmente o harness).
- Critério de reversão: se a dica aparecer em push cuja falha não é dependência ausente (falso positivo) em mais de uma de cada três ocorrências em 30 dias, a condição de B é estreitada ao código 127 (se a E1.3 provar que ele se propaga) ou a dica é retirada.

## 6. Neutralidade de stack (R-NEUTRO)
- B não nomeia ferramenta nem gerenciador; só usa git e a saída do `pre-push.local`.
- A tira o comando do arquivo da stack (`stacks/<stack>/pronto.md`); o texto genérico da regra diz "comando de preparação da stack", e stack sem dependências declara "nenhum".
- Nenhum dado deste projeto entra no PR: o texto do PR cita só "worktree nova sem dependências; o pre-push barrou o push com 'comando não encontrado'".

## 7. Pontos para as próximas etapas
- E1.2 (security-engineer): o `pre-push` é gatilho de R-SEGURANCA; a recomendada não executa nada novo no hook (só `git rev-parse` e `echo`), e a opção D foi descartada por segurança.
- E1.3 (tech-lead): confirmar por execução se o código 127 chega ao hook pelo executor de scripts antes de usá-lo; manter a ordem de `unset GIT_DIR ...` (l. 32) antes do `git rev-parse` da checagem, mas cuidado: a detecção de worktree vinculada tem de ler o git **depois** do `unset`, com o diretório atual na raiz da worktree.
