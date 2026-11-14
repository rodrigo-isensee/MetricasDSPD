# K-215: lista longa de equipes no texto do recorte da Sustentação (UX)

Pedido 087, etapa E3.12 · autor: ux-designer · 2026-11-14 · sem commit · entra antes do passo 2 (react-frontend) do desenho `docs/architecture/087-k215-desenho.md` (seção 5, "Para o ux-designer").
Não é um discovery completo (muda o texto de uma nota existente, sem fluxo novo); é a decisão de forma. A validação final é do dono, na tela.

## 1. Problema
O parágrafo `data-testid="recorte-sustentacao"` (topo da visão Sustentação) hoje lista 1 organização, 1 tipo e 3 equipes. Com o pedido 098 virão 2 organizações e dezenas de equipes, e o nome da organização pode ser o rótulo literal (`UNIFIQUE - DSPD SUSTENTAÇÃO E PEQUENAS MELHORIAS`, 49 caracteres). Listar tudo em linha empurra "Pede atenção" e os cartões para baixo (R2 do desenho), em especial no celular. Hipótese (não validada): quem lê o parágrafo quer saber "o que está dentro deste painel" de relance e só às vezes precisa conferir se uma equipe específica entra.

## 2. Alternativas
| | Alternativa | Prós | Contras | Esforço |
|---|---|---|---|---|
| A | Tudo em linha, sem limite | Zero interação; simples | Parágrafo de dezenas de linhas; empurra o conteúdo; ruim no celular | baixo |
| B | **Resumo com contagem + lista expansível (`<details>`)** | Parágrafo curto e estável; lista completa a um toque; semântica nativa (teclado e leitor de tela); já há precedente no projeto (`MaisMetricas`, `CabecalhoApontamento`) | Uma interação a mais para quem quer conferir | baixo |
| C | Lista sempre visível em caixa com rolagem interna | Tudo "na tela" | Rolagem aninhada é ruim no toque e para leitor de tela; esconde itens sem aviso | médio |
| D | Contagem sem lista (só "38 equipes") | Mínimo | Perde a transparência: não dá para saber quais equipes entram | baixo |

Escolhida: **B**. Mantém o texto curto e estável, não esconde a informação (a lista completa existe e é alcançável) e usa elemento nativo, sem biblioteca nova.

## 3. Regra de exibição
Aplicada a cada uma das três listas (organizações, tipos, equipes) pela mesma função, com limite de itens em linha:

- **Até 3 itens** (organizações e tipos) ou **até 4 itens** (equipes): nomes por extenso na frase, separados por vírgula e "e" ("equipes SSSC TOTVS, SSSC SENIOR e SSSC FLUIG"). Com isso o recorte de hoje (3 equipes) continua sem expansão.
- **Acima do limite**: a frase traz só a contagem ("38 equipes") e logo depois do parágrafo vem o `<details>` "Ver as 38 equipes", com a lista completa em `<ul>`.
- Um único `<details>` por lista que passou do limite, todos fechados por padrão. Se mais de uma lista passar do limite, cada uma tem o seu, empilhados abaixo do parágrafo, na ordem da frase (organizações, tipos, equipes).
- Ordem dos itens: a que o servidor entrega (`ordem, codigo`). Não reordenar nem agrupar no cliente.
- Os limites (3 e 4) são constantes de apresentação, não regra de negócio; ajustáveis na validação.

## 4. Wireframes (ASCII)
Hoje e caso pequeno (3 equipes, 1 organização, 1 tipo; sem expansão):
```
+--------------------------------------------------------------+
| Chamados da organização UNIFIQUE - DSPD SUSTENTAÇÃO E        |
| PEQUENAS MELHORIAS, tipo DSPD - SSSC, equipes SSSC TOTVS,    |
| SSSC SENIOR e SSSC FLUIG, excluídos os removidos. Tempos e   |
| aderência usam somente chamados fechados. Chamados com       |
| exceção de SLA por registro posterior ficam fora destas      |
| apurações.                                                   |
+--------------------------------------------------------------+
```
Caso 098 (2 organizações, 1 tipo, 38 equipes), fechado:
```
+--------------------------------------------------------------+
| Chamados de 2 organizações (UNIFIQUE - DSPD SUSTENTAÇÃO E    |
| PEQUENAS MELHORIAS e <segunda>), tipo DSPD - SSSC, de 38     |
| equipes, excluídos os removidos. Tempos e aderência usam     |
| somente chamados fechados. Chamados com exceção de SLA por   |
| registro posterior ficam fora destas apurações.              |
|                                                              |
| > Ver as 38 equipes                                          |
+--------------------------------------------------------------+
```
Aberto:
```
| v Ocultar as 38 equipes                                      |
|   - <equipe 1>                                               |
|   - <equipe 2>                                               |
|   ...                                                        |
```
(sem rolagem interna; a lista cresce a página. Em telas >= 768px a `<ul>` pode ficar em 2 colunas; em 1024px+, 3 colunas, com `column-gap` de 16px.)

Celular (375px): o resumo `<summary>` ocupa a largura toda, altura mínima 44px, texto "Ver as 38 equipes" com marcador de seta; a lista abre em 1 coluna, um nome por linha, nomes longos quebram a linha (nunca cortar com reticências, o nome é o dado).

## 5. Estados
- Carregando, erro ou `recorte` ausente: o texto de hoje, literal (decisão técnica do 087, 2026-11-10 13:11); sem `<details>`.
- 1 a limite itens: sem expansão (acima).
- Acima do limite: resumo + `<details>` fechado.
- Vazio: não existe; o servidor omite `recorte` se qualquer lista estiver vazia (desenho, seção 3), então cai no texto de hoje.
- Estado aberto/fechado é local e não persiste (nem na URL, nem em preferência): a lista é consulta eventual.

## 6. Acessibilidade (WCAG 2.2 AA; itens `lido`, sem medição)
- `<details>`/`<summary>` nativos: operável por Enter e Espaço, anuncia "recolhido/expandido" no leitor de tela, sem ARIA extra.
- O texto do `<summary>` repete a contagem e o substantivo ("Ver as 38 equipes"): rótulo próprio e único mesmo quando houver mais de um `<details>` (ex.: "Ver as 12 organizações").
- A lista expandida é `<ul>`: o leitor anuncia "lista com 38 itens".
- A contagem na frase é texto real; nada transmitido só por cor ou ícone. A seta do resumo é decorativa (`aria-hidden`), com o estado dado pelo próprio `<details>`.
- Foco visível no `<summary>` (anel do design system); alvo de toque >= 44px de altura no celular, >= 24px sempre.
- Sem live region: abrir é ação da pessoa, não evento a anunciar.
- Contraste: usar os tokens de texto e borda já usados na nota (`text-sm`, `border-borda`, `bg-superficie`); medir no QA (`@axe`).
- Respeitar `prefers-reduced-motion`: sem animação de abertura.

## 7. As duas respostas pendentes do dono
A estrutura acima vale para qualquer resposta; muda só o conteúdo das frases e dos itens.

**P-K215-1 (nome da organização)**
- (a) Rótulo literal (recomendado pelo Jarvis): nome de 49 caracteres ocupa 2 a 3 linhas no celular. Com 1 organização, vai em linha na frase ("da organização UNIFIQUE - ..."). Com 2 a 3, vão em linha e separadas por "e" (como no wireframe); acima de 3, contagem + `<details>`. Se a segunda organização for igualmente longa, a frase com duas fica pesada: se a validação mostrar isso, baixar o limite de organizações em linha para 1 (as 2 vão ao `<details>`), sem mudar mais nada.
- (b) Nome curto: frases mais curtas, mesma estrutura; a UX não tem objeção, mas não adicionar o campo `rotulo_curto` só por estética: o custo é do arquivo de domínio, e o `<details>` já resolve o tamanho.
- Recomendação de UX: (a). O rótulo longo é a identificação que a pessoa vê no Acelerato, e o parágrafo curto é obtido pela contagem, não pela abreviação.

**P-K215-2 (equipes com marca comum)**
- (a) Lista literal (recomendado): item a item no `<details>`, sem agrupar. Previsível, auditável, sem regra escondida de "marca". Com o 098 não há marca comum.
- (b) Juntar pela marca: só afeta a frase curta (até 4 itens), ex.: "SSSC: TOTVS, SENIOR e FLUIG". A UX não vê ganho: a frase curta já cabe por extenso e o agrupamento acrescenta risco de leitura errada (nome que não existe no Acelerato). Se o dono escolher (b), a regra tem de ser escrita por ele e, na lista expandida, os nomes continuam inteiros.
- Recomendação de UX: (a), alinhada à do arquiteto. Nenhum ponto da forma proposta depende da resposta, então o react-frontend pode implementar o comportamento de lista longa já, só o texto da frase espera a resposta.

## 8. Microcopy
- Frase (1 a limite): "Chamados da organização {org}, tipo {tipo}, equipes {a, b e c}, excluídos os removidos." (plural conforme a contagem: "organizações", "tipos").
- Frase (acima do limite): "Chamados de {n} organizações, tipo {tipo}, de {n} equipes, excluídos os removidos." Se as organizações ou tipos couberem em linha, mantêm-se por extenso.
- Resumo fechado: "Ver as {n} equipes"; aberto: "Ocultar as {n} equipes". Para as outras listas: "Ver as {n} organizações", "Ver os {n} tipos de chamado".
- Resto do parágrafo, fixo: "Tempos e aderência usam somente chamados fechados. Chamados com exceção de SLA por registro posterior ficam fora destas apurações."
- Reserva (sem `recorte`): o texto de hoje, caractere por caractere.

## 9. Critérios de aceite
- CA-1 ENQUANTO o recorte tem 4 equipes ou menos O SISTEMA DEVE listar os nomes por extenso na frase do parágrafo do recorte, sem exibir o controle de expandir.
- CA-2 ENQUANTO o recorte tem mais de 4 equipes O SISTEMA DEVE exibir na frase a contagem de equipes ("38 equipes") e, abaixo do parágrafo, um controle "Ver as 38 equipes" recolhido por padrão.
- CA-3 QUANDO a pessoa aciona o controle (clique, Enter ou Espaço) O SISTEMA DEVE exibir a lista completa, um nome por item de lista, na ordem recebida do servidor, e trocar o texto do controle para "Ocultar as 38 equipes".
- CA-4 O SISTEMA DEVE manter a lista expandida sem rolagem interna e com cada nome inteiro (quebra de linha, sem reticências).
- CA-5 ENQUANTO a lista de organizações ou de tipos passa de 3 itens O SISTEMA DEVE aplicar a mesma regra de contagem e controle recolhido a essa lista, com rótulo próprio ("Ver as {n} organizações").
- CA-6 SE o servidor não devolver `recorte` OU a consulta estiver carregando ou em erro ENTÃO O SISTEMA DEVE exibir o texto de recorte de hoje, sem controle de expandir.
- CA-7 ENQUANTO o controle está exposto O SISTEMA DEVE expô-lo ao leitor de tela com seu estado (recolhido ou expandido) e com nome acessível contendo a contagem e o substantivo.
- CA-8 ENQUANTO a viewport tem 375px de largura O SISTEMA DEVE exibir o controle com altura mínima de 44px e a lista expandida em uma coluna, sem rolagem horizontal.
- CA-9 O SISTEMA DEVE manter o parágrafo do recorte sem nenhum nome de organização, tipo ou equipe fixo no código da web fora do texto de reserva (alinhado à prova do passo 2 do desenho).
- CA-10 QUANDO a pessoa recarrega a página ou troca de visão O SISTEMA DEVE exibir o controle recolhido (estado não persiste).

## 10. O que a validação do dono precisa confirmar
Estado: **aguardando o usuário**. Sem retorno literal registrado.
1. Os limites de itens em linha (3 para organizações e tipos, 4 para equipes) servem?
2. Resumo com contagem + lista expandida é a forma desejada (contra alternativas A, C e D)?
3. As respostas P-K215-1 e P-K215-2 (ver seção 7; não bloqueiam a estrutura).

## 11. Limites deste documento
- Sem protótipo HTML: é mudança pequena num elemento existente e o wireframe ASCII mais o precedente do `<details>` do projeto bastam; se o dono quiser ver antes, o protótipo sai como complemento.
- O papel não tem shell: não rodei busca por URL externa (não há protótipo) nem medi contraste ou leitor de tela; itens de acessibilidade são `lido`.
- Quantas equipes o 098 trará de fato (aqui "38" é exemplo) e o nome da segunda organização são dado ainda não presente no arquivo da develop.
