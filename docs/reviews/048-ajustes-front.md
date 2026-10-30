---
tipo: review
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-ajustes-front
commit: 832541d4a2350751ca6275ef866a752e179515bb
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Code review: ajustes do front do pedido 048 (K-128, K-126, K-133, K-127)

Propósito: revisar a `feature/048-ajustes-front` antes da segurança e do QA (etapa E5.1, E3 do pedido). Público: react-frontend, software-architect, security-engineer, qa-engineer, Jarvis.

**Parecer: aprovado.** Não há achado bloqueante. Os cinco achados abaixo são recomendações e não devolvem a entrega. O A1 pede uma medição ao QA e o A4 pede uma decisão antes do PR.

## Escopo conferido
O intervalo `7c94348..832541d` tem 5 commits e 13 arquivos:
- `430dcfe`: ADR 0021, que passa a vigente e ganha as seções 8 e 9 (arquiteto).
- `4ea4e24`: K-128.
- `04a24b8`: K-126.
- `7686aea`: K-133.
- `832541d`: K-127 (`web/scripts/f9.mjs`, `size.mjs` e o teste).

Li também a linha F9 da ADR 0003, que não muda, e `COM_EXTENSAO_TAMBEM` em `server/src/modulos/metricas/servico.ts:57`. Pelo teto de leitura M14, o diff tem 324 linhas de código e teste (ver A4).

## Ferramentas (saída citada)
`pnpm run pronto` foi rodado uma vez na raiz da worktree, no HEAD `832541d`, e terminou com rc=0. Saída:
- web: 82 arquivos e 1241 testes passaram.
- metricas: 1092 testes passaram.
- mock: 258 testes passaram.
- server: 591 testes passaram e 84 foram pulados.
- `docs:check`: ok.
- `F6 inicial: 192.31 KB (< 200) ok`.
- `F9 caminho worker: nucleoMock.worker-QBrqPoLa.js = 72.39 KB`.
- `F9 caminho processo: nucleoMock-C9lRbK_T.js, tambem-BZ_J2IwF.js (rota), metas-FzOIMGXy.js (rota) = 47.49 KB`.
- `F9 mock + biblioteca (maior caminho: worker): 72.39 KB (< 120 ...) ok`.
- `F9 informativo: soma de todos os chunks mock: 118.22 KB`.

O lint, o prettier e o typecheck estão dentro do `pronto`. Não os refiz por leitura.

## Por cartão
- **K-128.** O `COM_TAMBEM` do núcleo (`nucleoMock.ts:60`) tem o mesmo conjunto do servidor (T11, T13, T14, E6, E8, O22 e O26). Agora ele é exportado e testado. O teste "T13 chega com a extensão" (`nucleoMock.paridade.test.ts:118`) falharia sem a mudança: o núcleo devolveria o mesmo DTO calculado sem `tambem`. A documentação em `docs/tecnica/arquitetura-front.md` foi atualizada.
- **K-126.** O invólucro (`nucleoMock.worker.ts:12`) captura a exceção do `postMessage`, como um `DataCloneError`, e responde `{ id, ok: false, erro }`. Assim o pedido não fica pendente. Isso fecha o A1 do review do 037. O `tratarPedido` sem núcleo agora lança `núcleo do mock não iniciado`, no lugar de um TypeError genérico. Os dois testes novos falhariam sem a mudança: o primeiro pela espera sem resposta, o segundo pelo nome `TypeError`. O spy do `postMessage` é restaurado pelo `restoreAllMocks` do `afterEach`.
- **K-133.** A reserva da faixa passa a depender do filtro de equipe: 88 px com equipe e 130 px sem (`reservaFaixa.ts:14`). O `min-height` só vale enquanto a faixa carrega (`FaixaAtencao.tsx:88`). A função tem teste. O CLS real fica com o QA (A1).
- **K-127.** O `f9.mjs` segue a seção 8 da ADR 0021:
  - raízes em constantes no topo;
  - fecho por imports estáticos e dinâmicos;
  - exclusão do que está no `index.html`;
  - órfãos somados nos dois caminhos;
  - fallback pela soma, com aviso;
  - falha quando uma raiz está no inicial;
  - as quatro linhas de saída.

  A extração para um módulo puro, com `f9.d.mts` e teste sem build, foi aceita no mérito: é testável, e o `size.mjs` ficou só com a leitura do disco. A medida caiu de 118,22 KB pela soma para 72,39 KB pelo maior caminho. O limite de 120 KB e a falha por mock no inicial não mudaram. A ADR traz critério de reversão.

## Regras do projeto
- BusinessMap e Acelerato não se misturam: nenhum cálculo mudou, e a mudança está só em transporte, lista de extensão, reserva de layout e medida de bundle.
- Não há dado de pessoa nem métrica individual. O "time responsável" da T14 é time, não pessoa.
- Nenhuma métrica ganhou cálculo próprio.
- Os commits seguem o Conventional Commits em português, com a linha `Cartão:` e a atribuição.

## Achados
- A1 (recomendado) web/src/features/tatico/reservaFaixa.ts:14 · 88 px com equipe vale para 4 das 5 equipes do mock; na que quebra em duas linhas a faixa cresce cerca de 42 px ao carregar e desloca o núcleo. O QA mede o F2 de /tatico nas cinco equipes; se passar de 0,1, volta ao autor.
- A2 (recomendado) web/scripts/f9.mjs:44 · a terceira condição de falhaInicial repete a segunda (raiz no inicial); e o teste em web/src/test/f9-size.test.ts:78 usa raiz do tipo mock, então a regra "raiz no index.html" não é exercida sozinha. Remover a linha 44 e testar raiz não mock no inicial.
- A3 (recomendado) web/src/data/mock/nucleoMock.worker.ts:17 · `const e` no catch sombreia o parâmetro `e` (MessageEvent) do onmessage; renomear para `falha` evita leitura ambígua.
- A4 (recomendado) web/src/test/f9-size.test.ts:1 · teto M14: 324 linhas de código e teste e quatro cartões. A branch registra o Forge 0.30.3 (teto 400), dentro. Se o PR sair já no 0.30.7 (pedido 053), o corpo leva `teto: excedido, 324 linhas, <motivo>` e o Jarvis decide antes se divide.
- A5 (recomendado) web/src/data/mock/nucleoMock.paridade.test.ts:20 · a lista esperada é cópia à mão; nada pega o servidor (servico.ts:57) mudando sozinho. Um teste do contrato ou do server que compare as duas listas fecharia a deriva.

## Encaminhamentos
- Segurança (E5.4): sem gatilho novo visível. Não há rede, CSP, segredo nem dado de pessoa. O security-engineer decide se dispensa.
- QA (E5.2): o A1 (CLS por equipe em /tatico) e a conferência das quatro linhas do F9 pedida na seção 8 da ADR 0021. A soma informativa agora é 118,22 KB, não os 117,35 KB da medida anterior.
