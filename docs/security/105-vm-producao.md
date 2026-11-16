---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: 6aa8617707d275aed6947d405fd62a2b3584df8e
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: configuração de produção da VM (105, E7.298)

Escopo: revalidação por delta `d9f8bb9b..6aa86177` (volta 3, E7.295). `forge-check parecer delta`: nenhum arquivo do domínio mudou. Fora do domínio, lidas por tocarem acesso a dado pessoal e agendamento: as três linhas mudadas de `docs/devops/105-implantacao-vm.md` (106, 146, 187; A8, A9 e A10 de `/home/rodrigoisensee/pedidos-assistente/prod-volta3.md`), conferidas contra o código. Revisão estática; nada executado contra banco real nem contra a VM.

**Veredito: aprovado.** Nenhuma mudança de configuração, papel, GRANT ou unidade. O A2 do parecer anterior (texto sobre as colunas de pessoa do `dspd_api_apontamento`) está fechado: a linha 187 agora diz que o papel lê o nome real em claro e que o sal não o protege, o que bate com o código. Aprovação anterior (d9f8bb9b) segue de pé.

## Gatilhos
`R-SEGURANCA`: credenciais e papéis do banco, TLS ao banco, infraestrutura e acessos (grupo do motor de contêineres), dado pessoal em backup e acesso por coluna a dado de pessoa (LGPD).

## Achados
- A1 (recomendado) docker/postgres/init/01-databases-papeis.sh:7 · Fora do caminho de produção: o init do banco local e reparar-papeis.sh:15 ainda passam senhas por -v e criam webhook, automação e pesquisa com LOGIN. Só dado fictício; alinhar ao gerado (\getenv, NOLOGIN) quando mexerem no arquivo.

## Detalhe dos achados
**A2 (fechado).** `docs/devops/105-implantacao-vm.md:187`, conferido contra o código:
- "lê duas colunas de pessoa: `responsavel_nome` de `dim_responsavel` ... e `pessoa_ref` de `fato_apontamento`, `dim_responsavel` e `apt_pessoa_time`": `deploy/sql/9000_grants.sql:403` (`fato_apontamento`, com `pessoa_ref`), `:411` (`dim_responsavel`: `pessoa_ref`, `responsavel_nome`), `:413` (`apt_pessoa_time`: `pessoa_ref`, `vigencia_ate`); igual em `deploy/sql/consolidado.sql:1967`, `:1975`, `:1977`. Nenhum outro GRANT do papel traz coluna de pessoa (`dim_card` com `titulo` é título de card do BusinessMap, não do chamado do Acelerato).
- "o nome real em claro": nenhuma transformação do nome na gravação; a API do Apontamento o lê como está (`server/src/modulos/apontamento/repositorio.ts:82-84`, já citado no parecer anterior).
- "O sal não protege o nome: ele só alimenta o HMAC do `user_id` na lista de supressão": `server/src/modulos/businessmap/apontamento/supressao.ts:7,13` (único `createHmac`); os demais usos do sal só filtram suprimidos (`usuarios.ts:61-67`, `apontamento/coleta.ts:167-169,275`).
- "a eliminação a pedido é que apaga a linha de `dim_responsavel` e anula `pessoa_ref` no fato": `server/src/modulos/businessmap/apontamento/eliminacao.ts:89-90`.

**Linha 146 (A9 do review, texto).** O `metricas-referencias.timer` roda as quatro sincronizações: `deploy/systemd/metricas-referencias.service:17-20` (BusinessMap, Acelerato, calendário, subgrupos do Apontamento), pelo serviço `coleta`. A afirmação de que `bm:criterios-classe-servico` usa o papel migrador, não entregue ao container de coleta, confere: `server/src/entradas/criterios-classe-servico.ts:28` usa `PG_MIGRADOR_URL`, e em `docker-compose.prod.yml` essa URL só existe no serviço `migrate` (linha 18), não no `coleta` (linha 58). Postura correta: a sincronização agendada não recebe credencial de migrador.

**Linha 106 (A10 do review, texto).** `systemctl list-timers 'metricas-*'` cobre os quatro timers; era a inconsistência que o parecer anterior mandou ao `tech-lead`. Fechada.

**A1.** Evidência: `docker/postgres/init/01-databases-papeis.sh:7-9`, `docker/postgres/reparar-papeis.sh:15`. Caminho: só na máquina do desenvolvedor ou na homologação local (portas em 127.0.0.1, dado fictício); quem lê a lista de processos do contêiner já tem o banco. Severidade: informativa. Correção mínima: reaproveitar o padrão `\getenv` e NOLOGIN do gerado. Esforço P. Dono: `devops-engineer`.

**Conferência dos pareceres anteriores:** A1 segue aberto como recomendado, fora do caminho de produção. Os achados do parecer de 255d0250 e A1 a A8 de `docs/security/105-implantacao-vm.md` seguem fechados: o delta não toca Compose, roteiro de papéis, gerador nem unidades.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI; este parecer não afirma CI verde. Varredura de segredos, de dependências, SAST e de imagem: ferramentas fora do PATH (lacuna); o delta é só documentação.
