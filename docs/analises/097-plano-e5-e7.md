# 097: plano técnico de E5 (recolher cartão, 10 maiores no AP-PROJETO) e E7 (filtro Setor)

- **Propósito:** plano técnico da E1.7 do pedido 097: de onde vem o setor de cada card, o contrato e a mudança de servidor, como a escolha de recolher é lembrada, os 10 maiores do AP-PROJETO, os lotes (dono, arquivos, dependências, gatilho de segurança) e os riscos.
- **Público:** dono, Jarvis, tech-lead, node-backend, react-frontend, qa-engineer, security-engineer, ux-designer.
- **Base lida:** `develop` f4c122f1 na worktree `/home/rodrigoisensee/MetricasDSPD-052d` (branch `docs/097-ux-recolher-setor`), especificação `docs/ux/097-filtros-time-busca.md` (seções 5 a 7, CA-24 a CA-49, Q-6 a Q-9) e protótipo `docs/ux/prototipos/097-filtros.html`. Depois dessa base entraram o L4 (equipe nas tendências, PR 333), o L2 (equipe no apontamento, PR 337) e o L7a/L7b (equipe da sustentação por slug, PR 344): os caminhos abaixo seguem os mesmos pontos de entrada. Nada foi lido da base real nem de `.env*`.
- **Estado:** proposta. Nenhuma linha de código muda por esta análise. E7 depende de duas respostas do dono (P-097-9 e P-097-10, §8); E5 não depende de nada.
- **Decisões que valem aqui:** E5 em todo cartão de gráfico (13:45, "A"); 10 maiores com "ver todos" no AP-PROJETO (14:05, "faca suas recomendacoes"); rótulo "Equipe" (14:08); E7 com 7 setores sem o sobrenome, fora o AI Iniciatives (14:09, "A"); Q-6 a Q-9 pelas recomendações do UX (18:41).

## 0. Conferência com as regras invioláveis
| Regra (CLAUDE.md) | Como o desenho cumpre |
|---|---|
| Sem avaliação individual nem comparação entre times | Setor é só **recorte** (filtro), como Equipe. Nenhuma resposta ganha bloco, série, linha ou ordenação **por setor** (CA-46). Vários setores = um conjunto consolidado com o aviso (CA-45). A linha de resumo do cartão recolhido nunca traz número por pessoa, equipe ou setor (CA-32): o padrão é a base neutra do cartão (§2.3). |
| Sobrenome de pessoa (os nomes dos quadros trazem o do responsável) | O nome do setor **nunca** vem do nome do quadro no BusinessMap: vem de um dicionário versionado com o nome já sem sobrenome (decisão de 14:09). Nenhum código lê nem grava o nome do quadro (hoje `ref_quadro.equipe` guarda `Quadro <id>`, `server/src/modulos/businessmap/referencia.ts:76`). O id do setor na URL é o slug do nome sem sobrenome (CA-41). |
| BusinessMap e Acelerato nunca se misturam | Setor existe só em `FiltrosFluxo` e nas opções de `businessmap`; `FiltrosSustentacao` não muda (CA-43). No Resumo, o setor só chega ao bloco Fluxo (CA-49). |
| Story, frente e projeto nunca no mesmo histograma | O filtro só remove cards da seleção de cada granularidade (`selecionar`, `packages/metricas/src/businessmap/comum.ts:47`); não junta granularidades. |
| Abaixo de 20 itens, não publicar | O filtro só reduz `n`; a regra já está na biblioteca (CA-47). |
| Cálculo só na biblioteca (T2.5) | O filtro de setor entra em `selecionar()` e nos caminhos da biblioteca que hoje leem `f.equipe` direto (§1.4). Os 10 maiores do AP-PROJETO são corte de **exibição** de uma lista que a biblioteca já entrega ordenada (§3); não é tempo, percentil nem Monte Carlo. |
| Mudança de critério registrada (T2.6) | O dicionário de setores entra pelo `bm:ref-sync`, que já registra a versão de critério com o hash do arquivo (`server/src/modulos/businessmap/dominio-businessmap.ts:129-134`), sem marcar métrica (setor é recorte, não critério). |
| Dúvida de regra vira pergunta | §8: P-097-9 (qual quadro é qual setor) e P-097-10 (como o setor age no projeto), cada uma com recomendação. |
| Colunas de pessoa fora da API | E7 no fluxo não pede GRANT novo (o `dspd_api` já lê `ref_dominio` e `dim_card.quadro_id`). Só o L12 (Setor no Apontamento) pede o GRANT de `dim_card.quadro_id` ao papel da aba, que não é coluna de pessoa. |

## 1. E7: de onde vem o setor de cada card

### 1.1 O que existe (dado do BusinessMap já coletado)
- **Cada card já guarda o quadro:** `dim_card.quadro_id` (projetor, `server/src/modulos/businessmap/normalizador.ts:229`), já lido pela API (`server/src/modulos/metricas/repositorio.ts`, `LinhaCard.quadro_id`) e já presente no card da biblioteca (`packages/metricas/src/businessmap/modelo.ts:39`). Nenhuma coleta nova.
- **A coleta lê 7 quadros:** 35 (projetos, nível gerência) e 23, 24, 25, 27, 31 e 79 (quadros dos coordenadores, cada um com workflows de iniciativa e de time) (`docs/architecture/features/052-integracao-businessmap.md` §2, linhas 25 e 64; `server/migrations/0019_bm_carga_inicial_times.ts:28-41`).
- **O que falta:** a base não sabe o **nome** de nenhum quadro (por desenho: o nome traz o sobrenome do responsável). Falta o dicionário `quadro_id → setor` (nome sem sobrenome). É **configuração**, não dado novo da fonte.

### 1.2 Hipótese a confirmar (P-097-9)
O print do dono mostra 8 quadros no espaço de trabalho (os 7 setores e o AI Iniciatives); a coleta lê 7. A leitura mais provável é: "Desenv Sistemas Plataformas Digitais - Gerencial" = quadro 35 (o de projetos, nível gerência); os outros 6 setores = os quadros 23, 24, 25, 27, 31 e 79; AI Iniciatives = quadro não coletado. **Não se infere:** qual id é qual setor vai ao dono (P-097-9). O dono confere na tela do BusinessMap (o id aparece na URL do quadro) ou rodando o diagnóstico que já existe (só GET, `/boards`, saída com `board_id` e `name`, `server/src/modulos/businessmap/diagnostico.ts:7-21`), na máquina dele.
- Se a hipótese vale: Q-6 fica sem efeito ("Todos" = os 7 quadros coletados = os números de hoje).
- Se o AI Iniciatives for um dos 7 coletados: algum dos 7 setores não é coletado e a opção dele ficaria vazia. Aí a lista mostra só os setores com quadro coletado e o setor sem quadro vira pergunta (coletar o quadro é mudança de escopo da coleta, ADR 0025 e plano 052).

### 1.3 Onde guardar o dicionário: o mecanismo que já existe
| Via | Como | Veredito |
|---|---|---|
| **A. `dspd_bm.ref_dominio` pelo `bm:ref-sync`** (recomendada) | Lista nova `setores` no arquivo versionado `docs/architecture/fontes/businessmap-dominio.json`, gravada como `campo = 'setor_quadro'`, `codigo = quadro_id`, `rotulo = nome sem sobrenome`, `ordem`. Esquema do arquivo fechado (`strict`, `dominio-businessmap.ts:49-89`): `codigo` só dígitos, `rotulo` por `textoSeguro(80)`, sem rótulo nem código repetido. | Reusa leitura, vigência, transação única, versão de critério com hash e permissão (o `dspd_ref` já escreve `ref_`; o `dspd_api` já lê `ref_dominio`, `server/src/modulos/referencia/repositorio.ts:23-28`). **Sem migração, sem tabela, sem GRANT novo.** Mudar um setor é editar o arquivo por PR e rodar o `bm:ref-sync`; o histórico fica na vigência. |
| B. Tabela nova `ref_setor_quadro` com carga por migração (como `ref_time`, 0018/0019) | Migração + GRANT + gatilhos de vigência | Rejeitada agora: mesmo resultado que A com migração, GRANT e teste de esquema a mais. Só se o setor ganhar atributos próprios (ex.: responsável, meta), o que a regra de nenhuma avaliação individual já desaconselha. |
| C. Coluna em `ref_quadro` | `ref_quadro` é `soInserir` e guarda `equipe = 'Quadro N'` e `nivel` do desenho antigo (data-model §3, linha 130) | Rejeitada: reaproveita tabela com semântica legada e sem rastro (`motivo`, `versao_id`). |
| D. Constante no código (`packages/contratos`) | lista fixa de 7 | Rejeitada: é o que o dono acabou de pedir para tirar dos filtros ("tudo real", 13:42) e ids de produção no código. |

**Por que o existente basta (e não há mecanismo novo):** a via A é o mecanismo do pedido 069 (`bm:ref-sync`). O que muda é um campo a mais no esquema fechado do arquivo e uma lista a mais em `listasDoArquivo` (`dominio-businessmap.ts:116-123`). Por isso não há ADR de mecanismo novo; a decisão "setor = quadro do card" entra no `data-model.md` (§ referência do BusinessMap) quando o dono responder P-097-9 e P-097-10, e vira ADR 0031 só se a resposta da P-097-10 for a herança pelo filho (opção b), que muda a semântica do FL3.

Guardas do arquivo (critério do QA e do security-engineer):
- rótulo de setor sem o padrão de sobrenome em caixa alta depois de hífen (`/\s-\s\p{Lu}{2,}$/u`) e sem `@`: o esquema recusa;
- teste de fumaça com os 7 rótulos literais da decisão de 14:09 (nenhum deles termina em sobrenome);
- o código do setor no banco é lido com a mesma desconfiança do `CODIGO_SEGURO` (`dominio-businessmap.ts:33`).

### 1.4 Como o setor chega ao cálculo
- **Id do setor:** `slug(rotulo)` (o mesmo `slug` da equipe, `packages/metricas/src/slug.ts`). Dois quadros com o mesmo nome de setor viram uma opção só (consolidado). Setor e equipe são parâmetros diferentes (`setor` e `equipe`): um nome igual nos dois (o mock tem a equipe "Marketing e Vendas", `packages/mock/src/businessmap/catalogos.ts:8`) não colide.
- **Servidor:** `lerSetoresBM` (novo, em `server/src/modulos/referencia/repositorio.ts`) lê `ref_dominio` `campo = 'setor_quadro'` vigente. O mapa `quadro_id → nome do setor` entra na base que a API já monta para a biblioteca (`server/src/modulos/metricas/repositorio.ts` e `mapa.ts`), como lista `setores: { quadro_id, nome }[]` na `BaseBM`. Uma consulta pequena (7 linhas) por versão de carga da base, no mesmo cache.
- **Biblioteca:** `indice.ts` calcula `slugSetor` por card (`''` quando o quadro não tem setor) ao lado de `slugEquipe` (`packages/metricas/src/businessmap/indice.ts:164`). `selecionar()` ganha `(st.length === 0 || st.includes(m.slugSetor))`, a opção `semSetor` e o setor na **chave da memória** (`comum.ts:56`).
- **Caminhos que hoje leem `f.equipe` sem passar por `selecionar` e precisam do setor:** `o1.ts:18-53`, `o2.ts:46-51`, `o20.ts:55`, `o21.ts:62`, `t11.ts:54`, `t14.ts:38-47` e as chaves de cache de `varredura.ts:33` e `:60`. Um setor esquecido aqui é filtro aplicado só em parte (R1). A regra para cada um: o setor restringe os cards; os pontos que dependem de **uma** equipe (`f.equipe.length === 1`: WIP por coluna da equipe, SLE da equipe, T14) continuam dependendo só da equipe.
- **Story e frente:** setor = quadro do card. Frentes moram nos quadros dos coordenadores, então o Setor recorta o FL2 (o que a Equipe não faz hoje: frente não tem equipe).
- **Projeto (FL3) e a coluna Equipe "não afeta":** os projetos moram todos no quadro 35. Setor pelo quadro literal deixaria todos os projetos num só setor. Vai ao dono (P-097-10). Recomendação: **(a)** no nível projeto o Setor age como a Equipe age hoje (`semEquipe: true` em `e1`, `e3` a `e6`, `e9`, `t9`): não recorta, e o chip "não afeta" do cartão diz isso (`aplicaveis`, tabela 2.2). As métricas do FL3 que contam stories (`e2`, `e7`) seguem a mesma regra da Equipe nelas.
- **Contrato da tela (tabela 2.2):** `FiltroFluxoChave` ganha `'setor'` (`packages/contratos/src/metricas.ts:205`); cada cartão do fluxo declara se o setor atua (`aplicaveis`), como já faz com equipe, tipo e sistema.

## 2. E7: contrato e mudança de servidor
| Mudança | Onde | Classe (`docs/contratos/politica-de-mudanca.md` §2) |
|---|---|---|
| `setor` na consulta das métricas do fluxo, da visão geral do fluxo e da `TENDENCIA_FLUXO` (lista de slugs, `lista(idSlug)`, ausente = Todos) | `server/src/modulos/metricas/schemas.ts` (o mesmo ponto onde o L4 pôs `equipe` na tendência) | parâmetro opcional novo: compatível |
| `FiltrosFluxo.setor: string[]` com padrão `[]` | `packages/contratos/src/filtros.ts:39-45` | interno ao monorepo; link e filtro guardado sem `setor` continuam válidos |
| `OpcoesFiltroFluxo.setores: OpcaoFiltro[]` (id = slug, nome sem sobrenome, ordem alfabética, CA-40) | `filtros.ts:63-70` e o serviço de opções (`server/src/modulos/referencia/servico.ts`) | campo novo na resposta: compatível |
| Opções de toda a base, não do período | igual às demais (P-097-C, decisão de 14:05) | — |
| `openapi.json` regenerado | gate de contrato | PR normal |

Sem migração, sem coluna nova, sem índice novo: o filtro é em memória sobre a base já carregada (ADR 0003: custo desprezível; o QA mede FL1 com e sem setor no portão de desempenho existente).

## 3. E5: os 10 maiores do AP-PROJETO
- **O dado já chega pronto:** `distribuicao.porProjeto` vem da biblioteca já **filtrado** pelo recorte (CA-37) e **ordenado** por horas decrescentes, com rótulo e id no desempate (`packages/metricas/src/businessmap/apontamento/distribuicao.ts:33`), o que já atende CA-33.
- **Onde cortar: na web, sem contrato novo.** Uma função pura `dezMaiores(linhas)` em `web/src/features/apontamento/` devolve `{ visiveis, demais: { quantidade, segundos } }`. A soma dos demais é soma inteira de `segundos` já calculados (não é tempo, percentil nem Monte Carlo). Teste de propriedade: `soma(visiveis) + demais.segundos = kpis.segundos` e `visiveis + demais.quantidade = N`.
- Alternativa: o servidor devolver `porProjetoDemais`. Rejeitada: muda o contrato para uma decisão de exibição, e a lista completa continua necessária para "Ver todos".
- **Gráfico e tabela:** o gráfico de barras mostra só os 10 (a altura deixa de crescer com N, `CartaoDistribuicao.tsx:63`); a linha "Demais N-10 projetos: X h" e o botão "Ver todos os N projetos" ficam abaixo; "Ver todos" abre a lista completa em região com rolagem própria (CA-35). Estado só no componente (Q-9: não lembrado; volta a 10 ao reabrir, CA-38).
- **Selo de registro incompleto** (`selos-projeto-incompleto`, `CartaoDistribuicao.tsx:71-83`): continua sobre **todos** os projetos, não só os 10, para o aviso não sumir quando o projeto incompleto está entre os demais (R5).

## 4. E5: recolher todo cartão de gráfico e lembrar a escolha

### 4.1 Onde fica a memória e por quanto tempo
- **No navegador da pessoa, em `localStorage`, chave própria `metricas-dspd:recolhidos:v1`**, com a forma `{ versao: 1, paineis: { <painel>: <códigos de cartão>[] } }`, validada na leitura (zod; JSON quebrado ou forma inválida = nada recolhido, nunca quebra o painel).
- **Duração:** sem prazo. Vale até a pessoa expandir o cartão, acionar "Restaurar cartões recolhidos" (apaga a memória do painel, CA-30) ou limpar os dados do navegador. Nada vai para a URL nem para os filtros (CA-29), e nada vai ao servidor.
- **O que é gravado:** só o id do painel e códigos de cartão (`O3`, `AP-PROJETO`). Nenhum valor de filtro, nenhum nome, nenhum id de pessoa (mantém a regra AP-8 da aba Apontamento: pessoa nunca em `localStorage`, `web/src/features/apontamento/useApontamento.ts:7`). Leitura com teto: até 100 códigos por painel, formato `^[A-Z0-9-]{1,20}$`; o resto é descartado em silêncio.
- **Por painel:** o mesmo cartão em dois painéis (O3 no Resumo e no Operacional) tem escolha independente. Painéis: `resumo`, `operacional`, `tatico`, `estrategico`, `sustentacao`, `apontamento` (e os demais que usam `CartaoMetrica`).

**Por que as preferências que já existem não bastam** (`web/src/features/preferencias/fonte.ts`, `packages/contratos/src/cartoes.ts:358-370`): elas guardam **quais métricas a pessoa quer ver** ("Ocultar esta métrica"), num contrato de conta (`versao: z.literal(1)`, porta pronta para `GET/PUT /me/preferencias-metricas` com o SSO) e só para 4 painéis (`PAINEIS_COM_CARTOES`, sem Resumo nem Apontamento). Recolher é **estado de leitura** de um cartão que continua visível. Pôr os recolhidos ali obrigaria a `versao: 2` (o `salvar` recusa sobrescrever versão maior, `fonte.ts:71-79`, e quem voltasse a uma versão anterior perderia as preferências) e levaria estado de tela ao contrato de conta. Evidência: leitura do código na base f4c122f1, sem execução (esta delegação é só leitura). O padrão de chave em `localStorage` já existe no produto (`web/src/app/tema.tsx:25-61`).

### 4.2 Desenho do componente
- `CartaoMetrica` (`web/src/components/ui/CartaoMetrica.tsx`) ganha o botão "Recolher"/"Expandir" no cabeçalho (ao lado de "Ocultar"), com `aria-expanded`, `aria-controls` para o corpo e `aria-label` "Recolher cartão: <título>" (CA-25 a CA-28). Recolhido, o corpo **não é renderizado** (pergunta, notas, estados e corpo saem; ficam código, título, botão e a linha de resumo).
- Prop `recolhivel` (padrão `true`); os cartões de número único passam `false` (Q-8: KPIs não recolhem; ex.: `CartaoKpis` do Apontamento). A lista de cartões KPI fica no lote e o QA confere tela a tela.
- Provedor por página `ProvedorRecolhidos painel="..."` e o componente `RestaurarRecolhidos` acima dos cartões (CA-30). Fora de um provedor, o cartão não mostra o botão (testes isolados e a Visão geral não mudam).
- **O dado continua sendo carregado quando recolhido** (hipótese do UX aceita): a linha de resumo precisa do dado e os avisos da página (atualizando, erro) continuam; não há requisição a mais nem a menos que hoje.
- **Linha de resumo (CA-26, CA-31, CA-32):** padrão neutro a partir da base do cartão ("Recolhido. 312 itens."), que nunca é por pessoa, equipe ou setor; com erro, "Não foi possível carregar este cartão."; prop opcional `resumoRecolhido` para o cartão que tem um total melhor (AP-PROJETO: "Recolhido. 24 projetos, 3.669,6 h no total."). A frase de leitura (`leitura`) **não** é usada como resumo: nos cartões de capacidade ela pode citar pessoa.
- Sem animação de altura.

## 5. Lotes (até 150 linhas cada), ordem e dependências
| Lote | Agente | Escopo e arquivos | Depende de | Gatilho de segurança |
|---|---|---|---|---|
| **L8a** · E5 recolher, mecanismo | react-frontend | `web/src/components/ui/CartaoMetrica.tsx`; novo `web/src/components/ui/Recolhidos.tsx` (provedor, hook, leitura e gravação validadas da chave `metricas-dspd:recolhidos:v1`, `RestaurarRecolhidos`); testes de CA-25 a CA-32 e da memória corrompida | — (pode começar já) | não (só navegador; nada de pessoa no `localStorage`) |
| **L8b** · E5 recolher, painéis | react-frontend | provedor e "Restaurar" nas páginas (Resumo, Operacional, Tático, Estratégico, Sustentação, Apontamento); `recolhivel={false}` nos KPIs (Q-8); `resumoRecolhido` onde o UX pediu | L8a | não |
| **L9** · E5 10 maiores do AP-PROJETO | react-frontend | `web/src/features/apontamento/components/CartaoDistribuicao.tsx`, função pura `dezMaiores` com teste de propriedade (soma e contagem), CA-33 a CA-38, selo de incompleto sobre todos | — (o `resumoRecolhido` do AP-PROJETO entra no L8b) | não |
| **L10a** · E7 servidor, dicionário e opções | node-backend | `server/src/modulos/businessmap/dominio-businessmap.ts` (lista `setores` no esquema fechado, guarda de sobrenome, `listasDoArquivo` com `setor_quadro`); `docs/architecture/fontes/businessmap-dominio.json` (as 7 linhas **só depois** da P-097-9; antes, lista vazia); `server/src/modulos/referencia/repositorio.ts` e `servico.ts` (`opcoes.setores`); `packages/contratos/src/filtros.ts` (`setores`, `FiltrosFluxo.setor` com padrão `[]`); `metricas.ts` (`FiltroFluxoChave`); `openapi.json` | — (o código vai antes da resposta; as 7 linhas esperam P-097-9) | **sim**: muda o esquema fechado da fronteira de referência do 069 (`docs/security/069-modelo-ameacas.md`) e põe texto de configuração na API; prova de que nenhum rótulo leva sobrenome |
| **L10b** · E7 biblioteca e consulta | node-backend | `packages/metricas/src/businessmap/indice.ts` (`slugSetor`), `comum.ts` (`selecionar`, `semSetor`, chave da memória), `o1`, `o2`, `o20`, `o21`, `t11`, `t14`, `varredura.ts` (chaves), `ei.ts`; `server/src/modulos/metricas/schemas.ts` (`setor` no fluxo, na visão geral e na `TENDENCIA_FLUXO`) e a base com `setores`; teste de forma "sem bloco por setor" estendendo `server/tests/times-sem-comparacao.test.ts`; teste de propriedade "métrica com setor X = métrica sobre a base só com os quadros de X" | L10a; regra do projeto conforme P-097-10 | não (entrada nova validada por `idSlug`, como a equipe) |
| **L11** · E7 web | react-frontend | `web/src/features/filtros/BarraFiltros.tsx` (Setor antes de Equipe no FL1, FL2 e FL3, busca e estados do L1), `codec.ts` (`setor` na URL, valor inválido no aviso existente), aviso consolidado de setores (CA-45), `aplicaveis` com `setor` por cartão; Resumo: Setor no bloco Fluxo (`web/src/features/operacional/resumo/`), nunca no bloco Sustentação (CA-43, CA-49) | L10a (contrato); L10b para o efeito | não |
| **L12** · E7 Setor no Apontamento (Q-7) | node-backend, depois react-frontend | servidor: GRANT de `dim_card.quadro_id` ao `dspd_api_apontamento` (`server/src/plataforma/db/grants.ts`); `lerLinhas` com `COALESCE(c.quadro_id, p.quadro_id)`; `setor` em `LinhaApontamento` e em `filtrar()` da biblioteca ("Sem setor" para card fora dos quadros coletados); `setor` na consulta e `opcoes.setores` na resposta. web: `BarraFiltrosApontamento` com Setor | L10a | **sim**: banco (permissão por coluna do papel da aba); LGPD: recorte de pessoas por setor no cartão de capacidade (mesmo risco do R3 do L2, menor porque setor é mais amplo que equipe) |

- **Ordem com o limite de 1 cartão por agente:** react-frontend L8a → L9 → L8b → L11 → L12 (web); node-backend L10a → L10b → L12 (servidor). E5 (L8a, L9, L8b) não espera nada e pode rodar já, em paralelo ao L10a. O L11 começa com o contrato do L10a e liga ao efeito com o L10b.
- **O QA prepara desde o início:** a memória corrompida e o teto de códigos (L8a), a propriedade de soma do L9, os casos de abuso do arquivo de domínio (rótulo com sobrenome, código não numérico, rótulo repetido) do L10a, e a busca por sobrenome em URL, `title`, `aria-label` e anúncio (CA-41) no L11.
- **Release:** nenhum destes lotes entra na release 101 (histórico, 03:56). A especificação da segunda rodada do UX precisa chegar à `develop` (PR da branch `docs/097-ux-recolher-setor`) antes do primeiro PR destes lotes, para os CA citados existirem na base.

## 6. Riscos e critérios de reversão
| Id | Risco | Mitigação | Reverter quando (fato observável) |
|---|---|---|---|
| R1 | Algum caminho da biblioteca que lê `f.equipe` direto fica sem setor: o filtro vale em parte dos cartões | Lista do §1.4 no L10b; teste de propriedade por métrica do fluxo; `aplicaveis` com `setor` em todo cartão | Um cartão com `setor` em `aplicaveis` muda de número sem setor e com setor = Todos, ou não muda com um setor que exclui cards dele |
| R2 | Setor pelo quadro **atual** do card: card que mudou de quadro leva todo o histórico para o setor novo | Medir com a consulta C5 (§7) antes do L10b | C5 acima de 2% dos cards do período: setor pela versão do card na data (`dim_card_versao`), com ADR |
| R3 | O dicionário pega o sobrenome por engano (digitação, cópia do nome do quadro) | Guarda do esquema (§1.3), review e parecer de segurança no L10a; o dicionário só muda por PR | Qualquer rótulo de `setor_quadro` vigente terminando em ` - <MAIÚSCULAS>` |
| R4 | Mapa quadro → setor errado (P-097-9 respondida de memória) | O dono confere o id na URL do quadro; o QA confere a contagem de cards por setor com o dono **na tela do BusinessMap**, sem lista por setor no produto | O dono vê um card de um setor no recorte de outro |
| R5 | Projeto incompleto fora dos 10 maiores perde o selo | Selo sobre todos (§3) | — |
| R6 | "Recolher" e "Ocultar" lado a lado confundem | Texto visível diferente, revisão de UX no L8a | Revisão de UX (E3.5) com achado médio ou maior sobre os dois botões |
| R7 | `localStorage` bloqueado ou cheio | Gravação em `try`; falha = escolha vale só nesta visita, sem aviso | — |
| R8 | Quadro 35 (projetos) como setor "Gerencial": com a opção (a) da P-097-10, esse setor recorta só o que mora no quadro 35 e fica vazio no FL1 e no FL2 | É consequência da resposta a P-097-9 e P-097-10; a especificação de UX ganha a frase do estado vazio por setor | O dono pede que "Gerencial" mostre o trabalho do FL1: opção (b) da P-097-10, com ADR 0031 |

## 7. Consulta só de leitura (o dono roda; nada é escrito)
```sql
-- C5. Cards que mudaram de quadro ao longo da vida (mede o R2), por granularidade; sem nome, sem pessoa.
SELECT c.granularidade, count(*) AS cards_com_mais_de_um_quadro
FROM (SELECT card_id FROM dspd_bm.dim_card_versao GROUP BY card_id HAVING count(DISTINCT quadro_id) > 1) x
JOIN dspd_bm.dim_card c ON c.card_id = x.card_id
GROUP BY c.granularidade ORDER BY c.granularidade;
```

## 8. Perguntas ao dono (uma por vez; `R-DECISAO`)
- **P-097-9** (E7, dado que falta): qual quadro do BusinessMap é cada setor? Hipótese para confirmar: quadro 35 = "Desenv Sistemas Plataformas Digitais - Gerencial"; os quadros 23, 24, 25, 27, 31 e 79 = os outros seis (qual é qual, o dono diz; o número aparece na URL do quadro); AI Iniciatives não é coletado. Sem essa resposta o filtro Setor sai pronto e vazio ("Ainda não há setores na base"). Recomendação: o dono manda a lista "id = setor" de uma vez.
- **P-097-10** (E7, regra): no Estratégico (FL3), os projetos ficam todos no quadro de projetos. O Setor (a) não recorta projetos, como a Equipe já não recorta, com o aviso "não afeta" no cartão; ou (b) um projeto entra no setor dos quadros das suas frentes e stories (um projeto pode cair em vários setores)? Recomendação: (a) agora. É igual à regra da Equipe, sem decisão nova de cálculo; (b) pede regra de herança, ADR e teste próprio, e pode entrar depois sem refazer o (a).

## 9. Gatilhos de segurança (`R-SEGURANCA`)
- **L10a:** fronteira de referência do 069 (esquema fechado do arquivo de domínio) e texto de configuração exposto na API; prova de ausência de sobrenome. O `security-engineer` revisa o modelo de ameaças do 069 com o campo novo antes da implementação.
- **L12:** banco (GRANT de coluna ao `dspd_api_apontamento`) e LGPD (recorte de pessoas por setor no cartão de capacidade).
- **Sem gatilho:** L8a, L8b, L9, L10b e L11 (sem migração, sem dependência nova, sem coluna de pessoa, sem `.env`, sem CI; o `localStorage` guarda só códigos de cartão).

## 10. Afrouxa alguma regra?
Não. Nenhum texto de `docs/regras/`, de `tests/config.json` ou de controle muda. Nenhum mecanismo novo de fábrica (hook, regra, ferramenta, agente). Os campos novos são parâmetros e opções de contrato previstos pela política de mudança, um campo a mais no arquivo de domínio que já existe e uma chave de `localStorage` de tela, com o motivo no §4.1.
