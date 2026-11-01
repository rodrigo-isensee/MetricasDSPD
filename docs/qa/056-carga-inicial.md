---
tipo: qa
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-carga-inicial
commit: 180f2464dad1e739357ee3162a27d8aa4d306fab
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---

# Parecer de QA - carga inicial do ref_dominio do Acelerato (E4.27, K-190)

Review: `docs/reviews/056-carga-inicial.md` (aprovado em bf5cfd5). Segurança: `docs/security/056-carga-inicial.md` (aprovado, delta em 2f9c4f3). Arquitetura: seção do `ac:ref-sync` em `docs/architecture/server.md` e §4 a §6 e §12 de `docs/architecture/fontes/acelerato-listas.md`. Sem interface: sem E2E de navegador nem acessibilidade. Nada foi conectado ao MySQL e o `.env` não foi aberto. Os §4 a §6 (chaves do recorte) foram preenchidos na E4.32; ver a renovação abaixo.

Veredito: aprovado. Suíte `.pg` verde contra o PostgreSQL local, `pronto` sem erro, todo caso pedido tem teste e os dois arquivos de abuso novos do QA passam e provam a guarda (mutação abaixo).

## Saída real dos comandos (ponta 2f9c4f3, `nice -n 19`, uma suíte por vez)

- `pnpm run test:pg` na ponta sem os testes do QA: Test Files 20 passed (20); Tests 123 passed (123).
- `pnpm run test:pg` com os testes do QA: Test Files 21 passed (21); Tests 126 passed (126).
- `pnpm run pronto` com os testes do QA: terminou em `Done` e `docs:check: ok (822 páginas Markdown, 69 métricas, 2 eventos)`; `format:check` e lint incluídos.

## Pedido -> teste -> resultado

| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Gravação com vigência | `dominio-acelerato.pg.test.ts` "grava, repete sem duplicar..." | passa; `vigente_de` = data, `vigente_ate` nulo, ordem da lista | primeira carga |
| Repetição sem duplicar | mesmo teste, mesma data e dia seguinte; unitário "idempotente" | passa; 2 linhas e 1 versão | idempotência, só ordem diferente |
| Mudança de lista fecha vigência e abre versão T2.6 | `.pg` "mudança de lista fecha a vigência..." | passa; histórico preservado, hash novo, versão nova | nunca sobrescrever |
| Data retroativa | `.pg` "data retroativa é recusada...", unitário das últimas vigências | passa; nada gravado, nem versão; vigência fechada também conta | data menor que a última vigência |
| Mesmo dia da vigência aberta | `.pg` "mudança no mesmo dia..." | passa; recusa e nada gravado | mesmo dia |
| Data inexistente | `ref-sync-ac-entrada.test.ts` (2026-02-30, 2026-13-01, texto), `dataCivilValida` | passa; código 2 antes de ler a config | data civil |
| Texto com `@` e invisíveis | `dominio-acelerato.test.ts` (U+2028, U+2029, U+200B, controle) e QA `dominio-acelerato.qa.test.ts` (U+202E, U+FEFF, U+0007, U+0000, `@`) | passa | caractere fora da classe, nos 6 campos de texto |
| Privilégios `dspd_ref` | `.pg` "privilégios..." e QA `dominio-acelerato.qa.pg.test.ts` (UPDATE de `vigente_de` e `codigo`, DELETE, e `ref_versao_criterio` sem UPDATE nem DELETE: 42501) | passa | papel mínimo |
| Privilégios `dspd_coletor` e `dspd_api` | `.pg` do autor (INSERT) e QA (UPDATE, DELETE, versão de critério, INSERT da API: 42501) | passa | papel sem escrita |
| Arquivo real aceito | `.pg` "o arquivo real..." (135 categorias, 19 descrições, repetição sem mudança) e unitário; QA confere ausência de `@` e de invisíveis no JSON | passa | arquivo versionado |
| Nenhum acesso ao MySQL | QA `dominio-acelerato.qa.test.ts`: comando e módulo sem `mariadb`, `mysql`, cliente do coletor nem `PG_COLETOR`; piso de 500 caracteres contra leitura vazia | passa | fonte só leitura, fontes separadas |

## Prova de mutação (no código alterado)
Não há ferramenta de mutação da stack nesta máquina; mutante manual, em cópia do arquivo e restaurado em seguida (árvore limpa conferida). Mutante: tirar `\p{Cf}` e o `@` da classe de `textoSeguro` em `dominio-acelerato.ts`. Resultado: `dominio-acelerato.qa.test.ts` cai (1 failed, 2 passed) em "abuso: arroba e caractere invisível...". Os testes de privilégio são de banco e o GRANT é o que os faz cair; não houve mutante sobre a migração. Vermelho antes do verde por `forge-testes` não se aplica: os testes do QA guardam regra já implementada no HEAD, e nenhum é de correção.

## Observações
- Não acho divergência entre o diff e o review. O teto de 582 linhas (exceção do review) e a linha de teto do PR são da E4.31.
- A3 do review (versão de critério sem métrica, mudar lista não marca gráfico) segue aberto e depende de pergunta ao dono; não afeta a carga inicial.

## Renovação por delta depois da E4.32 (E4.38, 6e52cff..180f246)

Delta: só `docs/architecture/fontes/acelerato-dominio.json` (campos `tipo_recorte` 23, `organizacao_recorte` 3, `equipe` 7, 9 e 332, mais texto da versão de critério e da regra) e `docs/architecture/fontes/acelerato-listas.md` (§4 a §6). Sem código e sem teste novo no intervalo (os testes .qa. já estavam no parecer de 6e52cff). A ponta da branch (71d4fc2) só soma o review da E4.36, sem código. Conferido contra o diff: as obrigações da tabela acima seguem valendo, o escopo não mudou. Nada foi conectado ao MySQL e o `.env` não foi aberto.

Saída real (worktree 056d, ponta 180f246 mais o review 71d4fc2, uma suíte por vez):
- `pnpm run test:pg`: Test Files 21 passed (21); Tests 126 passed (126). O teste `.pg` do arquivo real aceita o arquivo com os 3 campos novos e repete sem mudança.
- `pnpm run pronto:interno` (o `pronto` abre em lock de `/tmp` sob o sandbox da QA; o corpo é o mesmo): terminou em `Done`, `docs:check: ok (823 páginas Markdown, 69 métricas, 2 eventos)`.
- Abuso no delta: nenhuma linha adicionada do JSON traz `@` nem caractere invisível (U+200B a U+200F, U+2028 a U+202E, U+FEFF); `referencia.ts` do coletor já lista os três campos novos como chaves.

| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Chaves do recorte gravadas com vigência | `.pg` "o arquivo real..." sobre o JSON novo | passa | arquivo versionado |
| Sem `@` nem invisível nos novos textos | QA `dominio-acelerato.qa.test.ts` e conferência do diff | passa | caractere fora da classe |
| Sem acesso ao MySQL | QA `dominio-acelerato.qa.test.ts` | passa | fonte só leitura |

Mutação e vermelho antes do verde: sem código novo, sem mutante novo; o mutante de `textoSeguro` do parecer anterior segue válido.

Veredito da renovação: aprovado, sem achado novo. A1 segue aberto como recomendado.

## Achados
- A1 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:135 · A3 do review segue aberto: a versão T2.6 sai sem métrica e a mudança de lista não marca gráfico; pergunta ao dono pelo Jarvis, sem inferência.
