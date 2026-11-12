---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d3-alvo-prioridade
commit: 8f0d669b6d65b1d1864e1b2062dae9b7b9a45acf
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: D3, migração 0036 e carregador dos alvos de prioridade (E2.21)

Propósito: o D3 do 099 (Q-099-5a e Q-099-11; desenho em `docs/analises/099-d3-unidade-prazo.md`, alternativa a) no head `8f0d669b`, base `ea826a9c`. Gatilho: banco (migração em tabela lida pela API e escrita pelo `dspd_ref`). Lidos: o diff inteiro (`git diff origin/develop...8f0d669b`, 31 arquivos), `server/src/plataforma/db/grants.ts` (sem mudança no diff) e a seção Segurança do desenho. Rodados, sem banco: `vitest run` de `tests/alvos-acelerato.test.ts`, `tests/ref-sync-ac-alvos-entrada.test.ts`, `tests/migracoes.estatico.test.ts`, `tests/metricas.mapa.test.ts` e `tests/seed.estatico.test.ts` (5 arquivos, 71 testes, todos passaram). Os `.pg` não rodaram aqui (sem Postgres no sandbox); li o `tests/alvos-acelerato.pg.test.ts`. Nada rodou contra base real e nenhum `.env*` foi aberto.

## Gatilhos
- Banco: `server/migrations/0036_ac_alvo_prioridade_unidade.ts` (novo) e o carregador `server/src/modulos/referencia/alvos-acelerato.ts` (novo), chamado pelo `ac:ref-sync` (`server/src/entradas/ref-sync-ac.ts:29`).

## Resultado por ponto do brief

**1. Nenhum GRANT novo: conforme.** O diff não toca `grants.ts` nem traz `GRANT`/`REVOKE`. Os privilégios saem de `gerarGrants` pelo catálogo: `ref_alvo_prioridade` não tem coluna em `COLUNAS_PESSOA` nem em `COLUNAS_FORA_DA_API`, então o `dspd_api` recebe `SELECT` de tabela (`grants.ts:110-114`), o que cobre as colunas novas e as renomeadas sem regra nova; o `dspd_ref` recebe `SELECT, INSERT` e `UPDATE (vigente_ate)` (`grants.ts:115-117`), como em todo `ref_` com vigência.

**2. `dspd_ref` só insere e fecha vigência: conforme.** O carregador só faz `INSERT` em `ref_alvo_prioridade` (`alvos-acelerato.ts:155`), em `ref_versao_criterio` e `ref_versao_criterio_metrica` (`:145`, `:147`), e `UPDATE ... SET vigente_ate` (`:151`). Tudo parametrizado; o único texto interpolado é o nome de schema de `montarEsquemas`. A troca de unidade é nova vigência, não UPDATE. O `.pg` prova pelo papel: `UPDATE` de `unidade_pa`, `UPDATE` de `prazo_pa_horas` e `DELETE` pelo `dspd_ref` recusam com `42501` (`tests/alvos-acelerato.pg.test.ts:123-125`).

**3. `dspd_api` só lê: conforme.** A API lê só a vigente, com a unidade (`repositorio.ts:168`); o `.pg` prova `SELECT` aceito e `UPDATE` recusado com `42501` pelo `dspd_api`. Unidade fora de `corrido`/`util` na leitura vira erro, nunca padrão (`mapa.ts:176-179`); a coluna já tem `CHECK`.

**4. O down da 0036 recusa com linha `corrido`: conforme.** O bloco `DO $guarda$` (`0036_ac_alvo_prioridade_unidade.ts:27-31`) levanta exceção antes de qualquer `DROP`, e o `.pg` prova a recusa sem mudança nos dois prazos e o down limpo sem a linha. O `DEFAULT 'util'` do up só preenche as linhas existentes (o que o nome antigo da coluna declarava) e sai em seguida: linha nova sem unidade recusa (`23502`). A migração não reescreve valor (só `RENAME`, `ADD COLUMN`, `DROP DEFAULT`), coerente com "nunca sobrescrever histórico".

**5. Sem pessoa nem segredo: conforme.** O arquivo `docs/architecture/fontes/acelerato-alvos.json` tem só prioridade, horas, unidade e o texto do PROC; o esquema é `strict`, os textos passam por `textoSeguro` (sem controle, sem `@`) e o `texto_proc` não é gravado. O contrato (`schemas.ts`) ganha só `unidade`. A saída do `ac:ref-sync` segue só de contagens e hashes; no erro, só a mensagem de `ErroAlvos` (caminho de campo e data) ou a categoria (`ref-sync-ac.ts:32`). As URLs com credencial no diff são dublês de teste (`tests/ref-sync-ac-alvos-entrada.test.ts`, valor fictício), e o teste prova que não vão à saída.

**6. Fato registrado: os `.pg` rodaram num Postgres descartável no Docker, com o sandbox contornado pelo portão de permissão.** Risco: com o sandbox desligado, o comando do autor roda com o acesso inteiro do usuário da estação (outros `.env`, sockets, rede), e o socket do Docker equivale a root na máquina; um comando errado nessa janela não tem a rede de proteção do sandbox. O que reduz o risco aqui: o portão de permissão viu cada comando, o banco era descartável, e o harness de teste (`tests/pg/ctx.ts`) usa a URL injetada pelo `globalSetup` e senhas de desenvolvimento por padrão, sem ler `.env`. Recomendação, sem bloqueio: (a) a prova de banco autoritativa é o CI do PR, que roda os `.pg` sem contornar nada; (b) quando o autor precisar rodar `.pg` local, usar um comando único e fixo do projeto (o mesmo que o CI usa para subir o Postgres de teste), autorizado uma vez por regra de permissão, em vez de contornar o sandbox comando a comando; (c) nunca no mesmo comando que lê `.env` ou fala com base real. A decisão de regra de permissão é do dono (`R-DECISAO`).

**Fora do recorte de segurança, sem bloqueio:** o A1 abaixo é integridade operacional, sem caminho de ataque (só o operador com o papel `dspd_ref` executa o comando).

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH. Não fazem falta aqui: sem dependência nova, sem script novo no `package.json`, e o diff foi lido inteiro à procura de credencial.

## Achados
- A1 (recomendado) server/src/entradas/ref-sync-ac.ts:28 · Domínio e alvos gravam em duas transações: se os alvos recusarem por vigência, as listas já ficaram gravadas. O comentário de :14-15 diz validar antes de qualquer escrita, o que vale só para o arquivo. Sem caminho de ataque; reexecutar é idempotente.

## Plano em cartões
Nenhum bloqueante. O A1 vai ao `node-backend` e ao `tech-lead` para decidirem no review (uma transação só, ou o comentário dizer o que a ordem garante). A recomendação do ponto 6 vai ao dono pelo Jarvis.

## Riscos aceitos
Nenhum.
