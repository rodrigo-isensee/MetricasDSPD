# Lacuna de valor na sustentação · 03 Idear

Prototipado em `docs/ux/figma/prototipos/lacuna-valor-1280.html` e `-375.html`.

## Coleta
**C1. Formulário dentro do app** (link por área, resposta na tela). Prós: experiência única. Contras: exige identidade/token por respondente (não há login), risco de anonimato, código de escrita e antifraude. Esforço: alto.
**C2. Formulário corporativo externo + importação do resultado agregado no app.** Pesquisa roda fora (ferramenta já aprovada); o DSPD carrega no app um arquivo só com **contagens por pergunta e por área, sem identificador de respondente**. Prós: anonimato por desenho, sem auth nova, esforço baixo, alinhado às "automações externas". Contras: passo manual trimestral; duas ferramentas. Esforço: baixo-médio.
**C3. Lançamento manual na reunião trimestral** (coordenação digita o resultado colhido em entrevista). Prós: conversa rica. Contras: viés do entrevistador, não anônimo, não escala.

## Exibição
**D1. Seção "Percepção de valor" no painel Sustentação**, no fim, com distribuição por pergunta (barras empilhadas com rótulos numéricos), tendência de 4 trimestres e taxa de resposta; rótulo de fonte; filtros do painel avisados como "não se aplicam".
**D2. Página própria** `/sustentacao/percepcao`. Prós: espaço; contras: afasta do S1/S2.
**D3. Nota única (CSAT/NPS) no topo.** Prós: simples. Contras: média isolada que vira meta e esconde distribuição (mesma lógica do 7.1); descartada.

## Matriz impacto x esforço
| | Impacto alto | Impacto baixo |
|---|---|---|
| Esforço baixo | C2, D1 | D3 |
| Esforço médio | n/a | D2 |
| Esforço alto | C1 | C3 |

## Escolhida: C2 + D1 (C1 como evolução)
Anonimato por desenho e custo baixo; ao lado de S1/S2, onde a lacuna se sente.

## Conteúdo (hipóteses, a validar)
- **5 perguntas fechadas**, escala de 5 pontos ("Discordo totalmente" a "Concordo totalmente"), sobre o serviço: (1) resolve o que a minha área precisa; (2) o prazo atende à criticidade para a minha área; (3) sou informado sobre o andamento; (4) o problema não volta depois de resolvido; (5) confio na sustentação para o que é crítico. Texto exato é decisão do usuário (D-1).
- **Sem texto livre no painel.** Comentário livre, se existir, fica no formulário externo e nunca é importado (nomes de pessoas); alternativa em D-4: motivo fechado de insatisfação.
- Respondente: gestor da área atendida, pergunta única, sem nome do analista.

## Regras de exibição
1. Distribuição (5 faixas) e **n** sempre; sem média isolada; sem meta; sem semáforo.
2. **Consolidado por padrão**. Por área só se a área tiver base mínima (D-3); áreas abaixo entram em "Outras áreas". Nunca ranking de áreas: ordem alfabética.
3. Abaixo da base mínima: "Base insuficiente: N respostas. Mínimo M para publicar." sem percentual.
4. Fonte "Pesquisa de percepção" (não Acelerato); não entra em nenhum cálculo com S1 a S12; leitura "ao lado de". Filtros do painel (prioridade, nível) mostram "não se aplica a esta seção".
5. Mudança de pergunta/escala = mudança de critério, marcada com data e quebra de série (T2.6).
6. Preferências (007): cartão `s13` (id provisório) oculto/mostrado como qualquer cartão; cadência trimestral aparece como "Pesquisa de 3T/2026"; sem alerta em "Pede atenção".
7. Retorno: bloco "O que mudou por causa da pesquisa" (texto curto da coordenação por ciclo, D-7).
8. Estados: sem pesquisa carregada ("Nenhuma pesquisa carregada. Carregue o resultado do trimestre."), base insuficiente, importando, erro de arquivo (diz a coluna/linha e como corrigir), sucesso, sem permissão (se houver perfil de carga).

## Importação (tela ou ação "Carregar resultado da pesquisa")
Campos: trimestre, arquivo (CSV agregado: trimestre, área, pergunta, n por ponto da escala, convidados). Validações: sem coluna de pessoa (rejeita arquivo com e-mail/nome), soma por pergunta igual ao número de respostas, perguntas conhecidas. Reenvio do mesmo trimestre pede confirmação nomeando o trimestre ("Substituir a pesquisa de 3T/2026?") e **guarda a versão anterior** (nunca sobrescrever histórico).

## Perguntas para o arquiteto
1. Onde guardar um terceiro tipo de fonte (pesquisa) na base analítica sem tocar nas tabelas do Acelerato/BusinessMap? Nova tabela agregada trimestre x área x pergunta x faixa.
2. Importação por upload no app (exige escrita e possível perfil) ou carga por script/automação externa (T4.3)? Qual o menor desenho seguro sem login?
3. Como garantir por desenho que não há dado pessoal (LGPD): validação de colunas no import, sem log do arquivo bruto?
4. Regra de base mínima aplicada no back-end (nunca enviar percentual abaixo do mínimo no payload)?
5. Visão da biblioteca de cálculo: distribuição por faixa é cálculo simples; precisa passar por ela?
6. Versionamento de perguntas e série trimestral.

## Decisões para o usuário
- D-1: Texto das perguntas e escala (5 propostas acima).
- D-2: Quem responde (só gestor de área? mais de um por área?) e quem opera a pesquisa/carga.
- D-3: Base mínima para publicar (hipótese: 5 respostas no consolidado; por área, 3). A regra "20" do briefing se aplica?
- D-4: Comentário livre: fora do app (recomendado), importado moderado, ou motivo de insatisfação em domínio fechado?
- D-5: Existe meta de taxa de resposta? Recomendação: acompanhar sem meta.
- D-6: Sem meta de satisfação (recomendado, evita indução). Confirma?
- D-7: Bloco "O que mudou" no painel? Quem escreve?
- D-8: Lugar: Sustentação (proposto) ou Estratégico (como na proposta original)?
- D-9: Exibir por área, ou só consolidado no primeiro ciclo? (risco de identificação)
- D-10: Perfil de quem carrega o resultado (hoje não há login).
