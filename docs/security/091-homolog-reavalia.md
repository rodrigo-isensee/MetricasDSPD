---
tipo: revisao-seguranca
contrato: 1
pedido: 091-homolog-reavalia-nova-tentativa
branch: fix/k263-reavalia-espera
commit: d1693a72b467afaf6f74fcc97618481efd16565d
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: homolog-aprovada com nova tentativa do portão (pedido 091, E1.3, K-263)

Propósito: parecer de segurança (gatilho CI/CD, `R-SEGURANCA`) sobre a regra do check obrigatório `homolog-aprovada`, que libera o PR de release para a `main`. Público: tech-lead, devops-engineer, usuário.

**Veredito: aprovado**, sem bloqueante. Revisão estática do diff `6e42dfb8..d1693a72` (3 arquivos: `tools/homolog/src/aprovacao.ts`, `tools/homolog/src/aprovacao.test.ts`, `docs/devops/091-homolog-reavalia.md`). Teste do arquivo tocado rodado: `vitest run src/aprovacao.test.ts` em `tools/homolog`, 23 testes verdes. Lido o review do tech-lead (`docs/reviews/091-homolog-reavalia.md`, aprovado em `d315dea2`), sem refazê-lo. Ferramentas: `gitleaks`, `actionlint` e `zizmor` não estão no PATH (lacuna registrada; o diff não toca workflow, dependência nem lockfile). Não há segredo no diff.

## O que foi verificado
- **Candidato tem de ser a ponta da homolog.** As guardas de fork (`aprovacao.ts:77`), hotfix (`:79`), origem diferente de `homolog` (`:80`), branch ausente (`:87`) e candidato diferente da ponta (`:88`) ficam antes do laço e retornam sem esperar; o laço (`:101-105`) consulta sempre o mesmo `ponta`, já conferido igual a `pedido.shaCandidato`. A espera não reabre nenhuma dessas decisões nem relê a ponta.
- **Portão tem de estar verde.** A condição de saída do laço é a mesma `temPortaoVerde(api, execucoes, ponta, ['push'])` de antes (`:100`, `:104`), que exige execução de `push` em `homolog` do mesmo sha com o job `portao <sha>` em sucesso (`:166-170`). Esgotadas as tentativas, o retorno é o mesmo `aprovada: false` (`:106-107`). Nada vira verde por tempo: o laço só repete a leitura. Teste "portão vermelho falha só depois de esgotar as tentativas" (`aprovacao.test.ts`) prova 4 consultas e o motivo de falha.
- **Fork e hotfix.** O ramo de fork e o `decidirHotfix` (`aprovacao.ts:126-157`) não foram alterados e não passam pelo laço; nenhum caminho novo de aprovação para eles.
- **Permissões e tokens.** `.github/` intocado no diff: `homolog-aprovada.yml:15-17` segue `contents: read`, `actions: read`; `homolog-reavalia.yml:11-13` segue como estava. Nenhum segredo, PAT ou escopo novo; a API usada é só GET (`github.ts`).
- **Tempo do job.** Pior caso da espera: 6 x 10 s (`aprovacao.ts:18-22`) mais 7 rodadas de consulta (2 listagens e os `jobs` das execuções do sha), contra `timeout-minutes: 5` (`homolog-aprovada.yml:23`). Cabe com folga. Se estourar por lentidão da API, o job é cancelado e o check falha (fail-closed), sem aprovar.
- **A regra vem da base.** O check roda `aprovacao.ts` do `base.sha` (`homolog-aprovada.yml:27`): a mudança só vale depois de chegar à `main`, e um candidato não consegue trocar a regra pela própria branch.
- **Interação com o `homolog-reavalia`.** Com o check esperando até ~60 s, o rerun do `reavalia` (`homolog-reavalia.yml:33-38`, 6 x 10 s) pode ser recusado enquanto o check corre; o efeito é só operacional (no pior caso, "Re-run jobs" manual) e sempre em falha, nunca em aprovação.

## Achados
- A1 (recomendado) .github/workflows/homolog-aprovada.yml:7 · o comentário (linhas 7-8 e 45-46) ainda diz "sem espera"; agora a regra espera até ~60 s no "portão sem sucesso". Atualizar o texto com o K-263 junto do A1 do review (fluxo-homologacao.md). Informativa, P, devops-engineer.

## Detalhe dos achados
- **A1.** Documentação desatualizada não abre caminho de ataque, mas quem audita o portão de release lê esses comentários para entender quando o check falha. Correção mínima: trocar "Sem espera"/"sem espera paga" por "espera até 6 x 10 s só quando o portão aparece sem sucesso (K-263); critério inalterado". Arquivo de workflow: escrito pelo devops-engineer e enviado pelo dono (escopo `workflow`). Não devolve a entrega.

## Riscos aceitos
Nenhum.
