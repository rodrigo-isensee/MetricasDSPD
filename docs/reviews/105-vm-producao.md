---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: 6aa8617707d275aed6947d405fd62a2b3584df8e
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: configuração de produção da VM (E7.270, volta 1 E7.276, volta 2 E7.291, volta 3 E7.295, review E7.296)

## Delta lido (volta 3)
`forge-check parecer delta docs/reviews/105-vm-producao.md`: intervalo `d9f8bb9b..6aa86177`, "delta: nenhum arquivo do domínio mudou". O commit da volta, `6aa86177`, mexe só em `docs/devops/105-implantacao-vm.md` (3 linhas: 106, 146 e 187), lidas contra `deploy/sql/9000_grants.sql`, `server/src/plataforma/db/grants.ts`, `server/src/modulos/businessmap/apontamento/eliminacao.ts`, `deploy/systemd/metricas-referencias.service`, `docker-compose.prod.yml`, `docs/devops/runbook-coleta-diaria.md` e a ADR 0022.

## O que foi conferido
- **A8 resolvido (linha 146):** o texto diz que o `metricas-referencias.timer` roda as quatro sincronizações (BusinessMap, Acelerato, calendário, subgrupos do Apontamento); o service tem exatamente esses 4 `ExecStart` (`ref-sync-businessmap`, `ref-sync-ac`, `ref-sync-calendario`, `ref-sync-apontamento`). `bm:criterios-classe-servico` segue manual com o papel migrador: o `PG_MIGRADOR_URL` só aparece no serviço `migrate` do `docker-compose.prod.yml`, não no `coleta`. A ADR 0022 item 4 trata só da carga inicial, como o texto diz agora; o runbook (linha 19) traz as duas coisas. O título LACUNA saiu.
- **A9 resolvido (linha 187):** `9000_grants.sql:411` dá a `dspd_api_apontamento` `responsavel_nome` e `pessoa_ref` de `dim_responsavel`; `:403` dá `pessoa_ref` de `fato_apontamento`; `:413` dá `pessoa_ref` de `apt_pessoa_time`. O texto diz o nome real em claro e que o sal só alimenta o HMAC da supressão; confere com `eliminacao.ts:9-13` (grava o HMAC, apaga a linha de `dim_responsavel`, anula `pessoa_ref` no fato).
- **A10 resolvido (linha 106):** `systemctl list-timers 'metricas-*'` cobre os quatro timers ligados.
- **Ferramentas e CI:** só texto mudou; sem código, teste nem shell no diff, nada a rodar. Sem PR para a branch: a suíte fica para o CI do PR; não afirmo CI verde neste head.
- **Segurança:** cito o parecer do `security-engineer` (`docs/security/105-vm-producao.md`); não o refaço.

## Achados

## Parecer
Aprovado no head `6aa8617707d275aed6947d405fd62a2b3584df8e`, sem achado novo: A8, A9 e A10 da volta 2 resolvidos.
