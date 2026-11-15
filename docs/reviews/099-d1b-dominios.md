---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1b-dominios
commit: 5ec7d8e8f3d5d473442e009596fc4836b82604ab
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: D1b, domínios cpe_* e etapa_fluxo do Acelerato (E3.259)

## O que foi conferido
- Diff `origin/feature/099-d1a-fluxo-chamado...5ec7d8e8` (empilhado no D1a, ponta `ea9e313f`): 4 arquivos, 212 linhas a mais e 4 a menos. Código e teste: 2 linhas em `dominio-acelerato.ts` e 57 em `dominio-acelerato.test.ts`, dentro do teto de 150; o resto é o JSON de referência e o CHANGELOG. Um comportamento só.
- **cpe_* contra a B6-d em UTF-8** (`/home/rodrigoisensee/respostas-assistente/resposta-b6d-utf8.md`): conferi valor a valor. Escalação 4, avaliação 2, prioridade ajustada 2 e pendência 4 batem literalmente, acento incluso. Encerramento: os 11 valores de 3308, 3316, 3320 e 3328 dão 10 distintos ("Encerrado com Contorno e Plano de Ação" aparece em 3308 e 3320), e as grafias "Solução Definitiva Validada"/"Solução definitiva validada" e "Não é Problema"/"Não é problema" ficam como entradas separadas, sem de-para, como o recorte do arquiteto (`d1-recorte.txt` item 1b) manda. Nenhum valor traz nome de pessoa nem e-mail; o maior tem 38 caracteres (limite 80 do `textoSeguro`).
- **cpe_tipo_prioridade e cpe_suporte_acionado ausentes:** o recorte manda deixá-los vazios até o dono decidir, e o esquema recusa lista vazia (`dominio-acelerato.ts:65`, `.min(1)`). Ausente é o vazio que o carregador aceita; o normalizador não os projeta (`073-e10-plano.md:142`), então não muda nenhum cálculo. Os valores "Feito!"/"Feito" da B6-d ficaram fora por esse motivo, sem inferência.
- **etapa_fluxo contra a B5-a** (`resposta-b5a.md`): as 114 chaves do arquivo são as 114 da consulta, sem falta nem sobra, e cada rótulo é o nome literal daquela chave (0 divergências, conferido por script). A ordem segue as 9 fases do §4 da revisão de campos (AP-099-1, Decisão 20): Novo Atendimento até Retorno; triagem; diagnóstico; atendimento; solução; esperas; validação; Encerramento < Concluído < Encerrado; Causa Raiz e Revisão no fim. Em triagem (3308) vem antes de Encerrado (3316), então vale o Motivo de Encerramento do encerramento, como a decisão pede.
- **Inferência além da L23:** os 16 rótulos do arquivo que não estão no §4 são exatamente as 16 etapas que a L23 lista: as 4 variantes de caixa ou acento (BackLog, Em Analise, Em validação, Aguardando aprovação) ao lado da equivalente, Nova GMUD no fim da fase 1 e as 11 do fim da fase 5, na ordem da L23. Fora disso, nenhuma escolha de ordem foi feita.
- `CAMPOS_DOMINIO` (`dominio-acelerato.ts:19`): os 6 `cpe_*` de `CAMPOS_ETAPA_F3` com tratamento `lista`; o teste novo amarra os dois conjuntos. `versao_criterio` nova com data, motivo e referência (T2.6). O `ac:ref-sync` e o `--reconhecer-mudanca` ficam com o dono depois do merge, como o CHANGELOG registra.
- Regras invioláveis: BusinessMap e Acelerato não se misturam; nada de pessoa entra; nenhum cálculo novo.
- Guardas: nenhuma linha de guarda mudou; a mudança é dado de referência e uma constante de lista. Mutante manual: tirar `cpe_motivo_pendencia` de `CAMPOS_DOMINIO` faz o arquivo de teste falhar ao carregar o domínio (morto); fonte restaurada, árvore limpa.
- Teste tocado: `vitest run tests/dominio-acelerato.test.ts --maxWorkers=2` em `server/`: 35 passaram. Suíte: CI verde no head, run `43669474477` (citado do brief, não rerrodado).
- Commit `5ec7d8e8`: Conventional Commits em português, escopo e pedido no assunto.

## Achados
- A1 (recomendado) server/tests/dominio-acelerato.test.ts:260 · o título do teste diz "cpe_tipo_prioridade não tem valores (decisão do dono)", mas o dono ainda não decidiu; o recorte diz "vazio até decisão do dono", e o `versao_criterio.motivo` já diz certo. Trocar por "(até decisão do dono)", para o teste não parecer registrar uma decisão que não existe.
- A2 (recomendado) docs/architecture/fontes/acelerato-dominio.json:291 · mesmo nome em workflows diferentes ganha posições distintas (alfabética do workflow), não "a mesma posição" do §4; só pesa no chamado com `fluxo_multiplo` (D1a). Uma linha na `regra` basta.

## Pendências fora do review
- O merge do D1b espera a resposta do dono à L23 (fase das etapas dos fluxos pequenos), como registrado no pedido.
- O recorte do arquiteto marca o D1 com gatilho de segurança (vocabulário de fonte externa, A1 e A2 do modelo do 069): o parecer do security-engineer sobre o D1b é dele, não deste review.

## Veredito
Aprovado no head `5ec7d8e8`. Os valores e as chaves são cópias literais das consultas B6-d e B5-a, a ordem é a da AP-099-1, e a única suposição é a da L23, já com o dono.
