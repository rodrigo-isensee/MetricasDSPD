# Exportar métricas · 04 Prototipar

Protótipos HTML estáticos, descartáveis:
- `docs/ux/figma/prototipos/exportar-dialogo-1280.html` (diálogo e prévia do PDF)
- `docs/ux/figma/prototipos/exportar-dialogo-375.html` (folha no celular)

Fluxo: painel, "Exportar" na barra (ou no cartão), marcar métricas, escolher formato, "Gerar arquivo", estado "Gerando..." e "Arquivo pronto. Baixar". Erro: "Não foi possível gerar o arquivo. Tente de novo." Estados: carregando, vazio ("Nenhuma métrica visível para exportar. Marque ao menos uma."), erro, sucesso. A11y: dialog com foco preso, Esc, retorno ao botão, status anunciado.
