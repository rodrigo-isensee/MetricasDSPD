---
tipo: revisao-seguranca
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-spike-paginacao
commit: 95e1dad2e1bbe11ab103106a26ad13e104f94906
parecer: aprovado
veredito: aprovado
revisor: forge:security-engineer
data: 2026-11-03
---
# Review de segurança: script de spike de paginação do /loggedTime (pedido 063, E1.10, K-200)

Propósito: parecer de segurança do script que o dono roda com a chave dele (`R-SEGURANCA`, uso de credencial de integração). Público: tech-lead, node-backend, dono.

**Veredito: aprovado**, sem bloqueante. Revisão estática do diff `b446021...95e1dad` (7 arquivos); nada foi executado contra a API e nenhum `.env` foi aberto. O teste do pedido (`vitest`, 22 testes) passou. `gitleaks`, `osv-scanner` e SAST não foram invocados: lacuna registrada (o diff não toca dependência nem lockfile e não contém segredo).

## O que foi verificado
- **Chave só no cabeçalho.** `spike-paginacao.ts:58` põe `apikey` em `headers`; a URL (`:55`) leva só `card_ids` e `page=2`. A chave não entra em saída, erro ou log: a saída é montada só com status, contagem, nomes de chave e números (`:64-78`); o erro de configuração usa a mensagem de `lerConfig`, que nomeia a variável sem valor (`diagnostico.ts:63-71`); falha de rede e tempo esgotado têm texto fixo (`:80-82`), sem causa nem URL.
- **Destino da chave.** `lerConfig` exige https (http só em loopback, `diagnostico.ts:42-48`) e `redirect: 'error'` (`:59`) impede que um redirecionamento leve o cabeçalho a outro host.
- **Só GET, caminho fechado.** `method: 'GET'` (`:57`); o caminho `/loggedTime` é literal; o único dado variável é o id do card, validado por `/^[1-9]\d{0,11}$/` e com exatamente 1 argumento (`:41-43`), antes de qualquer rede. Não há retentativa (1 chamada, mesmo com 429 ou 500). Nada é escrito no BusinessMap.
- **Allow-list da saída.** Corpo e URL nunca são impressos; resposta que não é 2xx mostra só o status. Chaves do envelope só passam com `/^\w{1,40}$/`, no máximo 20; paginação só entra como `chave=número` finito (`:31-35`). Nenhum valor de registro, pessoa, título ou comentário chega ao terminal, em linha com a regra de dado de pessoa do projeto.
- **Carga do `.env`.** `bm-spike-paginacao.sh:6` usa `set -a; . ./.env`, igual ao `bm-diagnostico.sh`; o valor fica só no ambiente do processo, sem `echo` nem `set -x`. `"$@"` vai entre aspas e o id é revalidado no TypeScript. A entrada (`entradas/spike-paginacao-businessmap.ts`) só escreve `r.saida` e `r.erro`.
- **Escopo.** Nenhuma métrica por pessoa, nada em staging nem em tabela; script descartável.

## Achados
- A1 (recomendado) scripts/bm-spike-paginacao.sh:6 · `. ./.env` executa o arquivo como shell: valor com `$(...)` ou crase rodaria na máquina do dono. Só ele edita o `.env`, sem ataque realista; manter valores entre aspas simples. Informativa, igual ao diagnóstico. Dono node-backend.
- A2 (recomendado) server/src/modulos/businessmap/spike-paginacao.ts:31 · Nomes de chave de `data` e `pagination` vêm da resposta; se a API usar valor de pessoa como chave (id numérico), `\w` o deixaria passar. Improvável na API; conferir as 4 linhas antes de colar no pedido. Baixa, P, dono: dono.

## Detalhe dos achados
- **A1.** Não devolve a entrega. O mesmo padrão já existe em `bm-diagnostico.sh`; qualquer mudança vale para os dois scripts e cabe a uma revisão futura.
- **A2.** Não devolve a entrega. A conferência humana da saída antes de colar no pedido 063 (etapa E1.5) cobre o caso; a saída tem poucas linhas.

## Riscos aceitos
Nenhum.
