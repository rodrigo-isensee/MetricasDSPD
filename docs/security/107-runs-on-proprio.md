---
tipo: revisao-seguranca
contrato: 1
pedido: 107-ci-sem-gasto
branch: ci/107-runs-on-proprio
commit: acb62951646cfebc2243c8429e1f6582bc9d1175
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-17
---
# Review de segurança: runs-on próprio nos workflows (pedido 107, E1.15 e revalidação E1.19)

Propósito: dizer se a troca dos jobs do CI para os runners próprios v2 (`runs-on: [self-hosted, metricas]`) pode entrar e registrar a posição de segurança sobre o `migracao-smoke`. Público: dono, devops-engineer, tech-lead e Jarvis.

Revisão estática, toda feita dentro da proteção do terminal. Não usei o gerenciador de pacotes nem o Docker, não li token nem `.env` e só usei o git para leitura (`git diff`, `git status`, `git log`). O diff revisado é o da árvore de trabalho da worktree 091, ainda sem commit, sobre `acb62951`. O `commit:` acima é o Revisar-sha do brief: o código revisado ainda não tem commit próprio. Arquivos lidos: `.github/workflows/ci.yml`, `homolog.yml`, `restauracao.yml`, `.github/actions/playwright/action.yml`, `tools/homolog/src/artefatos.test.ts` e `changelog.d/ci-107-runs-on-proprio.md`. De apoio: `homolog-aprovada.yml`, `tools/homolog/src/aprovacao.ts`, `~/runner-metricas/` (Dockerfile e scripts do v2) e `docs/security/107-runner-proprio.md`.

## Gatilhos
- CI e execução de código de branch na máquina do dono.
- Integridade do portão de homologação, que é a evidência que libera a `main`.
- Cadeia de suprimentos: dependências executadas nos jobs.
- Credenciais de CI.

Regras: `R-SEGURANCA`, `R-MAIN`, `R-CONFORMIDADE`.

## Resumo
**Reprovado, com 1 bloqueante (A1), que não depende do diff.** O diff em si está aprovado do lado da segurança.

O devops corrigiu o A2 e o A4 e fechou a parte principal do A3 (detalhe em "Revalidação"). O que ainda bloqueia é o A1: a troca de `runs-on` exige o runner v2 provado, e isso depende do `sudo` do dono.

Hoje o v2 ainda não está provado:
- a rede não foi preparada: `/run/metricas-ci.ok` está ausente;
- nenhuma vaga subiu: `~/.metricas-runner` está ausente;
- não há saída da sonda nem prova do JIT.

**O merge da `ci/107-runs-on-proprio` fica condicionado ao A1.** Quando o dono e o assistente trouxerem as saídas, reviso só esse ponto e o delta do commit.

## Revalidação (E1.19, diff da 091 sobre `acb62951`)
**A2: fechado.** O `migracao-smoke` foi dividido conforme a posição de segurança:
- `migracao` (`homolog.yml:196`) roda no runner próprio, sem Docker.
- `smoke` (`homolog.yml:236`) roda em `ubuntu-latest`, com compose, os segredos gerados na execução (`openssl rand`, `chmod 600`) e nenhum `secrets.*`.
- O `portao` exige os dois em `needs` e avalia o `smoke` à parte (`homolog.yml:263`, `:274-291`).

O `smoke` pulado só é aceito quando `EVENTO = schedule`. Conferi que isso não abre desvio para a `main`:
- o `homolog-aprovada` só aceita como portão uma execução de evento `push` (`tools/homolog/src/aprovacao.ts:99`, `temPortaoVerde(..., ['push'])`);
- a noturna é avaliada à parte e hoje é informativa por decisão do dono (`aprovacao.ts:5`, `:108-112`).

Portanto, uma noturna verde sem o smoke não libera release. Na execução de `push`, o smoke `skipped` reprova o portão. O veto "tirar o smoke do `portao` ou aceitar `skipped` nele" está respeitado no caminho que libera a `main`. O teste novo (`artefatos.test.ts`, "o smoke (precisa de Docker) roda em ubuntu-latest e fora da noturna") prende o `runs-on` dos dois jobs e a condição do `schedule`.

**A4: fechado.** O `imagem` passa a depender do `filtro`, que agora inclui `server/package.json`, `package.json`, `pnpm-lock.yaml` e `pnpm-workspace.yaml`. O job também roda sempre em `workflow_dispatch` e em PR para `homolog` e `main` (`ci.yml:170`) e continua em `ubuntu-latest`. Se o `filtro` falhar, o `imagem` fica pulado, mas o `filtro` é check exigido (`docs/engineering/fluxo-homologacao.md`, seção 15) e o PR continua barrado. É o mesmo padrão do `banco`.

**A3: fechado em parte, rebaixado.** Com o binário ausente, o passo agora quebra (`ci.yml:297`), então o resumo não diz mais "sem segredo" quando a varredura não rodou. Resta um ponto: qualquer código diferente de 0 (erro de execução ou de configuração) ainda cai no mesmo `||` (`ci.yml:298-299`) e vira aviso de "possíveis segredos". Isso é falha visível e não é silenciosa: segue como recomendado.

**A5:** continua aberto, fora do repositório (`~/runner-metricas/runner-imagem/Dockerfile:14`, sem conferência da impressão digital). Segue recomendado.

**Sem regressão:**
- não há `pull_request_target` nem `secrets.*` nos workflows;
- o único `continue-on-error` é o do `seguranca` (`ci.yml:284`), que já existia;
- não há `--privileged`;
- `docker` só aparece no `imagem` e no `smoke`, ambos hospedados (`ci.yml:176`, `homolog.yml:252-256`);
- as actions seguem fixadas por SHA;
- `homolog-aprovada` e `homolog-reavalia` seguem em `ubuntu-latest`;
- o runner próprio continua sem Docker: nada no diff monta socket, liga dind nem acrescenta capacidade;
- a mudança do `playwright/action.yml` é só de texto (descrição, comentário e mensagem), o que fecha a observação anterior.

Ficam 20 jobs no runner próprio: 10 no `ci.yml`, 9 no `homolog.yml` e 1 no `restauracao.yml`.

**Suíte:** não há PR nem CI deste head, e eu não rodo o gerenciador de pacotes por ordem do dono. O teste novo de `artefatos.test.ts` foi lido, não executado. A suíte fica para o CI do PR, e a aprovação só vale com o CI do head todo verde, e2e incluso.

## Ponto aberto: `migracao-smoke` (posição de segurança, mantida)
Posição: separar o job em `migracao`, no runner próprio, e `smoke`, com compose em `ubuntu-latest`. Foi o formato adotado.

Continuam vetados:
- dar Docker ao runner próprio de qualquer forma: socket do host montado, dind, Docker rootless no contêiner do job, `--privileged` ou `--cap-add`;
- tirar o smoke do `portao` da execução de `push`, ou aceitar `skipped` nele.

Sobre a reversão do changelog (voltar o job único `migracao-smoke` em `ubuntu-latest` com `services: postgres`): não tenho objeção de segurança, porque o job volta inteiro para o ambiente hospedado.

## Avaliação da troca do `COPY --chmod` na imagem v2
Sem mudança desde a 1ª rodada e sem objeção:
- o `COPY` seguido de `RUN chmod 0755` roda como root, antes do `USER runner`;
- os scripts ficam `root:root`, legíveis e executáveis pelo uid 10001, mas não alteráveis por ele.

Confiro na prova do A1 que a imagem `metricas-runner:v2` em uso foi construída com o `versoes.env` atual. O `runner-subir.sh` reaproveita a imagem se a tag já existir.

## Para virar `aprovado`
1. O dono roda `sudo ./runner-rede.sh` e `./runner-subir.sh --sonda`. A saída só pode ter linhas `ok:`, inclusive as do A13 do parecer do runner: `CapEff` e `CapBnd` zerados, `NoNewPrivs 1`, `Seccomp 2`.
2. A prova do JIT (A10 do parecer do runner) roda num job real, com a saída no relatório.
3. Confirmação de que:
   - os runners `wsl-metricas-1` a `-3` do v1 saíram do GitHub;
   - os contêineres do v1 e os volumes `metricas-dind-dados-N` foram removidos.
4. As mudanças da 091 são commitadas na `ci/107-runs-on-proprio`. Reviso pelo delta sobre o commit novo, porque este parecer se prende ao `acb62951`, sem o diff.

## Achados
- A1 (bloqueante) .github/workflows/ci.yml:24 · runs-on próprio antes da pré-condição do parecer 107-runner-proprio: rede v2 não preparada (/run/metricas-ci.ok ausente), vagas não subiram, sem sonda nem prova do JIT. Condição do merge; fecha com as saídas da sonda e do JIT e o v1 removido, revalidadas por mim.
- A3 (recomendado) .github/workflows/ci.yml:298 · gitleaks ausente já quebra o passo; resta que erro de execução (código diferente de 0 e 1) cai no mesmo || e vira aviso de possíveis segredos. Tratar só o código 1 como achado; o resto é erro do passo.
- A5 (recomendado) ~/runner-metricas/runner-imagem/Dockerfile:14 · Chave do repositório do Postgres baixada sem conferir a impressão digital. Conferir o fingerprint publicado antes de gravar o signed-by; esforço P.

## Sondas
- S1 · ls -ld /run/metricas-ci.ok ~/.metricas-runner (revalidação, 2026-11-17) · espera: marca da rede e diretório das vagas presentes (v2 no ar) · obtido: No such file or directory nos dois (A1)
- S2 · grep -n -E 'privileged|2375' ~/runner-metricas/runner-subir.sh; ls -ld /tmp/metricas-runner-work-* · espera: nada (v1 fora) · obtido: nada nos dois (v1 fora da máquina; saída do GitHub não conferida, A1)
- S3 · grep -n -E '^  smoke:|runs-on' .github/workflows/homolog.yml (smoke) · espera: smoke com compose fora do runner próprio · obtido: smoke em homolog.yml:236 com runs-on: ubuntu-latest (A2 fechado)
- S4 · grep -n -E 'secrets\.|pull_request_target|continue-on-error|privileged|docker' .github/workflows/*.yml .github/actions/*/action.yml · espera: sem segredo, sem pull_request_target, só o continue-on-error antigo, docker só em job hospedado · obtido: igual ao esperado (ci.yml:284 e :176; os demais são caminhos docker/)
- S5 · grep -n "temPortaoVerde" tools/homolog/src/aprovacao.ts · espera: o portão que libera a main só aceita execução de push · obtido: :99 temPortaoVerde(api, execucoes, ponta, ['push'])

## Detalhe dos achados
**A1 (alta enquanto não cumprido).**
- Evidência: `ci.yml:24` e os outros `runs-on` próprios (20 no total); S1.
- Caminho de ataque: com o rótulo `metricas` livre no repositório, um job de qualquer branch cai no runner que estiver registrado com esse rótulo. Sem a sonda, não há prova de que o que roda tem `--cap-drop ALL`, seccomp e o bloqueio da rede local. Um v1 esquecido no GitHub, ou uma vaga subida sem as regras de rede, devolve o cenário do A1 e do A6 do parecer do runner: root na VM do WSL ou acesso à rede corporativa.
- Correção mínima: cumprir os passos 1 a 3 de "Para virar `aprovado`". O diff não muda.
- Esforço P, de execução do dono e do assistente.
- Dono: devops-engineer (roteiro) e dono (sudo).

**A3 (baixa).**
- Evidência: `ci.yml:297-299`.
- Correção mínima: no `||`, guardar o código e distinguir o código 1 (achado) dos demais, que viram `::error::` do passo.
- Esforço P. Dono: devops-engineer.

**A5 (baixa).**
- Evidência: `~/runner-metricas/runner-imagem/Dockerfile:14`.
- Correção mínima: conferir a impressão digital publicada antes de gravar o `signed-by`.
- Fora do repositório; esforço P. Dono: devops-engineer.

Fechados nesta revalidação: A2 (divisão `migracao`/`smoke`) e A4 (filtro e PR para `homolog`/`main` no `imagem`).

Observações sem achado:
- O `portao` roda no runner próprio, e a conclusão dele é o que o `homolog-aprovada` (hospedado) lê. Com o v2 provado (JIT por job, `--rm`, sem montagem do host, `enable_icc=false`), um job de outra branch não toca o contêiner do portão. Resta o risco residual do kernel compartilhado, já classificado como baixo no parecer do runner.
- `pnpm-workspace.yaml:7` (`onlyBuiltDependencies`) segue limitando os scripts de instalação.

## Riscos aceitos e ferramentas
- Nenhum risco foi aceito pelo dono neste parecer. O kernel compartilhado e o JIT legível pelo próprio job seguem como residual baixo, conforme `docs/security/107-runner-proprio.md`.
- Lacunas, sem instalar nada: não rodei `zizmor`, `actionlint` nem `trivy`, e não executei a suíte (sem `pnpm`, por ordem do dono). Também não li a configuração de Actions do repositório, que exige o token: a lista de runners registrados e "Fork pull request workflows in private repositories". O dono confere que os runners do v1 saíram e que o fork está desligado.
