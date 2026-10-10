# Preferências de métricas (pedido 007)

Etapas anteriores: `01-empatia.md`, `02-definicao.md`, `03-ideacao.md` (alternativas A1+A3, B1+B2; C3 substituída pela decisão 4), `05-validacao.md`, `viabilidade-tecnica.md`. Protótipos: `docs/ux/figma/prototipos/preferencias-*.html`.

## Objetivo
Cada pessoa escolhe quais métricas aparecem nos painéis, sem alterar cálculo, avisos ou alertas. Resultado: painéis mais enxutos para o papel de cada um.

## Personas / contexto de uso
Gerente, coordenador e time; desktop (1280) e celular (375); uso ocasional no perfil, frequente no ajuste na hora. Preferência é pessoal e nunca visível a outros.

## Fluxo
1. Perfil: `/preferencias`, marcar/desmarcar métricas por painel (aplicação imediata) ou começar por conjunto de papel.
2. No painel: botão "Métricas: N de M" (popover) e "Ocultar esta métrica" no cartão, com "Desfazer". A mudança no painel vale para a visita; "Salvar como meu padrão" não existe: o padrão é editado só no perfil.
3. Link: "Copiar link" leva apenas os filtros. O destinatário vê as próprias preferências.
4. Primeiro login com preferências já guardadas no navegador: diálogo de escolha (CA-14).
5. Erro: falha ao salvar mostra aviso e mantém a escolha na tela.

## Telas
### Perfil `/preferencias`
- Hierarquia: h1; nota de privacidade; "Começar pelo conjunto sugerido para: Gerente | Coordenador | Time"; um `fieldset` por painel (Operacional, Tático, Estratégico, Sustentação) com cartões por seção e contador "N de M visíveis"; "Restaurar padrão" com confirmação.
- Estados: carregando (esqueleto das caixas); vazio (não se aplica, padrão tudo visível); erro ("Não foi possível salvar suas preferências. Tente de novo."); sucesso ("Salvo neste navegador", `role=status`); sem permissão (não se aplica).
### Painel (barra e cartões)
- Botão "Métricas: N de M" abre popover (`role=dialog`, Esc fecha, folha no mobile) com caixas, "Mostrar todas", "Usar minhas preferências", "Fechar". Faixa "N métricas ocultas: ... Mostrar todas · Usar minhas preferências" sempre visível quando N>0.
- Menu do cartão: "Ocultar esta métrica".
- Seção toda oculta: "Todas as métricas desta seção estão ocultas. Mostrar métricas da seção". Painel todo oculto: estado vazio "Você ocultou todas as métricas deste painel. A faixa Pede atenção e os avisos continuam." + "Mostrar todas".
- Faixa "Pede atenção": nunca filtrada; item de métrica oculta ganha selo "métrica oculta" e "Mostrar O2 nesta visita".
- Mudança de critério em métrica oculta: "Critério alterado em O3 (oculta) em 02/03/2026. Mostrar O3".
- Visão geral: sem recorte; linha "As preferências de métricas valem para os painéis".
### Diálogo de primeiro login
Título "Encontramos preferências neste navegador". Botões "Usar estas preferências" (primário) e "Começar do padrão do meu papel". Foco inicial no primário; Esc não fecha (exige escolha).

## Necessidades de dados
- Ler/gravar preferências do usuário: `{versao, paineis: {<painel>: {ocultar: [ids]}}}` (guarda ocultos, métricas novas aparecem).
- Catálogo único de métricas por painel e seção (id, rótulo, seção, par "leia junto").
- Papel do usuário (gerente, coordenador, time) para o conjunto sugerido; hoje sem login, o papel é escolhido pela pessoa.
- A preferência é aplicada só no front; payload, alertas e avisos não dependem dela.

## Microcopy
"Preferências de métricas"; "Métricas: 6 de 9"; "Ocultar esta métrica"; "O9 oculta. 8 de 9 métricas visíveis. Desfazer"; "Mostrar todas"; "Usar minhas preferências"; "Restaurar padrão"; confirmação "Restaurar o padrão? As 2 métricas ocultas (O9, T5) voltam a aparecer em todos os painéis."; "Suas escolhas ficam salvas neste navegador. Ninguém as vê e elas não entram em nenhum cálculo."

## Critérios de aceite
1. `/preferencias` lista um grupo por painel com todas as métricas do catálogo, agrupadas por seção; link "Preferências" fixo no cabeçalho.
2. Marcar/desmarcar aplica na hora, sem botão Salvar, e anuncia "Salvo neste navegador" em `role=status`.
3. Conjuntos "Gerente", "Coordenador", "Time" só marcam caixas; a pessoa ajusta depois; nenhum papel é gravado como atributo de avaliação.
4. O botão "Métricas: N de M" abre popover com as caixas do painel; mudanças valem só na visita e não alteram o perfil.
5. "Ocultar esta métrica" oculta o cartão, anuncia em `aria-live` "O9 oculta. N de M métricas visíveis. Desfazer" e leva o foco ao título do próximo cartão (ou ao h2); ao restaurar, ao título restaurado.
6. Com N>0, a faixa de ocultas mostra a contagem e os ids, com "Mostrar todas" e "Usar minhas preferências".
7. "Copiar link" leva apenas os filtros; a URL nunca contém seleção de métricas; destinatário vê as próprias preferências. Nenhum aviso sobre seleção no botão.
8. A faixa "Pede atenção" nunca é filtrada; item de métrica oculta mostra selo "métrica oculta" e "Mostrar X nesta visita".
9. A Visão geral nunca é recortada e exibe a linha informativa.
10. Avisos do painel (consolidado, dados fictícios, filtros não aplicáveis, rodapé) e internos de cartão visível (base, amostra insuficiente, nota) não são controláveis.
11. Critério alterado em métrica oculta gera aviso no painel com "Mostrar X".
12. É permitido ocultar todas as métricas de uma seção e de um painel; estados vazios conforme Telas, com "Mostrar todas"; "Ir para" da seção some.
13. Espera invisível pode ser ocultada nos painéis; permanece na página própria e na Visão geral.
14. No primeiro login, se houver preferências no navegador, o sistema pergunta antes de aplicar ("Usar estas preferências" / "Começar do padrão do meu papel") e nada é migrado sem escolha.
15. Pares "leia junto" (T1/T4): o link some se o par está oculto; cartões com abas ocultam como unidade.
16. Ids inexistentes no perfil são ignorados em silêncio; métricas novas aparecem por padrão.
17. "Restaurar padrão" pede confirmação nomeando as métricas afetadas.
18. Nenhuma tela, rota ou log expõe preferências de outra pessoa; sem telemetria de uso das preferências.
19. Acessibilidade: tudo operável por teclado, foco visível, alvos >= 24 px, contraste 4,5:1, selo não depende só de cor, `prefers-reduced-motion` respeitado, popover com foco preso e retorno ao botão.
20. Funciona a 375 px sem rolagem horizontal (popover vira folha).

## Perguntas em aberto
P-1 (usuário): quais métricas compõem cada conjunto (gerente, coordenador, time)? Proposta a validar: time = Operacional completo; coordenador = Operacional + Tático; gerente = Tático + Estratégico. Até a resposta, os conjuntos são provisórios.
