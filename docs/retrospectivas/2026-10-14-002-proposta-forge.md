# Propostas ao Forge (origem: MetricasDSPD, K-077, 2026-10-14)

Classificação: todas de **fábrica** (vale para todos os projetos). Um PR por melhoria, a partir da `develop` do Forge, em `melhoria/metricasdspd-<tema>`, aberto pelo tech-lead da sessão de projeto; quem integra é a sessão do Forge com o dono (R-CONTRIB). Nenhum PR foi aberto por este documento. Versão lida: Forge 0.13.0 (cache local, somente leitura).

---
## (a) Autoria do parecer gravado pelo Bash ou dentro de worktree
Branch: `melhoria/metricasdspd-autoria-parecer`

**Problema observado.** O #64 travou por horas na noite de 13 para 14/10: parecer gravado pelo Bash ou em worktree não gerou registro em `.forge/run/autoria.jsonl`, e `forge-check pr` / hook `parecer` barraram o merge ("sem registro de que o papel `qa` gravou esta versão"). O erro só aparece no merge. Causas no código: `autoria()` em `hooks/conformidade.py` descarta arquivo fora de `raiz` (worktree irmã); `alvos_de_escrita()` só vê `>`, `>>` e `tee`.

**Comparação.**
| | Instruir os agentes | Corrigir o hook |
|---|---|---|
| Custo | Baixo (texto em `agents/tech-lead.md`, `agents/qa-engineer.md`, skills) | Médio (código + testes em `tests/hooks/conformidade/`) |
| Cobertura | Depende de cada agente lembrar, em cada projeto e retomada; o próprio projeto teve de repetir a regra no estado de retomada | Vale sempre, sem memória |
| Falha | Silenciosa até o merge (horas depois) | Corrige na origem |
| Efeito colateral | Obriga review/QA fora da worktree, contra o hábito (código está na worktree) | Mantém a regra de papel: só registra se o arquivo foi escrito pelo papel autorizado (a checagem de papel de `caminho_barrado` já roda antes) |
| Risco | Nenhum de segurança | Registrar autoria indevida; mitigado por escopo (ver abaixo) |

**Recomendação: corrigir o hook**, com uma linha de instrução como complemento, não como solução. Instrução sozinha é o que já falhou; o defeito é do mecanismo.

**Mudança (arquivos e texto).**
1. `hooks/conformidade.py`, função `autoria()`: trocar `raiz not in p.parents` por "o arquivo está sob `raiz` **ou** sob uma worktree da mesma cópia principal". Sugestão: calcular `raizes = {raiz, *worktrees}` com `git -C <raiz> worktree list --porcelain` (já usado em `_comum.copia_principal`), achar a raiz que contém `p` e usar o caminho relativo a ela para o teste `docs/reviews/`, `docs/qa/`, `docs/devops/`, `docs/security/`. O `caminho` gravado continua relativo (o `forge-check pr` já lê o `autoria.jsonl` da cópia principal e compara com `rel` do documento no ref do PR).
2. Mesma função, caminho Bash: além de `>`, `>>` e `tee`, tratar como alvo de escrita os destinos de `cp`, `mv`, `install`, `rsync` (último argumento) e `sed -i`/`perl -i` (arquivos). Para `python -c`, `node -e` e scripts, que não são analisáveis: no PreToolUse do Bash, guardar `time.time()` em `.forge/run/` e, no PostToolUse, registrar os `.md` das 4 pastas de parecer com `mtime` posterior (limitado a esse conjunto de pastas, e só quando o papel está autorizado a gravá-las, conforme `hooks/conformidade.json`). Se o último ponto for considerado largo demais, ficar só com o item 1 e a lista de comandos.
3. `bin/forge-check`, mensagem de `cmd_pr`: acrescentar a causa provável. Texto exato: `"{rel}: autoria: sem registro de que o papel `{papel}` gravou esta versão; o {papel} deve escrevê-lo ({rid}). Causas comuns: parecer editado depois do registro, gravado fora do diretório da sessão ou por comando que o hook não reconhece; regrave pelo Write/Edit."`
4. Testes novos em `tests/hooks/conformidade/`: `autoria-worktree-registra.json`, `autoria-cp-registra.json`, `autoria-papel-errado-nao-registra.json` (dev grava `docs/qa/` em worktree: bloqueado e sem registro).
5. Instrução complementar (uma linha) em `agents/qa-engineer.md` e `agents/tech-lead.md`, onde se descreve onde gravar o parecer: "Grave o parecer com Write ou Edit; depois de gravar, não edite o arquivo por outro meio (a autoria é por hash do texto)."

**Como medir o efeito.**
- Pareceres gravados em worktree ou por Bash com registro de autoria / pareceres gravados do mesmo jeito (alvo 100%, linha de base hoje: 0% nos casos do #64).
- Falhas "sem registro de que o papel ... gravou esta versão" em `forge-check pr` por entrega, nos projetos (alvo 0 em 3 entregas seguidas; linha de base: pelo menos 1 incidente com horas de bloqueio).
- Contra-métrica: registros de autoria de papel errado ou sem escrita real (alvo 0; qualquer um reverte o item 2).
- Tempo entre gravar o parecer e o merge liberado, no `historico.md` do projeto.

---
## (b) README: PR só com `.md` dispensa parecer; HTML não conta como documentação
Branch: `melhoria/metricasdspd-readme-pr-docs`

**Problema observado.** O estado de retomada registra a pendência: o PR de documentação só com `.md` dispensa parecer de review e de QA, mas isso não está dito no README, e HTML (protótipos, referências) não conta como documentação. Em `README.md` o termo não aparece (busca por "dispensa", "só .md", "documentação" na regra). O time hesita ou gasta parecer onde não precisa; no sentido oposto, um PR com HTML pode ser lido como "só documentação" e pular parecer indevidamente. Antes de redigir, o autor confirma o critério exato em `hooks/parecer.py` e `bin/forge-check` (função `gatilhos` e o que é classificado como documentação).

**Mudança.** `README.md`, na seção que descreve pareceres e portões (a mesma de "Escrita"/R-REVIEW/R-QA), acrescentar:
> **PR só de documentação.** Um PR cujas mudanças são todas em arquivos `.md` dispensa parecer de review e de QA (o `docs:check` e a CI continuam valendo). Arquivo `.html`, protótipo, imagem, script ou qualquer outro tipo **não conta como documentação**: se o PR tem um deles, exige parecer como qualquer entrega. Na dúvida, o hook `parecer` e `forge-check pr` decidem pelo conteúdo do diff, não pela pasta.
Se o critério real do `forge-check` for outro (por exemplo, por pasta `docs/`), o texto deve refletir o código, e o código não muda neste PR. Referenciar R-REVIEW e R-QA pelo ID, sem copiar texto de regra.

**Como medir.**
- Perguntas ao usuário ou ao Jarvis sobre "precisa de parecer neste PR de docs" por entrega (alvo 0 após o PR).
- PRs só de `.md` que geraram parecer desnecessário (alvo 0) e PRs com HTML que passaram sem parecer (alvo 0), contados em `historico.md` e no `forge-check pr`.
- Leitura em 2 entregas seguidas.

---
## (c) Falso positivo do hook `conformidade` quando o comando só cita o caminho
Branch: `melhoria/metricasdspd-conformidade-citacao`

**Problema observado.** Em 14/10 o hook bloqueou um comando Bash do Jarvis que só citava `docs/reviews/` no texto, sem gravar. O hook trata o texto como escrita em dois pontos de `hooks/conformidade.py`: (1) `checar_texto()`, para corpos de heredoc de `python`/`node`/`perl`/`ruby`: dispara se `ESCRITA_NO_TEXTO` casa e o caminho protegido aparece em literal; e o padrão inclui o caractere `>` solto (comparação, seta, HTML em texto), então basta citar o caminho e ter um `>`; (2) o regex `CRITICO` só liga a falha fechada em erro interno, não é a causa direta. O comando exato não foi guardado.

**Passo zero do PR.** Reproduzir com o comando real (pedir ao Jarvis, que tem o texto) e escrever o teste em `tests/hooks/conformidade/citacao-do-caminho-nao-bloqueia.json` antes de mudar o código. Se a causa for outra (por exemplo, `cat > arquivo <<EOF` com o caminho citado no corpo, ou redirecionamento), a mudança abaixo se ajusta.

**Mudança.**
1. `hooks/conformidade.py`, `ESCRITA_NO_TEXTO`: remover o `>` solto e exigir escrita real: `>\s*["']?<caminho>`, ou seja, redirecionamento cujo alvo é o caminho. Em `checar_texto()`, em vez de "qualquer literal protegido no texto", exigir que o literal esteja no argumento de uma chamada de escrita (`open(<lit>, "w")`, `writeFile(<lit>`, `Path(<lit>).write_text`) ou como alvo de `>`/`>>` na mesma linha. Citar o caminho em `print`, `echo`, comentário ou string de mensagem passa.
2. Testes: `citacao-do-caminho-nao-bloqueia.json` (comando que menciona `docs/reviews/` e usa `>` em comparação: libera), e manter `parecer-por-bash-dev-bloqueia.json` e `contrib-sessao-projeto-edit-cwd-home-bloqueia.json` (escrita real continua barrada). Acrescentar `python -c "open('docs/reviews/x.md','w')"` por dev: bloqueia.
3. Contra-risco: ofuscação passa hoje e passará igual (limite já documentado, SBX-03); a mudança não afrouxa a escrita real.

**Como medir.**
- Bloqueios de `conformidade` em comandos que não escrevem no caminho protegido, por entrega (contagem em `.forge/run/erros.log` e no relato do Jarvis; alvo 0; linha de base: 1 em 14/10).
- Bloqueios legítimos preservados: suíte `tests/hooks/conformidade` 100% verde, incluindo os casos novos.
- Reversão: qualquer escrita real em caminho protegido que passe a ser liberada reverte o PR.
