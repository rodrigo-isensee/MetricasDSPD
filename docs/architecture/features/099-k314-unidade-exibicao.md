---
tipo: plano-tecnico
contrato: 1
pedido: 099
estado: proposta
ux: docs/ux/099-k297-k314.md
adrs: [0011, 0016, 0020, 0026, 0027, 0030]
agentes: [node-backend, react-frontend, qa-engineer, tech-lead, security-engineer, ux-designer]
gatilhos_seguranca: [banco]
---

# 099 · K-314: unidade de exibição de cada prazo do S1 (min, h ou dia)

Etapa E3.177 (software-architect), pedido 099. Base lida: worktree `/home/rodrigoisensee/MetricasDSPD-056` (branch `docs/099-k314-unidade-exibicao`, igual à `develop` 699af53e). Público: node-backend, react-frontend, qa-engineer, tech-lead, security-engineer, ux-designer.

**Conferência com a constituição:** o projeto não tem `docs/constituicao.md`. Conferido contra as regras invioláveis do `CLAUDE.md`: **conforme**. O cálculo não muda (continua em horas pela biblioteca T2.5); a conversão para min ou dia é só de tela. Histórico não é sobrescrito (coluna nova nula nas linhas antigas; mudança = nova vigência). Sem dado de pessoa. BusinessMap não é tocado.

**Especificação de UX:** `docs/ux/099-k297-k314.md` (PR 399, ainda fora da `develop` quando este plano foi escrito). Este plano usa o essencial repassado pelo Jarvis: cada prazo do S1 na unidade e no relógio do PROC (Q-099-11 = A); alvo, mediana, P85, P95 e média na unidade do alvo da linha; minutos só no primeiro atendimento de P1 (15 min) e P2 (30 min); o campo de unidade de exibição por célula é ponto do arquiteto (sugestão do UX: `exibirEm`). **Antes do código, o react-frontend confere este plano contra o documento mesclado**; divergência volta ao arquiteto e ao UX, não se resolve no código.

## 1. O problema, com o código de hoje
- A célula do alvo já tem o **relógio** (`unidade_pa`, `unidade_r` = `corrido` ou `util`, migração 0036, D3) e a **quantidade em horas** (`prazo_pa_horas`, `prazo_r_horas`). Não tem a **unidade em que o PROC escreve o prazo** (minutos, horas ou dias).
- A web escolhe a unidade pela prioridade (regra J2, `web/src/features/sustentacao/formatar.ts:13-19`: P1 a P3 em "h úteis", P4 e P5 em dias úteis). Resultado errado contra a Q-099-11: P1 primeiro atendimento sai "0,25 h úteis" (é 15 min, corrido), P3 restauração sai "17,6 h úteis" (é 2 dias úteis), P4 primeiro atendimento sai "0,45 dia útil" (é 4 h úteis).
- A informação certa existe só no arquivo versionado: `texto_proc` de cada célula em `docs/architecture/fontes/acelerato-alvos.json` ("Até 15 minutos", "Até 2 dias úteis"…). Ela não chega à base nem ao contrato.

## 2. Alternativas
| | Desenho | Avaliação |
|---|---|---|
| (a) | O carregador (`ac:ref-sync`) **deriva** a unidade de exibição do `texto_proc` por regra fechada, grava em coluna nova de `ref_alvo_prioridade`, a biblioteca repassa e o contrato do S1 leva `exibirEm` | **Escolhida.** Uma fonte só (o texto do PROC, já versionado); o arquivo não muda (mesmo sha, nenhuma versão de critério nova); a unidade fica na mesma linha e vigência do prazo que qualifica, como o relógio no D3. |
| (b) | Campo explícito `exibir_em` em cada célula do arquivo, ao lado do `texto_proc` | Descartada. Duas fontes na mesma linha que podem divergir ("Até 2 dias úteis" com `exibir_em: "h"`); para pegar a divergência seria preciso o mesmo analisador de (a). Muda o arquivo (versão 3) sem ganho. |
| (c) | A web (ou a API) escolhe a unidade pelo valor em horas (abaixo de 1 h em min, múltiplo do dia útil em dia…) | Descartada. É inferência: 8,8 h pode ser "1 dia útil" (P5, PROC) ou "8,8 h"; e 4 h de P4 seria "0,45 dia" pela regra de hoje. Contra a Q-099-11 e contra "dúvida de regra não se resolve por inferência". |
| (d) | Mandar o `texto_proc` no contrato e a web analisar | Descartada. Texto livre no contrato e regra de negócio na web; a API ganharia leitura de uma coluna de texto para nada. |
| (e) | Sem coluna: a API lê o arquivo em tempo de execução | Descartada pelo mesmo motivo da alternativa (c) do D3 (`docs/analises/099-d3-unidade-prazo.md`): duas fontes para um dado que a base já versiona por vigência. |

## 3. Desenho

### 3.1 Onde nasce: regra fechada sobre o `texto_proc`, no carregador
No esquema do arquivo (`server/src/modulos/referencia/alvos-acelerato.ts`, `esquemaAlvos`), uma função pura `unidadeDeExibicao(texto_proc, horas, horas_por_dia_util)`:
1. Normaliza: NFC, `trim`, espaços repetidos viram um, minúsculas.
2. Casa com **uma** expressão fechada: `^até (\d+) (minuto|minutos|hora|horas|dia|dias)( útil| úteis)?$`. Qualquer outro texto: o arquivo inteiro é recusado (`ErroAlvos('arquivo')`, antes de gravar, como hoje).
3. Mapeia `minuto(s)` → `min`, `hora(s)` → `h`, `dia(s)` → `dia`.
4. **Confere a quantidade** contra `horas` (guarda, não conversão: o carregador continua sem converter): `min` → `n / 60`, `h` → `n`, `dia` → `n × horas_por_dia_util`, comparados com duas casas (`Math.round(x * 100) / 100 === horas`). Diferente: recusa o arquivo, dizendo a célula. Com o arquivo de hoje, os 10 prazos passam (15/60 = 0,25; 30/60 = 0,5; 2 × 8,8 = 17,6; 5 × 8,8 = 44; 1 × 8,8 = 8,8; 10 × 8,8 = 88).
5. **Recusa `dia` com relógio `corrido`** (dia corrido não está definido no PROC nem na Q-099-11; não se infere 24 h). Nenhum prazo de hoje cai aqui.
6. A palavra "útil/úteis" **não** é conferida contra o relógio (`unidade`): se a Q-099-11 reabrir (Acelerato medindo P1 e P2 em tempo útil), o caminho já decidido é trocar só a `unidade` no arquivo, sem mexer no texto do PROC; amarrar as duas coisas bloquearia esse caminho.

Resultado com o arquivo de hoje (o mesmo do UX):

| | Primeiro atendimento | Restauração |
|---|---|---|
| P1 | `min` (corrido) | `h` (corrido) |
| P2 | `min` (corrido) | `h` (útil) |
| P3 | `h` (útil) | `dia` (útil) |
| P4 | `h` (útil) | `dia` (útil) |
| P5 | `dia` (útil) | `dia` (útil) |

### 3.2 Base: migração `0037_ac_alvo_prioridade_exibicao.ts`
```sql
ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN exibir_pa text NULL CHECK (exibir_pa IN ('min','h','dia'));
ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN exibir_r  text NULL CHECK (exibir_r  IN ('min','h','dia'));
ALTER TABLE dspd_ac.ref_alvo_prioridade ADD CONSTRAINT ck_ref_alvo_exibir_par CHECK ((exibir_pa IS NULL) = (exibir_r IS NULL));
ALTER TABLE dspd_ac.ref_alvo_prioridade ADD CONSTRAINT ck_ref_alvo_exibir_relogio
  CHECK (NOT (unidade_pa = 'corrido' AND exibir_pa = 'dia') AND NOT (unidade_r = 'corrido' AND exibir_r = 'dia'));
```
- **Sem DEFAULT e sem preencher as linhas que existem.** Elas ficam nulas: preencher seria inferir a unidade a partir das horas (alternativa c) ou reescrever vigência gravada. Nulo quer dizer "vigência anterior ao K-314, sem unidade de exibição registrada".
- **Linha nova sempre diz a unidade:** garantido pelo carregador (o tipo de `LinhaAlvoNova` exige o campo) e por teste; o par de CHECKs impede metade preenchida e "dia corrido".
- `down`: tira as duas restrições e as duas colunas. Não recusa: a unidade de exibição não é dado de cálculo e se reconstrói do `texto_proc` no histórico do arquivo; as colunas que ficam continuam dizendo a verdade (diferente da 0036, cujo `down` faria `*_horas_uteis` mentir).
- Grants: sem mudança. `dspd_ref` tem `SELECT, INSERT` na tabela inteira e só `UPDATE (vigente_ate)`; `dspd_api` tem `SELECT` na tabela inteira (`server/src/plataforma/db/grants.ts:107-117`). Colunas sem dado de pessoa.
- **Número da migração:** 0037 é o próximo na `develop` (0036 é a última). O tech-lead confere, antes do merge, se outra branch aberta tomou o 0037; se tomou, renumera a desta.

### 3.3 Carregador (evolui o existente, sem entrada nova)
`server/src/modulos/referencia/alvos-acelerato.ts`:
- `VigenteAlvo` e `LinhaAlvoNova` ganham `exibirPa` e `exibirR` (`'min' | 'h' | 'dia'`; na vigente lida, também `null`).
- `planejarAlvos` compara também a unidade de exibição. Vigente com exibição nula ou diferente = diferente: fecha a vigente (`UPDATE (vigente_ate)`) e insere a nova (`INSERT`), como hoje. **Nunca UPDATE da coluna nova** (o `dspd_ref` nem tem o privilégio).
- O plano passa a separar `mudouCriterio` (horas ou relógio) de `mudouExibicao` (só a unidade de exibição). **Versão de critério (T2.6) só com `mudouCriterio`.** Motivo: a regra inviolável manda registrar mudança de *critério de cálculo*; a unidade de exibição não muda nenhum número calculado (status, razões e percentis em horas ficam iguais). Uma marca no gráfico sem mudança de número induziria a leitura de quebra que não houve. A guarda de data da versão (`hoje < ultimaVersao`) também só vale com `mudouCriterio`; a guarda de vigência (`hoje <= ultima` por prioridade) vale sempre (não há período sobreposto em nenhum dos dois casos). A guarda do expediente (`conferirExpediente`) roda em qualquer mudança: a conferência da quantidade em dias depende de `horas_por_dia_util`.
- Efeito esperado no primeiro `ac:ref-sync` depois da migração, em cada ambiente com alvos gravados: 5 vigências fechadas, 5 abertas com as mesmas horas e relógios e a unidade de exibição preenchida; `versaoRegistrada: false`. A saída continua só com contagens e hash.
- Operação: se o `ac:ref-sync` já gravou alvos **no mesmo dia**, a guarda `hoje <= ultima` recusa ("use uma data posterior"); roda-se no dia seguinte. Não é falha do desenho; o QA cobre a mensagem.

### 3.4 Leitura e biblioteca (o cálculo não muda; T2.5)
- `server/src/modulos/metricas/repositorio.ts`: `LinhaAlvo` e `lerAlvos` leem `exibir_pa` e `exibir_r`.
- `server/src/modulos/metricas/mapa.ts` (`montarBaseAC`): `exibirDe(valor)` aceita `null`, `'min'`, `'h'`, `'dia'` e lança com outro valor (molde de `unidadeDe`).
- `packages/metricas/src/acelerato/modelo.ts`: `type UnidadeExibicao = 'min' | 'h' | 'dia'`; `AlvoPrioridade` ganha `exibir_primeiro_atendimento` e `exibir_restauracao` (`UnidadeExibicao | null`, obrigatórios no tipo). `ALVOS_PADRAO` recebe os valores da tabela do §3.1.
- `packages/metricas/src/acelerato/s1.ts`: `classe(...)` recebe a unidade de exibição e a **repassa** como `exibirEm`, sem usar em nenhuma conta. `alvoHoras`, `estatistica`, `razaoMediana`, `razaoP85` e `statusMeta` continuam em horas, idênticos.
- Seed do modo homologação (`server/src/plataforma/db/seed.ts`, `refAlvo`): grava `exibir_pa` e `exibir_r` a partir de `ALVOS_PADRAO`.
- **Teste de paridade (novo, servidor):** `ALVOS_PADRAO` (unidades de exibição e relógios) igual ao que `unidadeDeExibicao` deriva de `acelerato-alvos.json`. Mesmo molde do teste de paridade do calendário: o mock nunca diverge do arquivo do PROC.

### 3.5 Contrato do S1 (aditivo)
`packages/contratos/src/schemas.ts`, `classeS1` (linha 618):
```ts
/** Unidade em que o PROC escreve o prazo (K-314, Q-099-11): só exibição; alvo e estatística continuam em horas. null = vigência anterior ao K-314. */
exibirEm: z.enum(['min', 'h', 'dia']).nullable(),
```
- Campo sempre enviado, aceita `null`. Mudança aditiva no gate de contrato (mesmo caminho do `horasPorDiaUtil`, `docs/contratos/politica-de-mudanca.md` §2). Regenerar `docs/api/openapi.json`, `docs/contratos/snapshots/resultados/S1.json` e a página `docs/contratos/metricas/S1.md` (campo, exemplo e uma linha de explicação); linha no `CHANGELOG.md`.
- O comentário da linha 635 ("Tempos em horas úteis … para todas as prioridades") está desatualizado desde o D3 (há horas corridas): corrigir para "Tempos em horas, no relógio de `unidade` de cada célula".

### 3.6 Web (conversão só de tela)
`web/src/features/sustentacao/formatar.ts` e `components/CartaoS1.tsx`:
- Função nova, pura, por célula: `fmtPrazo(h, exibirEm, unidade, horasPorDiaUtil)`. `min` → `h × 60`; `h` → `h`; `dia` → `h / horasPorDiaUtil` (do resultado, nunca constante). O rótulo do relógio vem de `unidade` (`util` → "úteis"/"útil"; `corrido` → sem qualificador). Texto, casas decimais, singular e plural: os da especificação de UX.
- **Todos** os números da célula usam a unidade da célula: alvo, mediana, P85, P95, média (tabela de detalhe, linhas 101-109), o rótulo da barra (linha 58) e a frase de leitura (linha 142, que hoje usa a restauração da primeira prioridade com dado).
- `exibirEm` nulo: a web mostra em horas com o rótulo do relógio (`fmtPrazo(h, 'h', unidade, …)`), nunca a regra J2 por prioridade. O texto exato do caso nulo é do UX (ponto 7.2).
- `fmtTempoPrioridade` (regra J2 por prioridade) sai depois de trocar os 4 usos no `CartaoS1`; `fmtHU` fica (S9 e S10 usam). A Visão geral não formata tempos do S1 (nenhum uso de `fmtTempoPrioridade` fora do `CartaoS1`), então não muda.
- Nenhuma conta de tempo, percentil ou comparação com o alvo na web: a barra continua em "% do alvo" pelas razões que vêm prontas.

## 4. Segurança
**Gatilho: banco** (migração em tabela lida pela API e escrita em `ref_` pelo `dspd_ref`). Sem GRANT novo, sem dado de pessoa (as colunas são enumerações fechadas; o `texto_proc` continua fora da base), sem dependência nova, sem script novo no `package.json`, sem mudança na allow-list do coletor (ADR 0020). A expressão do §3.1 é ancorada e sem repetição aninhada (sem risco de backtracking catastrófico) e roda sobre texto já limitado a 80 caracteres por `textoSeguro(80)`. Pede o parecer do `security-engineer` no lote do back-end; para os `.pg`, vale o que o pedido já decidiu (CI do PR como prova de banco; nada de Postgres local fora do comando autorizado).

## 5. ADRs
- **ADR nova: não.** A decisão de fundo é do dono (Q-099-11: cada prazo na unidade do PROC); este plano só diz onde o dado mora, com o mesmo padrão do D3 (coluna na mesma vigência, carregador existente). Alternativas, consequências e critério de reversão estão aqui.
- **ADR 0027: sem revisão.** Ela trata do calendário por domínio; a unidade de exibição não muda calendário nem relógio, e o dia útil usado na conversão já chega pelo `horasPorDiaUtil` do resultado (D3b).
- **ADR 0016:** sem mudança; a limitação "a API lê só o alvo vigente" segue registrada. As vigências criadas só para a exibição têm as mesmas horas e relógios: nenhum cálculo muda por elas.
- Afrouxa alguma regra ou controle: **não**. Nenhum texto de `docs/regras/`, item de `tests/config.json` ou controle sai. A versão de critério continua para toda mudança de cálculo; o §3.3 só não cria marca onde nenhum número mudou.

## 6. Por que o existente não basta
- `unidade_pa`/`unidade_r` dizem o relógio (corrido ou útil), não a unidade escrita: P3 restauração e P3 primeiro atendimento têm o mesmo relógio (`util`) e unidades diferentes (dia e h).
- `horas` não determina a unidade sem inferir (8,8 h é "1 dia útil" no P5 e seria "8,8 h" por qualquer regra numérica).
- O `texto_proc` existe só no arquivo; a API lê a base (`lerAlvos`), e a web hoje decide pela prioridade (`formatar.ts:13-19`), o que produz os três erros do §1, visíveis no teste `web/src/features/sustentacao/sustentacao.test.tsx:19-26` (`0,25 h úteis` para P1).
- Nenhum mecanismo novo: coluna em tabela existente, regra no carregador existente (`ac:ref-sync`), campo aditivo no contrato existente.

## 7. Riscos e pontos em aberto
1. **Especificação de UX ainda no PR 399.** O react-frontend começa só com ela na `develop` e confere o §3.6 contra ela.
2. **Texto do caso nulo** (`exibirEm: null`, vigência anterior ao K-314): fica visível na base real entre o deploy e o primeiro `ac:ref-sync`. Proposta técnica: horas com o rótulo do relógio, sem aviso; o UX confirma ou define o texto. Não é decisão do dono (não muda número nem regra).
3. **Mesmo dia do último sync:** ver §3.3 (operação, não defeito).
4. **Minutos em percentis altos:** P95 de P1 primeiro atendimento pode sair em centenas de minutos ("300 min"); a especificação manda a unidade do alvo da linha, e assim fica. Se a leitura ficar ruim, é ajuste de UX, não de contrato.
5. **Número 0037** disputado por outra branch: ver §3.2.
6. **Reabertura da Q-099-11:** trocar o relógio no arquivo continua sem migração; se o PROC passar a escrever um prazo fora da expressão do §3.1 (por exemplo "Até 1 semana" ou "Até 1 dia corrido"), o arquivo é recusado e o caso volta ao arquiteto e ao dono.

## 8. Critério de reversão
Rever este desenho se o PROC passar a escrever prazo que a expressão fechada do §3.1 não cobre, ou com quantidade que não bate com as horas em duas casas; o sinal observável é o `ac:ref-sync` recusar o arquivo de alvos com erro de unidade de exibição. Também rever se a UX pedir unidade que não dependa só da célula (por exemplo, a mesma unidade para a linha inteira de uma prioridade): o sinal é a especificação pedir um valor de `exibirEm` diferente do derivado do `texto_proc`.

## 9. Divisão do trabalho
Ordem: **B1 (node-backend)** → parecer de segurança, review e QA do B1 → **F1 (react-frontend)** sobre a `develop` com o B1 e o PR 399 mesclados. O `qa-engineer` prepara os casos em paralelo ao B1. Um lote por agente; B1 e F1 em branches próprias (`feature/099-k314-*`), PR para a `develop` pelo tech-lead.

### B1 · node-backend (gatilho banco)
Novos: `server/migrations/0037_ac_alvo_prioridade_exibicao.ts`; teste da migração (up, down, CHECK de par e de "dia corrido"); teste de paridade `ALVOS_PADRAO` × arquivo.
Alterados: `server/src/modulos/referencia/alvos-acelerato.ts` (§3.1 e §3.3; testes unitários do analisador com os 10 textos de hoje e recusas: texto fora da expressão, quantidade divergente, `dia` corrido; testes do `planejar`: só exibição muda → fecha e abre sem versão de critério; horas mudam → com versão); `server/src/modulos/metricas/repositorio.ts`; `server/src/modulos/metricas/mapa.ts`; `server/src/plataforma/db/seed.ts`; `packages/metricas/src/acelerato/modelo.ts`, `s1.ts`, `acelerato.test.ts` (o S1 repassa `exibirEm`; números iguais aos de antes); `packages/contratos/src/schemas.ts` (§3.5); `docs/api/openapi.json`, `docs/contratos/snapshots/resultados/S1.json`, `docs/contratos/metricas/S1.md`, `CHANGELOG.md`; testes `server/tests/pg/esquema.snapshot.json`, `server/tests/base-duble.ts`, `server/tests/metricas.mapa.test.ts`, `server/tests/alvos-acelerato*.test.ts`, `server/tests/limpar-seed*.test.ts`, `server/tests/migracoes.estatico.test.ts`; `docs/architecture/data-model.md` (linha da `ref_alvo_prioridade`); `docs/especificacao/domain/support/priority-target.md` (unidade de exibição por célula). Sem mudança: `grants.ts`, `acelerato-alvos.json`, `packages/mock`.

### F1 · react-frontend
`web/src/features/sustentacao/formatar.ts` (`fmtPrazo`; sai `fmtTempoPrioridade`), `components/CartaoS1.tsx` (quatro pontos do §3.6), `sustentacao.test.tsx` e `ramos.test.tsx` (troca das expectativas J2 pelas da especificação: P1 PA "15 min", P2 PA "30 min", P1 R "4 h", P3 R "2 dias úteis", P4 PA "4 h úteis", P5 PA "1 dia útil"; caso `exibirEm` nulo; conversão por `horasPorDiaUtil` do resultado com 8 e 8,8), `web/src/data/mock/MockFonteMetricas.test.ts` se tocar no alvo. Depois: revisão de interface pelo `ux-designer`.

### qa-engineer
Casos: os 10 prazos na unidade do PROC na tabela, na barra e na frase; os números calculados (razões, status, percentis em horas) iguais antes e depois (cálculo intocado); nenhuma versão de critério nova no primeiro sync depois da migração; recusas do arquivo (§3.1); linhas antigas nulas e mostradas em horas; mutantes sugeridos: trocar `min` por `h` no analisador, tirar a conferência da quantidade, registrar versão em `mudouExibicao`, converter dia por 8 fixo na web.

## 10. Decisão do dono
Nenhuma pendente. A regra (unidade do PROC por célula) é a Q-099-11 = A. Dois pontos técnicos que ficam registrados para o Jarvis, sem ir ao dono:
- só exibição não gera versão de critério (§3.3; a regra inviolável fala de critério de cálculo);
- caso nulo mostrado em horas (§7.2; texto final do UX).

## Critério de parada
Não se aplica: o lote não é analisador, hook nem segurança (PAR-P2).
