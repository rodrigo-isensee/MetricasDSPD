---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-spike
commit: 50fc7239dce44b3ac8357870ab784c04469ad018
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11, spike dos campos (E7.176, revalidações E7.183, E7.192 e E7.200)

Escopo desta rodada (E7.200): o delta `485f4070..50fc7239`: no domínio, `server/src/modulos/businessmap/spike-campos.ts` (catálogo pela rota `/customFields/{id}/allowedValues`, paginação até 5 páginas, laço no lugar de `push(...)`) e `server/src/plataforma/http.ts` (caminhos extras aceitam só `page`); fora do domínio, `server/tests/http.test.ts` e `server/tests/spike-campos.test.ts`. As rodadas anteriores (`ad934012`, `0ecc16c3`, `485f4070`) seguem valendo no que o delta não tocou. Nada foi rodado contra a API real com credencial.

Veredito: **aprovado para rodar**. `page` não abre outro caminho nem altera o cliente padrão (sondas abaixo); a lista global `CAMINHOS_PERMITIDOS` não mudou. A4 corrigido. A2 e A3 seguem como recomendação.

## Gatilhos
`R-SEGURANCA`: mudança na lista fechada do cliente HTTP do BusinessMap (controle de fronteira) e dado de terceiros com texto escrito por pessoas (rótulos de opção) gravado fora do clone.

## Achados
- A2 (recomendado) server/src/modulos/businessmap/spike-campos.ts:75 · se o campo 49 ou 50 for de texto livre, o valor escalar (até 80 caracteres) vai ao arquivo do dono; aceitável no arquivo 0600, mas o relatório deveria marcar a opção (escalar) como texto livre e o dono não a copiar para o pedido.
- A3 (recomendado) server/tests/spike-campos.test.ts:30 · o teste semeia texto no campo 99 mas não afirma que ele, título, descrição, pessoa e etiqueta fora de SISTEMA ficam fora do arquivo; acrescentar essa negação (a sonda S2 da rodada E7.176 é o modelo).

## Sondas

## Detalhe dos achados

### Delta E7.200 (esta rodada)
1. **Caminho extra só com `page`.** `http.ts:242` recusa em extra qualquer chave diferente de `page`; o valor de `page` ainda passa pela regra global `CONSULTA_PERMITIDA.page` (`http.ts:33`, `^\d{1,5}$`) no laço de `http.ts:252-258`, e a URL é montada por `URLSearchParams` sobre a origem do `.env`. O teste de host próprio (`http.ts:238`) roda antes. A regex do spike (`spike-campos.ts:20`) é ancorada nos dois lados e só casa os cinco ids com o sufixo `/allowedValues`; `/customFields/{id}` sem sufixo saiu da lista do spike.
2. **Cliente padrão inalterado.** `caminhosExtras` só é passado em `spike-campos.ts:239`; `CAMINHOS_PERMITIDOS` (`http.ts:15-26`) não ganhou entrada. Sem `caminhosExtras`, `/customFields/41/allowedValues` é recusado com e sem `page`.
3. **Paginação limitada.** `spike-campos.ts:295-301`: até `TETO_PAGINAS_CATALOGO = 5` páginas por campo (no máximo 25 GETs de catálogo), `paginas` só aceita número (`spike-forma.ts:64`); acima do teto, o aviso leva só o id do campo e a contagem. A forma no stdout continua só da 1ª página e sem rótulo; os rótulos das páginas seguintes vão só ao arquivo 0600 (`spike-campos.ts:307`, `flag: 'wx'`, `mode: 0o600`).
4. **A4 corrigido.** `spike-campos.ts:126-129` e `:283` trocam o espalhamento por laço; a lista grande não estoura mais a pilha.

Sondas locais desta rodada (script em `$TMPDIR` com `tsx`, importando `http.ts` e `CAMINHOS_CATALOGO` da branch em `50fc7239`, `fetchImpl` fictício), registradas aqui porque nenhuma prova bloqueante:
- extra, `/customFields/41/allowedValues` com `{page:2}` · espera: aceito · obtido: `https://<host do .env>/api/v2/customFields/41/allowedValues?page=2`.
- extra com `page` `123456`, `1&x=1`, `-1` · espera: recusa · obtido: `consulta`, "parâmetro de consulta recusado: page" nos três.
- extra com `{page:1, per_page:1}` e `{fields:'name'}` · espera: recusa · obtido: `consulta`, "este caminho só aceita page".
- extra `/customFields/42/allowedValues`, `/customFields/41/allowedValues/1`, `/customFields/41/allowedValues/../../users`, `/customFields/41`, `/customFields/41/allowedValues\n` · espera: recusa · obtido: `caminho` nos cinco.
- cliente padrão, `/customFields/41/allowedValues` com e sem `{page:1}` · espera: recusa · obtido: `caminho` nos dois.

Nota de execução: a primeira tentativa da sonda passou o `fetch` fictício no campo errado e o caso aceito (`page=2`) saiu à rede para o host fictício da sonda, com apikey fictícia, e voltou 401; nenhuma credencial real nem dado do projeto foi usado. Repetida com `fetchImpl`, sem rede.

### Detalhe das recomendações
- **A2.** Evidência `spike-campos.ts:75`. Caminho: se "Origem da Demanda" ou "Objetivo Estratégico" for campo de texto, cada valor distinto (escrito por pessoa, pode ter nome) vira uma linha do arquivo. O arquivo é 0600, fora do clone e só do dono; o risco é o rótulo ser copiado do arquivo para o pedido ou para o código. Severidade: baixa. Correção mínima: no relatório, marcar o campo com opção `(escalar)` como "texto livre, não copiar". Esforço P. Dono: `node-backend` (marca) e o Jarvis (não copiar rótulo para `docs/`).
- **A3.** Evidência `spike-campos.test.ts:30` (campo 99 semeado, sem `not.toContain`). Caminho: uma mudança futura que somasse outros campos ao relatório passaria verde. Severidade: baixa. Correção mínima: semear campo de outro id com texto, `title`, `description`, dono e etiqueta comum e afirmar que nenhum aparece no arquivo nem no stdout, e que nenhum rótulo do catálogo (inclusive o da página 2, "Opção Fictícia 41C") aparece no stdout. Esforço P. Dono: `qa-engineer`.

### Orientação para a execução
Rodar com o `.env` da raiz do clone do dono; não definir `BM_SPIKE_SAIDA` dentro do clone. O stdout (contagens e forma) pode ir ao pedido; o arquivo `relatorio-campos-sistemas.md` fica só na máquina do dono, e ao pedido e ao plano vão só `value_id`, `position`, `tag_id` e contagens, ou rótulos que o dono decidir transcrever (`R-DECISAO`).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Testes rodados local na branch em `50fc7239`: `tests/spike-campos.test.ts` e `tests/http.test.ts`, 2 arquivos, 46 testes, todos passaram. A suíte inteira fica para o CI do PR; este parecer não afirma CI verde nem cita PQ do autor (não recebido). Ferramentas de varredura de segredo, de dependências e SAST não estão no PATH desta estação (lacuna; o delta não muda dependência nem lockfile).
