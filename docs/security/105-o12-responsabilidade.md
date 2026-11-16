---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: 27453898059c1d28bd99a6ff31088e1cbd46dfde
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (E7.235, O12 pela Responsabilidade do Atraso)

Escopo: o commit `27453898` sobre `4cc170b4` (campos 48 e 49 pelo `value_id`, já com parecer próprio em `docs/security/105-campos-value-id.md`): arquivo de domínio (campo 51), interruptor `RESPONSABILIDADE_ATRASO_COM_FONTE`, cálculo do O12, versão de critério, testes de unidade, pg e e2e.

## Gatilhos
`R-SEGURANCA`: campo customizado novo na fronteira de coleta do BusinessMap e a regra inviolável de não avaliar ninguém individualmente. Sem migração, sem GRANT novo, sem rota nova; a coluna `responsabilidade_atraso` já existia (migrações 0005 e 0006) e não é coluna de pessoa.

Conferido:
- Campo 42 (Responsável CR, pessoa) fora por três camadas, sem alteração neste commit: o esquema do arquivo recusa os fields 36 e 42, inclusive com zeros à esquerda (`server/src/modulos/businessmap/dominio-businessmap.ts:127`, normalizado por `Number`); a leitura do `ref_dominio` ignora 36 e 42 mesmo se a linha for adulterada na base (`dominio-businessmap.ts:240` a `:257`); e o coletor só lê field que está no domínio (`server/src/modulos/businessmap/allow-list.ts:105` e `:106`), então o 42 nunca é lido. O arquivo real não tem o 42 (teste novo em `server/tests/dominio-businessmap.test.ts:57`).
- Campo 51 na fronteira: casado pelo `value_id` (137, 138, 139); só o código do domínio (Interno, Solicitante, Terceiro) vai ao staging; `value_id` fora do catálogo vira `desconhecido` (teste em `server/tests/allow-list.test.ts`), que o normalizador transforma em nulo (`normalizador.ts:148`) e o O12 conta como não classificado. Nenhum texto da API, rótulo de opção ou pessoa entra.
- Não vira avaliação individual: os três códigos são categorias de origem do atraso (o time, o solicitante, um terceiro), sem pessoa. O O12 só agrega por mês e no total (`packages/metricas/src/businessmap/o12.ts:51` a `:93`); o resultado não tem lista de cards nem dimensão por pessoa, e a tela (`CartaoO12.tsx`, `resumo/modelo.ts`, `atencao.ts`) só mostra contagens agregadas. "Interno" é o time, não alguém do time.
- Zero falso evitado: com o interruptor ligado e nenhum vencido classificado, `publica` é falso (`o12.ts:76`), as três partes saem nulas, `statusMeta = sem-referencia` e o motivo diz que a contagem começa em 16/11/2026. Teste C5-o12-zero-falso atualizado e verde.
- Versão de critério do O12 na biblioteca (`packages/metricas/src/core/criterios.ts:301`, `afeta` O12 e VISAO_GERAL), com teste.
- Regras invioláveis: nada mistura BusinessMap e Acelerato; nenhum segredo no diff.

Provas executadas no head `27453898`, local: `server/tests/allow-list.test.ts` e `server/tests/dominio-businessmap.test.ts` (2 arquivos, 119 testes, todos passaram) e `packages/metricas/src/businessmap/fixtures.cobertura.test.ts` (35 testes, todos passaram). CI do push no head (run 43896506195): `testes`, `banco` (inclui o teste pg do domínio) e `seguranca` passaram; `e2e` foi pulado nesse gatilho, então OP-17 e B3-002 não estão provados aqui. Sem PR nesta branch: a suíte inteira fica para o CI do PR.

## Achados
- A1 (recomendado) docs/architecture/fontes/businessmap-dominio.json:8 · versao_criterio.afeta passa de O14 e O17 (E7.203, ainda fora da develop) para vazio; um só bm:ref-sync depois do merge registra só esta versão e a mudança do O14 e O17 fica sem marca (T2.6). Não é segurança: ao tech-lead

## Sondas

## Detalhe dos achados
A1: evidência `docs/architecture/fontes/businessmap-dominio.json:8` e o teste que trava o vazio em `server/tests/dominio-businessmap.test.ts:49`; a `origin/develop` tem outro bloco (O8, E7.102), então o merge também conflita nesse bloco · caminho de ataque: nenhum; é integridade da regra T2.6, não segurança · severidade: informativa · correção mínima: o bloco final leva `afeta` com O14 e O17 (e O8, se o da develop ainda não foi sincronizado), ou o dono roda o `bm:ref-sync` entre os dois merges · esforço P · dono: node-backend, pelo tech-lead.

Observação informativa: o código do campo 51 no arquivo não é conferido contra `RESPONSABILIDADES_ATRASO` no esquema (`mapa.ts:50` faz só a conversão de tipo). O arquivo é versionado e passa por PR, sem caminho de ataque; fica como sugestão de defesa em profundidade.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática do diff e os testes da stack já instalados; nenhuma varredura externa. Segredos e dependências ficam com o CI (o diff não toca dependências nem configuração).
