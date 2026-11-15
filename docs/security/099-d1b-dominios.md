---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1b-dominios
commit: 5ec7d8e8f3d5d473442e009596fc4836b82604ab
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-15
---
# Review de segurança: D1b, domínios e vocabulário na fronteira (E3.261)

Propósito: o D1 1b e 1c do 099 no head `5ec7d8e8`, medido contra `origin/feature/099-d1a-fluxo-chamado` (empilhado no D1a). Gatilho: fronteira da allow-list (ADR 0020). Lidos: o diff (4 arquivos: `docs/architecture/fontes/acelerato-dominio.json`, `server/src/modulos/referencia/dominio-acelerato.ts`, `server/tests/dominio-acelerato.test.ts`, `CHANGELOG.md`), mais `server/src/modulos/acelerato/allow-list.ts:236-256`, `referencia.ts:58-75` e `listas-fechadas.ts:40-55`. Rodados, sem banco, da pasta `server/`: `vitest run tests/dominio-acelerato.test.ts --maxWorkers=2` (35 testes, todos passaram) e, para tirar dúvida sobre o casamento exato e a versão de critério, `tests/dominio-acelerato-real.test.ts tests/acelerato-campos-etapa.test.ts` (61 testes, todos passaram). Suíte inteira: CI run 43669474477, `success`, `headSha` 5ec7d8e8. Nenhum `.env*` aberto, nada contra base real.

## Gatilhos
- Fronteira da allow-list: `server/src/modulos/referencia/dominio-acelerato.ts:18-19` (6 campos `cpe_*` novos no conjunto fechado `CAMPOS_DOMINIO`) e os valores novos em `acelerato-dominio.json` (5 domínios `cpe_*` e `etapa_fluxo`).

## Resultado por ponto

**1. Nenhum valor é dado de pessoa, cliente ou texto livre: conforme.** Os 22 valores `cpe_*` são opções de lista da ferramenta (motivos de escalação, encerramento e pendência, avaliação de problema, Sim/Não), com `codigo` igual a `rotulo`. As 114 entradas de `etapa_fluxo` têm `codigo` numérico (`kanbanStatusKey`) e `rotulo` entre 60 nomes distintos de etapa de workflow (Backlog, Em triagem, Encerramento...), sem nome de pessoa nem de cliente. Conferi por script: todos em NFC, sem espaço nas pontas, sem espaço duplo, sem espaço não ASCII; o esquema do arquivo já barra controle, formato e `@` (`dominio-acelerato.ts:44`, `textoSeguro`). Maior valor `cpe_*`: 38 caracteres (coluna `varchar(80)`); maior rótulo de etapa: 46 (coluna `varchar(120)`).

**2. O domínio continua só com valor exato: conforme.** O casamento do campo de etapa é `dominio?.has(v)` sobre um `Set` (`allow-list.ts:253`), sem normalização de caixa ou acento; o que não casa sai nulo com a contagem `fora_dominio_<chave>`, sem o valor (`allow-list.ts:254`). O teste novo prende cada grafia como entrada própria (as duas grafias de "Solução definitiva validada" e de "Não é problema"), sem de-para. `cpe_tipo_prioridade` fica fora do arquivo e a lista vazia é recusada pelo esquema (`min(1)`, `dominio-acelerato.ts:65`), então o campo segue nulo com contagem.

**3. Nada novo cruza a fronteira: conforme.** Os nomes dos campos lidos continuam constante do código (`listas-fechadas.ts:40-49`) e o `campo` consultado em `ref_dominio` vem dela, parametrizado (`referencia.ts:60-63`). O diff só põe valores permitidos no domínio de campos que já eram lidos: o que passa a chegar ao staging é um destes valores literais, e só eles. Nenhum campo novo, nenhuma coluna, nenhum GRANT. Os 6 nomes `cpe_*` em `CAMPOS_DOMINIO` são exatamente os de tratamento `lista` (teste em `dominio-acelerato.test.ts:240-243`). A versão de critério nova (T2.6) cita data, motivo e referência.

**4. Segregação e regras invioláveis:** só Acelerato; sem cálculo novo neste corte; sem segredo, dependência ou script novo no diff. A aplicação na base é o `ac:ref-sync` do dono depois do merge.

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH. Sem dependência nova; o diff foi lido à procura de credencial.

## Achados

## Plano em cartões
Nenhum achado, nenhum cartão.

## Riscos aceitos
Nenhum.
