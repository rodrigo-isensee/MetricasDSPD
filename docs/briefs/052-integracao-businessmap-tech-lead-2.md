Agente destino: forge:tech-lead
Pedido: 052-integracao-businessmap
Tipo: codigo
Branch: docs/052-businessmap-discovery   Base: develop   Base-sha: a6e75433716727edc3256419740f384775290a66
Etapa: codigo   Cobre: E1.5

## Objetivo
Etapa E1.5 do pedido 052 (cartão K-182): gravar e enviar os documentos do discovery da integração real com o BusinessMap (E1.1 a E1.3), já escritos na worktree, para o dono validar o plano a partir da branch. Worktree `/home/rodrigoisensee/MetricasDSPD-052`, branch `docs/052-businessmap-discovery`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052 status --short` e o diff dos 3 arquivos modificados; os 4 arquivos novos só no frontmatter e nos títulos.
- Seção de commits de `/home/rodrigoisensee/MetricasDSPD-052/docs/engineering/praticas.md`.

## Entregar
- "E1.5 (tech-lead): commit e push dos documentos do discovery (E1.1 a E1.3) na `docs/052-businessmap-discovery`, sem PR; o PR vem depois da validação do dono." (E1.5), com:
  - (E1) Um commit por etapa, com `git add` explícito por caminho: E1.1 = `docs/architecture/features/052-integracao-businessmap.md`, `docs/architecture/adr/0022-coleta-incremental-e-webhook-businessmap.md`, `docs/architecture/data-model.md`, `docs/architecture/features/integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`; E1.2 = `docs/security/052-integracao-businessmap-ameacas.md`; E1.3 = `docs/ux/integracao-real/06-delta-2026-10-29.md`. Mensagens conforme o `praticas.md`, citando o pedido 052.
  - (E1) `pnpm run docs:check` na raiz da worktree antes do push; vermelho: pare e relate, sem corrigir o conteúdo dos documentos (é do autor).
  - (E1) Push com `git -C /home/rodrigoisensee/MetricasDSPD-052 push origin HEAD:refs/heads/docs/052-businessmap-discovery`, depois de conferir `git -C /home/rodrigoisensee/MetricasDSPD-052 branch --show-current`.
- (E2, E3, E4, E5, E6) Nada a entregar aqui: não nesta delegação (coleta, webhook, painel operacional com dado real, itens de segurança K-086, K-088 e K-089 e a ordem WS1 → WS2 → WS3 vêm depois do discovery validado).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-052` e branch `docs/052-businessmap-discovery` a partir da `develop`, sem commit." · etapa de outra delegação; já entregue (worktree e branch em a6e7543)
- "E1.1 (software-architect): atualizar o desenho já feito no pedido 006 (`docs/architecture/features/integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`, `docs/architecture/data-model.md`) contra o código atual de `server/src/modulos/businessmap` e as ADRs posteriores a 2026-10-11, e escrever o plano técnico da coleta (T2.2) e do webhook (T2.3) em fatias, com o que cada fatia espera do roteiro §7 do dono, em `docs/architecture/features/052-integracao-businessmap.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue (arquivos na worktree)
- "E1.2 (security-engineer): atualizar o modelo de ameaças da integração (apikey, allow-list, webhook, coleta agendada) a partir de `docs/security/adr-0020-protecao-de-pessoa.md` e `docs/security/k084-coletor-allow-list.md`, em `docs/security/052-integracao-businessmap-ameacas.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue (arquivo na worktree)
- "E1.3 (ux-designer): conferir a especificação validada `docs/ux/integracao-real/05-especificacao.md` (validação de 2026-10-10) contra os painéis atuais (FL1 a FL3 e as operacionais O19 a O26) e registrar só o que mudou, em `docs/ux/integracao-real/06-delta-2026-10-29.md`, na worktree 052, sem commit." · etapa de outra delegação; já entregue (arquivo na worktree)
- "E1.4 (dono): apikey do BusinessMap no `.env` e confirmação da WS1." · etapa de outra delegação; continua no pedido (do dono)
- Editar o conteúdo dos documentos; PR e merge; o quadro e os arquivos de pedido; as worktrees do 048 e do 050; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): "depois disso vamos trabalhar na integracao com o business map"
- DECISÃO DO DONO (2026-10-29): recibo do 052 aceito ("A", leitura a): a integração com dados reais do BusinessMap passa à frente do que falta do 048 em mock; E1 a E6 entram; Acelerato, WS1 e o resto do 048 ficam fora.
- DECISÃO DO DONO (2026-10-29): "facarecomendacao" (resposta ao roteiro §7): no item de decisão do roteiro ainda aberto (8, webhook ou só polling) vale a recomendação do time, escrita no plano da E1.1 e mostrada ao dono antes do código; o item 9 (dados de pessoa) já foi decidido pelo dono (2026-10-10 e R-2 = B em 2026-10-16, ADR 0020 itens 4b e 4c); os itens de ação (1 a 7 e 10) continuam com o dono.
- DECISÃO DO DONO (2026-10-29): "i" — E4 fica só no painel operacional inteiro (18 do FL1 e O19 a O26) com dado real do BusinessMap. Retira do escopo original: FL2 e FL3 com dado real (trecho "Painéis do fluxo (FL1, FL2, FL3)"); motivo: decisão do dono de priorizar as operacionais; consequência: FL2 e FL3 seguem em mock; decisão: "vamos fazer funionar as do bm operacionais so" + "i". Acelerato e sustentação: pedido seguinte.
- DECISÃO DO DONO (2026-10-29): "A" (MCP): o MCP do BusinessMap é só ferramenta do time nesta sessão (consulta ao quadro real no discovery e desenvolvimento; spike K-087 e mapa de campos); o coletor do sistema segue pela API REST. O dono configura o MCP e põe o token ("eu coloco o token"); o Jarvis não toca configuração do Claude Code nem o .env; dado de pessoa vindo do MCP não entra em documento.
- ADR 0020 (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`): vale para as etapas seguintes; esta não toca código.
- ADR 0022 (`docs/architecture/adr/0022-coleta-incremental-e-webhook-businessmap.md`) e ADR 0016: seguem como proposta; esta etapa só grava o texto que o arquiteto escreveu, sem aceitá-las nem alterá-las.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`. Sem PR.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 status --short` · espera: linhas=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 rev-list --count a6e75433716727edc3256419740f384775290a66..HEAD` · espera: igual '3'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052 ls-remote origin refs/heads/docs/052-businessmap-discovery` igual a `git -C /home/rodrigoisensee/MetricasDSPD-052 rev-parse HEAD`
- PQ-4 (cmd): `pnpm run docs:check` rodado na raiz de `/home/rodrigoisensee/MetricasDSPD-052` · espera: rc=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com os shas; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
