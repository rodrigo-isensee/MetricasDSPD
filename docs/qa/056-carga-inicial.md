---
tipo: qa
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-carga-inicial
commit: 2f9c4f3b5669ce190668d7688276820ad8318266
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-31
---

# Parecer de QA - carga inicial do ref_dominio do Acelerato (E4.27, K-190)

Review: `docs/reviews/056-carga-inicial.md` (aprovado em bf5cfd5). Segurança: `docs/security/056-carga-inicial.md` (aprovado, delta em 2f9c4f3). Arquitetura: seção do `ac:ref-sync` em `docs/architecture/server.md` e §4 a §6 e §12 de `docs/architecture/fontes/acelerato-listas.md`. Sem interface: sem E2E de navegador nem acessibilidade. Nada foi conectado ao MySQL e o `.env` não foi aberto. Os §4 a §6 (chaves do recorte) seguem vazios por desenho e ficam para a E4.32.

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
- Renovar este parecer por delta depois da E4.32, que preenche os §4 a §6 do arquivo de domínio.

## Achados
- A1 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:135 · A3 do review segue aberto: a versão T2.6 sai sem métrica e a mudança de lista não marca gráfico; pergunta ao dono pelo Jarvis, sem inferência.
