---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l3-apontamento-equipe-web
commit: e6d98fb80cae74436ef0737001e4b05db0164f65
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: Equipe no lugar de Pessoa na barra do Apontamento (097 L3, E3.2, K-273)

## Achados
- A1 (recomendado) web/src/features/apontamento/filtros.ts:83 · o aviso do `pessoa=` usa a chave crua em minúscula, entre rótulos: "em: pessoa, Tipo, Agrupar por.". Sugestão: constante "Pessoa" em `textos.ts`, ou o UX decide o texto na revisão do lote.
- A2 (recomendado) web/src/features/apontamento/mapa-diario.test.tsx:56 · a fonte do teste encolhe o mapa diário quando há `equipe`, e o servidor não faz isso (`filtrar(..., soPessoa)` ignora a equipe). Sugestão: encolher a grade por outro gatilho, como a janela, para o teste não descrever um recorte que não existe.

## Parecer
Aprovado. Li o patch do L3 sobre a base (`git diff 9e76d175..e6d98fb8`, a merge-base). O `git diff origin/develop e6d98fb8` do brief também mostra o K-278 (#341) desfeito, só porque a develop andou. `git merge-tree` com a develop atual não dá conflito.

- **Sem resto de pessoa na consulta:** `CHAVES_LISTA`, `consultaParaQuery` e `ConsultaApontamento` trocam `pessoa` por `equipe`. `pessoa=` na URL entra em `invalidos` e nunca chega à rota (unidades, ligação e e2e CT-10 conferem que nenhuma chamada leva `pessoa`). Saíram `ROTULO_FILTRO_PESSOA` e a prop `nomesReais` da barra. `PESSOA_NAO_IDENTIFICADA` continua em uso nas listas por pessoa.
- **"Sem equipe":** `opcoesDeEquipe` troca só o rótulo do id `sem-time` (o id continua o do contrato, `idEquipe`). Ela serve à barra e aos chips (`nomeDoValor`), e o teste confere "Sem equipe" na tela e nenhum "Sem time".
- **Mapa diário sem recorte:** `aplicaveis={[]}` no `CartaoDiario` bate com o servidor, porque `calcularApontamento` chama `filtrar(naJanela, ..., true)` e o diário só responde a `pessoa`. O rodapé diz "não responde aos filtros da barra" e o chip mostra "Não afetado por: Equipe, Tipo".
- **Q-3:** a linha de nomes ocultos e a `NotaOutraArea` saíram da barra e foram para o cartão de capacidade, sobre `capacidade.porPessoa`. Os testes de revisão de UX contam 3 notas, nenhuma delas na barra.
- **Fonte fictícia:** só valida que o filtro existe nas opções (inexistente devolve recorte vazio) e não simula mais recorte. A volta 1 cobre `opcoes.equipes` ausente: a lista fica vazia e o filtro cai no recorte vazio. A agregação real é do servidor (L2).
- **Regras invioláveis:** a equipe só recorta e não agrupa nem compara (o CA-8 confere as colunas da capacidade sem mudança). Nada de pessoa vai à URL nem ao storage.
- **Verificação local:** em e6d98fb8, `VITEST_MAX_WORKERS=2 npx vitest run src/features/apontamento` deu 11 arquivos e 175 testes passando, e `tsc --noEmit` na web ficou limpo. O e2e (`apontamento-qa.spec.ts`) roda no CI do PR.
- **Teto de linhas:** são 416 linhas de código e teste em web e e2e, sem o JSON de fixture. O PR (E3.4) precisa levar `teto: excedido, 416 linhas, troca do filtro espalhada pelos testes da aba`.
