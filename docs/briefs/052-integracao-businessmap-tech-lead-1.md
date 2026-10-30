Agente destino: forge:tech-lead
Pedido: 052-integracao-businessmap
Tipo: codigo
Branch: docs/052-businessmap-discovery   Base: develop   Base-sha: a6e75433716727edc3256419740f384775290a66
Etapa: codigo   Cobre: E1.0

## Objetivo
Etapa E1.0 do pedido 052 (cartão K-182): preparar a worktree onde o discovery da integração real com o BusinessMap vai ser escrito (E1.1 a E1.3), para o arquiteto, a segurança e o UX trabalharem em paralelo sem misturar arquivos com o clone principal.

## Ler
- Nada além deste brief.

## Entregar
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-052` e branch `docs/052-businessmap-discovery` a partir da `develop`, sem commit." (E1.0), com:
  - (E1) `git -C /home/rodrigoisensee/MetricasDSPD fetch origin`, depois `git -C /home/rodrigoisensee/MetricasDSPD worktree add -b docs/052-businessmap-discovery /home/rodrigoisensee/MetricasDSPD-052 a6e75433716727edc3256419740f384775290a66`; sem push, sem commit.
- (E2, E3, E4, E5, E6) Nada a entregar aqui: não nesta delegação (coleta, webhook, painéis, itens de segurança e ordem WS1 → WS2 → WS3 vêm depois do discovery validado, em outras delegações).

## Fora do escopo
- "E1.1 (software-architect): T2.1 e plano técnico da coleta (fonte, agendamento, incremental, base analítica)." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças da integração (apikey, allow-list, webhook)." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): o que muda nos painéis com dado real (estados vazio, abaixo de 20 itens, atraso da coleta)." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): apikey do BusinessMap no `.env` e confirmação da WS1." · etapa de outra delegação; continua no pedido (do dono)
- "E1.5 (tech-lead): commit e push dos documentos do discovery (E1.1 a E1.3) na `docs/052-businessmap-discovery`, sem PR; o PR vem depois da validação do dono." · etapa de outra delegação; continua no pedido
- Código, documentos, push, PR e merge; as worktrees e branches do 048 e do 050; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): "depois disso vamos trabalhar na integracao com o business map"
- DECISÃO DO DONO (2026-10-29): recibo do 052 aceito ("A", leitura a): a integração com dados reais do BusinessMap passa à frente do que falta do 048 em mock; E1 a E6 entram; Acelerato, WS1 e o resto do 048 ficam fora.
- ADR 0020 (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`): vale para as etapas seguintes; esta não toca código.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 branch --show-current` · espera: igual 'docs/052-businessmap-discovery'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052 rev-parse HEAD` · espera: igual 'a6e75433716727edc3256419740f384775290a66'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
