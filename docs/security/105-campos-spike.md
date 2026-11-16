---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-spike
commit: ad934012f6657d9b5a10ccd1fe3557eac567b658
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11, spike dos campos (E7.176)

Escopo: o diff `71d25693..ad934012` (E7.172), revisto **antes** de o assistente rodar `bm:spike-campos` contra o quadro real: `server/src/modulos/businessmap/spike-campos.ts` (novo), `server/src/entradas/spike-campos-businessmap.ts` (novo), `server/src/modulos/businessmap/spike.ts` (só exporta `prepararSaida`), `server/src/modulos/businessmap/index.ts`, `server/package.json` e `server/tests/spike-campos.test.ts`. O cliente HTTP (`server/src/plataforma/http.ts`) não muda nesta branch. Nada foi rodado contra a API real.

Veredito: **aprovado para rodar**. Os quatro pontos pedidos se sustentam no código e nas sondas locais; ficam três recomendações, nenhuma bloqueia a execução.

## Gatilhos
`R-SEGURANCA`: credencial de integração externa (chave do BusinessMap que pode escrever no quadro), dado de terceiros com texto escrito por pessoas (rótulos de opção e de etiqueta) e escrita em disco fora do clone.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/spike-campos.ts:139 · o value_id em texto vindo da API entra na tabela do relatório sem o rotuloSeguro nem teto de tamanho; quebra de linha ou barra vertical desmontam a tabela (sonda S4 do detalhe). Passar o value_id pelo mesmo saneamento do rótulo.
- A2 (recomendado) server/src/modulos/businessmap/spike-campos.ts:69 · se o campo 49 ou 50 for de texto livre, o valor escalar (até 80 caracteres) vai ao arquivo do dono; aceitável no arquivo 0600, mas o relatório deveria marcar a opção (escalar) como texto livre e o dono não a copiar para o pedido.
- A3 (recomendado) server/tests/spike-campos.test.ts:30 · o teste semeia texto no campo 99 mas não afirma que ele, título, descrição, pessoa e etiqueta fora de SISTEMA ficam fora do arquivo; acrescentar essa negação (a sonda S2 do detalhe é o modelo).

## Sondas

## Detalhe dos achados

### Os quatro pontos do brief
1. **Só GET.** O spike só chama `cliente.get` (`spike-campos.ts:195`) do cliente da F0, que só tem `GET`, `redirect: 'manual'` e lista fechada de caminhos e de consulta (`http.ts:15-26`, `http.ts:232-249`, `http.ts:309-318`). `/cards` com `expand=custom_fields,tag_ids` casa `EXPAND_CARDS` (`http.ts:51`); `/tags` com `page` casa `CONSULTA_PERMITIDA` (`http.ts:18`, `http.ts:33`). A lista de caminhos não foi tocada (`git diff --stat 71d25693..ad934012 -- server/src/plataforma` vazio). O catálogo `/customFields/{id}` segue fora da lista e o spike não o pede.
2. **Sem texto livre de outros campos nem pessoa.** `somarCard` descarta toda entrada de `custom_fields` cujo `field_id` não é 40, 41, 49 ou 50 (`spike-campos.ts:82-83`), não lê título, descrição nem dono do card, e a forma do valor guarda só chaves saneadas, tipos e contagens (`spike-forma.ts:17-36`). Do catálogo de etiquetas só saem as de rótulo "SISTEMA - " (`spike-campos.ts:117`). O stdout leva só contagens e o caminho do arquivo (`spike-campos.ts:152-162`, `:237`). Nenhuma resposta bruta é gravada; nada vai à base.
3. **Credencial só pelo `.env`.** A entrada lê `.env` da raiz por `process.loadEnvFile` e, em falha, imprime só o código do erro (`spike-campos-businessmap.ts:9-16`); `lerConfig` nomeia a variável e nunca o valor (`diagnostico.ts:62-80`) e exige https fora de loopback (`diagnostico.ts:47-52`); a chave vai só no cabeçalho e os avisos e o erro fatal passam por `limpar` (`spike-campos.ts:189`, `:199`, `:240`). As mensagens do cliente não levam corpo de resposta (`http.ts:8`).
4. **Guarda do caminho de saída.** `foraDoRepositorio` (caminho real, recusa link simbólico e link quebrado, recusa o clone e o que está dentro dele) e `prepararSaida` (cria 0700 ou aceita pasta vazia e a põe em 0700) são as mesmas do spike F1 já aprovado (`spike.ts:47-74`); o arquivo é criado com `flag: 'wx'` e `mode: 0o600` (`spike-campos.ts:236`), então não segue link plantado nem sobrescreve. O padrão sem `BM_SPIKE_SAIDA` é uma pasta nova com carimbo de tempo no diretório do usuário (`spike-campos-businessmap.ts:18`).

### Sondas executadas (locais, servidor fictício em 127.0.0.1, nenhuma chamada ao BusinessMap)
Script em `$TMPDIR/sonda105/sonda.mts`, importando o módulo da branch em `ad934012`.
- S1 · pedidos feitos · espera: só GET em /cards e /tags · obtido: `GET /cards?board_ids=10&state=active&per_page=100&page=1&expand=custom_fields%2Ctag_ids` e `GET /tags`, código 0.
- S2 · card com título, descrição, dono (nome e e-mail), campo 99 de texto, campo 12 com opção, `display_value` no campo 40, etiqueta "Joao da Silva" · espera: nada disso no arquivo nem no stdout · obtido: todos ausentes nos dois.
- S3 · stdout · espera: só contagens e o caminho · obtido: só contagens e o caminho.
- S4 · `value_id` `"v|1\n## injetado"` no campo 40 · espera: célula saneada · obtido: a linha da tabela quebra em duas (A1).
- S5 · saída = link para o clone; saída = subpasta via link; pasta com link plantado no nome do relatório · espera: recusa sem escrever · obtido: código 2 nos três ("é link simbólico", "dentro do repositório", "não está vazio"); clone intacto.
- Informativa: um valor de campo que contenha a própria chave iria ao arquivo do dono sem `[redigido]` (rótulos não passam por `limpar`); exige que alguém escreva a chave no quadro, sem caminho de ataque realista. Não é achado.

### Detalhe das recomendações
- **A1.** Evidência `spike-campos.ts:139` (`| ${vid} |`) e `:65` (`ehChave` aceita qualquer texto não vazio). Caminho: o `value_id` vem da API; na API real é numérico, então o efeito é só tabela torta no arquivo do dono. Severidade: baixa. Correção mínima: `rotuloSeguro(vid)` na linha 139. Esforço P. Dono: `node-backend`.
- **A2.** Evidência `spike-campos.ts:69`. Caminho: se "Origem da Demanda" ou "Objetivo Estratégico" for campo de texto, cada valor distinto (escrito por pessoa, pode ter nome) vira uma linha do arquivo. O arquivo é 0600, fora do clone e só do dono, o que o brief admite; o risco é o rótulo ser copiado do arquivo para o pedido ou para o código. Severidade: baixa. Correção mínima: no relatório, marcar o campo com opção `(escalar)` como "texto livre, não copiar"; quem levar o resultado ao plano usa só `value_id` e contagens. Esforço P. Dono: `node-backend` (marca) e o Jarvis (não copiar rótulo para `docs/`).
- **A3.** Evidência `spike-campos.test.ts:30` (campo 99 semeado, sem `not.toContain`) e `:99-118`. Caminho: uma mudança futura que somasse outros campos ao relatório passaria verde. Severidade: baixa. Correção mínima: no teste de ponta a ponta, semear campo de outro id com texto, `title`, `description`, dono e etiqueta comum e afirmar que nenhum aparece no arquivo nem no stdout. Esforço P. Dono: `qa-engineer`.

### Orientação para a execução
Rodar com o `.env` da raiz do clone do dono; não definir `BM_SPIKE_SAIDA` dentro do clone (é recusado de qualquer forma). O arquivo `relatorio-campos-sistemas.md` fica só na máquina do dono; ao pedido e ao plano vão só `value_id`, `tag_id` e contagens, ou rótulos que o dono decidir transcrever (`R-DECISAO`).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Teste novo rodado local na branch em `ad934012`: `tests/spike-campos.test.ts`, 1 arquivo, 6 testes, todos passaram. A suíte inteira fica para o CI do PR; este parecer não afirma CI verde nem cita PQ do autor (não recebido). Ferramentas de varredura de segredo, de dependências e SAST não estão no PATH desta estação (lacuna; o diff não muda dependência nem lockfile).
