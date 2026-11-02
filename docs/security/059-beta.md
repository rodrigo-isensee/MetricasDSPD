---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-coleta-worklog
commit: 29c64aaed34d84ca3443c49404f188d5ebba4fa9
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança da branch da coleta do worklog (pedido 059, E2.26 e E2.70, K-193)

**Rodada 3 (revalidação por delta, E2.70).** Intervalo pedido: `2321a1a..29c64aa`, o merge da develop com o squash do PR 194 (trilha B) na branch do PR 195. Lido com `forge-check delta --parecer docs/security/059-beta.md` (que parte de 82d1360, a ponta da rodada 2), `git show --cc 29c64aa`, `git diff origin/develop..29c64aa -- packages` e a saída do `forge-check pr`, que acusava este parecer desatualizado por `packages/contratos/src/apontamento.test.ts`. Revisão estática: o `.env` não foi lido, nada foi chamado no BusinessMap, nenhum nome, e-mail ou id de pessoa aparece aqui. Público: node-backend (dono do código), tech-lead, Jarvis.

**Veredito: aprovado em 29c64aa.** O merge não traz conteúdo próprio: os arquivos da trilha B passam à versão da develop, já aprovada em `docs/security/059-alfa.md` (rodada sobre ccf9651), e em `packages` a branch difere da develop só pelo 70b70a9, que já estava na ponta aprovada na rodada 2. Nenhum achado novo; o recomendado A4 segue como estava.

## Gatilhos
Os mesmos da rodada 2 (dado pessoal, integração externa, migrações da coleta, segredo `PESSOA_ELIMINADA_SAL`, eliminação a pedido). O intervalo toca a biblioteca que vê o comentário na fronteira (`classificarApontamento`), por isso a conferência abaixo. Nenhum workflow, compose, hook ou controle do Forge muda (conferido no `diff --stat` de `2321a1a..29c64aa`: só `docs/` da trilha B e `packages/`).

## Achados
- A4 (recomendado) server/src/modulos/businessmap/apontamento/coleta.ts:161 · o worklog pede /users e grava o nome de quem é de Outra área, que a aba nunca mostra com nome; minimização a decidir na fatia de retenção (sem mudança desde a rodada 1).

## O que o delta muda (rodada 3)
- **Merge sem conteúdo próprio.** `git show --cc 29c64aa -- packages` sai vazio: cada trecho resolvido vem de um dos dois pais. Os 12 arquivos da trilha B (contrato, cálculos de `businessmap/apontamento/`, `classificarApontamento.ts`) ficam iguais à develop (`git diff origin/develop..29c64aa` sem saída nesses caminhos).
- **Diferença restante para a develop em `packages` (5 arquivos, +14 -4).** O subcaminho `./coletor` em `packages/metricas/package.json:11` (ADR 0020, item 3) e o comentário de `packages/metricas/src/coletor/index.ts:1-5`, do 70b70a9; os guardas de `classificarApontamento.test.ts:469-475`, `faixaConcentracao.test.ts:25-26` e `houveTroca.test.ts:109-110` aceitam só a linha literal do subcaminho e continuam recusando qualquer outra menção a `coletor` no `package.json`. Os testes de que o `web/` não importa a classificação seguem como na develop. Tudo isso já estava na ponta aprovada na rodada 2.
- **`coletor/index.ts` combinado.** Os exports novos (`MAX_PONTOS_DE_CODIGO`, `palavrasDe`) são da develop, aprovados no 059-alfa; nenhum devolve texto do comentário para fora do servidor.
- **Coleta com o classificador novo.** A assinatura de `classificarApontamento` e o tipo `ResultadoApontamento` não mudaram; `server/src/modulos/businessmap/apontamento/registro.ts:31-37` segue gravando só subgrupo, máscara, contagem de palavras e versão do dicionário. O classificador da develop trunca o comentário em 2000 pontos de código antes de normalizar (`classificarApontamento.ts:83-97`) e tira controles e caracteres de direção: na fronteira da coleta isso reduz o custo de um comentário enorme vindo da API e não muda o que vai ao banco.
- **Fora de `packages`.** As mudanças de `server/`, `docs/architecture/server.md`, `CLAUDE.md`, briefing e `.forge/versao` entre 82d1360 e 29c64aa chegaram pelo merge anterior da develop (afe05d5) e são iguais à develop, salvo os comandos da coleta em `server/package.json:25-27` e a seção da coleta em `server.md`, já revisados nas rodadas 1 e 2.

## Resolução dos achados da rodada 1 (registrada na rodada 2, sem mudança)
- **A1 (bloqueante): resolvido** em 82d1360 (supressão por HMAC antes de `/users` também na coleta de cards; `sem-sal` sem rodar a etapa). O delta não toca `usuarios.ts`, `coleta.ts` nem `eliminacao.ts`.
- **A2 e A3 (recomendados): resolvidos** em 82d1360 (id pela entrada padrão sem eco; sal de 32 bytes documentado).

## O que foi verificado e segue correto (rodadas 1 e 2, fora do delta)
Allow-list na fronteira e comentário só em memória; staging com `versao` e eventos sem pessoa nem texto livre; cliente só GET com `/loggedTime` em lista fechada e `fields` fixo; varredura de presença com guarda de massa e guarda `recusa_em_massa`; supressão com HMAC; dicionário com vigência; GRANTs do coletor, do `dspd_ref` e do `dspd_api`; segredos só por variável de ambiente; regras invioláveis (só BusinessMap, histórico preservado).

## Plano em cartões
- A4: software-architect na fatia de retenção, com o DPO; node-backend implementa o que for decidido.
- Para o qa-engineer: o caso `sem-sal` e o `.pg` da recriação pelos cards seguem como na rodada 2.
- Para a segurança da rota: depois do merge desta ponta, conferir que a view de quem é do time não devolve `pessoa_ref` para a pessoa eliminada.

## Riscos aceitos
Nenhum proposto. O resíduo dos arrays `responsaveis` de `dim_card` e `dim_card_versao` segue declarado (A5 de `059-adrs.md`, DT-3) e não é aceite novo.

## Ferramentas e lacunas
Leitura estática, `forge-check delta`, `forge-check pr`, `git show --cc` e `grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta máquina (lacuna registrada; as varreduras rodam no CI do devops-engineer). Nenhuma dependência nova no intervalo. Suítes não foram rodadas por este papel (o tech-lead relatou pronto verde e checks verdes em 29c64aa). Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
