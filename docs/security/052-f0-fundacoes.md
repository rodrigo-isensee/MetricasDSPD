---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f0-fundacoes
commit: f24c3a9b98722b2bf62961ef3ea8cf75e11de291
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-31
---
# Review de segurança: F0 do coletor do BusinessMap (pedido 052, E2.3, E2.8 e E2.20, K-182)

Propósito: parecer de segurança da F0 (cliente HTTP só GET, configuração, referência do quadro, tabela de times e carga inicial, grants), gatilhos segredo, integração externa, banco e dados pessoais (R-SEGURANCA). Público: node-backend (dono do código), tech-lead (E2.9 e E2.21), qa-engineer (E2.5 e E2.22), Jarvis.

**Veredito: aprovado** em `f24c3a9` (revalidação por delta E2.20, depois do merge da develop e da renumeração das migrações, E2.19). Antes: aprovado em `051c46e` (revalidação E2.8, delta `ffa261f..051c46e`, conferido também com `forge-check delta` sobre `746aae5`). Os cinco achados da rodada 1 (A1 bloqueante, A2 a A5 recomendados) foram resolvidos na volta E2.7, sem achado novo. Revisão estática; nada foi executado contra o BusinessMap, o `.env` não foi lido e nenhuma suíte foi rodada (decisão técnica de 2026-10-30: E2.8 sem suíte).

## Revalidação por delta depois da E2.19 (E2.20, 2026-10-31)
Delta lido: `git diff e86e8d5..f24c3a9` (merge da develop `4e7a180`, PR 175, e renumeração), conferido com `forge-check delta --parecer` (intervalo `051c46e..f24c3a9`; os commits intermediários `ba3ddff`, `c15c1ab`, `e018d85` e `e86e8d5` são só pareceres). Para separar o que é da F0 do que veio da develop, li também `git diff 4e7a180..f24c3a9` (lado da F0 sobre a develop) e listei os arquivos que diferem dos dois pais do merge.
- **Renumeração 0016 e 0017 para 0018 e 0019, conteúdo igual.** `git diff -M` dá rename 100% nos dois arquivos; os checksums em `server/migrations/checksums.json` são os mesmos de antes (`5f427f7f...` e `80d4011e...`), só a chave mudou. O lado da F0 sobre a develop traz só `0018`, `0019`, `checksums.json`, `grants.ts` e o bloco do BusinessMap no `.env.example`. As migrações do Acelerato (`0016_ac_stg_chamado_recorte`, `0017_ac_projecao_f2`) não criam função, gatilho nem grant com nome da F0; `proibir_alteracao_vigencia` segue só na `0018` (`0018_bm_referencia_workflow_tipo_times.ts:25`). Nenhuma referência ativa aos nomes antigos em `server`, `scripts`, `packages` ou `.github`; a ordem do `down` em `server/tests/pesquisa.pg.test.ts:144` e o import em `server/tests/referencia-times.pg.test.ts:3` usam os nomes novos.
- **Grants depois do merge.** `server/src/plataforma/db/grants.ts` em `f24c3a9` é o da F0: `dspd_bm.ref_time.registrado_por` e `dspd_bm.ref_time_workflow.registrado_por` seguem em `COLUNAS_FORA_DA_API` (`grants.ts:17-18`); o merge não perdeu nem somou entrada. As migrações da F0 não têm GRANT literal; o grant segue gerado por `gerarGrants`.
- **`COLUNAS_PESSOA` depois do merge.** `server/src/plataforma/db/lgpd.ts` em `f24c3a9` é idêntico ao da develop: `COLUNAS_PESSOA` continua só com `responsaveis` de `dim_card` e `dim_card_versao` (`lgpd.ts:12-13`); a develop somou duas exceções do Acelerato (`com_agente`, booleano, `lgpd.ts:22-23`), já revisadas no pedido 056. As tabelas da F0 não têm coluna de pessoa (`nome` é de workflow, tipo e time; `registrado_por` é rótulo de carga ou HMAC, fora da API).
- **`.env.example` com os blocos separados.** Sobre a develop, o lado da F0 só soma 8 linhas (+8 -0) e, sobre a F0, a develop só soma 12 (+12 -0): nenhuma linha removida de um lado nem de outro. Bloco do BusinessMap nas linhas 25-32 (nomes sem valor) e bloco do Acelerato nas linhas 33-44 (comentado, sem valor; só os dois tetos numéricos `120000` e `24`, que não são credencial). Nenhuma variável mistura as duas fontes.
- **Resto do delta:** código do Acelerato, `scripts/coleta.sh`, dependência nova e documentos vieram da develop sem mudança no merge (já revisados em `docs/security/056-coletor-f1-f2.md` e `docs/security/056-coletor-listas-e-driver.md`); não fazem parte desta revalidação. Nenhum arquivo do cliente HTTP, da configuração ou do log da F0 mudou.
- **Para o tech-lead (estilo, sem efeito de segurança):** comentários ainda citam a numeração antiga em `server/tests/referencia-times.pg.test.ts:11` e `:204` e em `server/tests/conferencia.test.ts:53`.
- **Observação:** um banco local que já aplicou a F0 com os nomes antigos falha na verificação de checksum da `0016` (falha fechada, só disponibilidade local); a F0 nunca chegou à develop nem à homologação.
- **Varreduras:** `gitleaks`, `osv-scanner` e `semgrep` continuam fora do PATH (lacuna registrada). Leitura manual do `.env.example`: sem segredo real (as senhas `*_dev` e `troque-me-postgres` das linhas 3-14 são do Compose local e anteriores a esta branch).

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
- **Gatilho de vigência:** `proibir_alteracao_vigencia` só deixa passar o UPDATE que fecha a vigência, barra DELETE e TRUNCATE nas quatro tabelas novas; o `down` da 0017 (hoje 0019) recusa se houver vigência posterior.
- **Grants:** `dspd_ref` com SELECT e INSERT em `ref_` e UPDATE só de `vigente_ate`; `dspd_coletor` só lê `ref_`; sem DELETE para papel de aplicação.
- **Migrações sem injeção:** SQL só de constantes do código; nenhum nome de pessoa na carga nem no arquivo de conferência.
- **Times só como filtro:** nenhuma view usa as tabelas de times.
- **Troca de ky e p-throttle por fetch nativo (ADR 0015 S-22):** do lado da segurança, a troca fica (sem dependência nova; redirect não seguido; erro sem `cause`). O critério de reversão com esses dois controles foi pedido à revisão da ADR (E1.28, 485df6a, na branch `docs/052-plano-hierarquia`).

## Achados

## Plano em cartões
- K-182: nada a corrigir na F0 pela segurança depois da E2.19; segue para a E2.21, a E2.22 e o PR (E2.6).

## Casos de abuso para o QA (E2.5)
Do modelo de ameaças (`052-integracao-businessmap-ameacas.md` §7), cobertos pela F0: CA-2, CA-3, CA-4 (partida com http e redirect) e CA-9 (páginas e bytes). No CA-3: `GET /users?fields=user_id,realname` sem `user_ids` recusado antes da rede; com `expand`, `is_archived`, `page` ou `per_page` recusado; só `fields` + `user_ids` passa. No limite de requisições: janela horária e `retry_after` acima de 120 s param a execução sem nova chamada.

## Riscos aceitos
Nenhum novo. Continua valendo a decisão do dono de 2026-10-29 de usar a própria chave, com poder de escrita (S-1 = Q-5 B); a F0 cumpre a mitigação (só GET, lista fechada, sem redirect). A troca por usuário de serviço só leitor segue pendente antes de qualquer coleta agendada fora da máquina do dono. Observação para a F1: a janela horária conta por instância do cliente (uma execução); duas execuções na mesma hora somam no servidor, e nesse caso o 429 com `retry_after` longo já para a execução.
