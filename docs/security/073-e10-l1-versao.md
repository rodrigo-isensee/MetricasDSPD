---
tipo: revisao-seguranca
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-e10-l1-versao
commit: c9f887118bf9d6272e027b1043e1d2541123f55b
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: E10 Lote 1 (versão por hash e dia no `ac:ref-sync`)

Propósito: parecer do gatilho de banco do Lote 1 do E10 (K-235): a referência da versão de critério passa de `056:ref-dominio:<sha256>` para `056:ref-dominio:<sha256>:<AAAA-MM-DD>` (P-E10-4). Público: tech-lead, node-backend, qa-engineer. Revisão estática do diff `78cf396c...c9f88711` (5 arquivos, 35 inserções e 16 remoções) e do Lote 1 de `docs/analises/073-e10-plano.md`. Nenhum código foi alterado e nada rodou contra a base real.

## Gatilho
Banco: escrita em `dspd_core` (`ref_versao_criterio`) pelo papel `dspd_ref` (`R-SEGURANCA`).

## Resultado por pergunta

**1. Escrita nova ou GRANT novo: não há.**
- `git diff --name-only 78cf396c..c9f88711 -- server/migrations` não lista nada, e `server/src/plataforma/db/grants.ts` está fora do diff. O INSERT em `ref_versao_criterio` é o mesmo de antes (`dominio-acelerato.ts:183-185`), com as mesmas colunas, pelo mesmo papel.
- A única mudança de código de produção é o valor da referência (`dominio-acelerato.ts:153`) e o argumento passado a ela (`dominio-acelerato.ts:181`).

**2. Sobrescrita de histórico: não há.**
- A versão continua sendo só INSERT, nunca UPDATE nem DELETE, e vem depois da checagem `SELECT 1 ... WHERE referencia = $1` (`dominio-acelerato.ts:182`). As versões antigas (sem data) ficam como estão: nenhum SQL as toca, e a referência nova nunca coincide com elas.
- A idempotência passa a ser por hash e dia: repetir a mesma carga no mesmo dia não duplica. Reverter a lista deixa linha nova com `vigente_desde` novo, que é o que a regra "nunca sobrescrever histórico" pede. O limite do mesmo dia continua recusado pela `planejarDominio` (`dominio-acelerato.ts:138-139`, `:144-148`), dentro da mesma transação (tudo ou nada).
- Nada fora do `dominio-acelerato.ts` procura essa referência: a busca por `ref-dominio` e `referenciaDaVersao` em `server/src` só acha o próprio módulo (os módulos do BusinessMap e do calendário têm função homônima própria, de outro prefixo).

**3. Dado de pessoa e entrada externa: nenhum.**
- A referência é montada de `sha256` (hash calculado pelo próprio módulo sobre o arquivo versionado) e `hoje` (data civil validada na entrada: data inexistente sai com código 2). Nenhuma coluna de pessoa, texto livre ou valor vindo do Acelerato entra no valor. Tudo vai por parâmetro (`$1` a `$5`), sem concatenação em SQL.
- Tamanho: 91 caracteres contra `varchar(200)` (`server/migrations/0010_core_referencia.ts:13`).

**4. Testes dos arquivos tocados.** Os três arquivos de teste do plano foram alterados e a CI do push (run 42331476876) está verde pelo brief; a suíte inteira é do QA (D-5). Não rodei a suíte.

## Ferramentas
Nenhuma varredura nova: o diff não toca dependência, workflow, imagem nem segredo. Sem lacuna a registrar.

## Achados

## Riscos aceitos
Nenhum.
