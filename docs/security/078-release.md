---
tipo: revisao-seguranca
contrato: 1
pedido: 078-release-noite-2026-11-07
branch: docs/078-release
commit: 4388083c63ea04993f2b1fbb7c94d45e518008ce
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança da release: develop (4388083c) contra homolog (pedido 078, E1.3)

Revisão estática do diff `origin/homolog...4388083c` (266 arquivos, PRs 238 a 280): coletor do Acelerato, ref-sync, projetor e derivador de bloqueio do BusinessMap, migração 0035, GRANT, `.github/`, scripts, pre-push e dependências. Nada foi alterado nem executado contra base real. Esta release é um agregado de lotes que já tiveram parecer próprio (069 L9-c, 073, 075, 081, 083, 085); aqui se confere a soma e o que mudou entre os pareceres e a ponta.

## Gatilhos
Coletor do Acelerato (dado de pessoa na fronteira), migração e views, projeção de bloqueio, pre-push e scripts da catraca.

## Resultado por pergunta
1. **Credencial no código:** nenhuma. A varredura das linhas adicionadas em `server/ packages/ web/ e2e/ scripts/ .githooks/` achou só uma constante de teste (`SENHA` em arquivo de teste, valor fictício). As entradas novas leem a configuração por `carregarConfigAcelerato` (variáveis de ambiente), sem valor no código.
2. **Acelerato só por leitura e allow-list:** mantido. As consultas novas são `SELECT` (Q6 ganhou `kanban_status_key`, lido como inteiro e não gravado; Q3/Q6/Q7 por nome exato da constante `CAMPOS_ETAPA_F3`). Os campos de etapa novos entram só como domínio fechado (`fora_dominio_*` anula o valor), booleano de preenchido (`justificativa_informada`, `previsao_retorno_informada`) ou nulo; o texto livre da justificativa nunca sai do `SELECT`. `esquemaEtapaLista` é `strictObject` e `kanban_status_key` falha fechado (texto, decimal, negativo). Nome, e-mail, `usuarioKey`, descrição e título não passam.
3. **Comando de apoio `ac:apoio-l9c`:** só `SELECT` agregado, mesma sessão só leitura da coleta, saída só de contagens e do nome de um dos 7 campos da lista fechada; erro sem valor. Roda pelo dono, no terminal; não toca o PostgreSQL.
4. **API (`dspd_api`) e GRANT por coluna:** a 0035 troca o tipo de `previsao_retorno` (coluna nunca projetada, sempre nula) com guarda que recusa se houver valor, recria as 3 views com a definição da 0009 (`security_invoker`, sem coluna de pessoa) e deixa os GRANTs ao migrador, que os reaplica ao fim. Nenhum GRANT novo, nenhuma coluna de pessoa exposta, nada apagado (`down` com guarda).
5. **Projeções de bloqueio (BusinessMap):** `evt_bloqueio` e `fato_bloqueio` guardam id de card, código de motivo (só dígitos, `^\d{1,10}$`), coluna, código de fornecedor, instantes e horas úteis. Da `stg_card` o projetor lê só 6 chaves do payload (`is_blocked`, `block_reason_id`, `column_id`, `archived_at`, `custom_fields`, exclusão); `custom_fields` passa por `colunasDeLista` restrito à coluna `fornecedor`. Nenhum nome, e-mail nem título. Sem DELETE; UPDATE só de fim, duração e motivo, com parâmetros ligados. Motivo sem tradução vira `MOTIVO_NAO_CLASSIFICADO`, sem inferência.
6. **Fontes separadas:** nenhuma mudança cruza BusinessMap e Acelerato (esquemas `S.ac` e `S.bm` distintos; `ordemFluxo` e domínios vêm de `ref_dominio` do próprio Acelerato).
7. **Dependências novas:** nenhum pacote novo; só atualizações de versão menor ou patch (`vitest` e `coverage-v8` 5.1.0, `fastify` 5.12.8, `@fastify/swagger` 9.9.3, `@lhci/cli` 0.16.0, `@mermaid-js/mermaid-cli` 12.2.0, `pdfjs-dist` 6.5.438, `@tanstack/react-query`, `@tailwindcss/vite`, `tailwindcss`, `@vitejs/plugin-react`, `globals`), todas com lockfile versionado e cobertas pelos pareceres 073 (deps-patch e triagem do Dependabot). `osv-scanner` não está no PATH: a auditoria fica com o CI.
8. **CI e pre-push:** `.github/` não está no diff. O pre-push passa a rodar `lint-alterados.sh` e `typecheck-alterados.sh` (só arquivos e pacotes tocados contra `origin/develop`, com fallback para o lint e o typecheck inteiros se a ref faltar; mudança em `packages/*`, lockfile ou tsconfig força o typecheck inteiro). A CI continua com `pnpm run lint` e `typecheck` inteiros; ver A1. `shellcheck -S warning` nos dois scripts: sem avisos. `suite-unica.sh` move a trava para `/tmp/claude-<uid>` com recusa de link simbólico e diretório 700 (parecer 085); não afrouxa a trava.
9. **Erros de entrada (081):** `categoriaDoErro` devolve só a categoria e os nomes das variáveis de configuração, nunca valor, URL ou texto do erro do banco; reduz o vazamento em stderr em relação ao texto anterior.

## Achados
- A1 (recomendado) .githooks/pre-push:13 · O pre-push agora só vê o que mudou contra `origin/develop`; defeito de lint ou tipo fora do diff passa até o CI, que roda o conjunto inteiro (`.github/` intocado). Sem caminho de ataque realista; manter a CI inteira como portão.
- A2 (recomendado) .forge/versao:1 · O marcador sobe de 0.32.0 para 0.44.2 enquanto o pedido 084 mira o Forge 0.45.2; confirmar o valor final na promoção. Informativo, sem efeito de segurança.

## Riscos aceitos
Nenhum; A1 e A2 são recomendações e não bloqueiam. Parecer `aprovado`.

## Lacunas de ferramenta
`gitleaks`, `osv-scanner`, `semgrep`, `zizmor` e `actionlint` não estão no PATH (só `shellcheck`): varredura de segredos no histórico e auditoria de dependências ficam com o CI. A revisão leu o diff; os testes dos arquivos tocados não foram rodados aqui (a suíte completa é do QA e do CI). A worktree está em `3c4cffa7` (branch `docs/078-release`); o parecer cobre o commit `4388083c` indicado no pedido.
