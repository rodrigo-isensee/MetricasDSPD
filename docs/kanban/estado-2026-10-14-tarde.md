# Estado do trabalho — 2026-10-14 (tarde) — ponto de retomada

Substitui `estado-2026-10-14.md` no que for diferente. Escrito antes da pausa para atualizar o Forge. O que não está commitado está em disco e listado abaixo.

## Regras do usuário (valem na retomada)
- Até **3 agentes** com o usuário na máquina; com ele ausente (liberado em 2026-10-14 18:20), até 4–5 de forma equilibrada, sempre dentro do R-TETO, com prioridade baixa (`nice -n 19`, `flock /tmp/metricas-pesado.lock`).
- Decisões **uma por vez**, sempre com **"Minha recomendação: X"** e o motivo. Não misturar assuntos na mesma mensagem.
- Antes de perguntar ao usuário, conferir se o briefing, a proposta ou os HTML originais respondem. **O documento vale mesmo sobre uma decisão já tomada.**
- Agentes não mesclam na `main` (R-MAIN). O usuário mescla com `env -u GH_TOKEN gh pr merge <n> --repo rodrigo-isensee/MetricasDSPD --merge --admin`.
- O SSH não tem chave carregada. O push é por HTTPS: `git -c credential.helper='!gh auth git-credential' push https://github.com/rodrigo-isensee/MetricasDSPD.git <branch>`.
- Pareceres em `docs/reviews` e `docs/qa`:
  - são gravados com **Write ou Edit, nunca pelo Bash**;
  - ficam **no diretório principal, não em worktree**, porque o hook não registra autoria dentro de worktree (defeito do Forge, cartão K-077).

## Frentes
1. **Lote de bugs, PR #70 (`fix/bugs-intensivos` → develop):**
   - Review e QA aprovados, com autoria registrada (e426a0a e d8539a9), UX aprovado.
   - Na pausa, o tech-lead estava enviando, mesclando, promovendo para a homolog e abrindo o release.
   - Na retomada, conferir em que passo parou (estado do #70, PR develop→homolog, portão, PR de release).
   - Não apagar a `fix/bugs-intensivos` até a Sustentação entrar, porque ela foi incorporada.
2. **Sustentação no Operacional (K-072 + K-073):**
   - Worktree `../MetricasDSPD-sust`, branch `feature/sustentacao-no-operacional`.
   - O back B1 a B3 está pronto.
   - O react-frontend estava fazendo o F1 a F8, já com o merge de `fix/bugs-intensivos`.
   - Na retomada, rodar `git -C ../MetricasDSPD-sust status` e `git log` e relançar o react-frontend para continuar, commitando o que estiver pronto.
   - Depois: review, QA e UX, **no diretório principal** por causa da autoria, PR e homolog.
3. **Pedido 011, as 17 métricas "Também disponíveis":**
   - Discovery pronto, sem commit, em `docs/pedidos/011-metricas-tambem-disponiveis.md`, `docs/ux/metricas-tambem-disponiveis/` (01 a 04 e protótipo, servido na porta 5184) e `docs/architecture/features/metricas-tambem-disponiveis.md`.
   - Ficam 16 métricas: O19 a O26 (O23 como bloco do O2), T10 a T13 e E6 a E9.
   - Decididas:
     - D-1: % provisório, porque o documento prevê R$ por rateio do custo de capacidade quando houver o custo;
     - D-2: contagem;
     - D-3: entregas em 12 meses;
     - D-4: lista de sistemas, sem pessoa;
     - D-9': só comentário.
   - Resolvidas pelos documentos: D-2, D-7, D-11, D-12, D-13, D-6 em parte, D-14 em parte, R-3, R-5 e R-6 (ver as seções C e D de `04-decisoes.md`).
   - **Pendentes com o usuário, nesta ordem, uma por vez:**
     1. **D-8, "ida e volta" na qualidade da entrada: já apresentada; o usuário ainda não respondeu. Recomendação: A.**
     2. D-5', se a entrada de co-responsável conta como troca.
     3. D-6', se a fila é por equipe ou do DSPD, junto com R-1 (custo da ultrapassagem, rec. A).
     4. D-1', a base do custo de capacidade e a visão "por demanda".
     5. D-10, de onde vem o prazo contratado, junto com R-7.
     6. D-14', os tipos de vínculo, junto com R-4. Depende antes do spike P-T1 na API do BusinessMap.
     7. R-2', o instante do descarte.
   - Ajustes técnicos para o arquiteto: o T10 está filtrando só "Aguardando fornecedor" e "Criado por engano" aparece no O25, os dois sem base nos documentos.
   - Depois das decisões: commit dos docs (PR só com `.md`; o protótipo HTML vai junto com a feature), validação do protótipo pelo usuário e implementação na ordem do plano do arquiteto.
4. **Na fila:**
   - K-074 usabilidade (U1 a U5, catálogo na Ajuda);
   - K-075 mobile e tablet;
   - K-070 e K-071 já resolvidos dentro do lote;
   - cartões novos: dividir os testes lentos do web; mínimos de frio e quente do perf do server; `intensivo-sistemico.spec.ts:137`;
   - K-077: retrospectiva e PR no Forge (autoria de parecer gravado pelo Bash e dentro de worktree);
   - o README do Forge precisa explicar que o PR de documentação só com `.md` dispensa parecer e que HTML não conta como documentação.

## Arquivos e estado fora do git
- No diretório principal, sem rastreamento: os docs do 011 (acima) e este arquivo.
- `git stash@{0}`: o `docs/kanban/entregas.md` com os tokens de 13 e 14/10. Reaplicar na develop e commitar no próximo PR de quadro.
- Worktrees:
  - `-qa`: a branch `test/qa-intensivo-main`, já incorporada no lote; os protótipos HTML de usabilidade, sustentação e mobile estão nela, sem rastreamento.
  - `-sust`: a Sustentação.
  - `-demo`: a main, servida na porta 5180.
- Protótipos servidos: 5183 (mobile) e 5184 (pedido 011). Os servidores param quando a sessão reinicia; para subir de novo, rodar `python3 -m http.server <porta>` na pasta `03-prototipo`.
- Pendências do usuário: `~/MetricasDSPD-local/pendencias-do-usuario.md`.
