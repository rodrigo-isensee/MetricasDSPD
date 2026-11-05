---
tipo: revisao-seguranca
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l2-campos
commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-04
---
# Review de segurança: lote L2-a do 069, mapa de campos customizados do BusinessMap (E1.8, K-220)

Propósito: parecer do lote L2-a (`R-SEGURANCA`) contra o modelo de ameaças `docs/security/069-modelo-ameacas.md` (seção L2-a, A3, A4, CA-069-1 a 4). Público: tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado.** A3 e A4 estão resolvidos no código e nos testes; os controles 1 a 6 do modelo estão presentes; o lote não muda o que é coletado (arquivo com `"campos": []` e lista positiva de tipos vazia).

Base revisada: `git diff origin/develop...1f62f203e7a0ced3947ec2b9c70eab644b98bc20` (16 arquivos, +824 -15). Executado só localmente: `vitest` com 2 workers sobre `dominio-businessmap.test.ts`, `coleta-businessmap.test.ts`, `ref-sync-businessmap-entrada.test.ts` e `dominio-businessmap.pg.test.ts` (83 verdes, 6 pulados: os de PostgreSQL, sem banco local). Nenhum `.env` lido, nenhuma API nem base consultada.

## Gatilho
Campo novo da fonte na fronteira: o mapa `field_id` para coluna sai de constante do código e passa a ser dado (`ref_dominio`), carregado de arquivo versionado.

## Conferência do modelo de ameaças
| Controle | Evidência | Situação |
|---|---|---|
| A3: lista positiva de `type` | `server/src/modulos/businessmap/dominio-businessmap.ts:26` (`TIPOS_SELECAO_UNICA = []`) e `:37` (`refine` por inclusão); testes `server/tests/dominio-businessmap.test.ts` (user, text, desconhecido, vazio, ausente, `null`, array; carga com campo recusada com a lista do código) | cumprido |
| `field_id` numérico | `dominio-businessmap.ts:28` (`^\d{1,10}$`), `:36`; testes com `"42 "`, `"4a"`, `"-1"`, `""`, 11 dígitos, `" 7"`, `"7\n"`, dígitos de largura total | cumprido |
| Enum fechado de colunas | `server/src/modulos/businessmap/allow-list.ts:64` (`COLUNAS_LISTA`, sem `causa_raiz`), `dominio-businessmap.ts:38`; testes com `owner_user_id`, `campo_customizado`, `causa_raiz`, `__proto__` | cumprido |
| `textoSeguro` existente | `server/src/modulos/referencia/dominio-acelerato.ts:37` só ganhou `export`, regex idêntica; usado em `dominio-businessmap.ts:32` e `:47-51`; testes com `@`, U+200B, U+202E, U+2028 e controle no código e no rótulo | cumprido |
| Esquema `strict`, duplicatas, reservado, tamanho | `dominio-businessmap.ts:43-77`, `:83`; chave extra em raiz, campo, valor e versão de critério recusa; `__proto__` sem poluição de protótipo (teste) | cumprido |
| A4 / CA-069-1: 36 e 42 recusados no `bm:ref-sync` | `dominio-businessmap.ts:60-62`, com `String(Number(...))` para `036` e `0042`; testes com a lista escrita no teste | cumprido |
| A4 / CA-069-3: 36 e 42 removidos no coletor depois da leitura do banco | `server/src/modulos/businessmap/coleta.ts:45-50` lê `ref_dominio` e passa por `dominiosDeLinhas` (`dominio-businessmap.ts:160-184`), que ignora 36, 42 (também com zeros à esquerda), `field_id` não numérico, coluna fora do enum, `field_id` com duas colunas, código inseguro ou reservado e rótulo ambíguo; teste de unidade, de coletor e de PostgreSQL (`dominio-businessmap.pg.test.ts:96`) | cumprido |
| CA-069-4: só código ou `desconhecido` no staging | `allow-list.ts:88` inalterado; teste em `server/tests/coleta-businessmap.test.ts` com marcadores nos fields 36 e 42 e texto fora do domínio, ausentes do staging, do log e do resultado | cumprido |
| Mensagens sem segredo | `server/src/entradas/ref-sync-businessmap.ts:27` (mensagem fixa fora de `ErroDominio`); `dominio-businessmap.ts:92-94` (só caminho do esquema, valores trocados por `#` e `item`); teste com senha marcador na URL e com rótulo marcador | cumprido |
| Caminho constante | `ref-sync-businessmap.ts:14` recusa argumento a mais; `dominio-businessmap.ts:17` | cumprido |
| GRANT | `server/src/plataforma/db/grants.ts` e `server/migrations/` sem diff; o `dspd_coletor` já lê `ref_` (`grants.ts:107`) e o `dspd_ref` já insere e fecha vigência (`grants.ts:115-116`); teste de GRANT em `ref-sync-businessmap-entrada.test.ts` | cumprido |
| Versão de critério com hash | `dominio-businessmap.ts:137-147` (domínio `businessmap`, `069:ref-bm-campos:<sha256>`) | cumprido |

## Os dois desvios aceitos pelo Jarvis
- `textoSeguro` exportado: a regex e os limites não mudaram; exportar não abre caminho de ataque.
- `planejarDominio` com tipo de entrada mais largo (`dominio-acelerato.ts:109`): a função não valida, só compara. Os dois chamadores entregam dado já validado pelo zod (`analisarDominio` no Acelerato, `listasDoArquivo` sobre o esquema estrito no BusinessMap). Sem efeito de segurança hoje; ver A2.
- `CAMPOS_CUSTOMIZADOS_FORA` mudou para `allow-list.ts:61` com o mesmo valor e é reexportada em `coleta.ts:39`; o teste do coletor confere `['36', '42']`.

## Observação fora de segurança (para o tech-lead)
Quando um campo sai do arquivo, só a linha `campo_customizado` é fechada; a lista de valores da coluna continua vigente. E o `bm:ref-sync` com coluna `sistema` ou `objetivo_estrategico` compete com as listas que o seed grava em `server/src/plataforma/db/seed.ts:117-119`. Sem caminho de ataque (o coletor só usa a lista se houver ligação vigente); é integridade de referência para o review de código e para o PR que preencher o arquivo.

## Achados
- A1 (recomendado) server/tests/dominio-businessmap.pg.test.ts:96 · Testes de PostgreSQL pulados localmente (sem banco), entre eles 36 e 42 por INSERT direto e privilégios do coletor e do dspd_ref. Confirmar test:pg verde na CI do PR antes do merge. Dono: tech-lead, qa-engineer.
- A2 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:30 · CODIGO_SEGURO copia a regex de textoSeguro; se uma mudar, o coletor e o bm:ref-sync divergem. Derivar as duas de uma constante única ou testar a igualdade. Dono: node-backend.
- A3 (recomendado) docs/architecture/fontes/businessmap-dominio.json:12 · O PR que preencher o arquivo e TIPOS_SELECAO_UNICA (P-L2-1) passa por parecer de segurança que confere tipo e rótulos de cada campo (A5 do modelo). Dono: Jarvis.
- A4 (recomendado) server/package.json:27 · Lacuna de ferramenta: gitleaks, osv-scanner e semgrep fora do PATH; nada instalado. A evidência de varredura é a da CI do PR. Dono: devops-engineer.

## Riscos aceitos
Nenhum.
