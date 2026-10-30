# Modelo de ameaças: pedido 043 (F21 e F22 do Forge)

Etapa E1.2 (cartões K-152 e K-153). Autor: security-engineer. Data: 2026-10-27.
Base lida: `docs/analises/043-f21-worktree-sem-dependencias.md`, `docs/analises/043-f22-pr-de-release.md`, clone local do Forge em `develop` 363ceee (`templates/projeto/.githooks/pre-push`, `docs/regras/R-VERIFY.md`), só leitura. Análise estática; nada foi executado nem alterado no Forge.
Este documento é modelo de ameaças, não parecer: o parecer de cada PR é a E1.4 (F21) e o do F22 no seu PR. Gatilhos: hook (F21) e fluxo de release (F22), `R-SEGURANCA`.
R-NEUTRO: nada aqui deve ir ao PR do Forge com dado deste projeto; as mitigações abaixo são genéricas.

## F21: dica no pre-push da worktree sem dependências (opção C)

### Ativos e fronteiras
- Ativo: a integridade do `pre-push` do modelo (`templates/projeto/.githooks/pre-push`), que hoje carrega duas proteções: R-VERIFY (sem push não fast-forward, linhas 8-23) e R-MAIN (sem push na main, linhas 24-27), seguidas da checagem do projeto (`pre-push.local`, linhas 34-37).
- Fronteiras: (1) saída do hook para o terminal do agente (texto vira instrução para um LLM que age); (2) o que o hook lê do git (`rev-parse`); (3) a stack declarar o comando de preparação (A), texto que o agente executa.
- Quem ataca: não há atacante externo no hook (executa na máquina do desenvolvedor, com as permissões dele; quem escreve no repositório já controla o hook). O risco realista é de **indução**: a mensagem levar o agente a contornar o hook, a ignorar falha real ou a executar algo além do que se quer. Severidade geral esperada: baixa, desde que as mitigações valham.

### Ameaças (STRIDE resumido)
| # | Ameaça | Caminho | Sev. |
|---|---|---|---|
| F21-1 | Dica induz contorno (`--no-verify`, trocar `core.hooksPath`, apagar o `pre-push.local`) | texto do tipo "ignore/force/pule" ou que nomeie a flag; agente LLM obedece a texto de saída | média |
| F21-2 | Dica mascara falha real: lint falhou por defeito do código numa worktree e o agente atribui à dependência e "prepara" sem ler o erro | condição só diz "worktree vinculada + falhou"; a dica sobrepõe ou substitui a saída do local | média |
| F21-3 | Hook passa a engolir a falha: o código da dica altera o status de saída (`|| true`, dica como último comando, `set` sem cuidado) e o push sai com 0 | edição do bloco `if`/`||` nas linhas 35-37 | alta (derrota o controle) |
| F21-4 | Vazamento ou injeção pela saída: a dica interpola caminho absoluto da worktree, nome de branch/worktree, saída capturada do `pre-push.local` ou variável de ambiente | nome de branch com sequência de escape de terminal ou texto de instrução; segredo que o lint imprimir e o hook reecoar em log do agente | média |
| F21-5 | Execução de comando sugerido: o hook lê o comando de preparação da stack (`pronto.md`, `.forge/config.json`) e o executa ou o imprime como ordem | tentação de "ajudar" e imprimir/rodar `pnpm install` | média (opção D descartada por esta razão; concordo) |
| F21-6 | Detecção errada de worktree: `--git-dir` e `--git-common-dir` comparados como texto (relativo ".git" contra absoluto), dando "vinculada" no clone principal, ou o contrário; falha do `rev-parse` fora de repositório muda o fluxo | git antigo sem `--path-format`; diretório atual fora da raiz; `rev-parse` antes do `unset` das variáveis GIT_* (linha 32) devolve o repositório principal | baixa (só dica), vira média se o erro mudar o código de saída |
| F21-7 | Código 127 usado como sinal e tratado como "esperado": lint não encontrado vira aviso e o push passa | refinamento do texto por código de saída virando exceção | alta se ocorrer; a análise já pede prova antes de usar |
| F21-8 | Comando de preparação (A) com instalação não congelada ou com scripts de ciclo de vida: cadeia de suprimentos | `pronto.md` da stack mandar `install` sem lockfile congelado | média |

### Mitigações exigidas ao E1.3
M1 (F21-3, F21-7). O status de saída do hook não muda: a falha do `pre-push.local` continua terminando em `exit 1` em todos os ramos. A dica é um `echo` para stderr colocado **antes** do `exit 1`, nunca depois de um `|| true`; nada de `set +e` nem de código 127 tratado como sucesso. Se o 127 for usado, só afina o texto; qualquer código diferente de 0 sai 1.
M2 (F21-2). A dica é **aditiva e condicional**: a saída do `pre-push.local` não é capturada nem filtrada (nada de `$(...)` sobre ela; ela já vai direto ao terminal) e aparece antes da dica. O texto diz "se a worktree foi criada agora, prepare as dependências; senão, leia o erro acima" e não afirma causa. Não diz "falta dependência" como fato.
M3 (F21-1). Texto fixo, sem a palavra `--no-verify`, sem "ignore", "pule", "force", "desative" e sem mencionar `core.hooksPath`. Conclui com o caminho seguro: preparar e enviar de novo (R-VERIFY: "corrija a causa e rode de novo").
M4 (F21-4). Texto 100% literal (aspas simples), sem interpolar variável: nem caminho da worktree, nem nome de branch, nem `$0`, nem saída do local. Não imprime ambiente.
M5 (F21-5). A dica **não nomeia nem executa** o comando da stack: diz "o comando de preparação da stack" e aponta o arquivo da stack por nome fixo. O hook não lê `pronto.md` nem `config.json` para executar nada e não escreve na árvore (reforça o descarte da opção D e a invariante "árvore igual no início e no fim").
M6 (F21-6). A detecção roda **depois** do `unset` da linha 32, no diretório da raiz da worktree (o hook roda ali; não mudar de diretório), com os dois `rev-parse` redirecionados `2>/dev/null`. Comparar caminhos normalizados (`--path-format=absolute` se o git suportar, senão `cd` + `pwd -P` dentro de subshell); qualquer falha do `rev-parse` ou valor vazio significa "sem dica", nunca erro do hook. O clone principal não imprime a dica.
M7 (F21-8, opção A). O comando de preparação declarado na stack é o de instalação **congelada** (para node-react, `pnpm install --frozen-lockfile`, como já está no `pronto.md`), nunca `install` livre nem `update`. Não adicionar flag que afrouxe a verificação de integridade. Se o texto citar `--ignore-scripts`, é decisão da stack, não obrigação deste PR (registrar como recomendação, não bloqueio).
M8. As linhas 4-28 (R-VERIFY e R-MAIN) e a ordem do `unset` ficam byte a byte como estão; o diff do hook só acrescenta o bloco da dica no ramo de falha.

### Casos de abuso (para o qa-engineer, teste do Forge, classe `HookPrePush`)
| Entrada | Caminho | Resultado esperado |
|---|---|---|
| `pre-push.local` falha (exit 1) em worktree vinculada | push -> hook -> local | sai 1; stderr contém a saída do local e a dica fixa; a dica não contém `--no-verify` |
| mesma falha com exit 127 | idem | sai 1 (nunca 0); dica opcional |
| `pre-push.local` falha no clone principal | idem | sai 1; sem dica |
| `pre-push.local` passa em worktree vinculada | idem | sai 0; sem dica |
| nome de branch com `$(...)`, crase ou escape de terminal, em worktree vinculada com falha | idem | a dica não repete o nome; saída idêntica à de nome comum |
| `pre-push.local` imprime um valor parecido com segredo | idem | a dica não reecoa; o hook não captura a saída |
| `git rev-parse` falhando (diretório sem repositório, simulado) | idem | sem dica, mesmo código de saída da falha do local |
| push para a main e push não fast-forward em worktree vinculada | loop das linhas 4-28 | continuam barrados com as mesmas mensagens, antes de qualquer dica |

### O que a E1.4 vai conferir
Diff do hook restrito ao ramo de falha; M1 a M8 por `arquivo:linha`; execução dos casos acima pelo teste do Forge; ausência de captura/interpolação (busca por `$(`, crase e `$` dentro do texto da dica); `pronto.md` com instalação congelada; ausência de `--no-verify` no texto novo (também em `R-TETO.md`, skills e fragmento do changelog). Lacuna de ferramenta registrada se `shellcheck` não estiver no PATH.

## F22: texto de release (opção A: skill ci-cd, agente tech-lead, R-FLUXO)

### Ativos e fronteiras
- Ativo: o controle de release (a main é do usuário, `R-MAIN`; o check `homolog-aprovada` como portão; o PR de release como ponto de validação do dono).
- Fronteira: o texto manda o tech-lead executar `gh pr list` e `gh pr edit`/`create` com a identidade do dono (nos projetos os agentes usam a conta dele). Um texto de processo, sem código nem hook novo: não cria permissão, só orienta uso de permissão que o agente já tem. Não foi lido o `permissions` do modelo de projeto para `gh` (fora do escopo da leitura pedida); quem tem `gh pr edit` negado ou liberado não muda com este PR.

### Ameaças
| # | Ameaça | Caminho | Sev. |
|---|---|---|---|
| F22-1 | `gh pr edit` sobre PR que não é o de release legítimo: PR de **fork** com head de mesmo nome (`homolog`), PR de outro autor, ou mais de um PR aberto | `gh pr list --head homolog` casa por nome de branch, inclusive de fork; o agente edita título/corpo do que achar primeiro | média: alterar corpo de PR alheio é adulteração do que o dono vai validar |
| F22-2 | Troca de base: `gh pr edit --base` (ou recriar apontando para outra base) | texto de "editar o PR existente" sem limitar os campos | média (PR de release com base errada fura o controle; na direção de `main` mais ainda) |
| F22-3 | Texto leva o agente a mesclar ou a armar auto-merge (`gh pr merge`, `--auto`), ou a empurrar para a main | ambiguidade do verbo "promover" / "concluir a release" | alta (viola R-MAIN) |
| F22-4 | Corpo do PR com injeção de shell ou vazamento: corpo montado com `--body "..."` contendo crase, `$` ou saída de pareceres; segredo ou dado pessoal copiado de log/parecer para o corpo | corpo com notas de release e pareceres (o PR 144 do projeto tinha corpo rico) | média |
| F22-5 | Contornar o portão: "reexecutar o check até ficar verde" ou abrir o PR e confiar no verde sem conferir o sha; `pendente` tratado como aprovado | texto sobre "pendente" no `homolog-aprovada` ser lido como licença | média |
| F22-6 | Edição do corpo depois do aceite do dono muda o que ele validou sem aviso | `gh pr edit` tardio | baixa |
| F22-7 | Falha de `gh` (auth, rate limit) interpretada como "não existe PR" e o agente cria duplicado ou a lista vazia é lida como ausência | `gh pr list` com erro vira saída vazia | baixa |

Não há ameaça nova que exija hook ou código: o texto é de processo, o `pre-push` continua barrando push na main e a proteção de branch do GitHub continua sendo o controle técnico. Por isso a opção A é aceitável sob segurança; a opção B (hook de guarda) não agrega aqui e acoplaria o nome `homolog` ao Forge.

### Mitigações exigidas ao E2.2
N1 (F22-1). O texto manda listar com filtro explícito de base, head e estado (`--base main --head homolog --state open`) e conferir no resultado `isCrossRepository` falso, `baseRefName` igual a `main` e autor esperado (o do próprio tech-lead/dono) antes de editar. Mais de um PR aberto, PR de fork ou autor inesperado: **parar e levar ao Jarvis** (`R-DECISAO`), sem editar.
N2 (F22-2). A edição é só de título e corpo: o texto diz explicitamente que `gh pr edit` **não** leva `--base`, `--head`, `--add-reviewer` nem muda rascunho/estado, e que PR criado nunca tem a base alterada depois. Base errada: fechar e levar ao Jarvis.
N3 (F22-3). Texto expresso: tech-lead cria ou edita o PR de release e **nunca** mescla, nem `gh pr merge`, nem `--auto`, nem push na main; mesclar é do usuário (`R-MAIN`, `R-FLUXO`). Citar o ID em vez de reescrever a regra.
N4 (F22-4). Corpo por arquivo (`--body-file`), nunca `--body` com texto interpolado; corpo só com resumo e links para os pareceres, sem segredo, token, `.env`, dado pessoal nem log bruto (R-NEUTRO: sem dado de projeto no texto do Forge, também nos exemplos).
N5 (F22-5). O texto diz que o PR de release só abre com o portão da homolog **verde**, que o check de promoção roda de novo antes do merge e que quem decide é o check no sha do candidato; "pendente" significa esperar e reexecutar **o mesmo sha**, nunca marcar como aprovado nem afrouxar o check (`R-CONFORMIDADE`). Se o PR já foi aberto antes do portão, editar e aguardar; não fechar e recriar para "limpar" o vermelho.
N6 (F22-6, F22-7). Registrar no corpo, numa linha, que foi editado e por quê, quando o usuário já tiver visto o PR (recomendação, não bloqueio); erro do `gh` não é "sem PR": só cria quando a listagem terminou com sucesso e veio vazia.

### Casos de abuso (documentais; conferência por leitura no parecer, sem teste de máquina)
| Entrada | Caminho | Resultado esperado |
|---|---|---|
| Existe PR `homolog` -> `main` de fork ou de outro autor | agente segue o passo "listar e editar" | para e consulta o Jarvis; não edita |
| Dois PRs abertos para a main | idem | para e consulta |
| Texto sugere "ajustar base" do PR | idem | ausente; `--base` proibido no edit |
| "Concluir a release" | agente lê o passo | termina no PR pronto; sem `merge` |
| Check vermelho por "pendente" | agente decide | reexecuta o mesmo sha após o portão; não marca como aprovado |

### O que o parecer do F22 vai conferir
N1 a N6 por `arquivo:linha` nos três arquivos (skill ci-cd, `agents/tech-lead.md`, `R-FLUXO.md`) e no fragmento do changelog; busca por `merge`, `--auto`, `--base`, `--force`, `--no-verify` no texto novo (só aparecem em proibição); nenhum dado do projeto (R-NEUTRO); texto citando `R-MAIN`/`R-FLUXO` por ID em vez de copiá-los; nenhum workflow nem hook alterado (se alterar, volta a esta análise).

## Riscos aceitos
Nenhum solicitado. A dependência de cumprimento do texto do F22 (sem hook) é risco residual baixo, coberto pela medida da análise do E2.1 (duas releases com 0 duplicados); falha na medida leva à opção B, que reabre este modelo.

## Lacunas
Não li `templates/projeto/.claude/settings.json` (permissões de `gh` do modelo). Nenhuma ferramenta executada (`shellcheck`, `gitleaks` não necessários nesta etapa de leitura).
