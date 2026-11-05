Agente destino: forge:devops-engineer
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: docs/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E1.1

## Objetivo
Explicar como as coletas das métricas rodam hoje e propor como agendá-las uma vez por dia no ambiente publicado (pedido 061, E1.1, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch nova `docs/061-coleta-diaria`.

## Ler
- Os scripts do `package.json` da raiz e do server ligados a coleta, carga e projeção (BusinessMap, Acelerato, worklog do apontamento, pesquisa de percepção); `scripts/`; `docker-compose.yml` e `docker/`; `.github/workflows/`; `.env.example` (nunca o `.env`); `docs/engineering/fluxo-homologacao.md`.

## Entregar
- "E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento." (E1.1)
- (E1.1) `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052g switch --no-track -c docs/061-coleta-diaria origin/develop`.
- (E1.1) Parecer com: como cada coleta roda hoje (comando, ordem e dependências, travas contra execução dupla, variáveis de ambiente pelo nome, tempo e falhas conhecidas); opções para rodar todas uma vez por dia no ambiente publicado (por exemplo agendador do servidor, container com agendamento, agendamento da CI), cada uma com o que precisa, custo, riscos, como avisar falha e como reexecutar; recomendação com a base; o que o dono precisa decidir ou providenciar.
- (E1.1) Escrever em `docs/devops/061-coleta-diaria.md`; commit só do parecer com `Cartão: K-196`, `git add` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/docs/061-coleta-diaria`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "Isso" (recibo do 061): o devops-engineer explica como as coletas rodam hoje e propõe opções para agendá-las uma vez por dia no ambiente publicado, só lendo; nada é agendado, publicado nem mexido em servidor nesta etapa; a implementação vira pedido próprio.
- 2026-11-02 19:48: recibo confirmado pelo dono: "Isso". Cartão K-196. DECISÃO TÉCNICA (Jarvis): a E1.1 escreve o parecer na worktree 052g (branch mesclada feature/059-rota-apontamento, limpa), branch nova docs/061-coleta-diaria a partir da develop, criada com --no-track e enviada sem -u por causa do .git/config.lock parado.
- O agente nunca abre nem lê o `.env`; não roda coleta nem nada na base; não cria agendamento.
- O `.git/config.lock` do repositório principal está parado: crie a branch com `--no-track` e envie sem `-u`; recusa de hook ou do sandbox: pare e relate a mensagem literal.
- R-VERIFY: nunca `--no-verify` nem `--force`. O parecer é escrito pela ferramenta Write ou Edit; frase de regra só pelo ID; achado até 300 caracteres.
- Regras do CLAUDE.md: credenciais só no `.env`; BusinessMap só GET; Acelerato só leitura; carga incremental, nunca sobrescrever histórico; nada que custe dinheiro sem autorização do dono (R-CUSTO).
- NÃO tocar: código, scripts, workflows, Docker, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (dono): escolher a opção; a implementação vira pedido próprio." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052g log --format=%H -1 origin/docs/061-coleta-diaria -- docs/devops/061-coleta-diaria.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).