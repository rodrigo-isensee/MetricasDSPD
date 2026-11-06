# 073 E9 (K-234): controle de reconhecimento (CA-8) no coletor do BusinessMap

Desenho curto (E9.1, software-architect), feito só lendo o checkout da develop `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD 8a789d43). Molde: `docs/analises/073-e3-desenho.md` §1 e §3 (Acelerato). Nada aqui está implementado. As decisões de negócio estão no §6.

## 1. O que o coletor do BusinessMap controla hoje na partida
- `server/src/modulos/businessmap/coleta-comando.ts:99`: a lista de quadros não pode estar vazia. `:103` (`comTravaDaFonte`, sem a trava `trava`, `:127`): uma coleta por vez.
- `server/src/modulos/businessmap/coleta.ts:261`: recusa esquema que tenha seed (`esquema-com-seed`). `:263`: fecha como falha a execução que foi interrompida. `:286`: o incremental sem marca d'água é recusado (`sem-marca`).
- `coleta.ts:291-294`: monta `parametros` com `host_sha256` e `quadros_sha256`, que são **gravados, mas nunca comparados** com a coleta anterior. `:295` `dominiosDaColeta` (`:45-50`) lê o `ref_dominio` vigente. `:296-299` abre a linha de `ctl_coleta`. Não existe `parametrosDiferentes`, `parametros-mudaram` nem `--reconhecer-mudanca` (o union de `ErroColetaBm`, `:53`, e as opções de `analisarArgumentos`, `coleta-comando.ts:29-51`, confirmam).
- O controle que existe é outro: a etapa da referência (`referencia.ts:306-314`) recusa uma mudança de significado em `ref_coluna`, `ref_workflow` ou `ref_tipo_card` que chegue sem `--motivo`. Ela não cobre `ref_dominio`.
- Não há coleta agendada do BusinessMap (H-20 = C, `coleta.ts:17`, `entradas/coleta-businessmap.ts:11-12`): ela é sempre um comando manual.

## 2. Listas de `dspd_bm.ref_dominio`: coleta ou projeção
- **Coleta:** `campo_customizado` (`field_id` -> coluna) e as 10 listas de `COLUNAS_LISTA` (`allow-list.ts:64-67`: classe_servico, sistema, area_solicitante, fornecedor, objetivo_estrategico, tamanho_declarado, responsabilidade_atraso, origem_demanda, fase_deteccao, severidade), lidas em `coleta.ts:45-50` e reduzidas em `dominio-businessmap.ts:164-196`. Elas decidem qual campo sai da fonte e com qual código (ADR 0020, 4d), ou seja, mexem no que entra no staging.
- **Projeção:** `projetor.ts:64` lê só `campo_customizado` (qual coluna recebe o valor). **Painel/API:** `sistema` (`referencia/repositorio.ts:25`), `objetivo_estrategico` e `area_interna` (`metricas/servico.ts:148`, `metricas/repositorio.ts:134`). `area_interna` não está em `COLUNAS_LISTA` e o `bm:ref-sync` não a escreve. Não achei quem escreve essa lista.
- Quem escreve: `bm:ref-sync` (`entradas/ref-sync-businessmap.ts`, `dominio-businessmap.ts:121-151`). Ele registra a versão de critério `069:ref-bm-campos:<sha do arquivo>`, mas a coleta não fica sabendo da mudança.
- Situação hoje: o arquivo `businessmap-dominio.json` está com `campos: []` e `TIPOS_SELECAO_UNICA` está vazia (`dominio-businessmap.ts:26`). O mapa fica vazio e nenhum campo customizado é coletado. A lacuna existe, mas só tem efeito depois que o PR do P-L2-1 preencher o arquivo.

## 3. Proposta (mesmo molde do E3, sem mecanismo novo)
- **O que entra no hash:** uma chave nova, `dominio_sha256`, nos `parametros` do `dspd_bm.ctl_coleta`. A forma canônica é uma linha `campo|codigo|rotulo` por item vigente das mesmas linhas que `dominiosDaColeta` lê (`campo_customizado` + `COLUNAS_LISTA`), em ordem de `campo` e `codigo`. A `ordem` fica fora, e lista vazia tem hash estável. O hash é das linhas brutas, não do mapa já filtrado, para que uma linha inválida inserida no banco também mude o hash.
- **Quando é calculado:** na partida, com o mesmo retrato que vai para `x.dominios`. `dominiosDaColeta` passa a devolver as linhas e o mapa, e a montagem de `parametros` (`:291`) desce para depois da leitura (`:295`). O hash fica pronto antes do `INSERT` (`:296`) e antes de qualquer GET.
- **Onde fica o reconhecimento:** em `dspd_bm.ctl_coleta.parametros` (jsonb, `migrations/0002_bm_controle.ts:18`) da última linha com `status = 'sucesso'` (a mesma consulta da `marcaDagua`, `:188-192`). Não precisa de coluna nova.
- **Como a coleta recusa:** um código novo, `parametros-mudaram`, no union que já existe em `ErroColetaBm`. A recusa acontece depois de abrir a linha, que é fechada como `falha` com `erroResumo` `parametros-mudaram: dominio_sha256` (só o nome da chave, nunca o valor). A marca d'água não anda, porque ela só avança em sucesso (`:349`). Nenhum GET é feito. O comando sai com código 1 (`entradas/coleta-businessmap.ts:57`).
- **Como libera:** com a opção `--reconhecer-mudanca` em `analisarArgumentos`, rodada por uma pessoa. A linha de sucesso grava o hash novo, que passa a ser a base da próxima comparação.
- **Código compartilhado sem misturar dado:** a função de hash canônico pode ficar em `modulos/referencia/` (que as duas fontes já usam: `planejarDominio`). O `businessmap` nunca importa do `acelerato`, e cada fonte compara só o próprio `ctl_coleta`.
- **Fora do E9:** comparar `host_sha256` e `quadros_sha256`, que hoje são gravados sem uso. Seria uma linha a mais, mas é uma escolha separada (§6, P4).

## 4. Impacto
- **Migração:** nenhuma.
- **Primeira coleta depois do deploy:** a linha de sucesso anterior não tem a chave, então o primeiro `bm:coleta incremental` é recusado até alguém rodar `--reconhecer-mudanca` uma vez. Esse passo entra no roteiro da release combinada (decisão "A" do dono), ao lado do reconhecimento do E3/L9-c no Acelerato. São dois comandos, um por fonte. Na carga inicial sem nenhum sucesso anterior, nada é comparado.
- **Coleta agendada:** não existe no BusinessMap (H-20). A recusa aparece no comando e em `ctl_coleta` (painel de operação), não no e-mail de falha.
- **Testes (node-backend + QA):** unitários do hash: a ordem de chegada não muda o hash; incluir ou tirar código e trocar rótulo mudam; `ordem` não muda; lista vazia é estável. Unitários de `analisarArgumentos` com a opção nova. Coletor com duplo: mudar `campo_customizado` ou um valor de lista recusa sem GET, com a linha `falha` e sem marca. Com a opção, a coleta passa e grava o hash. Teste pg: `bm:ref-sync` fecha uma vigência e abre outra sem apagar, a coleta seguinte é recusada e, depois de reconhecida, segue. Atualizar o plano de QA da F3 (`docs/qa/052-f3-coleta.md`).
- **Documentação:** `docs/architecture/data-model.md` §6 (chaves de `parametros` do `dspd_bm`), ADR 0020 4d (por edição revisada, não nesta entrega) e o roteiro do `bm:ref-sync` (o passo de reconhecer).
- **Segurança:** a mudança toca o controle de coleta e a fronteira que decide qual campo sai da fonte, então precisa de parecer do security-engineer (`gatilhos_seguranca`: controle de coleta, banco).

## 5. Riscos
- **Carga incremental e histórico:** reconhecer não reescreve nada. `ref_dominio` só fecha vigência e acrescenta linhas, e o staging só acrescenta versões (dedupe por hash). Um campo que entra no mapa só aparece nos cards relidos depois (`last_modified_from`). Os cards antigos ficam sem o valor até serem modificados, e o que fazer com eles depende do P2. Um campo que sai do mapa deixa as versões já gravadas como estão.
- **Recusa vira rotina:** se o `bm:ref-sync` for sempre seguido do reconhecimento por reflexo, o controle perde o sentido. A opção continua manual e não deve virar padrão de script.
- **Reconhecimento sem versão de critério:** a opção também libera uma edição feita direto no banco, sem `ref_versao_criterio`. É o mesmo R1 do review 056 (`docs/reviews/056-coletor-f1-f2.md:109`) e fica fora, como no E3.
- **Mistura de fontes:** a chave fica só no `dspd_bm.ctl_coleta`, e o hash não lê nada do `dspd_ac`. O inverso também vale.
- **Momento:** com o arquivo vazio, o controle hoje só protege contra uma edição manual no banco. O ganho real vem junto com o PR do P-L2-1.

## 6. Perguntas ao dono (regra de negócio; não se decidem no desenho)
- **P1:** a mudança de uma lista que só o painel lê (`area_interna`, e `sistema` e `objetivo_estrategico` como filtro) deve parar a coleta do BusinessMap até alguém reconhecer, ou basta a versão de critério? No Acelerato, o dono decidiu que lista de projeção não para (P-E3-1 "A"). Estender isso ao BusinessMap seria inferência.
- **P2:** quando um campo customizado entra no mapa, os cards antigos devem receber o valor (releitura completa dos 12 meses junto com o reconhecimento, só GET, staging só acrescenta) ou só os cards modificados depois? No Acelerato, o dono escolheu a releitura (P-E3-2 "A"), mas lá a regra era sobre o recorte.
- **P3:** o E9 entra agora, na release combinada, ou junto com o PR do P-L2-1 que preenche o arquivo, quando o controle passa a ter efeito?
- **P4:** a coleta também deve ser recusada quando mudam o host ou a lista de quadros (`host_sha256` e `quadros_sha256` já são gravados)? Mudar os quadros muda o universo medido.
