---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 744e5a36e23676f9edc0cf6af88ef7b3e891890a
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105, S1 só com a escala P1 a P5 (E7.310)

Head revisado: 744e5a36 (base 57989aa0). Escopo: a migração 0040 (`dim_chamado.escala_p`), o comando novo `ac:reprojetar-escala`, que escreve na base, e o caminho do campo até a API (repositório, serviço, contrato).

**Veredito: aprovado.** A coluna nova é um booleano derivado, não dado de pessoa nem texto livre; o `dspd_api` a lê pela regra geral das projeções, sem abrir coluna de pessoa; o comando só preenche nulos, numa transação, com a guarda do seed e sem vazar credencial nem texto do banco. Uma recomendação operacional (SQL do DBA) abaixo.

## Gatilhos
`R-SEGURANCA`: migração com GRANT (papel `dspd_api`, regra inviolável do GRANT por coluna), comando que escreve na base com a credencial do migrador e leitura do staging do Acelerato (allow-list de campos).

## Achados
- A1 (recomendado) server/migrations/0040_ac_dim_chamado_escala_p.ts:14 · O SQL do DBA (db:sql, deploy/sql, existente só na develop) não tem a 0040; ao trazer a develop, regenerar deploy/sql antes de a VM migrar, senão a coluna falta lá e o S1 real cai em erro (disponibilidade, sem exposição).

## Sondas

## Detalhe dos achados
**Migração 0040 e GRANT.** `server/migrations/0040_ac_dim_chamado_escala_p.ts:14` só faz `ADD COLUMN IF NOT EXISTS escala_p boolean NULL`; não reescreve linha (histórico intacto) e o `down` só tira a coluna derivada da projeção. O GRANT vem de `gerarGrants`: `dim_chamado` casa `PROJECAO` (`server/src/plataforma/db/grants.ts:57`) e não tem nenhuma coluna em `COLUNAS_PESSOA` nem em `COLUNAS_FORA_DA_API` (`server/src/plataforma/db/lgpd.ts`), então o `dspd_api` recebe SELECT na tabela inteira (`grants.ts:117`), como já recebia (o `9000_grants.sql` da develop traz `GRANT SELECT ON dspd_ac.dim_chamado TO dspd_api`). O nome `escala_p` (segmentos `escala`, `p`) não casa `SEGMENTO_PESSOA`; o teste estático das migrações (LGPD por coluna) passa. Nenhum GRANT novo, nenhum papel ganha privilégio.

**Comando `ac:reprojetar-escala`.** Entrada em `server/src/entradas/reprojetar-escala-ac.ts:13` com a credencial do migrador (mesmo padrão de `ac:reprojetar-etapas` e `ac:reprojetar-fluxo`, executado só pelo dono na máquina dele; não é exposto pela API). Erro sai só como categoria (`:17`, `categoriaDoErro`), sem URL, senha nem texto do banco; a saída é só contagem. `server/src/modulos/acelerato/reprojecao-escala.ts:23` toma a trava do seed e recusa esquema com seed; tudo numa transação. O SQL é parametrizado (`unnest($1::text[], $2::boolean[])`); o único interpolado é o nome do esquema da configuração e a constante `TAMANHO_LOTE`. O `UPDATE` (`:44`) só toca linha com `escala_p IS NULL` e só grava resultado não nulo: não sobrescreve valor existente, repetir não muda dado. Do staging sai só o booleano derivado do texto da prioridade (`escalaPDaPrioridade`); nada de pessoa, título ou descrição chega à dimensão. O texto da prioridade já é campo da allow-list e já vivia em `dim_chamado.prioridade`.

**Caminho até a API.** O repositório passa a ler `escala_p` (booleano); o contrato ganha `foraDaMatriz` com duas contagens inteiras não negativas, sem estatística abaixo do mínimo; sem escala projetada o serviço responde sem dado real com motivo (`server/src/modulos/metricas/servico.ts:295`), sem presumir. Nenhuma superfície de entrada nova.

**A1, SQL do DBA.** Evidência: `db:sql` e `deploy/sql/` existem na develop (pedido 105, E7.246) e não na base desta branch; a develop vai até `0039_bm_toque_primeiro.sql`. Caminho: não há atacante; o risco é a VM ser migrada pelo SQL desatualizado e o S1 real falhar por coluna ausente. Severidade: informativa. Correção mínima: depois de trazer a develop, rodar `pnpm run db:sql` e commitar `deploy/sql/0040_ac_dim_chamado_escala_p.sql`, `deploy/sql/consolidado.sql` e `deploy/sql/9000_grants.sql` regenerados (o `9000_grants.sql` não deve mudar para `dim_chamado`, pois o GRANT é por tabela). Esforço P. Dono: `node-backend` (autor), conferido pelo `tech-lead`.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI do PR; o brief diz que o autor não fechou o pronto completo depois da última mudança na web e não cita PQ dele; o CI do head (execução 43953253555) estava em andamento ao fim desta revisão; este parecer não afirma CI verde. Executado aqui no head 744e5a36: os testes novos do comando (`server/tests/acelerato-reprojecao-escala.test.ts`, `server/tests/reprojetar-escala-ac-entrada.test.ts`) e o estático das migrações (`server/tests/migracoes.estatico.test.ts`): 3 arquivos, 30 testes, todos passaram. Ferramentas de varredura de segredos, de dependências, de SAST e de workflows não estão no PATH (lacuna); a busca por segredos foi por padrão de texto no diff (só valores fictícios de teste). Sem mudança de dependência nem de workflow.
