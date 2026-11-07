---
tipo: review
contrato: 1
pedido: 081-categoria-erro-entradas
branch: feature/081-categoria-erro-entradas
commit: 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 081 categoria do erro nas entradas de referência (K-241, E1.2)

Diff lido: `852b9406...1f8a19c6` (8 arquivos de código e teste), contra `## Escopo` e `## Fora do escopo` do pedido. Testes dos arquivos tocados rodados (`categoria-erro.test.ts`, `ref-sync-calendario-entrada.test.ts`): 15 passam. Segurança aprovada sem achados em `dbdbb417` (citada, não refeita); CI do push verde.

## Parecer
**Aprovado.** Faz o que o escopo pede, nem mais nem menos.

- **Função única:** `categoriaDoErro` (`plataforma/categoria-erro.ts`) é a única classificação; as três entradas (`ref-sync-calendario.ts:27`, `ref-sync-ac.ts:26`, `ref-sync-businessmap.ts:28`) a chamam no mesmo formato `<entrada> falhou: <categoria>`. `ref-sync-apontamento` ficou fora, como o brief exclui.
- **Categorias:** configuração (com nomes), autenticação (classe 28 do PostgreSQL, também em `AggregateError`), conexão (códigos de rede ou "timeout"), outro. Entrada que não é `Error` ou é nula cai em `outro` sem lançar.
- **`ErroConfiguracao` só com nomes:** `config.ts` lança com `nomes` vindos de `issues[].path[0]` e de `removidas`; a mensagem não leva valor. O teste de configuração prova que senha e valor ruim não saem.
- **Mensagens próprias:** `ErroCalendario` e `ErroDominio` seguem imprimindo a mensagem própria (ramo `instanceof` mantido); código de saída 1 mantido e testado no subprocesso e no dublê.
- **Parameter property:** o ajuste para campo explícito por `erasableSyntaxOnly` do `tools/docs-contratos` é correto e mínimo.
- **Testes por categoria:** cada categoria tem caso, e há o caso de que nenhuma saída contém senha, URL, host, usuário nem texto do erro do banco (o texto do erro é lido só para classificar). O teste de subprocesso agora afirma a saída exata, o que também prova que nada além da categoria sai.
- **Teto (M14):** 111 linhas alteradas de código e teste pelo `numstat` (contagem do brief: 109), abaixo de 150; um só comportamento. `web/`, `packages/`, `server/migrations` e `.github` sem diff.
- **Cabeçalho de `ref-sync-calendario.ts`:** "Imprime só contagens e o hash: nunca a URL, a senha nem o texto do erro do banco" segue verdadeiro para a saída de sucesso e para o erro (a categoria não é texto do banco), mas não cita a categoria; vira recomendação.

## Achados
- A1 (recomendado) server/src/entradas/ref-sync-calendario.ts:13 · o cabeçalho diz que imprime só contagens e o hash; acrescente que, na falha, imprime só a categoria do erro (e os nomes das variáveis, em configuração).
- A2 (recomendado) server/src/entradas/ref-sync-apontamento.ts:1 · ainda imprime "configuração ou banco inválidos"; fora do escopo deste pedido, vale cartão para usar `categoriaDoErro` também ali.
