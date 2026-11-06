---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l3-motivo-dominio
commit: 86f6dbb7c63ee3968482dc69092c68bce5c3c5b8
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-06
---
# Review de segurança: lote 3 dos bloqueios reais, domínio `motivo_bloqueio` no `bm:ref-sync` (pedido 075, E1.7, K-204)

Propósito: parecer do lote 3 (referência carregada de arquivo com texto vindo de pessoas), contra o controle 2 e o CA-075-3 do modelo de ameaças. Público: node-backend (dono), tech-lead (E1.6), qa-engineer, Jarvis.

**Veredito: aprovado** em `86f6dbb`. Nenhum achado bloqueante; um recomendado. Revisão estática do diff `c5a4728...86f6dbb` (6 arquivos, 107 linhas). Rodei `dominio-motivo-bloqueio.test.ts` e `dominio-businessmap.test.ts` (57 testes verdes). Não rodei o `.pg` (exige banco local; o autor e o QA o rodam). `gitleaks`, `osv-scanner` e `semgrep` fora do PATH: lacuna registrada. Sem `.env` lido e sem chamada à fonte.

## Controle 2 (mapa só do arquivo, nunca constante nem texto livre)
- O mapa nasce só de `motivo_bloqueio` do arquivo versionado (`dominio-businessmap.ts:59`, `businessmap-dominio.json`, lista vazia). `motivosDeLinhas` (`:211-226`) só lê linhas de `ref_dominio` e não traduz nada: não há tabela de `reason_id` no código. Sem entrada, não há motivo, e a tela mostra "não classificado" (P-075-3).
- `rotulo` é `z.enum(MOTIVOS_BLOQUEIO)` (`:47`): só os 7 do briefing; "não classificado" também é recusado (é ausência de mapa). Texto livre, marcador de pessoa e `@` caem fora do enum. `codigo` é `^\d{1,10}$` (`:31`).
- Esquema `strict` no item e no arquivo, `.max(500)` (`:59`), `.default([])`. `reason_id` repetido é recusado com normalização por `Number` (`05` = `5`, `:64-67`). O nome da lista não colide com `COLUNAS_LISTA` (`allow-list.ts:64-67`), então `listasDoArquivo` (`:121`) não sobrescreve outra lista.
- Defesa em profundidade na leitura: `motivosDeLinhas` descarta código não numérico, rótulo fora dos 7 e `reason_id` ligado a dois motivos, mesmo que o banco tenha sido alterado por fora. Escrita em `ref_dominio` segue só pelo papel `dspd_ref` (INSERT de vigência e UPDATE de `vigente_ate`), sem DELETE.

## CA-075-3
Coberto por `dominio-motivo-bloqueio.test.ts:29-38`: rótulo `MARCADOR-PESSOA-075`, com `@`, fora dos 7 e "não classificado" recusam a carga inteira. A mensagem vem de `analisarDominioBm` (`:96-99`) e leva só o caminho reduzido (`#` e `item`), nunca o valor; o teste confere `not.toContain(rotulo)`. Código não numérico, vazio, decimal, negativo, com espaço ou com 11 dígitos é recusado. Arquivo real carrega zero linhas (`:19-23`). Nada é gravado em recusa: a validação precede `sincronizarDominioBm`, que roda numa transação só.

## Fora do mapa de mudança
`allow-list.ts`, `coleta.ts`, grants, LGPD, migração e contrato: sem diff. Nenhuma dependência nova. A versão de critério T2.6 segue como o plano decidiu (nenhuma agora; o `ref-sync` registra a referência `069:ref-bm-campos:<sha>` quando o mapa mudar).

## Achados
- A1 (recomendado) server/tests/dominio-businessmap.pg.test.ts:59 · O .pg grava uma única entrada; vários reason_id para o mesmo motivo (P-075-3) só têm teste de leitura, não de gravação em ref_dominio. Acrescentar um caso com dois codigos e o mesmo rotulo. Dono: node-backend.
