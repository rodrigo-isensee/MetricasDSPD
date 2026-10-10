# Preferências de métricas · 05 Validar

Protótipos: `docs/ux/figma/prototipos/preferencias-*.html` (perfil e painel, 1280 e 375). Validado pelo usuário em 2026-10-10 14:56 (`docs/alinhamentos/2026-10-10-decisoes-do-usuario.md` §6).

## Roteiro (executado)
1. Ocultar O9 e T5 no perfil. 2. Ocultar O10 pelo botão "Métricas" e pelo cartão; desfazer. 3. Contar ocultas e restaurar. 4. Abrir link recebido. 5. Ler "Pede atenção" com O2 oculta.

## Registro do retorno
| # | Pergunta | Decisão | Efeito no desenho |
|---|---|---|---|
| 1 | Predefinições por papel | Sim: gerente, coordenador, time; ajustável | Deixa de ser hipótese; botões "Gerente / Coordenador / Time" no perfil. Conteúdo de cada conjunto: ver pergunta aberta P-1 |
| 2 | Alerta de métrica oculta | Continua, com selo e "Mostrar nesta visita" | Mantido |
| 3 | Visão geral | Sempre completa | Mantido |
| 4 | Link compartilhado | **Só filtros** (contraria a recomendação C3) | Removido o parâmetro `ocultar` da URL; some o aviso "o link inclui sua seleção" e a faixa "Este link oculta N métricas" |
| 5 | Ocultar todas de um painel | Permitido | Painel vazio com "Mostrar todas"; alertas e avisos seguem |
| 6 | Espera invisível ocultável | Sim, nos painéis | Mantido |
| 7 | Primeiro login com preferências no navegador | Perguntar antes | Diálogo "Usar estas preferências / Começar do padrão do meu papel" |

Decisão: **aprovado com os ajustes acima** (aplicados nos protótipos e na `06-especificacao.md`). Consequência aceita pelo usuário: quem recebe um link não vê o recorte de quem enviou; para compartilhar a visão exata, ver pedido 008 (exportar).

Pendência aberta: P-1 (conteúdo dos conjuntos por papel) está na especificação.
