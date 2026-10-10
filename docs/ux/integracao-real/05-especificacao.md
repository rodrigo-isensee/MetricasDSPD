# Integração real: frescor, calibração e tela /dados (especificação final)

Etapas anteriores: `01-empatia.md`, `02-definicao.md`, `03-ideacao.md` (alternativa A), `04-prototipo.md`. Protótipos: `docs/ux/figma/prototipos/integracao-real-*.html` e `dados-*.html`.

## Validação do usuário (2026-10-10, ver `docs/alinhamentos/2026-10-10-decisoes-do-usuario.md` §2)
Decisão: **aprovado com ajustes**. Demanda apta a "Pronto para fazer".
| Hipótese | Decisão | Efeito na especificação |
|---|---|---|
| H1 Painel durante a calibração | Sempre visível, com "dados de calibração, não cobrar" | Faixa W2 mantida; nunca esconder painel (CA-04) |
| H2 Quem registra a janela | Automática, sem cadastro manual | Sem tela de cadastro; /dados só exibe a janela vigente (CA-05, CA-17) |
| H3 Cadência | Diária; integração real com as ferramentas vem depois | "Atrasado" = passou 1 ciclo diário (CA-03); coleta real fica fora deste escopo |
| H4 Tela /dados | Sim | Tela nova (CA-11 a CA-18) |

## Objetivo
Dar a quem lê os painéis a idade e a confiabilidade de cada fonte (BusinessMap e Acelerato, sempre separadas), sinalizar dados de calibração sem cobrar ninguém e oferecer a tela `/dados` para conferir coletas, falhas e mudanças de critério.

## Personas / contexto de uso
Leitor dos painéis (liderança, tech lead; desktop e celular, diário) e responsável pelos dados/governança (desktop, ao suspeitar de número estranho). Nenhum uso por pessoa avaliada.

## Fluxo
1. Abre um painel: vê o selo de frescor da fonte e, se houver, a faixa de calibração. Os dados aparecem sempre.
2. Clica "Entenda" no selo ou "Dados e coletas" na navegação: vai a `/dados`.
3. Em `/dados` escolhe a fonte (aba), confere última coleta, contagens, falhas, janela de calibração e mudanças de critério.
4. Erro: falha de coleta mantém dados anteriores com aviso; falha de leitura da API oferece "Tentar de novo".

## Telas
### Painéis (alterações) — W1 a W6 do `04-prototipo.md`
- Cabeçalho: "Fonte: {fonte} · Atualizado em {data hora}" + selo Atual / Atrasado / Falha (ícone + texto).
- Faixa de calibração (`role="status"`) por fonte; cartões com selo "Em calibração" e sem status de meta; "Pede atenção" não lista metas de cartões em calibração.
- Cartão com cobertura (W3), marcador de critério (W4), quatro estados de falha (W5), Visão geral com um selo por fonte (W6).

### /dados — Dados e coletas
```
Dados e coletas                                  [aviso] Nenhuma informação por pessoa nesta tela.
[ BusinessMap ] [ Acelerato ]        (abas; nunca somadas)
+ Última coleta ----------------------------------------------+
| Selo Atual/Atrasado/Falha · Última coleta ok 09/10 06:10     |
| Última tentativa: ok · Próxima prevista: 10/10 06:00         |
+ Contagens (última coleta ok) --------------------------------+
| Cards lidos 1.240 · Novos 18 · Atualizados 61 · Arquivados mantidos 212 · Excluídos mantidos 9 |
+ Calibração ---------------------------------------------------+
| Janela vigente: 15/09 a 14/11/2026 (definida automaticamente) |
+ Falhas recentes (14 dias) -------------------------------------+
| tabela: data, tipo de erro, o que acontece com os dados |
+ Histórico de coletas -----------------------------------------+
| tabela: data/hora, resultado, itens lidos, duração |
+ Mudanças de critério (T2.6) ------------------------------------+
| tabela: data, descrição, métricas afetadas, link Ver critérios |
```
- Componentes: abas, selo, cartão, tabela, nota, chip (existentes no design system).
- Estados: carregando (esqueleto); vazio por fonte "Ainda não há coletas desta fonte"; erro "Não foi possível carregar os dados desta fonte" + "Tentar de novo"; sucesso; sem permissão (se houver autenticação: "Você não tem acesso a esta tela"; hipótese, depende do arquiteto).
- Interações: troca de aba atualiza `?fonte=bm|ac` na URL; tabelas paginadas (20 por página); sem ordenar/filtrar por pessoa; sem exportar.
- Sem nenhum campo de pessoa, equipe-ranking ou comparação entre fontes.

## Necessidades de dados
Por fonte: última coleta ok (timestamp), última tentativa (timestamp, resultado ok/parcial/falha), próxima prevista, contagens por coleta (lidos, novos, atualizados, arquivados e excluídos preservados), falhas recentes (data, tipo de erro sem detalhe sensível, efeito), histórico paginado de coletas, janela de calibração vigente (início, fim, origem automática), cobertura por métrica ("n de N"). Global: registro de mudanças de critério (data, descrição, métricas afetadas). Tudo agregado por fonte; nada por pessoa.

## Microcopy
Títulos: "Dados e coletas", "Última coleta", "Contagens da última coleta", "Janela de calibração", "Falhas recentes", "Histórico de coletas", "Mudanças de critério". Janela: "Definida automaticamente pelo sistema. Dados de calibração servem para ajustar o processo, não para cobrar pessoas ou times." Selos e faixas conforme `04-prototipo.md` (W1, W2, W5). Falha: "Coleta falhou em {data}. Mostrando dados de {data}." Aviso: "Esta tela mostra apenas o estado das coletas. Não há informação por pessoa." Vazio: "Ainda não há coletas desta fonte. A primeira coleta acontece no próximo ciclo diário." Contagem: "Arquivados e excluídos permanecem na base."

## Critérios de aceite
- CA-01 Todo painel mostra "Fonte", data/hora da última coleta ok e selo com ícone e texto (nunca só cor).
- CA-02 Visão geral mostra um selo por fonte, em separado (BusinessMap e Acelerato).
- CA-03 Atrasado quando passou 1 ciclo diário sem coleta ok; texto "Atrasado: última coleta há {n} h".
- CA-04 Em calibração o painel permanece visível, com faixa "Dados de calibração... não para cobrar" e selo no cartão.
- CA-05 Em calibração o cartão não exibe Dentro/Fora da meta e "Pede atenção" não lista suas metas.
- CA-06 Janela de calibração é definida e registrada pelo sistema; não existe tela de cadastro manual.
- CA-07 Cartão com cobertura parcial mostra "n de N"; n < 20 mostra "Amostra insuficiente".
- CA-08 Marcador de mudança de critério (T2.6) no gráfico com data e descrição do registro oficial.
- CA-09 Falha de coleta mantém dados anteriores e avisa; nunca coleta ok implica "Ainda não há dados desta fonte".
- CA-10 Falha de uma fonte não altera painéis da outra.
- CA-11 Rota `/dados` acessível pela navegação e pelo link "Entenda".
- CA-12 `/dados` tem abas BusinessMap e Acelerato; nenhum total, gráfico ou tabela mistura as duas.
- CA-13 Por fonte: última coleta ok, última tentativa com resultado, próxima prevista.
- CA-14 Por fonte: contagens de lidos, novos, atualizados, arquivados e excluídos preservados.
- CA-15 Falhas recentes listam data, tipo de erro e efeito, sem detalhe sensível (credenciais, SQL, stack).
- CA-16 Histórico de coletas paginado (20 por página).
- CA-17 Mostra a janela de calibração vigente com a nota "definida automaticamente".
- CA-18 Lista as mudanças de critério T2.6 com data, descrição e métricas afetadas.
- CA-19 Nenhum dado, filtro, coluna ou texto por pessoa em painéis e em `/dados`.
- CA-20 Estados carregando, vazio, erro e sucesso na `/dados`, com "Tentar de novo" no erro.
- CA-21 WCAG 2.2 AA: teclado, foco visível, contraste 4,5:1, alvos ≥ 24 px, abas com `role="tablist"`, faixa `role="status"`, tabelas com cabeçalho e legenda, `prefers-reduced-motion`.
- CA-22 Responsivo em 375 e 1280: tabelas rolam em contêiner com foco e sem perder colunas essenciais.

## Perguntas para o arquiteto
1. Qual a regra da janela automática de calibração (por exemplo, N dias após a primeira coleta, por fonte)? Quem a define e onde fica registrada? (Regra de negócio: confirmar com o usuário, não inferir.)
2. Existe `evento_coleta` por fonte com início, fim, resultado (ok/parcial/falha), tipo de erro seguro e contagens (lidos, novos, atualizados, arquivados, excluídos)? Retenção mínima de 14 dias para falhas e histórico paginado?
3. Endpoint dedicado `/dados` (por fonte) ou parte do payload dos painéis? O selo dos painéis precisa só de última coleta ok e resultado.
4. Próxima coleta prevista: vem do agendador? Qual o horário diário e a tolerância para "Atrasado"?
5. O registro de mudanças de critério (T2.6) é servido pela API com métricas afetadas?
6. Cobertura "n de N" por cartão está disponível na API?
7. Contagens de arquivados e excluídos preservados saem da base analítica sem varrer o histórico (agregado pré-calculado)?
8. Controle de acesso: `/dados` exige autenticação ou perfil? O que muda no estado "sem permissão"?
9. Garantia de que nenhum campo de pessoa aparece no DTO de `/dados`.
10. Enquanto não há integração real, o mock simula todos os estados (`?mock=`), incluindo `/dados`?
