---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-spike
commit: 1f4c4e5732cdcf82703eadf166c1a50610ca7707
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11, spike dos campos (E7.176, revalidações E7.183, E7.192, E7.200 e E7.213)

Escopo desta rodada (E7.213): o delta `50fc7239..1f4c4e57` (saída de `forge-check parecer delta`): no domínio, `server/src/modulos/businessmap/spike-campos.ts` (campo 51, Responsabilidade do Atraso, entra na contagem por card e no catálogo `/customFields/51/allowedValues`); fora do domínio, `server/tests/spike-campos.test.ts`. As rodadas anteriores (`ad934012`, `0ecc16c3`, `485f4070`, `50fc7239`) seguem valendo no que o delta não tocou. Nada foi rodado contra a API real com credencial.

Veredito: **aprovado para rodar**. O 51 entra só por id exato; o 42 (Responsável CR, contributor, pessoa) não entra por nenhum caminho (sondas abaixo). `http.ts` e a lista global `CAMINHOS_PERMITIDOS` não mudaram. A2 e A3 seguem como recomendação; A5 é nova recomendação para o uso do 51 depois do spike.

## Gatilhos
`R-SEGURANCA`: mudança na lista fechada de caminhos do spike sobre o cliente HTTP do BusinessMap (controle de fronteira) e dado de terceiros com texto escrito por pessoas (rótulos de opção) gravado fora do clone.

## Achados
- A2 (recomendado) server/src/modulos/businessmap/spike-campos.ts:75 · se o campo 49, 50 ou 51 for de texto livre, o valor escalar (até 80 caracteres) vai ao arquivo do dono; aceitável no arquivo 0600, mas o relatório deveria marcar a opção (escalar) como texto livre e o dono não a copiar para o pedido.
- A3 (recomendado) server/tests/spike-campos.test.ts:33 · o teste semeia texto nos campos 99 e 42 mas não afirma que eles, título, descrição, pessoa e etiqueta fora de SISTEMA ficam fora do arquivo; acrescentar essa negação no arquivo (a sonda S2 da rodada E7.176 é o modelo).
- A5 (recomendado) server/src/modulos/businessmap/spike-campos.ts:16 · "Responsabilidade do Atraso" pode ter opção com nome de pessoa; se tiver, o 51 não vai à base nem a painel por pessoa sem decisão do dono (regra inviolável: nenhuma métrica para avaliação individual).

## Sondas

## Detalhe dos achados

### Delta E7.213 (esta rodada)
1. **Casamento por id exato.** `spike-campos.ts:87-89`: o card só soma campo cujo `String(field_id)` é chave do mapa criado de `CAMPOS_SPIKE` (`:16`, `:59`), lookup exato em `Map`, sem prefixo nem regex; `42`, `'42'`, `' 42'` e `'051'` caem no `continue`.
2. **Regex do catálogo.** `spike-campos.ts:20`: alternância `(40|41|48|49|50|51)` ancorada nos dois lados com sufixo literal `/allowedValues`; não casa `42`, `510`, `5`, `051` nem travessia. A regex só é passada como `caminhosExtras` em `spike-campos.ts:239`; o cliente padrão continua sem `/customFields/{id}/allowedValues`. O catálogo é lido só para `CAMPOS_CATALOGO` (`:18`, `:289`), seis GETs de 1ª página e no máximo 30 com a paginação de até 5 páginas.
3. **Saída.** O stdout leva do 51 só contagem e forma (`:208-213`); rótulos de opção do 51 vão só ao arquivo 0600 fora do clone (inalterado desde E7.200).
4. **Testes do autor.** `spike-campos.test.ts` agora afirma `campos.has('42') === false` com um 42 semeado, a URL do catálogo dos seis ids, `saida` sem "campo 42" e a regex sem `/customFields/42/allowedValues`.

Sondas locais desta rodada (script `tsx` em diretório temporário, importando `spike-campos.ts` da branch em `1f4c4e57`, sem rede), registradas aqui porque nenhuma prova bloqueante:
- `CAMINHOS_CATALOGO` com `/customFields/51/allowedValues` · espera: casa · obtido: `true`.
- `CAMINHOS_CATALOGO` com `/customFields/42/allowedValues`, `/customFields/510/allowedValues`, `/customFields/5/allowedValues`, `/customFields/051/allowedValues`, `/customFields/51/allowedValues/../42`, `/customFields/51%2F../42/allowedValues` · espera: não casa · obtido: `false` nos seis.
- `somarCard` com `field_id` `42` (número, com `values`), `'42'`, `42.0`, `' 42'`, `'051'` e `51` (dropdown) · espera: só o 51 soma · obtido: chaves `40, 41, 49, 50, 51`, `has('42') = false`, opções do 51 só `5`.

### Delta E7.200 (rodada anterior, segue valendo)
1. **Caminho extra só com `page`.** `http.ts:242` recusa em extra qualquer chave diferente de `page`; o valor de `page` ainda passa pela regra global `CONSULTA_PERMITIDA.page` (`http.ts:33`, `^\d{1,5}$`) no laço de `http.ts:252-258`, e a URL é montada por `URLSearchParams` sobre a origem do `.env`. O teste de host próprio (`http.ts:238`) roda antes.
2. **Cliente padrão inalterado.** `caminhosExtras` só é passado em `spike-campos.ts:239`; `CAMINHOS_PERMITIDOS` (`http.ts:15-26`) não ganhou entrada. Sem `caminhosExtras`, `/customFields/41/allowedValues` é recusado com e sem `page`.
3. **Paginação limitada.** Até `TETO_PAGINAS_CATALOGO = 5` páginas por campo, `paginas` só aceita número (`spike-forma.ts:64`); acima do teto, o aviso leva só o id do campo e a contagem. Os rótulos vão só ao arquivo 0600 (`flag: 'wx'`, `mode: 0o600`).
4. **A4 corrigido.** O espalhamento virou laço; a lista grande não estoura mais a pilha.

Sondas da E7.200 (sem rede, `fetchImpl` fictício): extra com `{page:2}` aceito; `page` `123456`, `1&x=1`, `-1` recusados; `{page:1, per_page:1}` e `{fields:'name'}` recusados; `/customFields/42/allowedValues`, `/customFields/41/allowedValues/1`, `/customFields/41/allowedValues/../../users`, `/customFields/41`, `/customFields/41/allowedValues\n` recusados como `caminho`; cliente padrão recusa `/customFields/41/allowedValues` com e sem `page`.

### Detalhe das recomendações
- **A2.** Evidência `spike-campos.ts:75`. Caminho: se "Origem da Demanda", "Objetivo Estratégico" ou "Responsabilidade do Atraso" for campo de texto, cada valor distinto (escrito por pessoa, pode ter nome) vira uma linha do arquivo. O arquivo é 0600, fora do clone e só do dono; o risco é o rótulo ser copiado do arquivo para o pedido ou para o código. Severidade: baixa. Correção mínima: no relatório, marcar o campo com opção `(escalar)` como "texto livre, não copiar". Esforço P. Dono: `node-backend` (marca) e o Jarvis (não copiar rótulo para `docs/`).
- **A3.** Evidência `spike-campos.test.ts:33` (campos 99 e 42 semeados, sem `not.toContain` no arquivo). Caminho: uma mudança futura que somasse outros campos ao relatório passaria verde. Severidade: baixa. Correção mínima: semear campo de outro id com texto, o 42 com nome, `title`, `description`, dono e etiqueta comum e afirmar que nenhum aparece no arquivo nem no stdout, e que nenhum rótulo do catálogo (inclusive o da página 2, "Opção Fictícia 41C") aparece no stdout. Esforço P. Dono: `qa-engineer`.
- **A5.** Evidência `spike-campos.ts:16` (51 na contagem) e `:18` (catálogo). Caminho: o spike só conta e grava rótulos no arquivo 0600, sem risco hoje; o risco é o passo seguinte gravar o 51 por card e um painel cruzar "responsável pelo atraso" com pessoa, o que vira avaliação individual. Severidade: baixa (informativa para o plano). Correção mínima: ao ler o catálogo, o dono confirma se as opções são áreas ou pessoas; se houver pessoa, a ingestão do 51 vira pergunta ao dono (`R-DECISAO`) e entra no modelo de ameaças antes do código. Esforço P. Dono: Jarvis (pergunta) e `software-architect` (plano).

### Orientação para a execução
Rodar com o `.env` da raiz do clone do dono; não definir `BM_SPIKE_SAIDA` dentro do clone. O stdout (contagens e forma) pode ir ao pedido; o arquivo `relatorio-campos-sistemas.md` fica só na máquina do dono, e ao pedido e ao plano vão só `value_id`, `position`, `tag_id` e contagens, ou rótulos que o dono decidir transcrever (`R-DECISAO`).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Testes rodados local na branch em `1f4c4e57`: `tests/spike-campos.test.ts` e `tests/http.test.ts`, 2 arquivos, 46 testes, todos passaram. A suíte inteira fica para o CI do PR; este parecer não afirma CI verde nem cita PQ do autor (não recebido). Ferramentas de varredura de segredo, de dependências e SAST não estão no PATH desta estação (lacuna; o delta não muda dependência nem lockfile).
