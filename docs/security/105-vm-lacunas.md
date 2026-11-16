---
tipo: revisao-seguranca
contrato: 1
pedido: 105-vm-lacunas
branch: feature/105-vm-lacunas
commit: f203c8e84b091cd9a26e58fd545b50c889fc851b
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: lacunas da VM (pedido 105, E7.256 e E7.260)

Rodada 2 (volta por delta, E7.260). Intervalo do delta `6999a165..71ebff2f` (código em `f203c8e8`, E7.259; `71ebff2f` só traz o parecer do devops): no domínio, `docker-compose.yml` (+2), `deploy/systemd/metricas-referencias.service` (+3 -1) e `.timer` (+1); fora do domínio, relidos por tocarem os achados, `docs/devops/runbook-coleta-diaria.md` (+2 -2) e `CHANGELOG.md`. Revisão estática e uma sonda local da validação de configuração (sem banco, sem container, sem `.env` lido). Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde.

**Veredito: aprovado.** A1 e A2 da rodada 1 corrigidos; o delta não abre achado novo. Segredos: nenhum valor em arquivo versionado.

## Gatilhos
Credenciais e papéis do banco em host administrado por outros, agendador com execução como root, sal do HMAC da lista de supressão (ADR 0020 R4-6, dado pessoal). R-SEGURANCA.

## Achados

## Sondas

## Detalhe dos achados

Nenhum achado aberto. Situação dos achados da rodada 1 (commit `6999a165`):

**A1 (bloqueante na rodada 1) corrigido.** `docker-compose.yml:89` acrescenta ao `environment` do serviço `coleta` a `PG_REF_URL` do papel `dspd_ref`, montada de `DSPD_PWD_REF` (opção (a) da correção mínima). A senha vem do `.env` do Compose (600), como as demais; o padrão `ref_dev` já existia na linha 87 e o runbook (item 4 da seção 2) manda confirmar que nenhum padrão `_dev` restou no servidor. Sonda repetida com o ambiente novo do serviço (`PG_COLETOR_URL`, `DSPD_PWD_REF`, `PG_REF_URL` do `dspd_ref`, `LOG_LEVEL`): `carregarConfigRef` aceita e devolve o usuário `dspd_ref` (rodada 1: recusava por falta de `PG_REF_URL`). O caminho de risco (operador pondo a URL do migrador ou do coletor no `coleta.env`) fica fechado duas vezes: no Compose, `environment` prevalece sobre `env_file`, então uma `PG_REF_URL` no `coleta.env` não chega ao container; e a unidade (`metricas-referencias.service:12`) e o runbook (`runbook-coleta-diaria.md:17`) dizem para não defini-la ali. Efeito colateral verificado: `coleta-businessmap.ts` já usava `PG_REF_URL` derivada do coletor com `DSPD_PWD_REF` (`config.ts:106`), que dá a mesma URL; com a variável explícita o valor não muda. O teste de configuração com o ambiente exato do serviço, sugerido na rodada 1, não foi escrito; a sonda cobre a prova desta volta e o caso fica como sugestão ao QA, sem bloquear.

**A2 (recomendado na rodada 1) corrigido.** `metricas-referencias.service:10-12` e `runbook-coleta-diaria.md:17` passam a dizer que a unidade não guarda credencial e que o container `coleta` recebe o `coleta.env` inteiro (apikey, senha do MySQL, sal). O dono escolheu corrigir o texto em vez de criar um serviço próprio sem `env_file`; os ref-sync não leem essas variáveis (o esquema descarta o que não declara), então o texto correto basta.

**Observações sem achado.** (1) O comentário em `docker-compose.yml:88` resume o papel como "SELECT/INSERT nas ref_"; o `dspd_ref` tem também `UPDATE (vigente_ate)` (`server/src/plataforma/db/grants.ts:119-121,128-129`). É imprecisão de comentário, sem efeito no privilégio. (2) `Persistent=true` com nota no timer (`metricas-referencias.timer:7`) e no runbook: execução no boot que pode coincidir com a coleta das 06:00; os papéis são distintos e os scripts idempotentes, sem risco de segurança. (3) A nota do runbook de que o sal só entra no `coleta.env` junto da carga inicial do Apontamento evita que o incremental rode o Apontamento antes da hora; não muda a guarda do sal (cofre do dono, nunca em arquivo versionado).

## O que foi verificado e está correto
Na rodada 1 e mantido no delta: `.env.example:46` com `PESSOA_ELIMINADA_SAL=` vazio; unidade e timer sem valor de segredo; timer com `OnFailure=` para o aviso existente e `EnvironmentFile=-/etc/metricas-dspd/host.env` (só o e-mail do aviso); nenhuma chamada a BusinessMap nem Acelerato pelos quatro ref-sync; papel migrador fora do timer (`bm:criterios-classe-servico` manual); Apontamento recusa partida sem sal de 32 caracteres e loga só contagens. Varredura do delta por padrão de senha, chave, token e atribuição com valor: só nomes de variável e o padrão de desenvolvimento já existente.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática, `forge-check parecer delta`, varredura por padrão no diff e uma sonda local da validação de configuração. Faltaram no ambiente o varredor de segredos (não está no PATH) e a verificação das unidades pelo `systemd-analyze` (rodada 1: recusado pelo sandbox); lacunas registradas, sem instalação.
