# 043 · F22: PR de release homolog → main e a corrida do homolog-aprovada

Etapa E2.1 (cartão K-153), devops-engineer, 2026-10-27. Só leitura (consultas GET do `gh`, grep nos dois repositórios). Nenhum arquivo do projeto ou do Forge foi alterado.

## 1. Veredito curto
- A premissa "um workflow cria o PR vazio" **não se sustenta**: nenhum workflow do projeto abre PR (busca por criação de PR, `pulls` e `pull-requests: write` em `.github/` e `tools/`: só `pull-requests: read` em `ci.yml:86`). Os 4 workflows são `ci.yml`, `homolog.yml`, `homolog-aprovada.yml`, `restauracao.yml`.
- Quem abre o PR é uma **ação com a identidade do dono** (autor `rodrigo-isensee` em todos os PRs de release recentes; os agentes usam a conta dele). Título "Homolog" e corpo vazio é o padrão do GitHub para PR aberto a partir da branch `homolog` (botão "Compare & pull request" ou criação por linha de comando sem título). Não dá para provar só por GET qual das duas formas foi: lacuna registrada.
- "Vazio" só no sentido de **sem corpo**: o diff não é vazio (PR 131: 796 adições, 10 arquivos; PR 136: 877, 33; PR 123: 3701, 124).
- A **corrida é real** e está no projeto: o PR é aberto logo depois do push em `homolog`, bem antes de o portão terminar, e `homolog-aprovada` lê só execuções com sucesso.

## 2. Onde nasce e onde está a corrida (evidência do PR 144)
Linha do tempo, 2026-10-23 (UTC), sha `7486836`:
- 16:08:20 push em homolog dispara o workflow "Homologação" (run 39984250260).
- 16:35:45 PR 144 criado (autor rodrigo-isensee).
- 16:35:51 dispara `homolog-aprovada` (run 39988086638, evento `opened`); falhou às 16:35:58 com "portão de homolog sem sucesso em 7486836".
- 16:37:04 o job `portao 7486836...` começa e termina às 16:37:07: success. O portão só fecha quando todos os jobs fecham, e `e2e-homolog` durou 16:08:33 a 16:37:02 (29 min).
- 16:42:50 `homolog-aprovada` reexecutado: success.

Arquivo e ponto da corrida:
- `.github/workflows/homolog-aprovada.yml`: gatilho `pull_request` com tipos `opened, synchronize, reopened, ready_for_review`; roda segundos depois do `opened`.
- `tools/homolog/src/aprovacao.ts:84`: "portão de homolog sem sucesso em <sha>". A linha 28 e o doc (`docs/engineering/fluxo-homologacao.md` §14 e as notas das linhas 166 e 170) confirmam: só conta `conclusion=success`; execução em andamento é tratada como falha, sem distinguir "pendente" de "falhou". O doc já manda "Re-run jobs" à mão: a corrida é um limite conhecido, não corrigido.
- Histórico: vários `homolog-aprovada` de PRs "Homolog" ficaram vermelhos (14, 15, 17 e 21/10; `gh run list --workflow "Homologação aprovada"`). Parte é falha real do portão (runs "Homologação" 39625232153 e 39521744106 falharam no push), parte é corrida; separar exige ler o motivo de cada um (não feito: o PR 144 já prova o mecanismo).

"already exists": consequência da mesma causa. O PR é aberto por outro ato (UI ou agente) antes do `create` do tech-lead, que não tem passo documentado para reaproveitar o PR existente. No PR 144 o título e o corpo ricos (notas, pareceres, rollback) ficaram sobre um PR já aberto, ou seja, foi uma edição na prática.

## 3. Fábrica × projeto
| Parte | Onde | Evidência |
|---|---|---|
| Workflow que abre PR vazio | **Não existe** (premissa errada) | busca acima |
| Check de promoção trata "em andamento" como falha | **Projeto** (`aprovacao.ts`, `homolog-aprovada.yml`); ligado ao K-108 do 041 | arquivo:linha acima |
| Nenhum modelo de CI/CD de release/portão no Forge | **Fábrica** (lacuna) | `templates/projeto/.github/` só tem `dependabot.yml`; "homolog-aprovada" não aparece em `skills/`, `agents/`, `docs/` |
| Passo de abertura do PR de release (quando e como: após portão verde, editar o PR se já existe) | **Fábrica** (lacuna) | `docs/regras/R-FLUXO.md:14` só diz que a promoção é PR que só o usuário mescla; `agents/tech-lead.md` não tem passo de release com PR; `skills/ci-cd/SKILL.md` "Ambientes e releases" não cobre o check de promoção |

Logo, a parte da fábrica é **documental e de processo**, não um workflow novo. O Forge não pode "criar o PR depois do portão" num modelo de workflow que não existe, e o portão assíncrono da homolog é desenho deste projeto (R-NEUTRO: nem todo projeto tem esse portão).

## 4. Opções para a parte da fábrica
- **A. Texto no processo (recomendada).**
  - `skills/ci-cd/SKILL.md`, "Ambientes e releases": princípio de 2 linhas. (1) Check de promoção que lê um gate assíncrono distingue `pendente` de `falhou`: pendente sai com mensagem clara e pede reexecução, sem marcar o gate como reprovado. (2) O PR de release só é aberto depois do portão verde, e o check roda de novo imediatamente antes do merge.
  - `agents/tech-lead.md`, linha de promoção do `R-FLUXO`: antes de criar o PR de release, listar PRs abertos de `homolog` para `main`; se existe, editar título e corpo; criar só se não existe, e só depois do portão da `homolog` verde.
  - `docs/regras/R-FLUXO.md:14`: uma frase equivalente.
  - Custo: 3 arquivos de texto, 1 PR, fragmento em `changelog.d/`, sem código. Risco baixo; depende de cumprimento (sem hook), mitigado pela medida.
- **B. A + guarda em hook do Forge** que barre a criação de PR `homolog` → `main` quando já existir um (consulta GET). Custo médio (hook + teste; hook é gatilho de R-SEGURANCA); risco de falso positivo e de acoplar o Forge ao nome `homolog`, que é do projeto. Só se A falhar na medida.
- **C. Modelo de workflow de release e portão em `templates/projeto/.github/`.** Custo alto (YAML, testes, rótulo `afrouxa-regra`, R-SEGURANCA), risco de impor o fluxo deste projeto a todos, minutos de CI (R-CUSTO). Não recomendada.

## 5. Recomendação
**Opção A** no Forge (E2.2 implementa; nenhum dado deste projeto no texto). Ela elimina o "already exists" e o motivo de abrir o PR cedo. A corrida só some de vez com a parte do **projeto**, que fica aqui (K-108 do 041, não vai ao Forge): `aprovacao.ts` devolver `pendente` quando a execução do portão existe e não terminou (sem esperar dentro do job, para não gastar minutos de runner, R-CUSTO), e reexecutar o check no momento certo. Isto altera `.github/` e `tools/`, fora desta etapa; o dono decide se entra no 041.

## 6. Medida
- Checks `homolog-aprovada` vermelhos por corrida = 0: por release, `gh run list --workflow "Homologação aprovada" --json conclusion,createdAt,headSha` e comparar o `createdAt` com o fim do job `portao <sha>` (`gh run view <id> --json jobs`); corrida = vermelho cujo run começou antes de o `portao` fechar.
- Criação duplicada de PR = 0: `gh pr list --base main --head homolog --state all` mostra 1 PR por release, e a retrospectiva não registra "already exists".
- Medir em 2 releases seguidas; se qualquer um sair de 0, passa-se à opção B.

## 7. Limites desta análise
Não foi possível (nem permitido) provar por API quem criou o PR 144. Não foi lido o motivo de cada falha antiga. Nenhum workflow ou teste foi executado.
