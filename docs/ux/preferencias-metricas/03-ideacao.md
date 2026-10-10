# Preferências de métricas · 03 Idear

Alternativas apresentadas ao `software-architect` para viabilidade (perguntas ao final).

## Caso A: perfil (padrão pessoal)
**A1. Página "Preferências" com lista de caixas por painel.** Rota `/preferencias`, link "Preferências" no cabeçalho (ao lado de Ajuda, lugar fixo, WCAG 3.2.6). Um `fieldset` por painel (Operacional, Tático, Estratégico, Sustentação), cartões agrupados por seção, aplicação imediata com "Salvo" em `role=status`. Botão "Restaurar padrão (mostrar tudo)".
Prós: visão completa e previsível; leitor de tela simples; escala com novos cartões. Contras: sair do painel para configurar. Esforço: médio.
```
Preferências de métricas        Salvas neste navegador
Operacional   [x] O2 [x] Bloqueados [x] O1 [ ] O9 ...
Tático        [x] T2 [x] T1 [ ] T5 ...            [Restaurar padrão]
```
**A2. Modo "Editar painel" no próprio painel** com "Salvar como meu padrão". Prós: contexto visual. Contras: modo, risco de salvar sem querer, ruim no mobile e para teclado; esforço alto.
**A3. A1 + predefinições** (Time, Coordenação, Gerência, Sustentação) como botões de atalho que só marcam caixas; usuário ajusta. Prós: bom primeiro uso. Contras: predefinições são decisão de produto (H2) e podem sugerir "papel de pessoa". Esforço: médio+.
**Escolhida: A1 agora, A3 como extensão opcional** (as predefinições ficam no protótipo marcadas "hipótese, a validar"). Motivo: simples, acessível, sem modos.

**Onde mora o perfil:** sem login no mock, a identidade é "este navegador" (localStorage), com aviso "Suas escolhas ficam salvas neste navegador e não são vistas por ninguém". A tela e o contrato não mudam quando o login chegar: só a origem do dado (ver perguntas). **Padrão por papel/nível:** o padrão do sistema é tudo visível; não existe "papel" no cadastro; qualquer padrão por nível é predefinição escolhida pela pessoa (A3).

## Caso B: momento da visualização
**B1. Botão "Métricas: 9 de 9" na barra do painel, abre popover com caixas.** Mesmo padrão dos filtros (popover, Esc, aplicação imediata, folha no mobile). Prós: consistente, descobrível, uma só área. Contras: não é "no cartão". Esforço: baixo-médio.
**B2. Botão "Ocultar" dentro de cada cartão** (menu do cartão) com "Desfazer" em aviso. Prós: gesto direto. Contras: restaurar exige outro lugar; sozinho não lista o que está oculto. Esforço: baixo.
**B3. Índice lateral com chaves liga/desliga.** Prós: visão geral. Contras: ocupa espaço, não existe sidebar (D1), ruim no mobile.
**Escolhida: B1 + B2.** B1 é o lugar de ver e restaurar; B2 é atalho ocultar. Texto de estado sempre visível: faixa "2 métricas ocultas (O9, O10). Mostrar todas · Usar minhas preferências".

## Caso C: links compartilhados
**C1. URL nunca carrega seleção** (destinatário vê o perfil dele). Prós: simples, privado. Contras: "mesma visão" quebra.
**C2. URL sempre carrega a seleção** (inclusive a do perfil). Prós: mesma visão. Contras: vaza preferência pessoal sem querer.
**C3. Híbrido:** só o recorte feito na hora vai na URL (`ocultar=o9,o10`, lista de ocultos, nunca de visíveis, para métricas novas aparecerem). O perfil nunca vai. `ocultar` presente na URL **substitui** o perfil do destinatário naquela visita, com faixa: "Este link oculta 2 métricas. Mostrar todas · Usar minhas preferências". `ocultar=` vazio força "todas visíveis". Ids inválidos: aviso da 2.6. Sem `ocultar`: vale o perfil de quem abre. Parâmetro por painel, em `ocultar`; não entra na memória de sessão dos filtros.
**Escolhida: C3.** Copiar link inclui `ocultar` só se a pessoa alterou a seleção na sessão; um aviso discreto no botão diz "O link inclui sua seleção de métricas".

## Regras de segurança da informação (todas as alternativas)
1. **Faixa "Pede atenção" nunca filtra por preferência.** Alerta de métrica oculta continua, com selo "métrica oculta" e link "Mostrar O2 nesta visita" (leva ao painel com a métrica fora de `ocultar`). A mesma regra vale nos itens e cartões de nível da Visão geral.
2. **Visão geral não é recortada** por preferências (H4); ganha uma linha "As preferências de métricas valem para os painéis".
3. **Avisos de painel permanecem:** consolidado, filtros não aplicáveis, dados fictícios, rodapé. **Mudança de critério:** se um cartão oculto tem critério alterado dentro da janela, o painel mostra "Critério alterado em O3 (oculta) em 02/03/2026. Mostrar O3". Avisos internos de cartão visível (amostra insuficiente, nota, base) nunca ficam controláveis.
4. Seção com todos os cartões ocultos: some o atalho "Ir para" e o `h2` mostra "Todas as métricas desta seção estão ocultas. Mostrar". Painel inteiro oculto: estado vazio com "Mostrar todas".
5. Foco ao ocultar: vai ao título do próximo cartão (ou ao `h2`); ao restaurar, ao título do cartão restaurado. Anúncio `aria-live`: "O9 oculta. 8 de 9 métricas visíveis. Desfazer".
6. T1 e T4 e demais pares "leia junto": o link some se o par está oculto. Cartões com abas ocultam como unidade.
7. Nenhuma tela mostra preferências de outra pessoa; nenhuma métrica de uso das preferências.

## Matriz impacto x esforço
| | Impacto alto | Impacto baixo |
|---|---|---|
| Esforço baixo | B2, C3 | C1 |
| Esforço médio | A1, B1 | A3 |
| Esforço alto | n/a | A2, B3 |

## Perguntas para o arquiteto
1. **Identidade:** sem login, "navegador" via localStorage é aceitável para o mock? Como a preferência migra para o usuário quando o login (pedido futuro) existir sem retrabalho de contrato?
2. **Persistência:** localStorage agora e API depois, ou API desde já? Se API: sem identidade, qual a chave? Há risco de dado pessoal (LGPD) e de alguém consultar preferências alheias? (deve ser impossível por desenho.)
3. **Contrato:** formato sugerido `{versao, paineis: {operacional: {ocultar: ["o9"]}}}` guardando **ocultos**, para métricas novas aparecerem. Quem define o contrato de cartões (catálogo de ids por painel, com seção)? O catálogo precisa vir de uma fonte única que o front, o perfil e a URL compartilhem.
4. **Visão geral e alertas:** a camada de dados já devolve alertas independentes do que a tela mostra? A preferência deve ser aplicada **só no front**, nunca no cálculo ou no corte do payload (para alertas e avisos de critério não dependerem dela).
5. **Versionamento:** como tratar ids de cartões que deixam de existir ou mudam (ignorar em silêncio no perfil, aviso na URL)?
6. **Privacidade:** confirmar que não há telemetria agregada por pessoa; log de servidor não deve registrar preferências.
7. **E2E/QA:** parâmetro de mock para fixar uma preferência em testes (`localStorage` pré-carregado).

## Decisões que dependem do usuário (produto)
D-a: predefinições por papel (A3)? D-b: alerta de métrica oculta continua na faixa (recomendado)? D-c: Visão geral fora do recorte? D-d: `ocultar` na URL substitui o perfil do destinatário (C3)? D-e: permitir ocultar todos os cartões de um painel?
