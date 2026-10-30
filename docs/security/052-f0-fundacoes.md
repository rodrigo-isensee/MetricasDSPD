---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f0-fundacoes
commit: 746aae599b9cdb5c1029ed83e366f5646635b083
parecer: reprovado
revisor: forge:security-engineer
data: 2026-10-30
---
# Review de segurança: F0 do coletor do BusinessMap (pedido 052, E2.3, K-182)

Propósito: parecer de segurança da F0 (cliente HTTP só GET, configuração, referência do quadro, tabela de times e carga inicial, grants), gatilhos segredo, integração externa, banco e dados pessoais (R-SEGURANCA). Público: node-backend (dono do código), tech-lead (E2.4, em paralelo), qa-engineer (E2.5), Jarvis.

**Veredito: reprovado** em `746aae5` (intervalo `11141d7..746aae5`), por um achado bloqueante (A1): o cliente aceita `GET /users` sem `user_ids` e com `expand`, contra a ADR 0020 R3-1 e R3-4 e o plano 052 F0. O resto da F0 está de acordo com o modelo de ameaças. Revisão estática; nada foi executado contra o BusinessMap e o `.env` não foi lido.

## O que foi verificado
- **Só GET, única barreira contra escrita (Q-5 = B):** `requisitar` recusa método diferente de GET antes da rede (`server/src/plataforma/http.ts:187`) e o `fetch` leva `method: 'GET'` fixo (`http.ts:201`). Lista fechada de caminhos com âncoras e `\d+` ASCII (`http.ts:14-20`): nenhum caminho de escrita ou de chave (`/my/apiKey/...`, `/users/{id}`) casa. Consulta fechada por nome (`Object.hasOwn`, sem herança de protótipo) e por formato (`http.ts:157-163`). Testes em `server/tests/http.test.ts:86-143`.
- **Host fixo e sem redirect:** caminho com esquema ou `//` recusado (`http.ts:154`); o alvo é sempre `base.origin` + prefixo + caminho validado (`http.ts:170`). Base só `https` (http só em loopback) sem credencial, consulta nem fragmento, no cliente (`http.ts:106-117`) e na partida (`server/src/plataforma/config.ts:47-50`, só https). `redirect: 'manual'` e 3xx vira erro sem seguir (`http.ts:203`, `208-211`); teste com segundo servidor (`http.test.ts:154`).
- **Apikey fora de log, erro e URL:** só no cabeçalho `apikey` (`http.ts:202`); `EventoHttp` não tem campo de chave nem de consulta (`http.ts:85-90`); `ErroBusinessMap` sem `cause` e sem corpo (`http.ts:63-72`); erro de rede reduzido a código `[A-Z_]` (`http.ts:241-247`); config valida sem ecoar valor (`config-businessmap.test.ts:19`). Teste do marcador em mensagem, stack, JSON e log (`http.test.ts:165`).
- **401 e 403 interrompem:** marcam `interrompido` e nenhuma chamada seguinte sai, em qualquer caminho (`http.ts:188-191`, `212-216`); teste `http.test.ts:226`.
- **Disponibilidade:** janela móvel de 60 s com teto de 25 por minuto na config (`config.ts:60`), 429 com `retry_after` limitado a 1..120 s e 5 esperas, 3 tentativas em 5xx e rede, timeout por chamada, teto de páginas por execução (`http.ts:140-151`, `173-183`, `276`).
- **`registrado_por` fora da API:** entra em `COLUNAS_FORA_DA_API` nas duas tabelas de times (`server/src/plataforma/db/grants.ts:14-19`); teste 42501 (`referencia-times.pg.test.ts:157`). O valor é rótulo fixo de carga ou HMAC do `sub`, nunca nome nem e-mail (`0017_bm_carga_inicial_times.ts:16`).
- **Gatilho de vigência:** `proibir_alteracao_vigencia` só deixa passar o UPDATE que fecha a vigência (`vigente_ate` de NULL para data, resto igual por `to_jsonb`), barra DELETE e TRUNCATE, nas quatro tabelas novas (`0016_bm_referencia_workflow_tipo_times.ts:24-33`, `54-57`); testes até para o dono (`referencia-times.pg.test.ts:81`, `99`). O `down` da 0017 recusa se houver vigência posterior e só desliga o gatilho dentro da transação da migração (`0017:76-85`).
- **INSERT herdado pelo `dspd_ref` em `ref_time`:** `dspd_ref` recebe SELECT e INSERT em todo `ref_` e UPDATE só de `vigente_ate` (`grants.ts:79-81`); `dspd_coletor` só lê `ref_` (`grants.ts:71`). Teste `referencia-times.pg.test.ts:174`. Sem DELETE para nenhum papel de aplicação.
- **Migrações sem injeção:** a 0017 monta SQL só de constantes do código, com aspas escapadas (`0017:52`); nenhum valor externo entra. Nenhum nome de pessoa na carga (nomes de time e "Workflow <id>") nem no arquivo de conferência (`businessmap-conferencia.json`, só ids, nomes de coluna e de tipo).
- **Times só como filtro:** nenhuma view usa as tabelas de times (`referencia-times.pg.test.ts:181`, `times-sem-comparacao.test.ts`).
- **Troca de ky e p-throttle por fetch nativo (ADR 0015 S-22):** do lado da segurança, **a troca fica**. Motivos: zero dependência nova na cadeia de suprimentos (ky e p-throttle nunca entraram no `package.json`); `redirect: 'manual'` é mais seguro que o padrão `follow` do `fetch` sob o ky, que reenviaria o cabeçalho `apikey` (não é `Authorization`) a outro host num redirect; erro próprio sem `cause` fica sob controle do projeto. A revisão da ADR (E1.27) deve registrar esses dois controles como critério: voltar a uma biblioteca só se ela mantiver redirect não seguido e erro sem `cause`.
- **Varreduras:** `gitleaks`, `osv-scanner` e `semgrep` não estão no PATH desta máquina (lacuna registrada; o diff não muda dependência). Busca manual no diff: sem segredo literal (a chave dos testes é marcador fictício). O `.env.example` não foi lido por regra de negação da sessão (lacuna; o teste `config-businessmap.test.ts:13` indica valores vazios), conferir no QA.

## Achados
- A1 (bloqueante) server/src/plataforma/http.ts:165 · /users passa sem user_ids e com expand (http.ts:33): lê o nome de toda a conta, contra ADR 0020 R3-1/R3-4 e o plano F0. Correção: /users exige fields e user_ids e recusa outro parâmetro, salvo page e per_page; testes. Dono: node-backend.
- A2 (recomendado) server/src/plataforma/log.ts:12 · O plano F0 pede redact da apikey no logger: só há *.apikey (um nível). Acrescentar apikey, *.headers.apikey e *.*.headers.apikey, defesa em profundidade para F1 a F3. Dono: node-backend.
- A3 (recomendado) server/src/plataforma/http.ts:182 · 25/min dá até 1500/h, acima dos 600/h da conta; o retry_after é cortado em 120 s e esconde o 429 horário. Janela horária abaixo de 600 e retry_after acima de 120 s interrompendo a execução. Dono: node-backend.
- A4 (recomendado) server/src/plataforma/http.ts:232 · Sem teto de bytes por resposta (CA-9 pede páginas e bytes): resp.text() lê o corpo inteiro. Ler com limite (por exemplo 10 MB) e erro limite-bytes; host confiável sob TLS, por isso não bloqueia. Dono: node-backend.
- A5 (recomendado) server/src/plataforma/http.ts:295 · requisitar(metodo) sai no objeto devolvido (o modelo pede sem método genérico exportado) e o evento interrompido loga caminho não validado (http.ts:189). Devolver só get e listarPaginas; validar antes de logar. Dono: node-backend.

## Plano em cartões
- K-182 (volta da F0, node-backend): A1 obrigatório; A2 a A5 por decisão técnica do time, junto com os achados do review E2.4. Depois da volta, revalidação por delta desta etapa.

## Casos de abuso para o QA (E2.5)
Do modelo de ameaças (`052-integracao-businessmap-ameacas.md` §7), cobertos pela F0: CA-2, CA-3, CA-4 (partida com http e redirect) e a parte de páginas do CA-9. Acrescentar ao CA-3, depois do A1: `GET /users?fields=user_id,realname` sem `user_ids` recusado antes da rede; com `expand` ou `is_archived` recusado; só `fields` + `user_ids` (mais `page` e `per_page`) passa.

## Riscos aceitos
Nenhum novo. Continua valendo a decisão do dono de 2026-10-29 de usar a própria chave, com poder de escrita (S-1 = Q-5 B); a F0 cumpre a mitigação (só GET, lista fechada, sem redirect). A troca por usuário de serviço só leitor segue pendente antes de qualquer coleta agendada fora da máquina do dono.
