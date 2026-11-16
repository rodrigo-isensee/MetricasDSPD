---
tipo: revisao-seguranca
contrato: 1
pedido: 105-vm-lacunas
branch: feature/105-vm-lacunas
commit: 6999a1658ad8dd4dadd52eaea813db95981430de
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: lacunas da VM (pedido 105, E7.256)

Rodada 1. Intervalo `57989aa0...6999a165` (commit único `6999a165`, E7.245): `.env.example` (+3), `CHANGELOG.md` (+1), `deploy/systemd/metricas-referencias.service` e `.timer` (novos), `docs/devops/runbook-coleta-diaria.md` (+23 -9). Revisão estática, mais uma sonda local da validação de configuração (sem banco, sem container, sem `.env` lido). Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde.

**Veredito: reprovado.** Um bloqueante (A1): a unidade nova não obtém o papel `dspd_ref` que declara usar e falha toda semana na partida; a correção natural de quem opera (pôr outra URL de banco no `coleta.env`) tende a dar ao timer um papel mais forte que o necessário. Segredos: nenhum valor em arquivo versionado.

## Gatilhos
Credenciais e papéis do banco em host administrado por outros, agendador com execução como root, sal do HMAC da lista de supressão (ADR 0020 R4-6, dado pessoal). R-SEGURANCA.

## Achados
- A1 (bloqueante) deploy/systemd/metricas-referencias.service:13 · Os 4 ref-sync usam carregarConfigRef, que exige PG_REF_URL; o serviço coleta só recebe PG_COLETOR_URL e DSPD_PWD_REF (docker-compose.yml:86-87). A unidade falha toda semana (S1) e convida a pôr URL de outro papel no coleta.env. Dono: devops-engineer.
- A2 (recomendado) deploy/systemd/metricas-referencias.service:10 · O comentário (e runbook:17) diz que o container só recebe senhas do banco, mas o serviço coleta carrega o coleta.env inteiro (apikey, senha do MySQL, sal). Corrigir o texto ou usar serviço próprio sem env_file. Dono: devops-engineer.

## Sondas
- S1 · carregarConfigRef({PG_COLETOR_URL:'postgres://dspd_coletor:x@postgres:5432/metricas', DSPD_PWD_REF:'y', LOG_LEVEL:'info'}) (o ambiente do serviço coleta) · espera: config do papel dspd_ref · obtido: ErroConfiguracao "Configuração inválida (variáveis: PG_REF_URL)"

## Detalhe dos achados

**A1. O timer não chega ao papel `dspd_ref`.** Evidência: `server/src/entradas/ref-sync-businessmap.ts:21`, `ref-sync-ac.ts:23`, `ref-sync-calendario.ts:20` e `ref-sync-apontamento.ts:32` chamam `carregarConfigRef`, cujo esquema é `{ ...comum, PG_REF_URL: urlPg }` (`server/src/plataforma/config.ts:72`), sem a derivação a partir de `DSPD_PWD_REF` que o esquema da coleta do BusinessMap tem (`config.ts:106`). O serviço `coleta` define só `PG_COLETOR_URL` e `DSPD_PWD_REF` (`docker-compose.yml:86-87`), e o runbook não lista `PG_REF_URL` no `coleta.env` (`runbook-coleta-diaria.md:29`). O `.env.example:16` traz `PG_REF_URL` só para a máquina de desenvolvimento. Resultado provado (S1): saída por configuração ilegível no primeiro `ExecStart`, as outras três não rodam, aviso de falha todo domingo; o comando manual do item 4a (`runbook:61`) falha igual e bloqueia a primeira carga do Apontamento. Caminho de risco: quem opera a VM, para calar o aviso, define `PG_REF_URL` no `coleta.env` com a URL que tem à mão, a do migrador (citada no mesmo runbook, :17) ou a do coletor; o timer passa a rodar como root na VM com um papel que pode alterar esquema ou escrever fatos, fora do mínimo (`dspd_ref`: só `SELECT, INSERT` nas `ref_` e `UPDATE (vigente_ate)`, `server/src/plataforma/db/grants.ts:119-121,128-129`, que está correto). Severidade: média (falha certa; escalada depende de erro do operador). Correção mínima, uma das duas: (a) no `docker-compose.yml`, serviço `coleta`, `environment`, acrescentar `PG_REF_URL: postgres://dspd_ref:${DSPD_PWD_REF:-ref_dev}@postgres:5432/metricas` (a senha vem do `.env` do Compose, 600, como as demais; nada novo em arquivo versionado além do padrão de desenvolvimento já existente); ou (b) dar a `esquemaRef` a mesma derivação de `esquemaColetaBusinessMap` (`PG_REF_URL` ou `PG_COLETOR_URL` + `DSPD_PWD_REF`, trocando papel e senha), com dono `node-backend`. Nos dois casos, o runbook diz que a URL do timer é sempre a do `dspd_ref`, nunca a do migrador nem a do coletor, e a prova é um teste de configuração que carrega `carregarConfigRef` com o ambiente exato do serviço `coleta`. Esforço: P. Dono: devops-engineer (a) ou node-backend (b), com review do tech-lead.

**A2. "Sem credencial" vale para o arquivo, não para o container.** Evidência: `metricas-referencias.service:10` e `runbook-coleta-diaria.md:17` afirmam que o Compose entrega só senhas do banco; o serviço `coleta` lê `env_file` `coleta.env` (`docker-compose.yml:82-84`), com apikey do BusinessMap, senha do MySQL do Acelerato e o sal. Os ref-sync não leem essas variáveis (o esquema descarta o que não declara), então não há vazamento demonstrado; o ponto é mínimo privilégio e documentação correta: um defeito futuro num ref-sync (log de `process.env`, dependência comprometida na imagem) alcançaria segredos que essa tarefa não precisa. Severidade: baixa. Correção mínima: corrigir o texto da unidade e do runbook ("a unidade não guarda credencial; o container de coleta recebe o `coleta.env`") ou, se o dono preferir o mínimo, um serviço Compose `referencias` com o mesmo `build`, sem `env_file` nem volume `/segredos`, só com `PG_REF_URL` do `dspd_ref`. Esforço: P. Dono: devops-engineer.

## O que foi verificado e está correto

**Segredos em arquivo.** `.env.example:46` traz `PESSOA_ELIMINADA_SAL=` vazio, com o comentário (:44-45) de gerar na instalação e guardar só no `.env`. Unidade e timer novos sem valor de segredo; o runbook só nomeia variáveis e caminhos e manda guardar cópia do sal no cofre do dono (:29), o que preserva a lista de supressão sem pôr o sal em arquivo do repositório. Varredura do diff por padrão de senha, chave, token e atribuição com valor: só nomes de variável. O `.env` não foi lido.

**Timer.** `OnCalendar=Sun *-*-* 05:00:00 America/Sao_Paulo`, `Persistent=true`, `OnFailure=` para o aviso existente, `EnvironmentFile=-/etc/metricas-dspd/host.env` (só o e-mail do aviso), `TimeoutStartSec=30min`. Mesma postura das unidades da coleta (root, Compose, sem porta publicada). Nenhuma chamada a BusinessMap nem Acelerato: os quatro scripts só leem arquivos versionados e o banco.

**Papel migrador fora do timer.** `bm:criterios-classe-servico` fica manual e o container de coleta não recebe o papel migrador (`runbook:17`), correto.

**Apontamento.** Carga inicial manual, uma vez, recusa sem sal (`config.ts`, `esquemaApontamentoBusinessMap` exige 32 caracteres); log só com contagens, nunca nome nem id de pessoa (`runbook:65`).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática, varredura por padrão no diff e uma sonda local da validação de configuração. Faltaram no ambiente o varredor de segredos (não está no PATH) e a verificação das unidades pelo `systemd-analyze` (recusou por sistema de arquivos somente leitura no sandbox); ambos são lacuna registrada, sem instalação.
