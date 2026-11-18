---
tipo: revisao-seguranca
contrato: 1
pedido: 098-acelerato-todos-os-times
branch: feature/098-b1-nomes-times
commit: 34793256b4e8dd874dced2e78bed6a2ea86e9c75
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-18
---
# Review de segurança: 098-acelerato-todos-os-times (lote B1, migração 0043)

Etapa E1.16 (delta da E1.11). A rodada anterior (head `856804d2`, aprovado com A1 e A2 recomendados) fica no git; aqui só o delta.

## Gatilhos
Gatilhos: migração de banco em tabela de referência com vigência imutável (gatilho de vigência desligado no `down`); dado vindo de arquivo do dono fora do repositório.

## Achados

## Sondas

## Delta 856804d2..34793256 (E1.16)
Lido: `forge-check parecer delta` aponta no domínio só `server/migrations/0043_bm_nomes_times.ts`; os três testes (`nomes-times.test.ts`, `nomes-times.pg.test.ts`, `referencia-times.pg.test.ts`) foram lidos por serem a prova das correções. Já lido na rodada anterior: o resto da 0043, o runner (`migrar.ts`, `executar.ts`), `grants.ts` e `checksums.json`.

**A1 (recomendado) · resolvido.** `server/migrations/0043_bm_nomes_times.ts:50`: `WORKFLOWS_UNIFICADOS` agora passa por `aspas(w)`, declarada antes (`:46`). Como os workflows são só dígitos, o SQL gerado é byte a byte o mesmo: `checksums.json` não mudou no delta e o teste "SHA-256 de ddl(S_PADRAO) bate com checksums.json" passa.

**A2 (recomendado) · resolvido.** `validarNomes` recusa `$` nos 47 nomes novos (`:73`) e nos três de `JA_NOMEADOS` (`:75`); `ddl` chama `validarNomes(novos)` antes de montar o SQL (`:98`). Dos nomes, só os de `JA_NOMEADOS` entram num bloco `DO $$` (o do `up`, `jaNomeados`); os novos entram no `INSERT` fora do bloco, onde a recusa é conservadora e não custa nada. O resto do que entra nos blocos `DO` é constante sem `$` nem aspa: workflows (dígitos, iguais aos da 0019 por `nomes-times.test.ts:17-18` e `:33`), `REFERENCIA_VERSAO`, `REGISTRADO_POR*` e `IDS` (números). Testes: `nomes-times.test.ts` (cifrão no meio, no fim e num dos times 1 a 3; e o `ddl` lançando com `a$$b`).

**SQL da 0043 no delta.** Duas mudanças além de A1 e A2, sem efeito de segurança: (1) o parâmetro `novos` de `ddl` tem padrão `NOMES_NOVOS`, e o runner chama `ddl(esquemasDoAmbiente())` com um argumento só (`server/src/plataforma/db/executar.ts:14-15`), então nada externo chega por ali; (2) a checagem de slug saiu do `ddl` para `validarSlugs`, chamada só no teste, o que tira a dependência do `slug.ts` vivo e mantém o checksum estável; slug repetido é defeito de dado, não caminho de ataque, e a lista é constante coberta pelo teste. A falha fechada do `up` e a guarda do `down` não mudaram; os testes novos com banco (T-B1.2 por caso, T-B1.5 por cláusula da guarda, gatilhos `tgenabled = 'O'` nas duas tabelas depois do `down` e depois da recusa) reforçam o que a rodada anterior leu no código. `referencia-times.pg.test.ts` passou a exigir exatamente os dois `registrado_por`, mais estrito; a checagem de privilégio de `dspd_api` não foi tocada.

**Fora do domínio de segurança (para o `tech-lead`):** `migracoes.estatico.test.ts:62` continua falhando localmente porque a 0042 não está na base (mesma nota da rodada anterior).

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum.
Ferramentas: `git diff` e leitura estática; `npx vitest run tests/nomes-times.test.ts tests/migracoes.estatico.test.ts` no head: 38 de 39, a falha é a sequência da 0042. Suíte com banco não rodada (sem docker por restrição do brief): vale o CI do PR. Lacunas no PATH: varredor de segredos, SAST e varredor de dependências; o delta não toca dependência nem configuração.
