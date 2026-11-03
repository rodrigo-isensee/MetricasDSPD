---
tipo: review
contrato: 1
pedido: 061-coleta-diaria
branch: feature/061-coleta-diaria
commit: 6dece9a61c6c152f2e61422dcd881286e3beafd8
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 061-coleta-diaria, coleta diária no servidor interno (E2.3, K-196), revalidação por delta

**Veredito: aprovado** em `6dece9a`. O A1 bloqueante da primeira rodada (`e992a5f`) está resolvido; os recomendados A2, A3, A4 e A5 e os da segurança foram aplicados. Não restou achado.

## Delta lido
- `git diff e992a5f...6dece9a`: `README.md`, `deploy/systemd/metricas-coleta-acelerato-releitura.service` e `docs/devops/runbook-coleta-diaria.md` (mais os pareceres, que não se revisam). O `forge-check delta` não existe neste repositório; o delta foi lido pelo diff do brief.
- Já lido e sem mudança: Dockerfile, `.dockerignore`, `docker-compose.yml`, os demais arquivos de `deploy/systemd/` e as ADRs 0022 e 0023 (parecer anterior, `17481f8`).
- Teto M14: o delta só toca 1 linha de unidade systemd além de texto; o total segue abaixo de 150. Um comportamento só.

## Conferência
- **A1 resolvido:** o runbook manda `install -d -m 755` no `segredos/` e `chmod 644` no PEM, com a razão (certificado público, container uid 1000) e o sintoma de 700/600 (`tls`). O diretório `/etc/metricas-dspd` segue 700: só o daemon do Docker monta o `segredos/`, então a travessia é de root e basta.
- **A2:** `After=` da releitura inclui `metricas-coleta-acelerato.service`; as duas entram na fila.
- **A3:** Compose 2.24 nos pré-requisitos e `docker compose version` na instalação.
- **A4:** passo de conferência do estouro do `TimeoutStartSec` com `docker ps`, e o plano `--name` fixo mais `ExecStopPost` se sobrar container. Como recomendação, a conferência na instalação basta.
- **A5:** o README ganhou a seção que aponta o runbook.
- **Segurança:** clone em root, `chmod 600` do `.env` do Compose e conferência das senhas `_dev` estão no runbook, o que atende aos A1 a A3 do parecer de segurança.

## Achados
- Nenhum.
