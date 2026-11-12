---
tipo: revisao-seguranca
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/k286-mapa-diario-equipe
commit: 62a622abf9abecc9813c01e3a6ca015e21d21cb4
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: 097 K-286, mapa diário recortado pela Equipe

Propósito: parecer de segurança (gatilho LGPD: o mapa de calor mostra pessoa × dia; `R-SEGURANCA`) do K-286 do pedido 097. Revalidação da volta 1 da revisão de UX (A1 a A4), só web, sobre o parecer anterior em `dfba8a37`. Revisado o delta `dfba8a37..62a622ab` (código: `ApontamentoPage.tsx`, `components/CartaoDiario.tsx`, `dados.tsx`, `textos.ts` e o teste novo `mapa-diario-equipe.test.tsx`, todos em `web/src/features/apontamento/`; o resto do delta são os pareceres de QA, review e segurança) e relido o diff inteiro `origin/develop...62a622ab`. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Dado de pessoa (LGPD): o mapa diário é recortado pelo filtro `equipe`, o que estreita o grupo de "Pessoa n" mostrado dia a dia.

## Resultado
- **O delta não muda o veredito.** A volta 1 é só texto e estado da interface; não toca `packages/metricas`, `server/src/`, migrações, `grants.ts`, o contrato nem `docs/api/` além do que o parecer anterior já cobriu.
- **A resposta continua sem nome nem coluna de pessoa: conforme.** A forma da resposta não muda; a web continua recebendo só `pessoaRef` por linha. O dado novo no contexto da aba, `equipes` (`ApontamentoPage.tsx:92`, `dados.tsx:22`), é o rótulo das equipes escolhidas, tirado de `filtrosAtivos(uso.consulta, resposta.opcoes)`: nome de equipe vindo de `opcoes`, nunca de pessoa. Ele só entra no `aria-label` da grade e na legenda da tabela (`CartaoDiario.tsx:83-86`, `:128`, `:241`), como texto renderizado pelo React (sem `dangerouslySetInnerHTML` na feature); um slug digitado na URL que não case com uma opção aparece escapado, sem caminho de injeção.
- **Nenhum GRANT novo nem SQL novo: conforme.** O delta é só web.
- **Sem comparação entre equipes: conforme.** Várias equipes viram uma frase única ("das equipes X, Y") e o mapa segue sendo um conjunto; nada agrupa, soma nem ordena por equipe.
- **Estado vazio por equipe (A2): conforme.** `CartaoDiario.tsx:278-295` mostra "Nenhum apontamento da equipe escolhida nesta janela" e um botão que só remove o filtro (`uso.remover('equipe')`). Não revela quem nem quantos, e a ausência de apontamento do time na janela já era dedutível do mapa vazio.
- **Dica do atípico com a Equipe (A3) e "Como ler" (A1): conforme e melhora a transparência.** O texto passa a dizer que o dia atípico é decidido sobre o dia inteiro da pessoa (`textos.ts:74-75`, `:191`), o que já era o comportamento informado no parecer anterior; não acrescenta dado.
- **Reidentificação de "Pessoa n" em equipe pequena: sem mudança.** O A1 do parecer anterior (granularidade diária dentro do recorte de um time pequeno) continua de pé, com o mesmo caminho e a mesma severidade; o delta não amplia nem reduz a exposição. O mínimo de pessoas por recorte segue com o dono.
- **Testes dos arquivos tocados (`VITEST_MAX_WORKERS=2`):** `web` `mapa-diario-equipe.test.tsx` e `apontamento.test.tsx`, 69 passed, no head `62a622ab`. Os testes de `packages/metricas` e `server` não foram reexecutados porque o delta não os toca (passaram no parecer anterior).
- **Lacunas:** `gitleaks` e `semgrep` não estão no PATH e não rodaram. O delta não traz segredo, configuração nem dependência.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/apontamento/index.ts:66 · mapa diário recortado por equipe expõe Pessoa n dia a dia em time pequeno (piora o A1 do L2); se o dono adotar piso de pessoas por recorte, aplicá-lo também ao mapa, contado sobre doDiario (janela própria), não sobre o recorte do período.

## Plano em cartões
Nenhum bloqueante. A1 segue ao Jarvis como insumo da pergunta já aberta ao dono sobre o mínimo de pessoas por recorte (`R-DECISAO`); se a resposta for um piso, o cartão é do `node-backend` (cálculo em `packages/metricas`) com o `react-frontend` para o estado "recorte pequeno demais" no cartão do mapa.

## Riscos aceitos
Nenhum.
