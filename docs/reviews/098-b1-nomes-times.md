---
tipo: review
contrato: 1
pedido: 098-acelerato-todos-os-times
branch: feature/098-b1-nomes-times
commit: 856804d29c3c5644f0544447c901e40d673b70b0
parecer: aprovado
revisor: tech-lead
data: 2026-11-18
---

# Code review: 098, lote B1 (migração 0043, nomes reais dos times)

Etapa E1.9, classe N. Diff lido: `git diff acb62951..856804d2` (7 arquivos; código: `server/migrations/0043_bm_nomes_times.ts` e `server/migrations/checksums.json`; o resto é teste). Conferido contra o lote B1 e o §3.2 de `docs/architecture/features/098-plano.md`, os achados A5 a A7 de `docs/reviews/098-plano.md`, as decisões 7 a 9 do dono no pedido 098 e as regras do `CLAUDE.md`.

**Veredito: aprovado no conteúdo.** O merge depende da ordem de integração da 0042 (veja A1). A suíte inteira fica para o CI do PR, que precisa estar verde, com o e2e, antes do merge.

## O que foi conferido

- **Lista fechada (decisões 7 a 9).** São 45 nomes ativos, iguais à tabela do §3.2. Os times 17 e 49 levam o nome do quadro: Falcon (Escritório de Projetos) e Falcon (Marketing e Vendas). Os times 22 e 23 ficam como ATO e EXA Books, e nenhum nome tem `[revisar]`. Os times 24 e 25 ficam inativos com o nome atual. Os workflows 127 e 220 passam aos times 20 e 10, no quadro 24 em que já estavam pela 0019. Nenhum nome de pessoa aparece. A lista de segurança (R4) cabe ao security-engineer (E1.11).
- **Histórico nunca sobrescrito.** O `up` faz só INSERT e `UPDATE ... SET vigente_ate = current_date WHERE vigente_ate IS NULL`, o mesmo caso que o gatilho `proibir_alteracao_vigencia` (0018) aceita. Um teste estático novo de `migracoes.estatico.test.ts` trava isso: o `up` não tem DELETE, TRUNCATE nem ON CONFLICT, e o único UPDATE é o de `vigente_ate`.
- **Vigência (U-1, T2.6).** A gravação usa `motivo = 'correcao'`, e a versão `098-E4:nomes-dos-times` não tem linha de métrica, logo não há marca nos gráficos, como o plano decide. O T-B1.3 prova o nome novo pelo `vigenteEm` no dia de partida, e o time 20 para o wf 127.
- **Falha fechada (T-B1.2).** O bloco `DO` vem antes de qualquer escrita e confere quatro coisas: os 47 times seguem no nome provisório e no workflow da lista; os times 1 a 3 têm os nomes da 0019 (A6); nenhum time ativo está fora de 1 a 50; e a versão ainda não existe. A mensagem cita só o `time_id`. Os testes pg provam cada um desses ramos e que nada é gravado.
- **Slug único (A6).** `validarNomes` usa `slug.ts` sobre os 45 nomes mais os 3 da 0019. O teste unitário prova o slug repetido, inclusive com acento e caixa.
- **Down (A7, T-B1.5).** O `down` recusa quando existe vigência posterior, de outra origem ou fechada depois. Ele desliga o gatilho só na transação, reabre as vigências, apaga as linhas da correção e religa o gatilho, que o teste mostra ativo depois. O `up` seguinte reproduz o mesmo estado.
- **Segurança de SQL.** Os literais vêm de constantes, e `aspas` duplica o apóstrofo. Não há entrada externa.

## Ferramenta (citada, sem refazer)

Logs do assistente em `~/.metricas-k274/b1`, no commit 856804d2:
- `tsc --noEmit`: rc 0 (`4-tsc.log`).
- Checksums regerados: "42 checksums gravados" (`1-checksums.log`).
- Suíte pg: 54 arquivos e 368 testes, todos passaram (`3-pg.log`).
- Vitest sem banco: 35 de 36 (`2-vitest.log`). A única falha é `migracoes.estatico` "sequenciais": `0043_bm_nomes_times: expected 43 to be 42`, porque a 0042 do T8 ainda não está na `develop`.

## Achados

- A1 (recomendado) server/migrations/0043_bm_nomes_times.ts:1 · O teste "sequenciais" fica vermelho sem a 0042 (105/T8) na `develop`, onde a última é a 0041. Não é defeito: o plano (A5) prevê. O PR só entra depois da 0042 (merge da base e checksums) ou com o B1 renumerado.
- A2 (recomendado) server/migrations/0043_bm_nomes_times.ts:85 · `ddl()` chama `validarNomes()` com o `slug` vivo. Se o `slug.ts` mudar depois de aplicada, o `ddl()` pode lançar erro e quebrar todas as migrações e o `checksumDe`. Deixe o slug só no teste (T-B1.2a).
- A3 (recomendado) server/tests/referencia-times.pg.test.ts:82 · `arrayContaining` mais `<= 2` aceita qualquer segundo par `(registrado_por, motivo)`. Melhor afirmar o conjunto exato: carga inicial e `correcao-098-E4`/`correcao`.
- A4 (recomendado) server/tests/nomes-times.pg.test.ts:80 · O T-B1.4 cobre só o dado em `ref_time_workflow`. Ainda falta a parte do plano em que um card do wf 127 ou 220 projeta com o time 20 ou 10 e nenhuma métrica muda. Fica com o QA (E1.10) ou entra num teste do projetor.
- A5 (recomendado) server/migrations/0043_bm_nomes_times.ts:1 · Tamanho (H1): são 159 linhas de código (156 da migração e 3 do `checksums.json`), acima do teto de 150. Uma migração é uma unidade atômica, e 22 linhas são a lista fechada. O PR leva `teto: excedido, 159 linhas, migração atômica com lista fechada de 45 nomes`.

## Pendências de integração

- O PR para a `develop` só depois da 0042 na base (A1). O CI do head precisa estar todo verde, com o e2e.
- Os pareceres do QA (E1.10) e da segurança (E1.11, gatilho migração e R4) ficam no mesmo head.
- Depois de migrar (B3): `bm:projetar --reconstruir` (§3.2).
