---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-k304-nomes-env
commit: 3f2803e2192391aa8d3d72266379e09c3b5cde16
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-13
---
# Review de segurança: K-304, falta de variável de ambiente lista os nomes, nunca o valor (E3.118)

Propósito: conferir que a coleta do Acelerato (`coleta.ts`), a do BusinessMap (`coleta-businessmap.ts`) e o diagnóstico do BusinessMap (`diagnostico.ts`), ao recusar configuração, nomeiam as variáveis e nunca imprimem valor, parte de valor, stack ou texto de erro de driver. Diff de `9bb72d1f` a `3f2803e2`: 6 arquivos, 5 de produção e o teste novo `server/tests/coleta-nomes-env.test.ts`. Nenhum `.env*` foi aberto e nada rodou contra banco, BusinessMap ou Acelerato reais. Os 7 testes do arquivo novo rodaram localmente no head (7 passaram); o CI do head (run 43430694893) estava em andamento na hora deste parecer, e a suíte inteira fica com ele.

## Achados

## Sondas
- S1 · coleta ac, `ACELERATO_MYSQL_HOST=h;$S` · espera: só o nome · obtido: `coleta ac falhou: configuração: ACELERATO_MYSQL_HOST`, rc 1
- S2 · coleta ac, `NODE_TLS_REJECT_UNAUTHORIZED=0` · espera: só o nome · obtido: `coleta ac falhou: configuração: NODE_TLS_REJECT_UNAUTHORIZED`, rc 1
- S3 · coleta ac, senha com 300 caracteres terminando em `$S` · espera: só o nome · obtido: `coleta ac falhou: configuração: ACELERATO_MYSQL_PASSWORD`, rc 1
- S4 · coleta ac, `LOG_LEVEL=$S` e `DSPD_SCHEMA_PREFIXO=$S` · espera: sem valor · obtido: `coleta ac falhou: configuração: LOG_LEVEL`, rc 1
- S5 · coleta ac, configuração válida com `$S` na senha da URL do PostgreSQL e certificado inexistente · espera: sem valor · obtido: `coleta ac falhou: {"codigo":"tls-configuracao"}`, rc 1
- S6 · bm:coleta, `$S` na URL do coletor, em `DSPD_PWD_REF` e num sal curto · espera: só o nome · obtido: `bm:coleta falhou: configuração: PESSOA_ELIMINADA_SAL`, rc 1
- S7 · diagnóstico, `BUSINESSMAP_URL_BASE=ftp://$S` e `BUSINESSMAP_APIKEY=$S` · espera: só o nome · obtido: `variável inválida: BUSINESSMAP_URL_BASE`, rc 2

## Gatilhos
- Credenciais: senha do MySQL do Acelerato, URL do PostgreSQL do coletor (com senha), apikey do BusinessMap, sal da supressão, todas lidas do ambiente (CLAUDE.md: credenciais só em `.env`).
- Saída de erro de comando manual: o stderr da coleta pode ir para log de terminal, CI ou agendador.

## Detalhe dos achados
Nenhum achado. Resultado por ponto do brief:

**1. Mensagem, log e stack: conforme.** Os três caminhos de recusa saem por uma linha fixa no stderr:
- `server/src/entradas/coleta.ts:37`: com `ErroConfiguracao`, a saída é `categoriaDoErro(e)`, que para essa classe devolve só `configuração: <nomes>` (`server/src/plataforma/categoria-erro.ts:25`); a mensagem do erro não é impressa. O resto continua como antes (`ErroColeta.paraLog()` ou `erro-interno`).
- `server/src/entradas/coleta-businessmap.ts:56`: mesma regra; o texto da exceção só sai para `ErroColetaBm` (texto fixo nosso, como antes).
- `server/src/modulos/businessmap/diagnostico.ts:64`: os nomes vêm da constante `OBRIGATORIAS`, nunca do ambiente.
Nenhum caminho novo escreve no log do pino nem imprime stack: o `try` de topo das duas entradas cobre a carga da configuração.

**2. Nome versus valor: conforme.** Os nomes vêm de três fontes, nenhuma alimentada por valor: `issues[].path[0]` do zod sobre um `z.object` de chaves fixas (`server/src/plataforma/config.ts:121`, `server/src/modulos/acelerato/config.ts:64`), o `path` fixo do `superRefine` (`PG_REF_URL`) e literais (`NODE_TLS_REJECT_UNAUTHORIZED`, `OBRIGATORIAS`). Em `carregarConfigColetaAcelerato` (`server/src/modulos/acelerato/config.ts:70`), a lista de nomes vem de `ErroConfiguracao.nomes` e de `ErroColeta.coluna` com código `configuracao-invalida`, ambos montados só com nomes; qualquer outra exceção é relançada e cai em `erro-interno`. A mensagem do `ErroConfiguracao` novo também carrega só os nomes.

**3. O teste prova a ausência do valor: conforme.** O arquivo novo usa uma sentinela fictícia em senha, URL com senha, porta inválida e URL do BusinessMap com credencial embutida, e confere `not.toContain` sobre stderr e stdout dos processos filhos; o filho recebe só `PATH`, `TMPDIR` e o que o teste define (`ambienteFilho`). Três casos fixam a saída inteira com `toBe`, o que também barra eco parcial.

As sondas S1 a S7 (fora do teste) cobrem variáveis que o teste não cobre; rodaram no head, com `env -i` (sem `.env`) e `node --import tsx` nas entradas, com `$S` = `segredo-sonda-77`. Nenhuma saída trouxe `$S`.

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum. O K-304 pode seguir com review e QA; a suíte inteira fica com o CI do head.

Ferramentas: `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH desta estação e não foram rodados (lacuna registrada). Sem dependência nova no diff; a sentinela do teste é texto fictício, não credencial.
