---
tipo: review
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-dominio-listas
commit: 8865ee78da61d7f4e755ad732b090abdfd73b5a8
parecer: aprovado
revisor: tech-lead
data: 2026-11-01
---

# Code review: listas de domínio do Acelerato (056, E4.44, K-190)

Escopo: `git diff origin/develop..8865ee7` (9 arquivos, +334 -17), um commit só (8865ee7, E4.42), sobre a base 55301e0. Lido: o diff inteiro, o arquivo de domínio no commit, o `normalizador.ts` até a prioridade, `carregarNaturezaPorPrefixo` e `projetarAcelerato` (`projetor.ts:36-43` e `:116-125`), a chamada de `carregarListas` no `coletor.ts:190`, o teste estático do módulo (`acelerato-estatico.test.ts:137-138`) e, para conferir as listas, a saída da consulta só leitura da E4.40 (`/tmp/claude-1000/dominio-056-e440.json`, fora do repositório, só nomes de domínio e contagens).

## Ferramentas (citadas, não refeitas)
- Autor (E4.42, Histórico do pedido): suíte do server 1098 verdes; `.pg` do domínio 10 verdes (PG_TESTE_URL direto); contrato de API sem mudança.
- Segurança: `docs/security/056-dominio-listas.md` (E4.43) corre em paralelo; não refeita aqui.
- O `praticas.md` não tem regra de ferramenta nova que alcance este diff.

## O que confere
- **Listas contra a E4.40 (conferência mecânica, conjunto contra conjunto).** Etapa: os 44 nomes distintos da consulta estão no arquivo, nem um a mais nem um a menos; os 22 nomes distintos de status (38 chaves) estão todos dentro da etapa, então um vocabulário só serve aos dois. Prioridade: os 23 nomes não nulos batem exatamente; os 29 nulos ficam nulos. `codigo` = `rotulo` em todas as 67 linhas novas. Grafia com acento (`REQUISIÇÃO`, `MÉDIA`) como veio, sem normalização.
- **Natureza pela decisão (c).** `natureza_prefixo` tem só `SSSC-I-`, `SSSC-I `, `SSSC-R-` e `SSSC-R `, os quatro prefixos da E4.40; SSSC-P, PEQUENA, TESTADE e Outros ficam sem natureza. Nenhuma categoria do arquivo começa por `SSSC-I` ou `SSSC-R` sem hífen ou espaço depois, então o prefixo mais longo de `naturezaDaCategoria` não deixa categoria de fora (o teste percorre as 135 e exige incidente e requisição acima de zero).
- **Recorte pela decisão (b).** `organizacao_recorte` segue só com a 3 (já vinha da E4.32); o teste novo fixa isso.
- **Mapa D-12 por nome exato (`normalizador.ts:44-60`).** A escala P é lida primeiro, como antes; depois um `Map` com as 4 famílias × 5 níveis, montado de duas constantes, igualdade exata, sem caixa nem acento normalizados. Vazio e outras áreas (DHO, CONTABILIDADE) seguem nulos. Os testes cobrem as 20 combinações, as grafias sem acento e em minúscula (nulo) e as 23 prioridades reais (todas viram P1 a P5). O mapa é o que o dono decidiu às 11:12, nada inferido.
- **Escapes `É` e `ÇÃ`.** O teste estático do módulo barra a palavra de média sem distinção de caixa, e o nível do meio da D-12 tem essa grafia. O escape deixa o teste verde sem mudar o valor e o comentário diz por quê. O módulo continua sem cálculo de média; ver A1.
- **Falha fechada em `carregarListas` (`referencia.ts:34-42`).** Etapa, prioridade, categoria e descrição do workflow vazias passam a recusar a coleta com `listas-vazias` e o nome do campo, como já faziam as três do recorte. A recusa vem antes de abrir conexão (`coletor.ts:190`). Teste por campo, só com o nome na saída. Era a causa da carga de 2026-11-01 (E4.39): agora ela não passaria calada.
- **Falha fechada na projeção (`projetor.ts:41-42`).** Sem prefixo vigente com rótulo conhecido, a projeção para antes de inserir o `ctl_coleta`, dentro da transação: nada fica gravado. Teste com lista vazia e com rótulo desconhecido.
- **Prioridade de teste no projetor (`acelerato-projetor.test.ts:53`).** `SSSC - INCIDENTE - ALTA` passou a ter P2 pela D-12; a troca por `DHO - ALTA` mantém o caso que o teste quer (prioridade fora da escala, nula e contada). O teste de ROLLBACK ganhou a linha de `natureza_prefixo` porque, sem ela, a projeção falharia antes do ponto que ele prova.
- **Documentação.** `acelerato-listas.md` traz a falha fechada na linha 7, os parágrafos de preenchimento nos §7, §8 e §10 e a tabela do §12 atualizada; a `versao_criterio` e a `regra` do JSON citam a E4.42, a E4.40 e as decisões b, c e D-12, então o hash muda e o próximo `ac:ref-sync` grava vigência e versão T2.6 novas. Ver A2 e A4.
- **Regras invioláveis.** Nenhum dado de pessoa nem de cliente nas listas e nos testes (só nomes de etapa, de prioridade e prefixos); nada lê o MySQL real; nenhuma mistura com o BusinessMap; histórico só por vigência nova.

## Teto de linhas (M14)
`git diff --numstat --no-renames origin/develop...8865ee7`, só `server/src` e `server/tests`: **252 linhas** (14 + 3 + 10 + 14 + 4 + 190 + 17). Fora da conta: o JSON de domínio (dado de configuração, como no 056-carga-inicial) e o `.md`. 190 das 252 são o teste de dados reais, que é na maior parte as três listas da E4.40 escritas como esperado. Leio um comportamento só: o domínio do Acelerato casar com a carga real, com as três listas, o mapa da prioridade que dá sentido à lista de prioridade e a recusa da mesma causa quando a lista some. Separar a falha fechada em outro PR atrasaria a releitura do dono sem ganho de leitura. Aceito a exceção: o PR da E4.46 leva a linha `teto: excedido, 252 linhas, domínio do Acelerato para a carga real (etapa, prioridade e natureza_prefixo, mapa D-12 e falha fechada com vocabulário vazio)`, com o número recontado se a branch mudar. Sem essa linha no corpo do PR, o teto vira achado bloqueante.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/normalizador.ts:45 · O escape tira a palavra do alcance do teste estático (`acelerato-estatico.test.ts:138`), e uma média de verdade escrita assim também passaria. Melhor: o teste ignora literais entre aspas, ou o mapa lê os níveis de `ref_dominio`.
- A2 (recomendado) docs/architecture/fontes/acelerato-listas.md:95 · Ainda diz que a D-12 está pendente e que não há agrupamento, e o parágrafo da linha 106 diz o contrário. Trocar pela referência à decisão de 2026-11-01.
- A3 (recomendado) server/src/modulos/acelerato/projetor.ts:147 · `VERSAO_PROJETOR` segue `acelerato-f2/1`, mas a projeção passa a dar P1 a P5 às famílias SSSC e DSPD (D-12). Subir para `/2`, para o `ctl_coleta` separar as projeções de antes e de depois do mapa.
- A4 (recomendado) docs/architecture/fontes/acelerato-listas.md:91 · Fala em 79 pares de chave e nome de etapa; a saída da E4.40 tem 85 pares distintos (44 nomes). O mesmo número está no comentário de `dominio-acelerato-real.test.ts:33`. Corrigir os dois.
- A5 (recomendado) server/src/modulos/acelerato/erros.ts:23 · A mensagem de `listas-vazias` fala das listas do recorte, e agora o código vale também para os vocabulários e para `natureza_prefixo`. Tirar o "do recorte".

Nenhum bloqueante: as listas batem com a E4.40, o mapa é o da D-12, a falha fechada cobre a causa e os testes provam os valores reais. Os cinco recomendados podem ir junto com o PR ou num cartão seguinte; nenhum muda o resultado da releitura do dono.

Parecer em 8865ee7: aprovado.
