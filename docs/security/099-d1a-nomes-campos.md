---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1a-nomes-campos
commit: 75c59c1b17f4ed766478e225d42c92f1aa9a9d76
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: D1a, nomes exatos dos campos de etapa do Acelerato (E3.65)

Propósito: a fronteira da coleta do Acelerato depois do D1a (desenho em `docs/analises/099-saidas-consultas.md` §5 e §7), no head `75c59c1b`, base `4c4a7a33`. Gatilho: allow-list da fronteira com dado de pessoa e texto livre (regra inviolável do `CLAUDE.md`; modelo de ameaças do 069, A1 e A2). Lidos: o diff inteiro (`git diff 4c4a7a33..75c59c1b`, 7 arquivos, 1 de produção), e sem mudança no diff `server/src/modulos/acelerato/allow-list.ts` (esquemas Q6/Q7, `nomeCanonico`, `camposEtapa`, `falhar`), `sql.ts` (Q6, Q7), `controle.ts` (hashes), `referencia.ts` e `server/src/apoio/apoio-l9c.ts`. Rodados, sem banco: `vitest run` de `tests/acelerato-campos-etapa.test.ts`, `tests/acelerato-allow-list.test.ts`, `tests/acelerato-l9c.test.ts` e `tests/apoio-l9c.test.ts` (4 arquivos, 105 testes, todos passaram) e as sondas abaixo (`tsx` sobre `camposEtapa`). Os `.pg` ficam para o CI. Nada rodou contra base real e nenhum `.env*` foi aberto.

## Gatilhos
- Fronteira de dado pessoal e texto livre: `server/src/modulos/acelerato/listas-fechadas.ts:40-49` (`CAMPOS_ETAPA_F3`), que alimenta o `IN` das Q6/Q7 (`coletor.ts:119-120`), o `z.enum` dos esquemas (`allow-list.ts:174`, `:178`), o hash `campos_sha256` (`controle.ts:58`) e a consulta de apoio (`apoio-l9c.ts:42`, `:58`).

## Resultado por ponto do brief

**1. Nenhum texto livre nem dado de pessoa chega ao staging: conforme.** A mudança de produção só renomeia três strings e retira uma entrada da lista fechada; nenhum esquema, consulta ou tratamento mudou. Os dois campos de texto livre continuam `preenchido`: a Q7 devolve só o booleano calculado no MySQL (`sql.ts:72`), e o esquema estrito recusa qualquer coluna `valor` (`allow-list.ts:178`). "Motivo da Escalação:" continua `lista`: o valor só segue se estiver no domínio de `ref_dominio` e se o `tipo` não for texto (`allow-list.ts:249-256`). Nenhum campo novo de pessoa entra; a lista de colunas (`COLUNAS_LIDAS`) não mudou.

**2. "Qual suporte foi acionado?" fora: conforme, e mais fechado que antes.** O nome saiu da constante, logo sai do `IN` das Q6/Q7: o valor (texto livre na fonte) não sai mais do MySQL. Se uma linha com esse nome chegasse mesmo assim, `nomeCanonico` não a casa e o `z.enum` recusa: `ErroColeta('dados-invalidos', coluna 'nome')`, sem o valor (S4, S5). A chave `suporte_acionado` não aparece em código de produção fora da lista (só em teste e documento); valores `cpe_suporte_acionado` que restem em `ref_dominio` ficam inertes, porque `referencia.ts:60` só lê os campos da constante.

**3. Nome sem dois-pontos falha fechado: conforme.** `formaDoNome` (`allow-list.ts:181`) normaliza caixa, acento e espaço nas pontas, não pontuação: "Motivo da Escalação", "Previsão de retorno" e "Se a prioridade foi ajustada, justifique" sem os dois-pontos não voltam ao canônico e recusam no `z.enum`, sem o valor (S1, S2, S3). Na base real elas nem saem do MySQL, porque o `IN` não as casa. Variante de caixa e acento com os dois-pontos segue aceita com a contagem `nome_variante_<chave>`, como antes (S6).

**4. Mudança de critério reconhecida: conforme.** O `campos_sha256` cobre `nome|tratamento` de cada campo (`controle.ts:58`): a coleta recusa com `parametros-mudaram` até o dono rodar `pnpm run coleta ac --reconhecer-mudanca`. Falha fechado, e o registro da mudança fica em `ctl_coleta` (T2.6).

**5. Sem segredo:** o diff só tem strings de nome de campo e valores fictícios de teste (`MARCADOR-*`, "Motivo Ficticio 1").

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH. Não fazem falta aqui: sem dependência nem script novos, e o diff foi lido inteiro.

## Achados
- A1 (recomendado) server/tests/acelerato-campos-etapa.test.ts:301 · Nenhum teste prova que o nome antigo, sem os dois-pontos, falha fechado (só as sondas S1 a S3). Correção: um caso de falha fechada com os três nomes sem os dois-pontos. Dono: node-backend.
- A2 (recomendado) server/tests/acelerato-campos-etapa.test.ts:321 · O teste das Q6/Q7 sem o campo de texto livre não põe "Qual suporte foi acionado?" com marcador na fonte, então não prova o caminho pela coleta. Correção: incluir a linha com MARCADOR e conferir staging e logs.

## Sondas
- S1 · camposEtapa lista nome 'Motivo da Escalação' (sem dois-pontos), valor 'Hardware' · espera: throw dados-invalidos coluna nome · obtido: throw dados-invalidos "nome"
- S2 · camposEtapa preenchido nome 'Previsão de retorno' (sem dois-pontos), preenchido 1 · espera: throw dados-invalidos coluna nome · obtido: throw dados-invalidos "nome"
- S3 · camposEtapa preenchido nome 'Se a prioridade foi ajustada, justifique' (sem dois-pontos) · espera: throw dados-invalidos coluna nome · obtido: throw dados-invalidos "nome"
- S4 · camposEtapa lista nome 'Qual suporte foi acionado?', tipo 'texto', valor 'MARCADOR-SONDA-X' · espera: throw sem o marcador · obtido: throw dados-invalidos "nome", marcador ausente do erro
- S5 · camposEtapa preenchido nome 'Qual suporte foi acionado?', preenchido 1 · espera: throw dados-invalidos coluna nome · obtido: throw dados-invalidos "nome"
- S6 · camposEtapa lista nome 'MOTIVO DA ESCALACAO: ', valor 'Hardware', domínio com 'Hardware' · espera: aceito com nome_variante · obtido: motivo_escalacao 'Hardware', nome_variante_motivo_escalacao 1

## Plano em cartões
Nenhum bloqueante. A1 e A2 vão ao `node-backend` e ao `tech-lead`, que decidem no review se entram neste lote.

## Riscos aceitos
Nenhum.
