# Preferências de métricas · Viabilidade técnica

Autor: `software-architect` · Data: 2026-10-10 · Entrada: `03-ideacao.md`, protótipo `04-prototipo/`, pedido 007.
Estado do código considerado: `web/src/data/FonteMetricas.ts`, `web/src/features/filtros/paineis.ts` (parâmetros por painel e 2.6.1), `packages/contratos/src/comum.ts` (`METRICA_IDS`).
Observação: **a ADR de autenticação ainda não existe** (está prevista no pedido 002). Este documento assume OIDC corporativo como hipótese e não cria a ADR; a migração descrita abaixo vale para qualquer identidade estável (`sub`).

## 1. Viabilidade por alternativa

| Alt. | Viável? | Dados necessários | Esforço relativo | Observação técnica |
|---|---|---|---|---|
| A1 Página `/preferencias` | Sim | Catálogo de cartões por painel (id, rótulo, seção) | Médio (M) | Renderização direta do catálogo; nenhum dado de métrica é lido |
| A2 Modo "Editar painel" | Sim, caro | Idem + estado de edição | Alto (G) | Duplica o painel em dois modos; mais estados e testes. Não recomendado |
| A3 Predefinições | Sim | Catálogo + lista de predefinições versionada | M+ | Predefinição é só um conjunto de `ocultar` pronto; nenhum vínculo a papel/pessoa. Depende de D-a |
| B1 Botão "Métricas: n de m" | Sim | Catálogo do painel atual | P-M | Reaproveita o popover/folha dos filtros |
| B2 "Ocultar" no menu do cartão | Sim | Id do cartão | P | Precisa de B1 ou da faixa para restaurar (já previsto) |
| B3 Índice lateral | Sim, caro | Catálogo | M-G | Exige layout novo (sem sidebar, D1). Não recomendado |
| C1 URL sem seleção | Sim | n/a | P | Simples, mas quebra "mesma visão" |
| C2 URL sempre com seleção | Sim | n/a | P | Vaza o perfil pessoal. **Rejeitado** por privacidade |
| C3 Híbrido (`ocultar` só do recorte na hora) | Sim | Catálogo para validar ids | P-M | Recomendado; regras na seção 4 |

## 2. Fonte única: catálogo de cartões (pré-requisito de tudo)
Card não é o mesmo que `MetricaId`: há cartões com abas, pares "leia junto" e cartões que juntam mais de uma métrica (ex.: Bloqueados). Por isso o catálogo é uma lista própria, **de cartões**, em `@metricas-dspd/contratos`, consumida por painel, perfil, URL e testes:

```ts
// packages/contratos/src/cartoes.ts (esqueleto)
export interface CartaoCatalogo {
  id: CartaoId            // minúsculo, estável, igual ao usado na URL: 'o9', 't5', 'bloqueados'
  painel: PainelId        // operacional | tatico | estrategico | sustentacao (espera-invisivel: ver D-f)
  secao: string           // id da seção (h2) do painel
  metricas: MetricaId[]   // métricas que o cartão exibe (para alertas e critério, seção 5)
  leiaJunto?: CartaoId[]  // pares T1/T4 etc.
}
export const CATALOGO_CARTOES: readonly CartaoCatalogo[] = [/* ... */]
```
Dono: `node-backend` define o contrato (é tipo compartilhado); `react-frontend` usa. `PainelId` sai de `web/src/features/filtros/paineis.ts` e passa para o pacote de contratos. Ids **retirados** ficam numa lista `CARTOES_RETIRADOS` (seção 6).

## 3. Persistência e identidade

**Agora (mock, sem login): localStorage, chave `metricas-dspd:preferencias:v1`.** Aceitável: o dado é escolha de interface, não identifica ninguém e não sai do navegador. Uma porta no front isola a origem:

```ts
export interface PreferenciasMetricas {
  versao: 1
  paineis: Partial<Record<PainelId, { ocultar: CartaoId[] }>>   // guarda OCULTOS: cartão novo aparece
  atualizadoEm: string                                          // ISO, só para resolver conflito na migração
}
export interface FontePreferencias {
  readonly origem: 'navegador' | 'conta'
  obter(): Promise<PreferenciasMetricas>      // ausente ou inválido -> padrão (tudo visível)
  salvar(p: PreferenciasMetricas): Promise<void>
}
```
Tipo e schema zod em `@metricas-dspd/contratos`; `LocalStoragePreferencias` hoje, `HttpPreferencias` depois. **A tela não muda**, só a implementação injetada e o texto "Salvas neste navegador" → "Salvas na sua conta".

**Depois (com login, pedido 002 + ADR de autenticação):** tabela no MySQL da aplicação:

```
preferencia_metricas (
  usuario_sub    VARCHAR(255) PK   -- 'sub' do token OIDC; sem nome, e-mail ou matrícula
  versao         SMALLINT
  dados          JSON              -- PreferenciasMetricas validado por zod
  atualizado_em  DATETIME
)
```
- Endpoints `GET` e `PUT /api/v1/me/preferencias-metricas`, **sem parâmetro de usuário**: a chave vem só da sessão. Não existe rota que receba id de outra pessoa, nem rota de listagem ou agregação. Impossível por desenho consultar preferência alheia.
- Migração: no primeiro login, se houver localStorage e a conta estiver vazia, o front oferece "Levar suas preferências deste navegador para a sua conta" (ou envia em silêncio, a decidir pelo UX); depois apaga a chave local. Mesmo tipo, zero retrabalho de contrato.
- LGPD: `sub` é dado pessoal pseudônimo; mínimo necessário. Exclusão: `DELETE /me/preferencias-metricas` e remoção junto com a conta. Sem histórico (sobrescreve; a regra "nunca sobrescrever histórico" é da base analítica, não de preferência de interface).
- **API desde já?** Não: sem identidade, a única chave possível seria um id de navegador gerado, que é um identificador persistente sem ganho funcional sobre o localStorage. API só com o login.

## 4. Parâmetro `ocultar` na URL e a regra 2.6.1
- Formato: `ocultar=o9,o10` (ids do catálogo, minúsculos, ordenados, sem repetição). Lista de **ocultos**, nunca de visíveis.
- Precedência na visita: `ocultar` presente substitui o perfil; `ocultar=` vazio força todas visíveis; ausente vale o perfil de quem abre.
- Entra em `params` de cada painel que tem cartões (operacional, tatico, estrategico, sustentacao), portanto vira parâmetro **conhecido**. Consequências pela 2.6.1:
  - Em painel que não usa (`/`, `espera-invisivel` se ficar fora): removido em silêncio com `replaceState`.
  - Valor com id inexistente ou de outro painel: ignora só esse id, mostra o aviso de "Alguns filtros do link não existem e foram ignorados" (critério 24) e corrige a URL. Id em `CARTOES_RETIRADOS`: removido em silêncio.
  - **Não entra na memória de sessão dos filtros** (`memoria.tsx`) e não é carregado pelos links de navegação entre painéis: é por painel e por visita.
- Sem colisão com os parâmetros de estado de cartão já existentes (`o2`, `o9`, `t1`...): os ids aparecem como valor de `ocultar`, não como chave. Se um cartão está oculto, seu parâmetro de estado (ex.: aba `o2=`) permanece na URL (não se perde ao restaurar).
- "Copiar link" inclui `ocultar` só se a seleção foi alterada na sessão (C3).

## 5. Impacto na `FonteMetricas`
**Recomendação: a preferência é aplicada só na renderização. A `FonteMetricas` não muda e continua calculando tudo.**
- Simplicidade: nenhum parâmetro novo em `obter`, cache e testes de dados intactos; preferência fica 100% em `web/`.
- Correção: a faixa "Pede atenção", os itens da Visão geral e os avisos de mudança de critério leem o resultado completo; se a métrica oculta não fosse calculada, o alerta sumiria (viola a regra 1 da ideação). `criterios()` já é independente de cartão.
- Custo: no mock é desprezível; com `HttpFonteMetricas`, o ganho de não buscar um cartão é pequeno frente ao orçamento da ADR 0003 e não justifica a complexidade. Otimização aceitável depois, se medida: **não montar** o componente do gráfico oculto (economiza render/lib de gráficos) mas manter a busca de dados que alimenta alertas. Nunca cortar o payload no servidor por preferência.
- Hoje cada cartão chama `obter` ao montar? Se sim, os alertas precisam de uma busca que não dependa do cartão estar montado (verificar no plano técnico; ajuste pequeno no hook da faixa).

## 6. Versionamento
- `versao` no objeto; schema zod com `.catch` para padrão: preferência corrompida nunca quebra o painel, vira "tudo visível".
- Perfil com id inexistente: **ignorar em silêncio** e limpar no próximo `salvar`. URL com id inexistente: aviso (seção 4); retirado conhecido: silêncio.
- Renomear id de cartão = retirar o antigo e mapear em `CARTOES_RETIRADOS: { antigo: novo | null }`, aplicado na leitura.
- Cartão novo: aparece visível para todos (é o motivo de guardar ocultos).

## 7. Riscos
| Risco | Mitigação |
|---|---|
| Link compartilhado esconde métrica relevante do destinatário | Faixa "Este link oculta n métricas. Mostrar todas · Usar minhas preferências"; perfil nunca vai na URL |
| Alerta de métrica oculta some | Preferência só na renderização (seção 5); teste E2E específico com O2 oculta |
| Aviso de critério de cartão oculto some | Mapa cartão → `metricas` no catálogo cruza com `criterios()` |
| Preferência vira dado sobre pessoa | Sem telemetria de preferência, sem log de corpo de `PUT` (log só status e correlation id), sem rota de listagem; registrar como regra no plano técnico |
| Catálogo divergente entre front, perfil e URL | Fonte única em `@metricas-dspd/contratos` + teste unitário que confere todo cartão renderizado contra o catálogo |
| Explosão de combinações em E2E | Fixture de preferência (abaixo) e casos selecionados, não combinatória |
| Ocultar todos os cartões | Estado vazio "Mostrar todas" (D-e) |

**E2E/QA:** pré-carregar `localStorage` via `page.addInitScript` com a chave `metricas-dspd:preferencias:v1` (fixture tipada com `PreferenciasMetricas`); para o caso de URL, só `?ocultar=`. Não criar parâmetro de mock dedicado: o próprio `ocultar` já fixa o estado por visita. Isolamento por contexto do Playwright garante perfil limpo por teste.

## 8. Recomendação
**A1 + B1 + B2 + C3**, com A3 só se D-a for aprovada (encaixa sem mudar contrato: predefinição = conjunto de `ocultar`). Persistência em localStorage atrás de `FontePreferencias`; API `/me` com tabela por `sub` quando o login existir. Esforço total: **médio**, quase todo no `react-frontend`; `node-backend` só tipo, schema e catálogo agora.

Ordem sugerida: catálogo de cartões + tipo/schema em contratos → `FontePreferencias` local + resolução URL × perfil (função pura testável) → B1/B2 e faixa → A1 → E2E.

## 9. Respostas às perguntas do UX
1. **Identidade:** sim, localStorage é aceitável no mock. Migra por troca de implementação de `FontePreferencias` e importação única no primeiro login; contrato inalterado.
2. **Persistência:** localStorage agora, API depois (sem identidade não há chave legítima). LGPD: `sub` pseudônimo, mínimo, exclusível. Consultar preferência alheia é impossível por desenho: rotas só em `/me`, sem parâmetro de usuário.
3. **Contrato:** formato aprovado com `versao` e `ocultar` (ocultos). O catálogo é de **cartões** (não `MetricaId`), em `@metricas-dspd/contratos`, definido pelo `node-backend` e usado por front, perfil, URL e testes.
4. **Visão geral e alertas:** confirmado, preferência só no front, na renderização; nunca no cálculo nem no payload. Ponto a verificar: a faixa não pode depender de o cartão estar montado.
5. **Versionamento:** perfil ignora em silêncio; URL avisa (2.6/critério 24), exceto ids retirados conhecidos (silêncio); renomeação via mapa de retirados.
6. **Privacidade:** confirmado: nenhuma telemetria, nenhum log do conteúdo da preferência, nenhuma agregação.
7. **E2E:** `addInitScript` pré-carregando a chave do localStorage com fixture tipada; `?ocultar=` para casos de link.

## 10. Decisões em aberto para o usuário (além de D-a a D-e)
- **D-f:** o painel Espera invisível entra no recorte (tem cartões próprios) ou fica fora, como a Visão geral?
- **D-g:** no primeiro login, importar as preferências do navegador automaticamente ou perguntar?
- Pendência técnica: ADR de autenticação (pedido 002) precisa existir antes da fase "conta".
