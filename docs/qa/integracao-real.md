---
contrato: 0
---
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
### Execução Q1 (2026-10-10)
Ambiente: Chromium local, `vite preview` com `VITE_MOCK_LATENCIA=0`, branch `feature/integracao-real`.
- E2E completo (chromium + semente-alt): 226 testes, 222 passaram na primeira rodada. As 4 falhas:
  - CT-08: a regex pegava "Meta: Acima de 90%" e a nota da meta, que são a definição da meta e não o status; teste ajustado para exigir o status exato. Mudança esperada, não é bug.
  - CT-17: a aba BusinessMap já vem ativa, então clicar nela não grava `?fonte=bm`; teste agora começa pela outra aba. Não é bug.
  - CT-24: o aviso passou a dizer "Esta tela mostra apenas o estado das coletas. Não há informação por pessoa."; texto do teste atualizado.
  - FIL-03 (`filtros.spec.ts`): falhou em paralelo e passou isolada; instável sob carga, a observar (sem skip).
  - Depois dos ajustes: `integracao-real.spec.ts` 45/45.
- axe (wcag2a/aa/22aa), claro e escuro, 7 rotas (`/dados` BM e AC, erro, vazio, `/sustentacao`, selo atrasado, coleta falha) em `integracao-real-evidencias.spec.ts`: 24/24, zero violações críticas ou sérias.
- `test:perf`: 4 falhas de CLS (375 em `/`, `/sustentacao`, `/espera-invisivel`; desktop `/` uma vez, instável) e 7 não executados por ser série. Bug IR-001 (média, react-frontend).
- CT-33 (sem permissão): fora de escopo desta etapa, não há autenticação.
- Evidências: `docs/qa/evidencias/integracao-real/` (/dados BM e AC, faixa de calibração, selo atrasado e falha; 1280 claro e 375 escuro).
- Não executados: testes unitários de back e front (fora do escopo pedido).

Veredito: aprovado com ressalva. Funcional e acessibilidade ok; pendente o IR-001 (CLS mobile) e a conferência da perf completa após a correção.

### Revisão 2 (2026-10-10, após K-061/K-062; build novo, Chromium local, portas 4173/4174)
- `npm run pronto`: verde (back 17+343, 107, 445 no front etc.). `npm run gate` (e2e): APROVADO (base mock idêntica, bundle ok).
- E2E completa (chromium + semente-alt), 2 workers: 250/250 antes de acrescentar CT-34. Com workers padrão (paralelismo alto) houve 9 falhas (axe, FIL-03/04, OP-10/11, A11Y-03) que passaram isoladas e com 2 workers: instabilidade por carga da máquina (WSL), registrada, sem skip.
- axe: zero violações críticas ou sérias nas rotas de `integracao-real-evidencias` e CT-27 (inclui `/operacional` com falha de coleta).
- `test:perf` (CLS a 375): 0,000 a 0,007 em todas as rotas, orçamento 0,1. **IR-001 fechado.** Desktop: CLS 0,021 ok; C6 (tarefa longa < 200 ms) em `/` falhou em 3 de 4 rodadas (204 a 323 ms), outras rotas ok. Não relacionado a CLS; reportado como instável/limite apertado em máquina carregada, não alterado.
- Capturas UX (`docs/qa/evidencias/integracao-real/`): M-1 `m1-selo-falha-coleta-falhou-*.png` (selo Falha + "Coleta falhou em ... Mostrando dados de ..."); M-2 `m2-pede-atencao-omitidos-*.png` (aviso de itens omitidos visível, sem "Verificando..."); `selo-falha-*` refeitas em `/operacional`. As antigas usavam `?mock=coleta-erro:bm`, que é falha de leitura, não de coleta.
- Novo: **IR-002** (média, react-frontend): `?mock=coleta-erro:bm` fica em "Verificando a coleta..." e não mostra "Tentar de novo". CT-34 falha de propósito (sem skip).

Veredito: aprovado com ressalva. IR-001 fechado; aberto IR-002 (média) e a instabilidade de C6 em `/`; sem bugs críticos ou altos.
