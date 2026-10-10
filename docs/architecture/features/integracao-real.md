# Plano técnico: Integração real (K-034), frescor, calibração e `/dados`

- Spec: `docs/ux/integracao-real/05-especificacao.md` (CA-01 a CA-22). Decisões: `docs/alinhamentos/2026-10-10-decisoes-do-usuario.md` §2 e §5.
- Escopo: etapa mock. Coleta real (002) fica fora; este plano fixa o contrato que o 002 vai servir.
- Arquitetura do front: `docs/tecnica/arquitetura-front.md` (porta única `FonteMetricas`).

## 1. Decisões
| # | Decisão | Motivo |
|---|---|---|
| D1 | **Frescor vai no corpo de um recurso próprio** (`EstadoColeta` por fonte), não em cabeçalho. O `X-Ultima-Coleta` sai do rascunho do 002; o corpo das métricas continua sem envelope. | Cabeçalho não é tipado em `contratos`, não é validável com zod, o mock não o reproduz, exige `Access-Control-Expose-Headers` e repete o mesmo dado em 30 respostas. Um recurso por fonte serve selo, faixa e `/dados` com um só cache do React Query. |
| D2 | Selo, janela de calibração e `metricasEmCalibracao` são **calculados em `packages/metricas`** e chegam prontos no DTO. O front só exibe. | Regra única (T2.5), servidor e mock usam o mesmo código. |
| D3 | Janela = **60 dias corridos** (constante única `DURACAO_CALIBRACAO_DIAS`), aberta (a) na primeira coleta ok de cada fonte, para todas as métricas da fonte, e (b) em cada `VersaoCriterio`, só para `afeta` que pertencem à fonte. Intervalo fechado `[inicio, inicio + 59]`. | §5 das decisões (provisória, a confirmar pelo usuário). |
| D4 | Coletas do mock ficam **fora da `BaseMock`** (`gerarColetasMock`, PRNG `derivar(semente, 'coletas')`). | Hash da base (`924448d4`, `b2bfd4c0`) não muda. |
| D5 | Aviso de dados fictícios renderizado só se `useFonte().tipo === 'mock'`. | Corrige a pendência da arquitetura-front §5.3. |
| D6 | `/dados` sem autenticação nesta etapa, como os painéis. Sem estado "sem permissão" agora. | Não há autenticação no produto; entra com a ADR de autenticação. |

## 2. Contrato novo em `@metricas-dspd/contratos` (`src/coletas.ts`)
Esqueleto (o `node-backend` fecha os nomes finais):
```ts
export const resultadoColetaSchema = z.enum(['ok', 'parcial', 'falha'])
// Tipo de erro seguro: só categoria; nunca mensagem, SQL, stack ou credencial (CA-15).
export const tipoErroColetaSchema = z.enum(['indisponivel', 'autenticacao', 'tempo-esgotado', 'dados-invalidos', 'desconhecido'])
export const contagensColetaSchema = z.object({
  lidos: z.number(), novos: z.number(), atualizados: z.number(),
  arquivadosPreservados: z.number(), excluidosPreservados: z.number(),
})
export const eventoColetaSchema = z.object({
  id: z.string(), inicio: z.string(), fim: z.string(), duracaoMs: z.number(),
  resultado: resultadoColetaSchema,
  tipoErro: tipoErroColetaSchema.nullable(),           // null quando ok
  efeito: z.enum(['aplicada', 'parcial-aplicada', 'anteriores-mantidos']),
  contagens: contagensColetaSchema.nullable(),          // null quando falha
}).strict()
export const janelaCalibracaoSchema = z.object({
  inicio: z.string(), fim: z.string(),
  origem: z.enum(['inicio-coleta', 'criterio']), criterioId: z.string().nullable(),
  metricas: z.array(z.enum(METRICA_IDS)),
}).strict()
export const seloFrescorSchema = z.enum(['atual', 'atrasado', 'falha', 'sem-coleta'])
export const estadoColetaSchema = z.object({
  dominio: z.enum(['businessmap', 'acelerato']),
  selo: seloFrescorSchema,
  horasDesdeUltimaOk: z.number().nullable(),
  ultimaOk: eventoColetaSchema.nullable(),
  ultimaTentativa: eventoColetaSchema.nullable(),
  proximaPrevista: z.string(),
  falhasRecentes: z.array(eventoColetaSchema),         // 14 dias, resultado != ok
  calibracao: z.array(janelaCalibracaoSchema),         // só as vigentes
  metricasEmCalibracao: z.array(z.enum(METRICA_IDS)),
}).strict()
export const paginaColetasSchema = z.object({
  itens: z.array(eventoColetaSchema), pagina: z.number(),
  porPagina: z.literal(20), total: z.number(),
}).strict()
```
- `.strict()` em todos: campo extra (ex.: pessoa) reprova a validação (CA-19, pergunta 9).
- Uma fonte por objeto; não existe DTO com as duas somadas (CA-12).
- Histórico T2.6: reusa `VersaoCriterio` e `FonteMetricas.criterios()` (já existem).

## 3. `FonteMetricas` e `MockFonteMetricas`
```ts
interface FonteMetricas {
  // ...atual
  estadoColeta(dominio: Dominio): Promise<EstadoColeta>
  historicoColetas(dominio: Dominio, pagina: number): Promise<PaginaColetas> // mais recente primeiro
}
```
- Hooks: `useEstadoColeta(dominio)` (chave `['coleta', dominio]`, compartilhada por selo, faixa, cartões e `/dados`) e `useHistoricoColetas(dominio, pagina)`.
- `packages/mock/src/coletas.ts`: `gerarColetasMock(config, base)` determinístico. Usa a base só para ler contagens (lidos, arquivados, excluídos reais), nunca a altera. Cenário padrão com `hoje = 2026-10-09T18:00-03:00`:
  - **BusinessMap**: coletas diárias às 06:00 desde 2026-01-05, todas ok, **exceto 09/10 06:00 = falha `tempo-esgotado`**; última ok 08/10. Selo "Falha", dados de 08/10 mantidos.
  - **Acelerato**: primeira coleta ok em 2026-09-15, diárias ok. **Janela de calibração vigente 15/09 a 13/11** para todas as métricas S* e `EI_SUST`. Selo "Atual".
  - Os critérios do mock (03/2026 e 06/2026) já venceram os 60 dias: nenhuma janela por critério no cenário padrão (o caso fica coberto no unitário).
- `?mock=` (só com `tipo === 'mock'`), novos modos: `coleta-atrasada:bm|ac`, `coleta-vazia:bm|ac`, `coleta-erro:bm|ac` (falha de leitura do recurso, para o "Tentar de novo"), `sem-calibracao` (para testes que verificam status de meta no Acelerato).
- `HttpFonteMetricas` (futuro): `GET /api/v1/fontes/:dominio/estado`, `GET /api/v1/fontes/:dominio/coletas?pagina=`, `GET /api/v1/criterios`.

## 4. Cálculo em `packages/metricas`
- `core/calibracao.ts`: `DURACAO_CALIBRACAO_DIAS = 60` (único lugar do número); `janelasCalibracao(dominio, primeiraOk, versoes, metricasDoDominio)`; `vigentes(janelas, hojeIso)`; `metricasEmCalibracao(vigentes)`. Critério que afeta as duas fontes abre janela só nas métricas de cada fonte (nunca mistura).
- `core/frescor.ts`: `HORARIO_COLETA = '06:00'` (America/Sao_Paulo), `TOLERANCIA_ATRASO_HORAS` (provisória 0, ver §7), `proximaColeta(agora)`, `seloFrescor(ultimaOk, ultimaTentativa, agora)`. Precedência: `sem-coleta` > `falha` (última tentativa falhou) > `atrasado` (agora > próxima prevista após a última ok + tolerância) > `atual`.
- `montarEstadoColeta(dominio, eventos, versoes, agora)`: junta tudo e devolve `EstadoColeta`. Usado pelo mock e, depois, pela API.

## 5. Onde aparece na UI
| Lugar | O que | CA |
|---|---|---|
| Cabeçalho de FL1, FL2, FL3 (BM) e Sustentação (AC) | "Fonte: X · Atualizado em ..." + `SeloFrescor` (ícone + texto) + link "Entenda" → `/dados?fonte=bm|ac` | 01, 03, 09, 11 |
| Visão geral | Dois `SeloFrescor`, um por fonte, separados | 02, 10 |
| Abaixo do cabeçalho | `FaixaCalibracao` (`role="status"`) quando `calibracao` não vazio | 04 |
| `CartaoMetrica` | Se `id ∈ metricasEmCalibracao`: selo "Em calibração", sem Dentro/Fora; "Pede atenção" filtra essas metas | 05 |
| Cartão | Cobertura "n de N" com `baseAmostral.n` e `complemento`; n < 20 já é "Amostra insuficiente" (`Estatistica`) | 07 |
| Gráficos | Marcadores T2.6 existentes (`criterios.serie`) | 08 |
| Navegação global | Item "Dados e coletas" → rota lazy `/dados` com `?fonte=bm|ac` (padrão `bm`) | 11 a 22 |
| `AppShell` | `AvisoDadosFicticios` só com `tipo === 'mock'` (vale para `/dados`) | D5 |

## 6. Testes (meta 100% de linhas, ramos e funções, `docs/qa/estrategia-de-cobertura.md`)
- **Unitário**: `calibracao` (abertura por início e por critério, borda dia 59/60, critério das duas fontes, constante única) e `frescor` (cada selo, precedência, virada de dia, fuso) com testes de propriedade (janela sempre 60 dias; selo total). `gerarColetasMock`: determinístico (hash próprio), **hash da base inalterado** (`924448d4`/`b2bfd4c0`). Schemas: rejeitam campo extra. Componentes: `SeloFrescor`, `FaixaCalibracao`, cartão em calibração, abas e tabelas de `/dados`, aviso com fonte `tipo: 'api'` falsa (não renderiza).
- **Sistêmico** (`*.sistemico.test.tsx`): mock → metricas → `MockFonteMetricas` → hooks → UI; saída de `estadoColeta`/`historicoColetas` validada pelos schemas zod; falha de BM não altera Sustentação (CA-10).
- **E2E** (Playwright): selo em cada painel e dois na Visão geral; faixa e cartões em calibração na Sustentação; `/dados` abas com `?fonte`, paginação 20, falha de 09/10 listada, estados via `?mock=coleta-*`, "Tentar de novo"; axe sem violações; 375 e 1280.
- Testes atuais que verificam status de meta no Acelerato passam a usar `?mock=sem-calibracao` ou mudam a expectativa.

## 7. Riscos e pendências
- R1: regra de 60 dias e gatilhos são provisórios (§5); a tolerância de "Atrasado" é **pergunta ao usuário** (constante provisória 0 h após a próxima prevista).
- R2: calibração do AC no cenário padrão esconde status de meta da Sustentação; impacta testes existentes (ver §6).
- R3: o 002 precisa persistir `evento_coleta` e servir os três GET; contrato do 002 deve remover `X-Ultima-Coleta` (D1).

## 8. Cartões (ordem; `||` = paralelo)
| # | Agente | Cartão | Depende |
|---|---|---|---|
| B1 | node-backend | Schemas de `contratos/src/coletas.ts` + testes | - |
| B2 | node-backend | `core/calibracao.ts`, `core/frescor.ts`, `montarEstadoColeta` + unitários e propriedade | B1 |
| B3 | node-backend | `mock/src/coletas.ts` (cenário §3) + teste de hash | B1 (`||` B2) |
| B4 | node-backend | Atualizar `docs/api/metricas.md` do 002: tirar `X-Ultima-Coleta`, criar `docs/api/fontes.md` | B1 |
| F1 | react-frontend | `FonteMetricas` + `MockFonteMetricas` (2 métodos), hooks, modos `?mock=coleta-*` e `sem-calibracao` | B2, B3 |
| F2 | react-frontend | `AvisoDadosFicticios` condicional a `tipo` | - |
| F3 | react-frontend | `SeloFrescor` + cabeçalho dos 4 painéis + 2 selos na Visão geral | F1 |
| F4 | react-frontend | `FaixaCalibracao` + cartão "Em calibração" + filtro do "Pede atenção" | F1 (`||` F3) |
| F5 | react-frontend | Rota `/dados`, item de navegação, abas com `?fonte`, estados carregando/vazio/erro | F1 (`||` F3, F4) |
| F6 | react-frontend | `/dados`: Última coleta, Contagens, Janela de calibração | F5 |
| F7 | react-frontend | `/dados`: Falhas recentes, Histórico paginado, Mudanças de critério | F5 (`||` F6) |
| Q1 | qa-engineer | Plano de testes + E2E + axe + ajuste dos testes de meta da Sustentação | plano: B1; execução: F3 a F7 |

## 9. Respostas às perguntas do UX
1. Janela: 60 dias corridos, automática, por fonte, aberta na primeira coleta ok e em cada mudança de critério (só métricas afetadas da fonte). Calculada em `packages/metricas`; registrada pelo 002 junto aos eventos de coleta. Provisória até o usuário confirmar (§5).
2. Sim: `EventoColeta` por fonte com início, fim, resultado, `tipoErro` seguro e contagens. Histórico nunca é apagado (retém tudo); `falhasRecentes` traz 14 dias; histórico paginado em 20.
3. Recurso dedicado por fonte (`estadoColeta`), usado pelos painéis e por `/dados`; histórico em chamada separada paginada. Frescor no corpo, não em cabeçalho (D1).
4. Do agendador: diária às 06:00 (America/Sao_Paulo), `proximaPrevista` no DTO. Tolerância do "Atrasado" é pergunta ao usuário (provisória 0 h).
5. Sim: `criterios()` (já existe) com data, descrição e `afeta`.
6. Parcial: `baseAmostral.n` e `complemento` existem; "n de N" usa os dois; n < 20 já vem como insuficiente.
7. Sim: as contagens são gravadas no próprio evento de coleta no momento da carga (agregado), sem varrer o histórico.
8. Sem autenticação nesta etapa (D6); estado "sem permissão" não é implementado agora.
9. Schemas `.strict()` sem nenhum campo de pessoa; teste rejeita campo extra.
10. Sim: cenário padrão (falha no BM, calibração no AC) mais `?mock=coleta-atrasada|coleta-vazia|coleta-erro:bm|ac` e `sem-calibracao`.
