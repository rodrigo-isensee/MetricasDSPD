# Plano de testes - integração real (frescor, calibração e /dados)
Links: `docs/ux/integracao-real/05-especificacao.md` (CA-01..CA-22), `04-prototipo.md` (W1-W6). Contrato/plano técnico: `docs/api/` e `docs/architecture/features/` (ver rastreio ao final do ciclo).

## Escopo
Selo de frescor por fonte, faixa/selo de calibração, cobertura "n de N", marcador T2.6, falhas de coleta, tela `/dados`. Fora: coleta real nas ferramentas (H3), cadastro manual de janela (H2), autenticação (pergunta 8 em aberto; CT-33 fica pendente de decisão, nunca skip).
Modos mock: `?mock=coleta-atrasada|coleta-erro|coleta-vazia|sem-calibracao` (e padrão com dados). Aviso de dados fictícios só quando `tipo === 'mock'`.
Seletores: papéis e texto da microcopy da spec; a spec não define data-testid, então o E2E não depende deles.

## Cenários
Legenda: U unitário (back/web), S sistêmico (API/Supertest), E E2E, A axe 375 e 1280. Arquivo E2E: `e2e/tests/integracao-real.spec.ts`.
| ID | CA | Cenário | Tipo | Prio | Auto |
|---|---|---|---|---|---|
| CT-01 | 01 | Cada painel mostra "Fonte", "Atualizado em" e selo com ícone+texto | E | Alta | sim |
| CT-02 | 01 | Selo nunca só cor (texto presente nos 3 estados) | E/U | Alta | sim |
| CT-03 | 02 | Visão geral: um selo BusinessMap e um Acelerato separados | E | Alta | sim |
| CT-04 | 03 | `coleta-atrasada`: "Atrasado: última coleta há {n} h" | E | Alta | sim |
| CT-05 | 03 | Limite: exatamente 1 ciclo ainda "Atual"; acima, "Atrasado" | U/S | Alta | back/web |
| CT-06 | 04 | Em calibração, painel visível + faixa `role=status` "não para cobrar" | E | Alta | sim |
| CT-07 | 04 | Selo "Em calibração" no cartão | E | Alta | sim |
| CT-08 | 05 | Cartão em calibração sem Dentro/Fora da meta; "Pede atenção" não lista suas metas | E | Alta | sim |
| CT-09 | 05 | `sem-calibracao`: status de meta volta a aparecer, sem faixa | E | Alta | sim |
| CT-10 | 06 | Não existe tela/rota/botão de cadastro de janela | E | Média | sim |
| CT-11 | 07 | Cobertura "n de N"; n<20 "Amostra insuficiente"; n=20 publica | U/E | Alta | U sim, E parcial |
| CT-12 | 08 | Marcador T2.6 com data e descrição do registro | E/U | Média | sim |
| CT-13 | 09 | `coleta-erro`: dados anteriores mantidos + "Coleta falhou em ... Mostrando dados de ..." | E | Alta | sim |
| CT-14 | 09 | `coleta-vazia`: "Ainda não há dados desta fonte" só sem nenhuma coleta ok | E | Alta | sim |
| CT-15 | 10 | Falha de BM não altera painéis do AC (e vice-versa) | E | Alta | sim |
| CT-16 | 11 | `/dados` via navegação "Dados e coletas" e via link "Entenda" | E | Alta | sim |
| CT-17 | 12 | Abas BusinessMap/Acelerato (`tablist`); troca atualiza `?fonte=bm|ac`; nenhum total somado | E | Alta | sim |
| CT-18 | 13 | Última coleta ok, última tentativa e próxima prevista por fonte | E/S | Alta | sim |
| CT-19 | 14 | Contagens lidos/novos/atualizados/arquivados/excluídos + "permanecem na base" | E/S | Alta | sim |
| CT-20 | 15 | Falhas: data, tipo, efeito; sem credencial/SQL/stack no DOM nem no JSON | E/S | Alta | sim |
| CT-21 | 16 | Histórico paginado a 20 por página; limites 0, 20, 21 itens | E/S | Média | sim |
| CT-22 | 17 | Janela vigente + "Definida automaticamente pelo sistema" | E | Média | sim |
| CT-23 | 18 | Mudanças T2.6: data, descrição, métricas afetadas | E/S | Média | sim |
| CT-24 | 19 | Nada por pessoa: sem colunas/filtros/textos de pessoa em painéis e /dados; DTO sem campos de pessoa | E/S | Alta | sim |
| CT-25 | 20 | /dados carregando (esqueleto), vazio, erro + "Tentar de novo" (recupera), sucesso | E | Alta | sim |
| CT-26 | 21 | Teclado: Tab/setas nas abas, foco visível, Enter em "Entenda" | E | Alta | sim |
| CT-27 | 21 | axe wcag2a/aa/22aa 1280 e 375 em /dados (ambas as abas e estados) e painéis nos modos coleta-* | A | Alta | sim |
| CT-28 | 21 | `prefers-reduced-motion`: sem animação no esqueleto | E | Baixa | sim |
| CT-29 | 22 | 375: tabelas em contêiner rolável focável; sem rolagem horizontal da página | E | Média | sim |
| CT-30 | 22 | 1280: tabelas sem perder colunas | E | Média | sim |
| CT-31 | - | Aviso de dados fictícios só com `tipo === 'mock'` (ausente em real) | U/E | Alta | sim |
| CT-32 | - | BM e AC nunca misturados em histograma/total/percentil na /dados | E/S | Alta | sim |
| CT-33 | - | /dados sem permissão ("Você não tem acesso a esta tela") | E | Média | pendente (decisão do arquiteto) |
| CT-34 | - | Entradas inválidas: `?fonte=xyz` cai em BusinessMap sem erro; `?mock=` desconhecido ignorado; página fora do intervalo | E | Média | sim |
| CT-35 | - | Falha da API na /dados (500) mostra erro com recuperação, sem stack | E | Alta | sim |

## Dados de teste
Modos `?mock=` do front (padrão, `coleta-atrasada`, `coleta-erro`, `coleta-vazia`, `sem-calibracao`) e interceptação de rede (`page.route`) para 500 e histórico de 0/20/21 itens.

## Resultado da execução
Pendente: os E2E rodam quando F1-F7 forem concluídos (Q1 entrega apenas plano e especificação de testes).
