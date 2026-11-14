---
tipo: revisao-seguranca
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l10a-setor-dicionario
commit: 86a3808ffcb19a0c2aaae420ce49ab4a51af3d01
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: 097 L10a, dicionário de setores do BusinessMap

Propósito: parecer de segurança (gatilho do plano `docs/analises/097-plano-e5-e7.md` §9: fronteira de referência do pedido 069, esquema fechado do arquivo de domínio, texto de configuração exposto na API e prova de ausência de sobrenome; `R-SEGURANCA`) do L10a do pedido 097 (E7.2). Passada única sobre o diff `origin/develop...86a3808f` (base `84001e7a`), 12 arquivos: `server/`, `packages/contratos/`, `docs/architecture/fontes/` e `docs/api/`. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Fronteira 1 do modelo `docs/security/069-modelo-ameacas.md`: arquivo versionado `businessmap-dominio.json` → `bm:ref-sync` (zod `strict`) → `dspd_bm.ref_dominio`. O arquivo ganha a lista `setores`.
- Fronteira 4 do mesmo modelo: `ref_dominio` → API → navegador. O `rotulo` do setor vai em `GET /api/v1/filtros/businessmap` (`opcoes.setores`).

## Resultado
- **O arquivo só aceita código numérico: conforme.** `valorSetor` (`dominio-businessmap.ts:51`) é `strict`, com `codigo` em `CODIGO_QUADRO = /^\d{1,10}$/` (`setor.ts:9`). O `superRefine` recusa quadro repetido pela forma numérica (`23` e `023` colidem) e rótulo repetido. A lista tem no máximo 50 itens (`:66`). Campo extra, como `nome_quadro`, recusa a carga inteira. A mensagem de erro não ecoa o valor, como mostra o teste `recusa a carga inteira` (`server/tests/dominio-businessmap.test.ts:211` em diante).
- **O rótulo passa por `textoSeguro(80)` e pelo guarda de sobrenome: conforme ao plano, com ressalva (A1).** `textoSeguro` (`dominio-acelerato.ts:42`) já barra controle, formatação, separador de linha e `@`. `rotuloDeSetorSeguro` (`setor.ts:13`) recusa o padrão do plano §1.3 (` - ` seguido de maiúsculas até o fim) e `@`. As sondas S1 a S9 mostram que o guarda pega a forma esperada da cópia do nome do quadro ("Plataformas - SILVA"), mas não variações (caixa mista, travessão, sobrenome composto, parênteses, sem hífen). A lista nasce vazia (`businessmap-dominio.json:14`), então nada vaza neste head. A `regra` do arquivo (`:11`) já exige parecer de segurança no PR que preencher a lista. Por isso a ressalva é recomendação, e não bloqueante.
- **Nenhum nome de quadro nem de pessoa vai a tabela ou resposta: conforme.** O nome do quadro no BusinessMap não é lido em nenhum ponto do diff: o setor vem só do arquivo versionado. O que se grava em `ref_dominio` é `campo = 'setor_quadro'`, `codigo` (id do quadro) e `rotulo` (nome do setor). A resposta traz só `{ id: slug(nome), nome }` (`servico.ts:47`): o id do quadro não sai, como confere o teste `nenhuma resposta traz código de quadro`. A Sustentação não ganha `setores`.
- **`setor_quadro` não amplia a allow-list da coleta: conforme (T2 do 069).** `dominiosDaColeta` lê só `campo_customizado` e `COLUNAS_LISTA` (`server/src/modulos/businessmap/coleta.ts:46-48`), e `setor_quadro` não está nessa lista nem colide com nome de coluna (`allow-list.ts:64-67`). O projetor lê `ref_dominio` só por campo constante. Uma linha `setor_quadro` no banco não muda o que sai da fonte.
- **`lerSetoresBM` é parametrizado e desconfia do banco: conforme.** A consulta é `WHERE campo = $1 AND vigente_ate IS NULL` com `[CAMPO_SETOR_QUADRO]` (`repositorio.ts:36-40`). Só `${S.bm}` é interpolado, e ele vem da configuração, como no resto do módulo. A leitura descarta código não numérico, rótulo vazio, rótulo com o padrão de sobrenome e rótulo com `@`. Isso cobre a linha inserida direto com a credencial do `dspd_ref`, com a mesma limitação de A1. A rota continua sem parâmetro de entrada (`semQuerySchema`), então o setor não chega ao SQL vindo da requisição.
- **O contrato novo não abre leitura de coluna de pessoa: conforme.** Não há migração nem GRANT novo. O `dspd_api` já lia `ref_dominio` (`codigo`, `rotulo`), que não tem coluna de pessoa. `opcoesFiltroFluxoSchema.setores` é opcional, com `opcao` estrita (`id` e `nome` não vazios, `packages/contratos/src/referencia.ts:5`), e o schema do Acelerato recusa `setores`. O rótulo vai ao navegador como texto do React, com escape padrão.
- **Regras invioláveis: conforme.** O setor é recorte e não ranking. A resposta não traz contagem por setor, e BusinessMap e Acelerato continuam separados.
- **Testes dos arquivos tocados (`VITEST_MAX_WORKERS=2`):** `server/tests/dominio-businessmap.test.ts` e `server/tests/opcoes-setores.test.ts` deram `Test Files 2 passed (2)`, `Tests 63 passed (63)`. `packages/contratos/src/referencia.test.ts` deu `Test Files 1 passed (1)`, `Tests 3 passed (3)`.
- **Lacunas:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH e não rodaram. O diff não traz segredo, dependência, workflow nem `.env`. O plano §9 pedia a revisão do modelo de ameaças do 069 com o campo novo antes da implementação, e ela não houve. Os casos de abuso abaixo fazem esse papel e estão quase todos nos testes do autor.

As sondas abaixo rodaram com cópia literal de `SOBRENOME_EM_CAIXA_ALTA` e `rotuloDeSetorSeguro` (`setor.ts:11-13`) em `node`, fora do repositório.

## Casos de abuso (L10a)
- `codigo` `abc`, `-5`, vazio ou `023` repetindo `23` → arquivo → `bm:ref-sync`: recusa a carga inteira (coberto).
- `rotulo` `Plataformas - SILVA`, com `@`, com `\u0000` ou vazio → arquivo: recusa sem ecoar o valor (coberto).
- item com `nome_quadro` → arquivo: recusa (coberto).
- `INSERT` direto em `ref_dominio` de `setor_quadro` com `Plataformas - SILVA` ou código `x` → `lerSetoresBM` → API: a linha some da resposta (coberto).
- `rotulo` `Plataformas - Silva` ou `Plataformas – SILVA` → arquivo → API: deveria recusar e hoje passa (A1).

## Sondas
- S1 · `Plataformas - SILVA` · espera: recusa · obtido: recusa
- S2 · `Plataformas - Silva` · espera: recusa · obtido: ACEITA
- S3 · `Plataformas – SILVA` (travessão) · espera: recusa · obtido: ACEITA
- S4 · `Plataformas - SILVA JR` · espera: recusa · obtido: ACEITA
- S5 · `Plataformas (SILVA)` · espera: recusa · obtido: ACEITA
- S6 · `Plataformas-SILVA` · espera: recusa · obtido: ACEITA
- S7 · `SILVA` · espera: recusa · obtido: ACEITA
- S8 · os 7 rótulos literais da decisão de 2026-11-11 14:09 · espera: aceita · obtido: aceita os 7
- S9 · `Desenv Sistemas Plataformas Digitais - Gerencial` · espera: aceita · obtido: aceita

## Achados
- A1 (recomendado) server/src/modulos/referencia/setor.ts:11 · O guarda de sobrenome é lista negativa e deixa passar Plataformas - Silva, travessão, sobrenome composto e parênteses (S2 a S7). No PR que preencher a lista, fechar o rótulo no z.enum dos 7 nomes da decisão 14:09 (molde MOTIVOS_BLOQUEIO) e manter o guarda. Dono: node-backend.
- A2 (recomendado) server/tests/dominio-businessmap.test.ts:211 · Falta o teste de fumaça do plano §1.3 com os 7 rótulos literais da decisão 14:09 aceitos pelo esquema (S8 mostra que passam hoje). Dono: node-backend, com o qa-engineer.

## Plano em cartões
Nenhum bloqueante. A1 e A2 entram no lote que preencher `setores` (depois da P-097-9). Esse PR passa por parecer de segurança, como manda a `regra` do arquivo. Com o `z.enum`, um setor novo vira mudança de código revisada, e não só de dado (T2 do 069). O texto exato da lista fechada é: Sistemas Corporativos; Escritório de Processos e Projetos; Sistemas de Vendas e Operações; Plataformas; Ciência de Dados; Desenv Sistemas Plataformas Digitais - Gerencial; Marketing e Vendas.

## Riscos aceitos
Nenhum.
