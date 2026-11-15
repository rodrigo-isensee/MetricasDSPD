---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/099-d2-motivos-sust
commit: 03ad3399be37e984bcd5f6abab0663485907f06a
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: D2, S5, S6 e S7 com dado real dos fluxos do PROC (E6.3)

## O que foi conferido
- Diff `origin/feature/099-d1b-dominios...03ad3399` (PR 452 ainda fora da develop): 3 commits (`aebccf9b`, `c0f5d0d7`, `03ad3399`), 40 arquivos. Código e teste em `packages/`, `server/` e `web/`: 801 linhas, acima da orientação de 150 (M14). O tamanho vem de um comportamento só (S5, S6 e S7 reais, com o mesmo recorte de fluxo e o mesmo de-para) repetido nas três métricas, no contrato, na API e na tela. O corpo do PR leva `teto: excedido, 801 linhas, S5 a S7 mudam juntos pelo mesmo recorte e contrato sem convivência (P3 = A)`.
- **Decisões do dono.** P1 = B: `fluxo_proc` traz os cinco fluxos, literais; conferi por script que os cinco estão em `descricao_workflow` do mesmo arquivo (grafia idêntica, sem nenhum de fora). P2 = A: `motivos.ts` compara só sem caixa, sem vírgula e sem espaço extra; "Solução Definitiva Validada", "Encerrado com Contorno e Plano de Ação" e "Não é Problema" (nas duas grafias) caem em `Outro`, como o teste `d2-motivos.test.ts` prova. P3 = A: `MOTIVOS_*_PUBLICADOS` acrescenta `Outro` ao domínio; vazio (ou só espaços) é `null` e vai para `naoInformado`, nunca para `Outro`. O contrato muda sem convivência e a mudança incompatível está registrada em `03ad3399`.
- **Escolha 1, `fluxo_proc` no JSON do domínio: aprovo.** É dado de referência versionado, carregado pelo mesmo `ac:ref-sync` dos outros domínios, com `CAMPOS_DOMINIO` fechado e o `motivo` da `versao_criterio` atualizado. `ref_dominio` não tem CHECK sobre `campo` (`0009_ac_projecoes_referencia.ts:29`) e os códigos cabem nas colunas. Sem a lista carregada a API não presume nada: S5, S6 e S7 respondem "sem dado real" com `MOTIVO_FLUXOS_PROC_NAO_CARREGADOS` (`servico.ts:293`), o mesmo padrão do S1 sem alvos. Custa ao dono um `ac:ref-sync` depois do merge; ver Riscos.
- **Escolha 2, nota `excecao-sla-sem-fonte` desacoplada do interruptor: aprovo.** Era a falha que a decisão evitaria: com `AJUSTE_PRIORIDADE_COM_FONTE = true`, a nota do S2 e da tendência sumiria junto, e a exceção de SLA continua sem fonte. Agora `comNotaExcecaoSlaSemFonte` roda em todo resultado real (`servico.ts:346`), e o teste L2 segue provando a nota no S2.
- **Escolha 3, S3 sem a nota "Não igual a vazio": deve ter, por consistência.** O `ajustesManuais` do S3 (`s3.ts:39`) conta o mesmo campo pela mesma regra (só "Sim") que o S7, então a mesma ressalva vale para quem lê o S3. Não bloqueia, porque o número publicado não está errado: só falta o aviso. Achado A2.
- **Interruptor e versões de critério (T2.6).** `AJUSTE_PRIORIDADE_COM_FONTE = true` vem com `VERSAO_CRITERIO_AJUSTE_PRIORIDADE_DADO_REAL` (afeta S3 e S7), como o comentário do pedido 069 exigia, e `VERSAO_CRITERIO_MOTIVOS_PROC_DADO_REAL` (afeta S5, S6 e S7), as duas em `VERSOES_DA_BIBLIOTECA`. A reversão do interruptor está testada (L1b, com o módulo de contratos simulado). A paridade do `acelerato-l9c` pg agora afirma que só o S3 muda com a coluna de ajuste; o resto fica igual.
- **Regras invioláveis.** Biblioteca compartilhada: o de-para e o recorte de fluxo estão em `packages/metricas` (`motivos.ts`); o servidor só lê a lista e acrescenta notas, sem recalcular. Abaixo de 20 não publica: os percentuais passam por `pctOuNulo` e a taxa de contorno por `taxa` (teste "abaixo de 20 não publica percentual"). Sem pessoa: `fluxo` e `fluxo_proc` são nomes de workflow de domínio fechado; nenhuma coluna de pessoa entra na consulta nova (`repositorio.ts:146`). Acelerato sem BusinessMap: `lerFluxosProc` lê `S.ac.ref_dominio`, e o teste da sustentação segue com zero leituras do BusinessMap (`leituras(d.chamadas, NA_REAL)`).
- **Guardas do diff e mutantes rodados.** (1) `separarPorFluxoProc` sem lista (`motivos.ts:51`) trocado por `if (false)`: o teste "sem a lista na base (mock)" falha (morto). (2) A guarda de `servico.ts:293` sem `fluxos_proc === undefined`: o teste de sustentação de `painel-real-f6.test.ts` falha (morto, 1 de 46). Fontes restauradas, árvore limpa.
- Teste novo: `vitest run src/acelerato/d2-motivos.test.ts` em `packages/metricas`: 6 passaram. Suíte: CI verde em `03ad3399`, run `43728259776` (citado, não rerrodado).
- **A linha nova na tela pede revisão de UX.** Entram texto novo visível (`NotaForaDoFluxo` no S5, no S6 e no S7), a faixa "Outro" no gráfico de motivos, duas notas de cartão e o texto de "Como se calcula" reescrito. É interface, então passa pelo `ux-designer` (passo 5 do fluxo); a redação de A1 é com ele.
- Commits: Conventional Commits em português, escopo e pedido no assunto, um por etapa (código, conserto do CI, docs de contratos).

## Achados
- A1 (recomendado) web/src/features/sustentacao/components/comuns.tsx:25 · diz "de outros fluxos", mas `foraDoFluxo` conta também sem fluxo e fluxo múltiplo (`motivos.ts:53`); antes da reprojeção todos são "sem fluxo". Ao UX: "fora dos cinco fluxos do PROC (outro fluxo, sem fluxo ou mais de um)".
- A2 (recomendado) packages/contratos/src/schemas.ts:676 · o S3 publica `ajustesManuais` do mesmo campo e com a mesma regra do S7, sem a ressalva `s7-nao-igual-vazio`. Por consistência, a nota deve ir para o S3 também: aceitar `notaMotivosIdSchema` nas notas do S3 (ou uma nota neutra do ajuste comum aos dois) e aplicá-la em `servico.ts` junto da do S7.
- A3 (recomendado) server/src/modulos/metricas/parte-sem-dado.ts:43 · a volta para `comNotaExcecaoSlaSemFonte` em `semParteDeAjusteDePrioridade` não tem mais chamador (a lista é só `['S3']`), e `comNotaMotivos` (linha 55) repete `comNotaSust`. Trocar por `return resultado` e juntar as duas num auxiliar genérico.
- A4 (recomendado) web/src/features/sustentacao/notas.ts:48 · "o último, ainda que pequeno, merece leitura própria" falava do quinto motivo da lista fechada. Com `Outro` no domínio publicado e a ordem por volume, "o último" deixou de apontar um motivo definido. Nomear o motivo ou tirar a frase (com o UX).

## Riscos e pendências fora do review
- Depois do merge, o dono roda o `ac:ref-sync` (para carregar `fluxo_proc`) e a reprojeção que preenche `dim_chamado.fluxo` (migração 0038, coluna nascida nula). Com a lista carregada e a coluna ainda nula, S5, S6 e S7 publicam `n = 0` e todos os chamados em `foraDoFluxo`: o resultado fica insuficiente, sem dado errado. O CHANGELOG e o PR devem dizer a ordem.
- O D2 está empilhado no D1b (PR 452): entra na develop só depois dele.
- Parecer do QA (E6.4) corre em paralelo e não é alterado aqui.

## Veredito
Aprovado no head `03ad3399`. As três decisões do dono estão no código como foram ditas, o recorte de fluxo para sem dado quando a lista falta, e as regras invioláveis se mantêm. As duas primeiras escolhas do autor estão certas; a terceira deixa uma ressalva de fora (A2, recomendado). A tela pede revisão de UX.
