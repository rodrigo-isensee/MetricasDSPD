---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-lacunas
commit: f203c8e84b091cd9a26e58fd545b50c889fc851b
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: lacunas da VM, volta 1 (E7.259)

## Achados

## Detalhes
Nenhum achado aberto. Fechados nesta volta: segurança A1 (bloqueante) e A2; review A1 e A2.

Escopo: `docker-compose.yml`, `deploy/systemd/metricas-referencias.service` e `.timer`, `docs/devops/runbook-coleta-diaria.md`, `CHANGELOG.md`.

- Segurança A1: o serviço `coleta` do Compose agora define `PG_REF_URL` do papel `dspd_ref`, montada de `DSPD_PWD_REF` como as outras senhas (opção a do parecer). Prova: `docker compose --profile coleta config` mostra `PG_REF_URL` no ambiente do serviço; `carregarConfigRef` carregado com exatamente esse ambiente (sem variável manual) devolve a config com papel `dspd_ref` (antes: ErroConfiguracao em `PG_REF_URL`). O runbook manda nunca pôr `PG_REF_URL` no `coleta.env`, e o item 4a (comando manual) passa a funcionar.
- Segurança A2: texto da unidade e do runbook corrigido: sem credencial no arquivo da unidade, mas o container `coleta` recebe o `coleta.env` inteiro; os scripts só leem o banco. Serviço próprio sem `env_file` não foi criado (opção só se o dono preferir o mínimo).
- Review A1: o runbook diz que o sal só entra no `coleta.env` junto da carga inicial do Apontamento, porque com ele o incremental das 06:00 já roda o Apontamento.
- Review A2: `Persistent=true` documentado no timer e no runbook (roda no boot se a VM estava desligada; idempotente).
- Ferramentas: `actionlint` e `shellcheck` não se aplicam (nenhum workflow ou script mudou); `systemd-analyze verify` não roda nesta estação (somente leitura), fica no passo de instalação do runbook. Sem workflow alterado.

## Custo e rollback
Custo zero. Rollback: reverter o commit; a unidade volta a falhar por `PG_REF_URL`.
