# K-215: texto do recorte da Sustentação a partir do `ref_dominio` (desenho)

Pedido 087, etapa E3.7 · autor: software-architect · 2026-11-14 · base: `develop` em b57d68c8 (depois do K-287, PR 401)
Estado: proposta. Não implementa nada. Sem gatilho de segurança (ver "Segurança e LGPD").

## 1. Situação hoje (lida no código)
- O texto está fixo na web: `web/src/features/sustentacao/VisaoSustentacao.tsx:60-67` (`data-testid="recorte-sustentacao"`): "Chamados da organização DSPD Sustentação, tipo DSPD - SSSC, equipes SSSC TOTVS, SENIOR e FLUIG, excluídos os removidos. …".
- O recorte que o cálculo usa está em `dspd_ac.ref_dominio`, campos `organizacao_recorte`, `tipo_recorte` e `equipe` (código = chave numérica do Acelerato, rótulo = nome), carregados de `docs/architecture/fontes/acelerato-dominio.json` pelo `ac:ref-sync` (`server/src/modulos/referencia/dominio-acelerato.ts`), com vigência e versão de critério (T2.6). A view `vw_populacao_sssc` (migração 0009) e o coletor (`server/src/modulos/acelerato/referencia.ts`, `CAMPOS_RECORTE` em `acelerato/controle.ts:32`) leem essas três listas vigentes.
- Rótulos vigentes no arquivo da develop: organização `UNIFIQUE - DSPD SUSTENTAÇÃO E PEQUENAS MELHORIAS` (3); tipo `DSPD - SSSC` (23); equipes `SSSC TOTVS` (7), `SSSC SENIOR` (9), `SSSC FLUIG` (332). **O texto da tela não é o rótulo vigente** ("DSPD Sustentação" é abreviação): ver P-K215-1.
- Pedido 098 (decisões 6 e 11): o recorte passa a ter as organizações 3 e 13 e todas as equipes; isso ainda não está no arquivo da develop. Logo o desenho tem de servir para listas de N itens, não para 1 + 1 + 3.
- `GET /api/v1/filtros/acelerato` (`server/src/modulos/referencia/servico.ts:35-43`) devolve `equipes` como `DISTINCT equipe` de `dim_chamado` no corte `CORTE_CHAMADOS` (L7a do 097), **não** do `ref_dominio` e **não** mais de constante (o registro do 087 de 2026-11-10 13:42 descreve o estado anterior ao L7a). São coisas diferentes: o filtro lista as equipes com chamado; o recorte é a lista configurada que o painel considera (inclui equipe ainda sem chamado).
- `dspd_api` já lê `ref_*` inteiras (exceto `ref_conta_automacao`), em qualquer schema: `server/tests/plataforma.test.ts:133-152`. Ler `dspd_ac.ref_dominio` pela API não pede GRANT nem migração.

## 2. De onde vem cada parte do texto
| Parte | Fonte | Observação |
|---|---|---|
| Organização(ões) | `ref_dominio` `organizacao_recorte` vigente, `rotulo` | forma do rótulo: P-K215-1 |
| Tipo(s) de chamado | `ref_dominio` `tipo_recorte` vigente, `rotulo` | |
| Equipes | `ref_dominio` `equipe` vigente, `rotulo` | nunca de `opcoesFiltro.equipes` (dado presente, não recorte); compactação: P-K215-2 |
| "excluídos os removidos", "Tempos e aderência usam somente chamados fechados", exceção de SLA | fica fixo na web | é regra de cálculo (view e biblioteca), não lista de domínio |

## 3. Contrato
**Escolha: campo novo e opcional `recorte` em `OpcoesFiltroSustentacao` (rota existente `GET /api/v1/filtros/acelerato`). Compatível.**

```ts
// packages/contratos/src/filtros.ts (interface) e referencia.ts (schema zod, .strict() mantido)
export interface RecorteSustentacao {
  organizacoes: string[] // rótulos vigentes de organizacao_recorte, na ordem (ordem, codigo)
  tipos: string[]        // rótulos vigentes de tipo_recorte
  equipes: string[]      // rótulos vigentes de equipe
}
export interface OpcoesFiltroSustentacao {
  dominio: 'acelerato'
  equipes: OpcaoFiltro[]
  prioridades: OpcaoFiltro[]
  /** K-215: listas vigentes do recorte (ref_dominio). Ausente = a tela mantém o texto de hoje (decisão técnica do 087, 2026-11-10 13:11). */
  recorte?: RecorteSustentacao | undefined
  historico: { inicio: string; fim: string }
}
```
- Só rótulos: a chave numérica do Acelerato não vai ao front (mínimo necessário).
- Regras do servidor: lê as três listas numa consulta (`campo IN (…) AND vigente_ate IS NULL ORDER BY campo, ordem, codigo`) em função nova do `referencia/repositorio.ts` (`lerRecorteAC`), com a mesma desconfiança de `lerSetoresBM`: rótulo que não passa em `textoSeguro` (controle, formatação invisível, arroba) é ignorado. Se qualquer das três listas ficar vazia, `recorte` é **omitido** (nunca lista vazia, que leria "equipes ." na tela; a coleta já falha fechado nesse caso). O BusinessMap nunca traz `recorte` (fontes não se misturam).
- Mesmo padrão já usado em `setores?` do fluxo (L10a do 097): opcional, a resposta antiga segue válida no schema estrito, e a web e a API saem do mesmo build.

Alternativas consideradas:
- (b) rota nova `GET /api/v1/fontes/acelerato/recorte`: separa melhor "opção de filtro" de "recorte", mas soma rota, schema, OpenAPI, cache e um segundo pedido na tela para três listas; rejeitada por custo sem ganho hoje.
- (c) campo em `GET /api/v1/referencia`: essa rota é comum às duas fontes; pôr lista do Acelerato nela abre caminho para misturar fontes; rejeitada.
- Reversão: se uma segunda tela precisar do recorte sem as opções de filtro, ou o recorte ganhar dado além de rótulos (vigência, data da mudança), migrar para (b).

Arquivos que o contrato toca:
- `packages/contratos/src/filtros.ts` e `packages/contratos/src/referencia.ts` (schema).
- `server/src/modulos/referencia/repositorio.ts` (`lerRecorteAC`) e `servico.ts` (preenche `recorte`).
- `docs/api/metricas.md` (seção `GET /api/v1/filtros/:dominio`), `docs/api/openapi.json`, `docs/contratos/http.md:45`.
- Mock: `web/src/data/mock/nucleoMock.ts:234-241` devolve `recorte` com os valores do próprio gerador (`packages/mock/src/acelerato/gerador.ts:200-201`: organização e tipo; as 3 equipes que o mock já lista). `packages/mock` não muda.
- Sem migração, sem GRANT, sem mudança no `ac:ref-sync` nem no arquivo de domínio.

## 4. Front parcial (`feature/087-k215-recorte-sust`, 5e051a37)
Limite deste desenho: o papel não tem shell e não há worktree com essa branch; não li o diff por `git show`. O que segue vem dos registros (pedido 087, 2026-11-10 13:42; K-331 no pedido 104, 2026-11-14 09:37; KANBAN K-215). O react-frontend confere com `git show origin/feature/087-k215-recorte-sust` antes de aproveitar.
- **Aproveitar:** a ligação da `VisaoSustentacao` aos dados do domínio (hook de opções do Acelerato, `['opcoes-filtro', 'acelerato']`, mesmo cache do filtro, sem pedido novo), o caminho de reserva (carregando, erro ou campo ausente = texto de hoje, literal) e a estrutura dos testes do texto.
- **Trocar:** a fonte das equipes passa de `opcoesFiltro.equipes` para `recorte.equipes`; organização e tipo também passam a vir de `recorte` (eram fixos).
- **Não aproveitar sem decisão:** `textoEquipes` (compacta "SSSC TOTVS, SSSC SENIOR, SSSC FLUIG" em "SSSC TOTVS, SENIOR e FLUIG" supondo marca comum pela primeira palavra do primeiro nome). O texto depende dessa regra, então ela é pergunta ao dono (P-K215-2); até a resposta, a lista sai literal, rótulo por rótulo.
- A branch é de antes do L7a, do K-287 e do K-295 (codec dos filtros mudou). Recomendação: branch nova da develop (`feature/087-k215-recorte`) e trazer à mão o que se aproveita; a `feature/087-k215-recorte-sust` fica como está (apagar é decisão do dono, já registrada no K-331).

## 5. Perguntas ao dono (não decididas aqui)
- **P-K215-1 (forma do nome):** o texto mostra o rótulo vigente literal ("UNIFIQUE - DSPD SUSTENTAÇÃO E PEQUENAS MELHORIAS"), ou um nome curto ("DSPD Sustentação")? (a) literal, recomendado: é o dado vigente, sem tradução no código; muda o texto visível. (b) nome curto: exige um campo novo no arquivo de domínio (`rotulo_curto`), escrito pelas pessoas, e passa pela regra de mecanismo novo. Não abreviar no código.
- **P-K215-2 (compactação das equipes):** juntar equipes pela marca comum (primeira palavra) como faz `textoEquipes`? (a) não, lista literal, recomendado (com todos os times do 098 não há marca comum, e a regra adivinha agrupamento); (b) sim, com a regra escrita pelo dono (o que é "marca", e o que acontece se só parte das equipes a tiver).
- **Para o ux-designer, não para o dono:** com o 098 o recorte terá duas organizações e dezenas de equipes; a forma de mostrar a lista longa (por exemplo, contagem com lista expansível) é da UX e entra antes do react-frontend.

## 6. Divisão, ordem e provas
Branch única `feature/087-k215-recorte` da develop atual. Ordem: 1 → 2 → 3 → 4; o 2 só depende do campo desenhado na seção 3, mas os dois commits ficam na mesma branch, então seguem em sequência. UX da lista longa (seção 5) e as respostas P-K215-1 e P-K215-2 antes do passo 2.

1. **node-backend:** contratos (campo opcional e schema), `lerRecorteAC`, `servico.ts`, docs da API, OpenAPI e `docs/contratos/http.md`.
   Provas: teste de serviço com dublê de banco: (i) rótulos vigentes das três listas, na ordem; (ii) linha com `vigente_ate` preenchido fica fora; (iii) rótulo com `@` ou caractere de controle é ignorado; (iv) uma lista vazia omite `recorte`; (v) `filtros/businessmap` sem `recorte`; (vi) resposta validada pelo schema estrito com e sem o campo. Teste `.pg` da rota sob o papel `dspd_api` lendo `dspd_ac.ref_dominio` (sem GRANT novo). Teste estático: a consulta lê só as colunas `campo, codigo, rotulo, ordem` (nada de pessoa). `pnpm --filter @metricas-dspd/server test` e `pnpm --filter @metricas-dspd/contratos test` verdes.
2. **react-frontend:** mock (`nucleoMock` com `recorte`, paridade), texto da `VisaoSustentacao` a partir de `recorte`, reserva literal de hoje quando ausente, carregando ou com erro; o que se aproveita da seção 4.
   Provas: com `recorte` = texto montado dos rótulos, sem constante de nome na web (busca no código: nenhum "SSSC" nem "DSPD Sustentação" em `features/sustentacao/` fora da reserva); sem `recorte` = texto de hoje, caractere por caractere; lista com 1, 2 e N itens; e2e `sustentacao-no-operacional` verde; cobertura da web mantida.
3. **tech-lead:** review. 4. **qa-engineer:** QA (inclui um `ac:ref-sync` com lista alterada em base local e a tela refletindo a nova lista sem mudança de código). Depois **ux-designer** revisa a tela e o tech-lead abre o PR (squash) para a develop.

`pnpm run pronto` verde é condição de cada passo.

## 7. Segurança e LGPD
- Sem dado de pessoa: `ref_dominio` só tem chaves e nomes de domínio; o arquivo já recusa arroba e controle (`textoSeguro`), e a leitura da API repete o filtro. Nomes de empresa ou marca nos rótulos valem como nome de time ou sistema (decisão do dono no 098, 2026-11-12 15:27).
- Sem escrita, sem GRANT novo, sem dependência nova, sem rota nova, nada no Acelerato. Por isso sem gatilho de segurança; se o review discordar, o security-engineer entra antes do passo 1.
- Não afrouxa regra: nenhuma alteração em `docs/regras/`, `tests/config.json` ou controle.

## 8. Riscos
- R1: o texto passa a mostrar o rótulo literal e muda o que o usuário vê (P-K215-1). Mitigação: decisão do dono antes do passo 2.
- R2: com o 098, texto longo empurra a faixa "Pede atenção" para baixo. Mitigação: forma da lista definida pela UX.
- R3: divergência entre recorte (configurado) e filtro de equipes (presente nos chamados) pode parecer erro. Mitigação: é intencional; a UX decide se a tela explica.
