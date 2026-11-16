---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-spike
commit: 485f4070a4cfc4fcb827e93d39473731f7e6a4bf
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11, spike dos campos (E7.176, revalidações E7.183 e E7.192)

Escopo desta rodada (E7.192): o delta `0ecc16c3..485f4070` (E7.186), lido por `forge-check parecer delta`: no domínio, `server/src/modulos/businessmap/spike-campos.ts` (`opcoesDoCatalogo` passa a buscar em largura, até 4 níveis, a primeira lista com `value_id`; o stdout ganha a forma da resposta de cada catálogo); fora do domínio, `server/tests/spike-campos.test.ts`. As rodadas anteriores (`ad934012` e `0ecc16c3`) seguem valendo no que o delta não tocou. Nada foi rodado contra a API real.

Veredito: **aprovado para rodar**. A forma impressa no stdout leva só caminho de chave, tipo, ocorrências e tamanho de lista; nenhum rótulo nem valor sai (sondas abaixo). Os rótulos continuam só no arquivo 0600 do dono. A2 e A3 seguem como recomendação; A4 é novo e recomendado.

## Gatilhos
`R-SEGURANCA`: dado de terceiros com texto escrito por pessoas (rótulos de opção e de etiqueta) agora com saída nova no stdout, e escrita em disco fora do clone.

## Achados
- A2 (recomendado) server/src/modulos/businessmap/spike-campos.ts:74 · se o campo 49 ou 50 for de texto livre, o valor escalar (até 80 caracteres) vai ao arquivo do dono; aceitável no arquivo 0600, mas o relatório deveria marcar a opção (escalar) como texto livre e o dono não a copiar para o pedido.
- A3 (recomendado) server/tests/spike-campos.test.ts:30 · o teste semeia texto no campo 99 mas não afirma que ele, título, descrição, pessoa e etiqueta fora de SISTEMA ficam fora do arquivo; acrescentar essa negação (a sonda S2 da rodada anterior é o modelo).
- A4 (recomendado) server/src/modulos/businessmap/spike-campos.ts:125 · `prox.push(...no)` com lista muito grande estoura a pilha (RangeError); o erro é capturado e sai sem dado, mas o spike aborta; trocar o espalhamento por laço.

## Sondas

## Detalhe dos achados

### Delta E7.186 (esta rodada)
1. **Forma no stdout sem rótulo nem valor.** `linhasFormaCatalogo` (`spike-campos.ts:147-149`) usa `somarForma` e `linhasDeForma` de `spike-forma.ts` (já revisados no spike F1): imprime só o caminho, o conjunto de tipos, as ocorrências e, para lista, o menor e o maior tamanho. Chave numérica vira `<id>`; chave fora de `^[A-Za-z_][A-Za-z0-9_]{0,39}$` (espaço, acento, quebra de linha, crase, barra vertical) vira `<chave>`. A forma entra no stdout só no caminho de sucesso (`spike-campos.ts:290`, `:297`); falha de leitura segue como aviso por `limpar`, sem corpo.
2. **Busca em profundidade limitada.** `listaComValueId` (`spike-campos.ts:118-131`) para no nível 4 (`PROFUNDIDADE_CATALOGO`, `:115`) e devolve a primeira lista com algum objeto que tenha `value_id`; o que sai dela continua sendo só `value_id`, rótulo (`value`/`label`/`name`) e `position`, e só ao arquivo 0600 passando por `rotuloSeguro` (`:189`). O stdout do catálogo continua só com a contagem por campo. A busca não amplia caminhos de rede (a lista `CAMINHOS_CATALOGO` e o cliente não mudaram) nem grava resposta bruta.
3. **Arquivo inalterado:** `flag: 'wx'`, `mode: 0o600` (`spike-campos.ts:296`).

Sondas locais desta rodada (script em `$TMPDIR` com `tsx`, importando `spike-campos.ts` da branch em `485f4070`, dados fictícios), registradas aqui porque nenhuma prova bloqueante:
- `linhasFormaCatalogo('49', {data:{field_id:49, allowed_values:[{value_id:1, value:"Fulano de Tal", label:"<e-mail fictício>", position:0}]}})` · espera: só caminhos e tipos · obtido: `$.data.allowed_values[].value: string (1x)`, `...label: string (1x)`, nenhum texto dos valores.
- corpo com chaves `"Diretoria de Fulano"`, `"Rotulo\nInjetado`|"` e `"123"` · espera: chaves mascaradas · obtido: `$.data.<chave>` e `$.data.<id>`, sem quebra de linha nem texto da chave.
- corpo `[[{value_id:7, value:"SegredoQ"}]]` · espera: forma sem o texto; opção achada no nível 2 · obtido: forma `$[][].value: string`; `opcoesDoCatalogo` devolve `valueId 7` (o rótulo só vai ao arquivo).
- `opcoesDoCatalogo({data:{a:<lista de 300000 números>}})` · espera: sem dado na saída · obtido: `RangeError: Maximum call stack size exceeded`, capturado pelo `catch` de `executarSpikeCampos` (A4).

Informativa, não achado: chave que já tem formato de identificador (uma palavra só, até 40 caracteres) sai como está; um dicionário indexado por rótulo de uma palavra (um sobrenome, por exemplo) apareceria no caminho. A resposta de `GET /customFields/{id}` do BusinessMap tem esquema fixo, sem chave indexada por texto de pessoa; é o mesmo critério aceito no spike F1. Se a forma impressa mostrar uma chave que pareça nome, o dono não a copia para `docs/`.

### Detalhe das recomendações
- **A2.** Evidência `spike-campos.ts:74`. Caminho: se "Origem da Demanda" ou "Objetivo Estratégico" for campo de texto, cada valor distinto (escrito por pessoa, pode ter nome) vira uma linha do arquivo. O arquivo é 0600, fora do clone e só do dono; o risco é o rótulo ser copiado do arquivo para o pedido ou para o código. Severidade: baixa. Correção mínima: no relatório, marcar o campo com opção `(escalar)` como "texto livre, não copiar". Esforço P. Dono: `node-backend` (marca) e o Jarvis (não copiar rótulo para `docs/`).
- **A3.** Evidência `spike-campos.test.ts:30` (campo 99 semeado, sem `not.toContain`). Caminho: uma mudança futura que somasse outros campos ao relatório passaria verde. Severidade: baixa. Correção mínima: semear campo de outro id com texto, `title`, `description`, dono e etiqueta comum e afirmar que nenhum aparece no arquivo nem no stdout; agora também afirmar que nenhum rótulo do catálogo aparece no stdout (o teste novo `:118-120` cobre só a função isolada). Esforço P. Dono: `qa-engineer`.
- **A4.** Evidência `spike-campos.ts:125-126`. Caminho: resposta do BusinessMap (fonte confiável, GET de 5 campos) com lista de centenas de milhares de itens; o espalhamento em `push` estoura a pilha. Sem vazamento: o `catch` imprime só a mensagem do erro. Impacto: o spike não termina. Severidade: baixa (disponibilidade de uma ferramenta de uso único). Correção mínima: `for (const x of no) prox.push(x)` nas duas linhas. Esforço P. Dono: `node-backend`.

### Orientação para a execução
Rodar com o `.env` da raiz do clone do dono; não definir `BM_SPIKE_SAIDA` dentro do clone. O stdout (contagens e forma) pode ir ao pedido; o arquivo `relatorio-campos-sistemas.md` fica só na máquina do dono, e ao pedido e ao plano vão só `value_id`, `position`, `tag_id` e contagens, ou rótulos que o dono decidir transcrever (`R-DECISAO`).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Testes rodados local na branch em `485f4070`: `tests/spike-campos.test.ts` e `tests/http.test.ts`, 2 arquivos, 46 testes, todos passaram (inclui os novos de profundidade e de forma sem valor, `spike-campos.test.ts:111-121`). A suíte inteira fica para o CI do PR; este parecer não afirma CI verde nem cita PQ do autor (não recebido). Ferramentas de varredura de segredo, de dependências e SAST não estão no PATH desta estação (lacuna; o delta não muda dependência nem lockfile).
