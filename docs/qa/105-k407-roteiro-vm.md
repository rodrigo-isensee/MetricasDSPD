---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k407-roteiro-vm
commit: e8b897f6ba227696f1c7a9f544dbea6f82f3edff
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-k407-roteiro-vm (K-407 e K-409, E7.553)

Pedido só de documento (`docs/devops/105-implantacao-vm.md`, 11 linhas a mais, 7 a menos sobre `acb62951`). Sem especificação de UX, sem plano antecipado. Obrigações: (1) a reversão da 0041 descrita no roteiro funciona; (2) o `bm:ref-sync-sle` está na subida, na posição e com o nome certos, e o resumo diz 9 passos. Conferido contra `server/package.json`, `server/src/plataforma/db/vm-preparar.ts`, `server/migrations/0041_bm_ref_tipo_card_habilitador.ts` e o código dos comandos. Não há PR: a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde.

## Achados
- A1 (bloqueante) docs/devops/105-implantacao-vm.md:258 · Reversão da 0041 manda fechar a vigência do Enabler pelo `bm:ref-sync`, mas esse comando só grava `ref_dominio`; `ref_tipo_card` sai da etapa de referência do `bm:coleta` (API do BusinessMap).
- A2 (bloqueante) docs/devops/105-implantacao-vm.md:258 · Mesmo com o comando certo, o `down` da 0041 falha: a vigência fechada continua com `habilitador` e o `ADD CONSTRAINT CHECK` valida todas as linhas. Só a restauração do backup serve.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:258 · "categoria anterior, a do dicionário da versão a que se volta": o código novo ainda é o que está na VM antes do passo 3 do rollback, então o `businessmap-conferencia.json` lido traz `habilitador`.

## Provas dos achados
- A1: `server/src/entradas/ref-sync-businessmap.ts:5-11,28` chama `sincronizarDominioBm` (arquivo `businessmap-dominio.json`, tabela `ref_dominio`). `ref_tipo_card` só é gravada por `sincronizarReferencia` (`server/src/modulos/businessmap/referencia.ts:169,203-246`), chamada por `etapaReferencia` (`coleta-comando.ts:89-96`) do `bm:coleta`, com `lerReferenciaReal` (lê o BusinessMap) e o `businessmap-conferencia.json` (linha 61: Enabler = `habilitador`). Essa mudança de `categoria` é semântica e exige `motivo` (`referencia.ts:169,239-241`), e na mesma data recusa ("já existe vigência aberta em ...", linha 245). O roteiro não cita nada disso.
- A2: o `up` da 0041 só troca o CHECK; a referência é append-only (`dspd_ref`: INSERT e `UPDATE (vigente_ate)`, ver `referencia.ts:322,330`). Fechar a vigência não apaga a linha com `habilitador`; o `down` (`0041...ts`, `ADD CONSTRAINT ... CHECK (categoria IN (seis valores))`) valida a tabela inteira, histórico incluso, e para com erro. O texto do roteiro ("falha se já existir linha com categoria `habilitador`", "Sem isso o `down` para com erro") descreve a falha, mas o contorno prometido não a evita. Dedução do SQL (ADD CONSTRAINT valida todas as linhas); não rodei contra um PostgreSQL. Efeito real: o operador segue um caminho que não funciona e cai no `down` que recusa, sem dano (nada é alterado), e o caminho recomendado (restaurar o backup, passo 2) continua certo. Severidade média (contorno simples, sem perda de dado).
- Correção sugerida a quem escreveu (devops-engineer): tirar o contorno por vigência; dizer que, com linha `habilitador` na base (aberta ou fechada), a única volta é restaurar o backup anterior à subida (já está no fim do parágrafo), e que o `down 1` da 0041 só serve se nenhuma linha `habilitador` chegou a ser gravada.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| `bm:ref-sync-sle` existe com esse nome | `grep` em `server/package.json:37` (`tsx src/entradas/ref-sync-sle.ts`) e arquivo existe | nome do script | passa |
| É o passo 4, depois do `bm:ref-sync` e antes do `ac:ref-sync` | `PASSOS` em `vm-preparar.ts:15-23` (migrar, calendário, bm:ref-sync, bm:ref-sync-sle, ac:ref-sync, 3 reprojeções, criterios) | ordem | passa |
| Resumo de 9 passos | `PASSOS` tem 9 entradas, a de escala é `opcional` e o arquivo existe; 4 trechos do roteiro dizem 9 | contagem | passa |
| Fica fora do timer | `deploy/systemd/metricas-referencias.service:17-20` lista 4 `ExecStart`, sem o sle | timer | passa |
| Prazos 12,5 / 5,8 / 11,2 / 2,1 | `docs/architecture/fontes/businessmap-sle.json` | valores | passa |
| Papel `dspd_ref`, `PG_REF_URL` | `ref-sync-sle.ts:11,23` | papel | passa |
| Frase "com a 0040 o resumo lista 9 passos, não 8" | coerente com a nota "o passo `bm:ref-sync-sle` entrou depois" | n/a | passa |
| Reversão da 0041 pelo `bm:ref-sync` antes do `down` | leitura do código (A1, A2) | `down` com linha `habilitador` | **falha** |
| Documentação válida | `pnpm run docs:check` | n/a | passa (saída abaixo) |

Menção "8 passos" que sobra só em `docs/reviews/105-roteiro-vm-s1.md` e `105-s1-escala-p.md`, registros históricos de review: não é defeito.

## Execução
- `pnpm run docs:check` no head e8b897f6: `docs:check: ok (1762 páginas Markdown, 70 métricas, 2 eventos).`
- `forge-check docs`: não rodei (o brief pede só o parecer e o `docs:check`).
- Vermelho antes do verde e mutação: n/a, pedido só de documento sem teste novo.
- Review (ordem entre o código antigo e o `down` no rollback): fora do meu domínio; registro só A3, que toca o mesmo parágrafo.
- Reprovado por A1 e A2 (defeito provado no texto de um procedimento de rollback). Os itens do passo 4 (K-409) estão certos e não precisam de nova rodada.
