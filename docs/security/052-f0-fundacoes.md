---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f0-fundacoes
commit: 051c46e29ef8b04f19cfb1024a02e11b0d638bdb
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-30
---
# Review de segurança: F0 do coletor do BusinessMap (pedido 052, E2.3 e E2.8, K-182)

Propósito: parecer de segurança da F0 (cliente HTTP só GET, configuração, referência do quadro, tabela de times e carga inicial, grants), gatilhos segredo, integração externa, banco e dados pessoais (R-SEGURANCA). Público: node-backend (dono do código), tech-lead (E2.9, em paralelo), qa-engineer (E2.5), Jarvis.

**Veredito: aprovado** em `051c46e` (revalidação E2.8, delta `ffa261f..051c46e`, conferido também com `forge-check delta` sobre `746aae5`). Os cinco achados da rodada 1 (A1 bloqueante, A2 a A5 recomendados) foram resolvidos na volta E2.7, sem achado novo. Revisão estática; nada foi executado contra o BusinessMap, o `.env` não foi lido e nenhuma suíte foi rodada (decisão técnica de 2026-10-30: E2.8 sem suíte).

## Revalidação da volta (E2.8)
- **A1 resolvido.** `/users` tem lista própria, `CONSULTA_USERS`, só com `fields` (valor exato `user_id,realname`) e `user_ids` (`server/src/plataforma/http.ts:45-48`); o caminho exato `/users` troca de lista (`http.ts:195-196`) e exige os dois parâmetros (`http.ts:205`). `user_ids`, `fields` e `expand` saíram da lista geral, então não valem em outro caminho. `page` e `per_page` são recusados em `/users`: `listarPaginas('/users')` sempre os põe e falha antes da rede, o que cumpre a decisão técnica de 2026-10-30 (ADR 0020, R3-1 e R3-4). Lista grande vai em lotes de até 200 ids (`lotesDeUserIds`), cada lote ainda validado por `LISTA_IDS`. Testes em `server/tests/http.test.ts` (casos de `/users` e de lotes).
- **A2 resolvido.** Redact com `apikey`, `*.apikey`, `*.headers.apikey` e `*.*.headers.apikey` (`server/src/plataforma/log.ts:12-15`); `server/tests/log.test.ts` confere os quatro com o pino real.
- **A3 resolvido.** Janela móvel de 1 h, padrão 550 (abaixo dos 600/h da conta), que interrompe a execução em vez de esperar (`http.ts:119`, `179`); o corte em 120 s saiu do cálculo e `retry_after` acima de 120 s interrompe sem espera nem nova chamada (`http.ts:275`). A parada fica gravada e as chamadas seguintes repetem o erro. Testes de janela horária e de `retry_after` 121 (corpo e cabeçalho) em `http.test.ts`.
- **A4 resolvido.** `lerCorpo` (`http.ts:226-241`) recusa pelo `content-length` acima de 10 MB (`http.ts:120`, `228`) e, sem ele, lê em blocos e para no teto; sair do laço pelo erro cancela o fluxo. Vale para a resposta 200 e para o corpo do 429. Teste de `limite-bytes` com e sem cabeçalho.
- **A5 resolvido.** O cliente devolve só `get` e `listarPaginas` (`http.ts:355`); `requisitar` ficou interna e sem parâmetro de método (o `fetch` segue com `method: 'GET'` fixo). `montarAlvo` roda antes do log de `interrompido` (`http.ts:245-247`), então nenhum caminho fora da lista fechada chega ao log.
- **Fora dos achados, no delta:** `lerVersaoCriterioVigente` (`server/src/modulos/referencia/repositorio.ts:34-43`) ganhou um filtro por subconsulta sobre tabela do próprio esquema, com parâmetro `$1`; sem entrada externa nova, sem efeito de segurança. `diagnostico.ts` segue usando `limitePorMinuto` da própria configuração, não do cliente (a remoção do campo no retorno não o afeta).
- **Varreduras:** `gitleaks`, `osv-scanner` e `semgrep` continuam fora do PATH (lacuna registrada); o delta não muda dependência nem traz segredo literal (a chave dos testes é marcador fictício).

## O que foi verificado na rodada 1 (E2.3, 746aae5)
- **Só GET, única barreira contra escrita (Q-5 = B):** método fixo GET no `fetch`; lista fechada de caminhos com âncoras e `\d+` ASCII (`http.ts:15-21`): nenhum caminho de escrita ou de chave (`/my/apiKey/...`, `/users/{id}`) casa. Consulta fechada por nome (`Object.hasOwn`) e por formato.
- **Host fixo e sem redirect:** caminho com esquema ou `//` recusado; o alvo é sempre `base.origin` + prefixo + caminho validado. Base só `https` (http só em loopback) sem credencial, consulta nem fragmento, no cliente e na partida (`server/src/plataforma/config.ts`, só https). `redirect: 'manual'` e 3xx vira erro sem seguir; teste com segundo servidor.
- **Apikey fora de log, erro e URL:** só no cabeçalho `apikey`; `EventoHttp` sem campo de chave nem de consulta; `ErroBusinessMap` sem `cause` e sem corpo; erro de rede reduzido a código `[A-Z_]`; config valida sem ecoar valor.
- **401 e 403 interrompem:** nenhuma chamada seguinte sai, em qualquer caminho.
- **`registrado_por` fora da API:** em `COLUNAS_FORA_DA_API` nas duas tabelas de times (`server/src/plataforma/db/grants.ts:14-19`); teste 42501. O valor é rótulo fixo de carga ou HMAC do `sub`, nunca nome nem e-mail.
- **Gatilho de vigência:** `proibir_alteracao_vigencia` só deixa passar o UPDATE que fecha a vigência, barra DELETE e TRUNCATE nas quatro tabelas novas; o `down` da 0017 recusa se houver vigência posterior.
- **Grants:** `dspd_ref` com SELECT e INSERT em `ref_` e UPDATE só de `vigente_ate`; `dspd_coletor` só lê `ref_`; sem DELETE para papel de aplicação.
- **Migrações sem injeção:** SQL só de constantes do código; nenhum nome de pessoa na carga nem no arquivo de conferência.
- **Times só como filtro:** nenhuma view usa as tabelas de times.
- **Troca de ky e p-throttle por fetch nativo (ADR 0015 S-22):** do lado da segurança, a troca fica (sem dependência nova; redirect não seguido; erro sem `cause`). O critério de reversão com esses dois controles foi pedido à revisão da ADR (E1.28, 485df6a, na branch `docs/052-plano-hierarquia`).

## Achados

## Plano em cartões
- K-182: nada a corrigir na F0 pela segurança; segue para o QA (E2.5) e o PR (E2.6).

## Casos de abuso para o QA (E2.5)
Do modelo de ameaças (`052-integracao-businessmap-ameacas.md` §7), cobertos pela F0: CA-2, CA-3, CA-4 (partida com http e redirect) e CA-9 (páginas e bytes). No CA-3: `GET /users?fields=user_id,realname` sem `user_ids` recusado antes da rede; com `expand`, `is_archived`, `page` ou `per_page` recusado; só `fields` + `user_ids` passa. No limite de requisições: janela horária e `retry_after` acima de 120 s param a execução sem nova chamada.

## Riscos aceitos
Nenhum novo. Continua valendo a decisão do dono de 2026-10-29 de usar a própria chave, com poder de escrita (S-1 = Q-5 B); a F0 cumpre a mitigação (só GET, lista fechada, sem redirect). A troca por usuário de serviço só leitor segue pendente antes de qualquer coleta agendada fora da máquina do dono. Observação para a F1: a janela horária conta por instância do cliente (uma execução); duas execuções na mesma hora somam no servidor, e nesse caso o 429 com `retry_after` longo já para a execução.
