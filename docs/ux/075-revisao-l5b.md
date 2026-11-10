---
pedido: 075-bloqueios-reais
branch: feature/075-l5b-historico-parcial
commit: caee6f68686c5cf719583f4080670edaee4a4b5c
etapa: E1.10 (revisão de interface do lote 5b)
---

# Revisão de interface do lote 5b (histórico parcial e precisão do início)

## Veredito
Aprovado com ressalvas: nenhum achado crítico ou alto; 1 médio e 3 baixos, nenhum bloqueia o merge. Método: leitura do código e do teste (`lido`); nada foi medido (contraste e leitor de tela ficam para o QA com @axe).

## Conferência contra a especificação
| CA | Resultado | Evidência (lido) |
|---|---|---|
| CA-6 | Atendido | `AvisoCriterio` (tipo janela) vem de `CartaoMetrica` por `criterios.janela` (CartaoMetrica.tsx:351-353), por isso `fluxo.tsx` não está no diff. O teste prova a faixa com a data no estado de amostra insuficiente. |
| CA-7 | Atendido | `SerieLinhas` com `connectNulls={false}`; a série `bloqueados` recebe null e `marcacoes={d.criterios.serie}` traz a faixa e a linha vertical. O teste confere faixa, marcador com data e linhas da tabela "— amostra insuficiente". |
| CA-8 | Atendido | Com `criterios.janela` vazio a faixa não renderiza (`AvisoCriterio` retorna null); teste cobre. |
| CA-9 | Atendido em essência, com divergência decidida abaixo | Com 1 ou mais tipos publicados, o tipo curto sai em `ListaInsuficientes`, só texto, sem barra nem %. Sem nenhum tipo publicado, vale o `AmostraInsuficiente`. |
| CA-11 | Atendido | Texto sob a tabela em `#bloqueados-apoio`, ligado à tabela por `aria-describedby`; some junto com a tabela quando não há bloqueado (coerente com CA-10). |

## Decisão sobre a divergência do CA-9
Aceita como está. Motivos: (1) o medidor mostra o progresso até o mínimo de 20, não o valor da métrica; nenhuma eficiência, barra de valor ou percentual do tipo é publicado, que é a intenção do CA; (2) é o mesmo componente de todos os cartões do painel (consistência, Nielsen), com texto "N de 20 itens mínimos" que dá o N exigido; (3) o medidor tem `role="meter"` e `aria-label` com o texto, então a informação não depende da barra. Em vez de mudar a tela, o CA-9 deve ser reescrito para "sem barra de valor nem percentual de eficiência; o medidor de progresso até 20 é permitido" (ver achado 1).

## Achados
- (baixo) Texto do CA-9 diz "sem barra"; o `AmostraInsuficiente` mostra medidor N/20, aceito. Ajustar o CA-9 em docs/ux/075-bloqueios-reais.md para "sem barra de valor nem percentual". Dono: ux-designer (Jarvis commita).
- (médio) CA-9: com todos os tipos do O5 abaixo de 20, `maiorN(faltam)` mostra um só N e não diz qual tipo; o CA pede N de 20 por tipo. Listar cada tipo com seu N (`ListaInsuficientes`) sob o aviso. Pode virar cartão curto.
- (baixo) CA-6: a expressão "histórico parcial" só aparece pela `descricao` da marcação (lote 6a); a faixa genérica diz "mudança de critério". Garantir no lote 6a a descrição literal; o teste usa fixture, não o contrato real.
- (baixo) CA-7: nenhum teste verifica o gap na linha desenhada, só na tabela alternativa; `connectNulls={false}` é lido, não medido. O E2E ou QA pode confirmar visualmente com a série real.

## Acessibilidade (WCAG 2.2 AA)
- Faixa de critério com `role="note"`, ícone mais texto, sem depender só de cor: lido.
- Série Bloqueados com traço pontilhado distinto das demais, legenda por nome: lido.
- Medidor com `role="meter"`, valores e `aria-label`: lido.
- Contraste, foco e leitor de tela: sem medição aqui; QA mede com @axe.

## Heurísticas (Nielsen)
Visibilidade do status (faixa e data) e prevenção de erro de leitura (trecho anterior sem ponto, nunca zero) bem atendidas; ajuda e documentação pelo link "Ver mudanças de critério". Sem achados além dos acima.
