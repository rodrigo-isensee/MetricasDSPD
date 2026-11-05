Agente destino: forge:security-engineer
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: docs/060-triagem-dependabot   Base: develop   Base-sha: e32ee542d56b4767cebda581dc20f4283e04a56c
Etapa: seguranca   Cobre: E1.1

## Objetivo
Triar os alertas do Dependabot do repositório e recomendar o que fazer com cada um (pedido 060, E1.1, K-194). Worktree `/home/rodrigoisensee/MetricasDSPD-052b` (livre), branch nova `docs/060-triagem-dependabot` a partir da develop.

## Ler
- `gh api repos/rodrigo-isensee/MetricasDSPD/dependabot/alerts --paginate` (só leitura, alertas abertos); o `pnpm-lock.yaml` e os `package.json` da develop.

## Entregar
- "E1.1 (security-engineer): triagem dos alertas pela API do GitHub (só leitura) e pelo lockfile da develop, com parecer em docs/security/060-triagem-dependabot.md, sem mexer em dependência." (E1.1)
- (E1.1) `git -C /home/rodrigoisensee/MetricasDSPD-052b fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052b checkout -b docs/060-triagem-dependabot origin/develop`.
- (E1.1) Para cada alerta aberto: pacote, versão instalada e corrigida, gravidade, se é dependência de produção ou só de desenvolvimento e por qual pacote ela chega, se o código do projeto alcança a parte vulnerável (com evidência por busca no código), o custo da troca e a recomendação: corrigir já, corrigir depois ou aceitar o risco com motivo.
- (E1.1) Parecer `docs/security/060-triagem-dependabot.md` com a tabela dos alertas, o resumo por recomendação e o bloco `## Achados`; commit só do parecer com `Cartão: K-194`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052b push -u origin docs/060-triagem-dependabot`; sem PR, sem mudar dependência, sem dispensar alerta.
- (E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "isso" (recibo da triagem): o security-engineer tria os 15 alertas do Dependabot só lendo, com parecer e recomendação por alerta; nenhuma dependência é atualizada e nenhum alerta é dispensado nesta etapa; a correção vira pedido próprio depois da escolha do dono.
- 2026-11-02 18:20: recibo da triagem confirmado pelo dono: "isso" (E1 como descrita: triagem só leitura, parecer, sem atualizar dependência nem dispensar alerta). Cartão K-194.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha.
- O parecer é escrito só pela ferramenta Write ou Edit do papel; frase de regra só pelo ID; achado até 300 caracteres.
- O agente nunca abre nem lê o `.env`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook ou do sandbox: pare e relate a mensagem literal.
- NÃO tocar: dependências, lockfile, código, o estado dos alertas no GitHub, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (dono): escolher o que corrigir; a correção vira pedido de implementação próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): achar e documentar o comando que regera o mock no esquema próprio, sem tocar a base real, só lendo o código e a documentação do server, sem rodar nada na base." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052b log --format=%H -1 origin/docs/060-triagem-dependabot -- docs/security/060-triagem-dependabot.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).