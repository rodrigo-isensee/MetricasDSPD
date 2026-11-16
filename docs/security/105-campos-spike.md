---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-spike
commit: 0ecc16c30733eba6e2b3d7e2821ddf931d2ae412
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11, spike dos campos (E7.176, revalidação E7.183)

Escopo desta rodada: o delta `ad934012..0ecc16c3` (E7.179), lido por `forge-check parecer delta`: `server/src/plataforma/http.ts` (novo `ConfigHttp.caminhosExtras`), `server/src/modulos/businessmap/spike-campos.ts` (catálogo `GET /customFields/{id}` dos campos 40, 41, 48, 49 e 50) e os testes `server/tests/http.test.ts` e `server/tests/spike-campos.test.ts`. A rodada anterior (aprovada em `ad934012`) cobriu o spike inteiro; o que ela concluiu e não foi tocado pelo delta continua valendo (resumo no detalhe). Nada foi rodado contra a API real.

Veredito: **aprovado para rodar**. A lista global `CAMINHOS_PERMITIDOS` não mudou; `caminhosExtras` só abre caminho no cliente que o recebe, e só o spike o passa. A1 foi corrigido no delta; A2 e A3 seguem como recomendação.

## Gatilhos
`R-SEGURANCA`: mudança no controle de caminhos do cliente HTTP do BusinessMap (fronteira com a credencial que pode escrever no quadro), dado de terceiros com texto escrito por pessoas (rótulos de opção e de etiqueta) e escrita em disco fora do clone.

## Achados
- A2 (recomendado) server/src/modulos/businessmap/spike-campos.ts:74 · se o campo 49 ou 50 for de texto livre, o valor escalar (até 80 caracteres) vai ao arquivo do dono; aceitável no arquivo 0600, mas o relatório deveria marcar a opção (escalar) como texto livre e o dono não a copiar para o pedido.
- A3 (recomendado) server/tests/spike-campos.test.ts:30 · o teste semeia texto no campo 99 mas não afirma que ele, título, descrição, pessoa e etiqueta fora de SISTEMA ficam fora do arquivo; acrescentar essa negação (a sonda S2 da rodada anterior é o modelo).

## Sondas

## Detalhe dos achados

### Delta E7.179 (esta rodada)
1. **`caminhosExtras` não abre o cliente padrão.** Em `http.ts:239-242`, o caminho extra só é aceito quando `cfg.caminhosExtras` do próprio cliente casa (`?? []` sem a opção); caminho extra recusa qualquer parâmetro de consulta antes da rede. `grep` nos fontes: só `spike-campos.ts:219` passa `caminhosExtras`; os outros quatro clientes (`entradas/coleta-businessmap.ts:34`, `entradas/apontamento-businessmap.ts:32`, `entradas/d1-comentario-businessmap.ts:23`, `modulos/businessmap/spike.ts:139`) montam o objeto literal sem a opção, e nenhum espalha configuração vinda de `.env` ou de arquivo no `ConfigHttp`. `CAMINHOS_PERMITIDOS` (`http.ts:15-26`) idêntica à de `ad934012`.
2. **Padrão do spike fechado.** `CAMINHOS_CATALOGO = [/^\/customFields\/(40|41|48|49|50)$/]` (`spike-campos.ts:20`): ancorado nos dois lados, sem flag `g` (sem estado de `lastIndex`), sem consulta. O spike pede os cinco com consulta vazia (`spike-campos.ts:268-270`).
3. **Só os campos da allow-list saem da resposta.** `opcoesDoCatalogo` (`spike-campos.ts:116-132`) extrai só `value_id`, o rótulo (`value`/`label`/`name`) e `position`; o resto da definição do campo é descartado e a resposta bruta não é gravada. No arquivo 0600 os três passam por `rotuloSeguro` (sem quebra de linha, barra vertical nem crase; teto de 80) (`spike-campos.ts:172`); o stdout leva só a contagem por campo (`spike-campos.ts:193`). O arquivo segue `flag: 'wx'`, `mode: 0o600` (`spike-campos.ts:275`). Falha de leitura do catálogo vira aviso passado por `limpar` (`spike-campos.ts:227-235`), sem corpo de resposta.
4. **A1 corrigido.** O `value_id` da amostra agora passa por `rotuloSeguro` (`spike-campos.ts:165`), e o do catálogo também (`:172`).

Sondas locais desta rodada (script em `$TMPDIR`, importando `http.ts` e `spike-campos.ts` da branch em `0ecc16c3`, `urlBase` em 127.0.0.1 porta fechada; "caminho" e "consulta" são recusas antes da rede, "indisponivel" é pedido aceito que não achou servidor), registradas aqui porque nenhuma prova bloqueante:
- cliente padrão, `/customFields/48` e `/customFields/40` · espera: recusa · obtido: `caminho` nos dois.
- cliente do spike, `/customFields/48` com `page=1` · espera: recusa · obtido: `consulta`.
- cliente do spike, `/customFields/480`, `/customFields/48/../users`, `"/customFields/48\n"`, `/customFields/48%2F..%2Fusers`, `/customFields/42`, `/customFields/48?fields=x` · espera: recusa · obtido: `caminho` nos seis.
- cliente do spike, `/customFields/48` sem consulta · espera: aceito · obtido: `indisponivel` (chegou à rede).

Informativa, não achado: `caminhosExtras` aceitaria um padrão frouxo ou com flag `g` de quem o passar; hoje o único chamador passa uma constante revisada. Se outro módulo vier a usá-lo, o uso volta a este review por `R-SEGURANCA` (mudança de controle).

### Da rodada anterior (ad934012), não tocado pelo delta
Só GET pelo cliente da F0, com `redirect: 'manual'`, lista fechada de caminhos e de consulta; nenhum texto livre de outros campos nem pessoa sai dos cards (`somarCard` descarta todo `field_id` fora de 40, 41, 49 e 50); a credencial vem só do `.env` e é redigida nos avisos; `foraDoRepositorio` e `prepararSaida` recusam saída dentro do clone e link simbólico. As sondas S1 a S5 daquela rodada continuam aplicáveis.

### Detalhe das recomendações
- **A2.** Evidência `spike-campos.ts:74`. Caminho: se "Origem da Demanda" ou "Objetivo Estratégico" for campo de texto, cada valor distinto (escrito por pessoa, pode ter nome) vira uma linha do arquivo. O arquivo é 0600, fora do clone e só do dono; o risco é o rótulo ser copiado do arquivo para o pedido ou para o código. O mesmo vale para os rótulos do catálogo (opções de Gerência e Diretoria podem trazer nome de pessoa). Severidade: baixa. Correção mínima: no relatório, marcar o campo com opção `(escalar)` como "texto livre, não copiar"; quem levar o resultado ao plano usa só `value_id`, `position` e contagens. Esforço P. Dono: `node-backend` (marca) e o Jarvis (não copiar rótulo para `docs/`).
- **A3.** Evidência `spike-campos.test.ts:30` (campo 99 semeado, sem `not.toContain`). Caminho: uma mudança futura que somasse outros campos ao relatório passaria verde. Severidade: baixa. Correção mínima: no teste de ponta a ponta, semear campo de outro id com texto, `title`, `description`, dono e etiqueta comum e afirmar que nenhum aparece no arquivo nem no stdout. Esforço P. Dono: `qa-engineer`.

### Orientação para a execução
Rodar com o `.env` da raiz do clone do dono; não definir `BM_SPIKE_SAIDA` dentro do clone (é recusado de qualquer forma). O arquivo `relatorio-campos-sistemas.md` fica só na máquina do dono; ao pedido e ao plano vão só `value_id`, `position`, `tag_id` e contagens, ou rótulos que o dono decidir transcrever (`R-DECISAO`).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Testes rodados local na branch em `0ecc16c3`: `tests/http.test.ts` e `tests/spike-campos.test.ts`, 2 arquivos, 44 testes, todos passaram (inclui o teste novo de abuso `caminhosExtras`, `http.test.ts:111`). A suíte inteira fica para o CI do PR; este parecer não afirma CI verde nem cita PQ do autor (não recebido). Ferramentas de varredura de segredo, de dependências e SAST não estão no PATH desta estação (lacuna; o delta não muda dependência nem lockfile).
