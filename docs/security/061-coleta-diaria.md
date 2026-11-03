---
tipo: revisao-seguranca
contrato: 1
pedido: 061-coleta-diaria
branch: feature/061-coleta-diaria
commit: 808034100af8feec83e9490dc4fbdec4b95afecf
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: coleta diária no servidor interno (pedido 061, E2.4, K-196)

Rodada 2, revalidação por delta. Parecer anterior sobre `e992a5f` (aprovado, A1 a A3 recomendados). Intervalo desta rodada: `e992a5f...8080341`. Fora pareceres de outros papéis, o delta é `6dece9a`: `README.md` (+3), `deploy/systemd/metricas-coleta-acelerato-releitura.service` (1 linha) e `docs/devops/runbook-coleta-diaria.md` (+12 -7). `forge-check delta --parecer` listou README:20-22 e a unidade da releitura:4; o runbook foi relido por inteiro no trecho alterado. Revisão estática: nenhum `.env` lido, nada executado, nenhum container subiu, nenhuma coleta rodou. Código (`server/`, `packages/`), `docker-compose.yml` e `server/Dockerfile` sem mudança no intervalo.

**Veredito: aprovado.** Nenhum bloqueante. A1, A2 e A3 da rodada 1 resolvidos no runbook. Uma recomendação nova (A4), sem caminho de ataque além de quem já é root na VM.

## Gatilhos
Os da rodada 1 (credenciais de integração em host administrado por outros, Compose e imagem, agendador com e-mail de saída, riscos aceitos nas ADRs 0022 e 0023). O delta toca permissões de segredos e do clone executado como root. R-SEGURANCA.

## Achados
- A1 (recomendado) docs/devops/runbook-coleta-diaria.md:29 · Resolvido: diretório `segredos` 755 e PEM 644 (público), com o motivo (uid 1000) e o comando em :42-44; o resto de `/etc/metricas-dspd` segue 700/600.
- A2 (recomendado) docs/devops/runbook-coleta-diaria.md:21 · Resolvido: clone de root, só root escreve, `chown -R root:root` em :45 e o motivo (execução como root).
- A3 (recomendado) docs/devops/runbook-coleta-diaria.md:31 · Resolvido: `.env` do Compose com `chmod 600` dono root (:46) e conferência de que nenhum padrão `_dev` restou, feita pelo dono.
- A4 (recomendado) docs/devops/runbook-coleta-diaria.md:29 · Com `segredos` em 755, dizer que ali fica só o PEM: `coleta.env` ou chave privada postos nesse diretório por engano ficam listáveis e, se 644, legíveis por qualquer usuário da VM. Dono: devops-engineer.

## O que foi verificado no delta

**Permissões de segredos (A1).** O afrouxamento é só do diretório `segredos` e do certificado, que é público; `coleta.env` e `host.env` seguem 600 em `/etc/metricas-dspd` 700 (`runbook-coleta-diaria.md:41,43`). O bind mount continua `:ro` (`docker-compose.yml:91`) e é feito pelo daemon (root), então o pai 700 não impede a montagem. O TLS do coletor não muda: o runbook repete "nunca afrouxar o TLS" (:29) e `NODE_TLS_REJECT_UNAUTHORIZED` segue proibido (:28).

**Clone executado como root (A2).** `aviso-falha.sh` e o `docker compose build` partem de `/opt/metricas-dspd`; o runbook fixa o dono root e a ausência de escrita de grupo e outros. O comando dado é só o `chown`; o modo do clone padrão (umask 022) já atende, por isso não vira achado.

**`.env` do Compose (A3).** `chmod 600` e a conferência das senhas padrão ficam com o dono, coerente com a restrição de o agente não abrir `.env*`.

**README.** Só aponta para o runbook; nenhum caminho de segredo, host, e-mail ou valor.

**Unidade da releitura.** `After=` passa a incluir `metricas-coleta-acelerato.service`: só ordenação, sem mudança de usuário, ambiente, comando ou segredo (`metricas-coleta-acelerato-releitura.service:4`).

**Compose 2.24 e estouro de `TimeoutStartSec`.** Requisito de versão para o `env_file` com `required` (:20, :40): sem efeito de segurança. A orientação de `--name` fixo e `ExecStopPost=docker rm -f` (:56) é operacional, não altera unidade versionada nem amplia privilégio (as unidades já rodam como root).

**Segredos no delta.** Varredura por padrão de chave, senha, token, chave privada, e-mail e IP nas linhas adicionadas: nada além de nomes de variável e caminhos.

## Ferramentas e lacunas
Revisão por leitura e `grep`. Não estão no PATH: `gitleaks`, `hadolint`, `trivy`, `semgrep`, `actionlint`, `zizmor`; nenhuma instalada (R-CUSTO). Sem workflow alterado. `systemd-analyze verify` fica para a instalação na VM, como o runbook registra.

## Riscos aceitos
Os do dono, já registrados nas ADRs: apikey pessoal com escrita guardada no servidor interno (ADR 0022 item 6) e conta compartilhada do MySQL sem host amarrado nem `REQUIRE SSL` no servidor (ADR 0023 §8). Este parecer não cria risco aceito novo.
