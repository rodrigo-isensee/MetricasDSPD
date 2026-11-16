---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-lacunas
commit: 6999a1658ad8dd4dadd52eaea813db95981430de
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: lacunas da VM (E7.245, review E7.255)

Commit revisado: `6999a165` (único commit sobre a base `57989aa0`). Diff: `.env.example` (+3), `CHANGELOG.md` (+1), `deploy/systemd/metricas-referencias.service` (novo, 17), `deploy/systemd/metricas-referencias.timer` (novo, 10) e `docs/devops/runbook-coleta-diaria.md`. Não há código TypeScript nem teste no diff. Configuração e unidades somam 30 linhas, dentro do teto M14, e o comportamento é um só: deixar a implantação na VM completa.

**Faz o que o pedido manda, sem defeito.** As três lacunas registradas no Histórico (13:01) estão fechadas: `PESSOA_ELIMINADA_SAL` aparece vazia e comentada no `.env.example`, o runbook cobre o Apontamento e a unidade semanal das referências existe.

## Conferências por leitura
- **`.env.example`:** a variável vem vazia, e o `vazioIndefinido` de `server/src/plataforma/config.ts:101` lê o vazio como ausente. A carga do Apontamento continua exigindo `min(32)` (`config.ts:112`). O comentário manda gerar o sal na instalação e avisa que trocá-lo invalida a lista de supressão. Nenhum segredo entra no repositório.
- **Unidade `metricas-referencias.service`:** segue o padrão das unidades de coleta: `Type=oneshot`, `OnFailure=metricas-coleta-falha@%n.service`, `host.env` opcional e nenhuma credencial. Com vários `ExecStart=` num oneshot, os passos rodam em sequência e o primeiro que falhar interrompe os seguintes, como o comentário diz. Os quatro scripts existem em `server/src/entradas/` e usam `carregarConfigRef` e `PG_REF_URL`. O serviço `coleta` do `docker-compose.yml` recebe `DSPD_PWD_REF`, e `config.ts:106` monta a URL do `dspd_ref` a partir da do coletor. Os arquivos que os scripts leem estão em `docs/architecture/fontes/`, que o `server/Dockerfile` copia para a imagem. Nenhum dos quatro chama BusinessMap ou Acelerato. Sem argumento, a data padrão (`Date.now() - 3h`) cai no próprio domingo às 05:00 de Brasília.
- **Timer:** `systemd-analyze calendar 'Sun *-*-* 05:00:00 America/Sao_Paulo'` normaliza para a próxima execução em `Sun 2026-11-22 05:00:00 -03`. Roda uma hora antes da coleta das 06:00. O `systemd-analyze verify` não roda nesta estação, porque o sistema de arquivos é somente leitura. Ele fica no passo de instalação do runbook, que já o inclui.
- **Runbook:** o comando da carga inicial (`apontamento-businessmap.ts carga-inicial`) bate com a entrada, cujo cabeçalho é a linha 13. O incremental do Apontamento já roda como etapa do `coleta-businessmap.ts incremental` quando o sal está configurado (`coleta-businessmap.ts:40-50`). O `bm:criterios-classe-servico` usa o `PG_MIGRADOR_URL` (`criterios-classe-servico.ts:27-28`): está certo deixá-lo manual. Instalação, ligar a agenda e voltar atrás incluem as duas unidades novas.
- **Regras invioláveis:** os dados continuam separados. Os subgrupos do Apontamento continuam com o papel `dspd_ref`. Nenhum dado de pessoa aparece em log: o runbook pede só as contagens.

## Comandos
- Sem PR nem CI para este head. O diff não tem código executável do Node e não há teste novo ou mutante a rodar. A suíte inteira fica para o CI do PR, e este parecer não afirma CI verde.
- Rodei `systemd-analyze calendar` (saída acima). O `verify` não roda nesta estação (`Failed to setup working directory: Read-only file system`).

## Achados
- A1 (recomendado) docs/devops/runbook-coleta-diaria.md:17 · O incremental do Apontamento roda assim que o sal está no `coleta.env`, com ou sem carga inicial. A ordem do runbook (4a antes dos timers) protege; vale dizê-lo numa frase explícita.
- A2 (recomendado) deploy/systemd/metricas-referencias.timer:7 · Com `Persistent=true`, a VM desligada no domingo roda as referências no boot, talvez junto da coleta. Os scripts são idempotentes, então o resultado não muda.
