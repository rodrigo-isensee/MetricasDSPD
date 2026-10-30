Agente destino: forge:security-engineer
Pedido: 052-integracao-businessmap
Tipo: codigo
Branch: docs/052-businessmap-discovery   Base: develop   Base-sha: a6e75433716727edc3256419740f384775290a66
Etapa: codigo   Cobre: E1.2

## Objetivo
Etapa E1.2 do pedido 052 (cartão K-182): o modelo de ameaças da coleta foi feito para a ADR 0020 e o K-084; a integração real agora traz coleta agendada pela API, apikey de verdade e webhook. Atualize as ameaças para esse cenário, de forma defensiva e estática. Worktree `/home/rodrigoisensee/MetricasDSPD-052`, branch `docs/052-businessmap-discovery`; você escreve, o commit é do tech-lead (E1.5).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052/docs/security/adr-0020-protecao-de-pessoa.md` e `/home/rodrigoisensee/MetricasDSPD-052/docs/security/k084-coletor-allow-list.md`.
- `/home/rodrigoisensee/MetricasDSPD-052/docs/integracao/businessmap-api-configuracao.md`, seções 1, 4.8, 4.9, 6 e 7.
- `/home/rodrigoisensee/MetricasDSPD-052/server/src/modulos/businessmap/webhook.ts` e `allow-list.ts`.

## Entregar
- "E1.2 (security-engineer): atualizar o modelo de ameaças da integração (apikey, allow-list, webhook, coleta agendada) a partir de `docs/security/adr-0020-protecao-de-pessoa.md` e `docs/security/k084-coletor-allow-list.md`, em `docs/security/052-integracao-businessmap-ameacas.md`, na worktree 052, sem commit." (E1.2), com:
  - (E1) `docs/security/052-integracao-businessmap-ameacas.md`: ativos, fronteiras, ameaças (apikey, usuário de serviço, webhook sem assinatura, dado de pessoa, log com payload, taxa e retry), controles existentes e faltantes, e o que entra como portão nas fatias da coleta (K-086, K-088, K-089).
- (E2, E3, E4, E5, E6) Nada a entregar aqui: não nesta delegação (coleta, webhook, painéis com dado real, itens de segurança K-086, K-088 e K-089 e a ordem WS1 → WS2 → WS3 vêm depois do discovery validado).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-052` e branch `docs/052-businessmap-discovery` a partir da `develop`, sem commit." · etapa de outra delegação; já entregue (worktree e branch em a6e7543)
- "E1.1 (software-architect): atualizar o desenho já feito no pedido 006 (`docs/architecture/features/integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`, `docs/architecture/data-model.md`) contra o código atual de `server/src/modulos/businessmap` e as ADRs posteriores a 2026-10-11, e escrever o plano técnico da coleta (T2.2) e do webhook (T2.3) em fatias, com o que cada fatia espera do roteiro §7 do dono, em `docs/architecture/features/052-integracao-businessmap.md`, na worktree 052, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): conferir a especificação validada `docs/ux/integracao-real/05-especificacao.md` (validação de 2026-10-10) contra os painéis atuais (FL1 a FL3 e as operacionais O19 a O26) e registrar só o que mudou, em `docs/ux/integracao-real/06-delta-2026-10-29.md`, na worktree 052, sem commit." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): apikey do BusinessMap no `.env` e confirmação da WS1." · etapa de outra delegação; continua no pedido (do dono)
- "E1.5 (tech-lead): commit e push dos documentos do discovery (E1.1 a E1.3) na `docs/052-businessmap-discovery`, sem PR; o PR vem depois da validação do dono." · etapa de outra delegação; continua no pedido
- Código, commit, push, PR e merge; o quadro e os arquivos de pedido; as worktrees do 048 e do 050; Acelerato e sustentação.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): "depois disso vamos trabalhar na integracao com o business map"
- DECISÃO DO DONO (2026-10-29): recibo do 052 aceito ("A", leitura a): a integração com dados reais do BusinessMap passa à frente do que falta do 048 em mock; E1 a E6 entram; Acelerato, WS1 e o resto do 048 ficam fora.
- DECISÃO DO DONO (2026-10-29): "facarecomendacao" (resposta ao roteiro §7): nos itens de decisão do roteiro (8, webhook ou só polling; 9, dados de pessoa) vale a recomendação do time, escrita no plano da E1.1 e mostrada ao dono antes do código; os itens de ação (1 a 7 e 10) continuam com o dono.
- ADR 0020 (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`): allow-list na fronteira; nenhum dado de pessoa no staging nem em outra tabela.
- Regras invioláveis do `CLAUDE.md` do projeto: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; abaixo de 20 itens não se publica estatística; carga incremental nunca sobrescreve histórico; credenciais só no `.env`; dúvida de regra de negócio vira pergunta ao dono, nunca decisão no documento.
- Não ler nem editar o `.env`; não chamar a API do BusinessMap (a apikey ainda não existe; E1.4 é do dono).

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-052/docs/security/052-integracao-businessmap-ameacas.md` existe, escrito por você · espera: arquivo

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono (perguntas de regra de negócio, uma por linha, com opções); suposições com a base; o que foi feito; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n`, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
