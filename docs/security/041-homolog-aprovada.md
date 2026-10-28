---
tipo: revisao-seguranca
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-homolog-aprovada
commit: a411f9fe2d6d7c2e63b92b68549f35317026690e
parecer: aprovado
veredito: aprovado
revisor: forge:security-engineer
data: 2026-10-28
---
# Review de segurança: homolog-aprovada sem corrida com o portão (pedido 041, E5.3, K-108)

Propósito: parecer de segurança sobre `homolog-aprovada.yml` (alterado) e `homolog-reavalia.yml` (novo), gatilho de `R-SEGURANCA` (workflows e portão de release). Público: tech-lead, devops-engineer.

**Veredito: aprovado**, sem bloqueante. Revisão estática do diff `origin/develop...a411f9f` (4 arquivos). Nada foi executado. `actionlint`, `zizmor`, `gitleaks` e `osv-scanner` não foram invocados: lacuna registrada (o diff não toca dependência nem lockfile; os workflows seguem para a CI). Não há segredo no diff.

## O que foi verificado
- **`permissions` mínimas.** `homolog-reavalia.yml:12-15` declara `contents: read`, `actions: write`, `pull-requests: read`. `actions: write` é o mínimo para `POST .../rerun` e vale só neste job. `homolog-aprovada.yml:15-17` não mudou (`contents: read`, `actions: read`); o `gh api` novo só lê execuções.
- **Gatilho `workflow_run`.** O `Homologação` só dispara em `push` em `homolog` (`homolog.yml:7-9`), branch protegida; o filtro `event == 'push'` e `head_branch == 'homolog'` (`homolog-reavalia.yml:20`) exclui PR e fork. Não há checkout, artefato, cache nem execução de código da branch: o job só chama a API com o token do repositório base. Código de PR não confiável não roda com token de escrita nem segredo. Como `workflow_run` usa o arquivo da branch padrão, ninguém altera o job por PR.
- **Injeção por `github.event.*` em `run:`.** Todos os valores entram por `env:` (`homolog-reavalia.yml:24-27`; `homolog-aprovada.yml:32-38`) e são expandidos entre aspas. Nenhuma expressão é interpolada no `run:`. `head.ref` do candidato (controlável) vai só como argumento entre aspas ao `main.ts`, sem passar por shell.
- **Ações de terceiros.** `homolog-reavalia.yml` não usa nenhuma (só `gh`, do runner). `homolog-aprovada.yml:25,29` mantém `checkout` e `setup-node` fixados por sha; `persist-credentials: false` e `ref` na base (`:27-28`).
- **Token e escopo `workflow`.** `github.token` só em `env` do passo, sem `secrets.*` e sem PAT. O job não escreve em ref nenhuma (nem na `main`) e não precisa do escopo `workflow`: o escopo e o rótulo `afrouxa-regra` pesam só no envio dos arquivos de workflow, que é do dono, não no runtime.

## O que a mudança faz com o portão de release
- **Mantém o critério.** A decisão continua em `tools/homolog/src/main.ts aprovacao`, lido do código da base (`homolog-aprovada.yml:25-28`); o diff só acrescenta código depois da falha da regra. Todos os caminhos novos terminam em `exit 1` (`homolog-aprovada.yml` nos ramos `::error::`); nenhum caminho novo aprova. Um erro de `gh api` falha o passo (fail-closed).
- **Não tira nenhuma verificação.** O `reavalia` só reexecuta a mesma execução do check do PR, pelo mesmo sha (`head_sha` no filtro, `homolog-reavalia.yml:29,31`); não escreve status, não cria check e não aprova. Ele pode atrasar ou repetir uma avaliação, nunca forçá-la a verde: quem avalia é a regra da base.
- **Sem bypass novo por tempo.** Sem `sleep` de espera no check; o laço de 6 x 10 s só repete o pedido de rerun e esgota em falha com instrução (`:33-39`).
- **Resíduo mantido (não novo).** Em `pull_request`, o arquivo de workflow vem do merge ref; a frase "a regra vem da base" vale para `aprovacao.ts`, não para o YAML do check. A defesa é a de sempre: `homolog` protegida, review e merge do usuário na `main`. Já existia e não piora.

Nenhum achado bloqueante.

## Achados
- A1 (recomendado) .github/workflows/homolog-reavalia.yml:29 · `$SHA` entra no filtro `jq` por interpolação de shell; hoje é sha hexadecimal do GitHub (sem ataque realista); `--arg sha "$SHA"` com `.head.sha == $sha` elimina a classe. Baixa, P, devops-engineer.
- A2 (recomendado) .github/workflows/homolog-reavalia.yml:12-15 · `actions: write` permite reexecutar qualquer workflow; é o mínimo para o rerun e o job não tem entrada não confiável nem checkout. Informativa, sem correção; manter sem checkout nem ação de terceiros. Dono devops-engineer.
- A3 (recomendado) .github/workflows/homolog-aprovada.yml:27 · o rerun reusa o payload original e a `base.sha` da 1ª execução; se a `main` avançar antes do fim do portão, vale a regra da base antiga. Informativa; documentar em `fluxo-homologacao.md` ou fechar e reabrir o PR. Dono tech-lead.

## Detalhe dos achados
- **A1.** A interpolação do `$SHA` no filtro `jq` não tem caminho de ataque hoje, porque o valor é um sha hexadecimal vindo do GitHub. Usar `--arg sha "$SHA"` e `.head.sha == $sha` elimina a classe. Severidade baixa, esforço P, dono devops-engineer; não devolve a entrega.
- **A2.** `actions: write` permite reexecutar qualquer workflow do repositório. É o mínimo para o rerun, e o job não tem entrada não confiável nem checkout, então o risco é aceitável. Severidade informativa, sem correção; manter o job sem checkout nem ação de terceiros nas próximas mudanças. Dono devops-engineer.
- **A3.** O rerun reutiliza o payload original e, portanto, a `base.sha` da primeira execução. Se a `main` avançar entre a abertura do PR e o fim do portão, o check reavalia com a regra da base antiga. Só a `main` do usuário avança a base e a regra do `aprovacao.ts` muda raramente. O "Re-run jobs imediatamente antes do merge" do fluxo (`fluxo-homologacao.md`) não cobre isso: cabe uma linha lá ou, num PR novo, fechar e reabrir. Severidade informativa, dono tech-lead.

## Riscos aceitos
Nenhum depende de aceite do usuário. A prova de que o rerun atualiza o check do PR, e a primeira release sem o `homolog-reavalia.yml` na `main` (Re-run manual), são limites funcionais já registrados no parecer de devops, não de segurança.
