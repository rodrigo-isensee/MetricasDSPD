---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-rota-apontamento
commit: 75bd9d9fc5c93bc5795bbabca579da417421c816
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: rota da aba Apontamento (pedido 059, E2.24, K-193)

Diff revisado: `origin/feature/059-contrato-biblioteca..75bd9d9` (o que a branch da rota soma à do contrato). O código vai até `8a92a49`; `75bd9d9` só acrescenta o parecer de devops (`docs/devops/059-rota-apontamento.md`). Itens lidos linha a linha: `7862ee9` (papel e GRANTs), `0f582f2` (rota, 421, interruptor, no-store), `f9664ee` (troca da interface local pelo import de `./coletor`), `1833eda` (limiares como versão de critério), `b4e72c1` (Outra área e a view da migração 0029) e `8a92a49` (guardas de teste). Referência: ADR 0020 revisão 4 (R4-1 a R4-8) no ramo `origin/docs/059-apontamento-discovery` (`abf0761`) e o parecer `docs/security/059-adrs.md` daquele ramo. Revisão estática: o `.env` não foi lido, nada foi executado contra banco nem contra o BusinessMap, nenhum nome de pessoa neste documento.

O intervalo também traz a trilha A (spike, migrações 0021 a 0028, cliente do `/loggedTime`, coleta, supressão), que ainda não tem parecer de segurança próprio. Li dela os controles que a rota usa ou dos quais depende (allow-list, `CONSULTA_WORKLOG`, `redact`, `ctl_coleta_falha` com `id_origem` do apontamento, supressão por HMAC, grants do coletor) e não achei desvio da ADR 0020 R4-2 e R4-6; a revisão completa da coleta fica para o parecer da branch dela. Os pareceres de 052 e as mudanças de `limpar-seed` no diff vêm do merge da develop (`05c5378`) e já têm parecer próprio.

**Veredito: aprovado.** Nenhum bloqueante. Duas recomendações que não devolvem (A1 e A2). A view sem `security_invoker` da migração 0029 é aceitável como está (detalhe abaixo); ela é a "revisão adicional" que a alternativa (b) da R4 pedia.

## Gatilhos
Dado pessoal (nome real e chave opaca de pessoa numa rota sem autenticação), novo papel de banco com GRANT por coluna, view com o privilégio do dono, exceções nomeadas em guardas de LGPD e de view (controle de integridade do projeto), mudança em compose, nginx, workflows e scripts de papéis. R-SEGURANCA.

## Achados
- A1 (recomendado) server/eslint.config.js:38 · `noInlineConfig` só no módulo da aba: noutro módulo um `eslint-disable` desliga a regra do pool, e `src/entradas` e `src/plataforma` importam `abrirPoolApontamento` pelo index. O privilégio e a credencial só na config da API seguram.
- A2 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:140 · (ramo do discovery) a R4-5 não lista `apt_pessoa_time` nem `ref_versao_criterio_metrica`, e a alternativa (b) dá a view definer como preterida; registrar view, parecer e tabelas antes da R4 vigorar.

## O que foi verificado e está correto

**Papel `dspd_api_apontamento` e GRANTs por coluna (`grants.ts:14-29`, `:134-140`).** Papel `LOGIN` próprio, sem SUPERUSER, CREATEDB nem herança, criado no init e no `reparar-papeis.sh` (senha por variável de psql e `quote_literal`, nome do banco validado por regex). Entra em `PAPEIS`, então recebe o REVOKE geral nos três esquemas antes de qualquer GRANT; USAGE só em `dspd_bm` e `dspd_core`, nunca no Acelerato. Os GRANTs saem só de `COLUNAS_API_APONTAMENTO`, sempre por coluna: de `dim_responsavel` só `pessoa_ref` e `responsavel_nome` (nunca `responsavel_id`); de `fato_apontamento` sem `logged_time_id`, hash, comentário, categoria nem `qtd_palavras`; de `ctl_coleta` só id, tarefa, status e instantes (sem `erro_resumo` nem `parametros`); nada em `stg_`, `evt_`, `cfg_` (a lista de supressão fica fora) nem tabela do Acelerato. Nenhuma das regras genéricas (`IMUTAVEL`, `PROJECAO`, prefixos `ref_`, `ctl_`, `vw_`) alcança `apt_pessoa_time`, `fato_apontamento`, `dim_card_raiz` ou `dim_responsavel` para outro papel além do coletor, e o `dspd_api` segue sem nenhuma tabela da aba nem coluna de `COLUNAS_PESSOA` (teste unitário em `apontamento-papel.test.ts` e o de catálogo em `catalogo.pg.test.ts`, que também prova `42501` do `dspd_api` na view). As colunas novas de pessoa entram em `COLUNAS_PESSOA` (`lgpd.ts`). As consultas do repositório usam só colunas concedidas, esquema vindo de `Esquemas` e todo valor por parâmetro.

**Pool (`pool.ts`, `entradas/api.ts`).** Aberto só com `PG_APONTAMENTO_URL`, que só a config da API lê (a config da coleta não a conhece); `statement_timeout` de 10 s, no máximo 4 conexões, `application_name` próprio, encerrado no SIGTERM. Sem a variável a rota não existe (teste: 404). Resíduo de lint no A1.

**Rota única e consulta estrita (`rotas.ts`).** Fora de `/api/v1`, num plugin encapsulado: hooks e tratador de erro valem só para ela. Consulta pelo schema `strict` do contrato mais a recusa de valor repetido; validação antes de qualquer acesso ao banco (testes com injeção, 10 000 caracteres, 201 itens, nome no lugar de `pessoaRef`: 400 sem chamada ao banco). O 400 da aba leva só `path` e `code` (o `keyword` do zod); chave desconhecida em objeto estrito aparece com caminho vazio, então nenhum nome nem valor enviado volta. O 422 do filtro `tipo` é recusa explícita, não ignora o filtro.

**421 de Host e Origin (`hosts.ts`, `rotas.ts:59-64`).** `onRequest` é o primeiro hook, antes da validação e do banco, e vale com o interruptor ligado ou desligado (os testes rodam os dez casos recusados nos dois estados). Lista fechada `localhost`, `127.0.0.1`, `::1` e o `APONTAMENTO_REDE_LOCAL` declarado; comparação exata depois de minúsculas e sem colchetes, porta fora; `Host` com forma inválida, sufixo, prefixo, IPv4 privado não declarado, `Origin: null` e esquema diferente de `http(s)` dão 421 sem corpo, com `no-store`, sem consulta ao banco e com log só do código. Um IPv4 literal da rede local não é vetor de rebinding (o ataque precisa de nome resolvível). O nginx repassa `Host $host` (`docker/web/nginx.conf:5`), e o proxy do Vite, por padrão só em `localhost`, repassa o `Host` do navegador. O 421 protege o navegador; quem fala direto com a porta escolhe o `Host`, e por isso a guarda de partida, não o 421, é que limita quem alcança a API.

**Interruptor `APONTAMENTO_NOMES` e guarda de partida (`config.ts:44-53`).** Enum `0`/`1` com padrão `0`; vazio ou outro valor recusa a partida. Ligado, a partida exige `HOST` em `127.0.0.1` ou `::1`, igual ao `APONTAMENTO_REDE_LOCAL` (um IPv4 privado único; zod recusa `0.0.0.0`, `::`, faixa, lista, nome, público, octeto com zero à esquerda) ou `0.0.0.0` com `APONTAMENTO_PUBLICACAO_LOOPBACK=1`; a mensagem cita a variável, nunca o valor (teste com a senha da URL fora da mensagem). Todas as portas dos dois compose são publicadas em `127.0.0.1:` (teste estático); o compose de homologação não recebe `PG_APONTAMENTO_URL` nem o interruptor (a rota não existe lá) e nenhum workflow liga o nome. Desligado, o rótulo é "Pessoa n" e a consulta ao nome nem é feita (teste sobre o SQL emitido). Ligado, o nome aparece uma única vez no corpo, só em `opcoes.pessoas[].rotulo`, e só para quem é do time (`servico.ts:104`).

**no-store e CORS (`rotas.ts:54-57`).** `onSend` do plugin põe `Cache-Control: no-store` em toda resposta da aba, inclusive 400, 421, 422 e 500; nenhum plugin de CORS no servidor, e o teste confere a ausência de `Access-Control-*`.

**Erros e log só com caminho e código.** O registro de requisição da aba usa `serializadorDaAba` (método e caminho, sem consulta e sem `Host`); a falha do banco loga só a classe e o SQLSTATE e responde 500 genérico (teste com marcador de nome na mensagem do driver, ausente da resposta e do log). O `redact` ganhou `comment`, `comentario`, `realname` e `responsavel_nome` em um e dois níveis, como defesa secundária.

**`./coletor` no `package.json` (`f9664ee`).** O subcaminho passa a existir para o coletor importar a função real; os três testes da trilha B foram relaxados só para essa linha exata. O `web/` não alcança o subcaminho: o lint da raiz proíbe `@metricas-dspd/metricas/*` inteiro na UI, e o teste de bundle varre `web/src` atrás de `classificarApontamento` e `metricas/coletor`. No servidor, o lint só deixa `modulos/businessmap` importar o subcaminho, e no módulo da aba o `eslint-disable` é ignorado (teste). Relaxamento aceito.

**Outra área (`servico.ts:97-98`).** Quem não é do time vira uma entrada única `outra-area`, sem nome e sem a chave da pessoa, também com o nome real ligado; os nomes só são buscados para os `pessoa_ref` do time; pessoa eliminada (`pessoa_ref` nulo) segue sem pessoa. Testes unitário e `.pg` conferem que nenhuma chave nem nome das pessoas de fora vai ao corpo. Isso também fecha, pela decisão do dono de 2026-11-02, o A7 do parecer das ADRs (pessoas de fora do escopo com nome).

**Limiares como versão de critério (`1833eda`).** Gravação por comando manual com o migrador (dono da referência), por parâmetro, idempotente, data validada por regex; a rota só lê `ref_versao_criterio_metrica` (id e métrica). Sem efeito de segurança além do GRANT de leitura já citado.

## A view sem `security_invoker` da migração 0029: aceitável

`apt_pessoa_time` roda com o privilégio do dono (`dspd_migrador`) e lê `dim_card_versao.responsaveis` e `dim_responsavel.responsavel_id`, que o papel da aba não lê; entrega só `pessoa_ref` e `vigencia_ate`. Por que aceito:
1. **Saída mínima.** O papel da aba já lê `pessoa_ref` de todos em `dim_responsavel`; a view acrescenta só "foi responsável por card do escopo até a data D", agregado por pessoa, sem card, sem id do BusinessMap. A rota nunca devolve `vigencia_ate`; usa o conjunto só para separar o time da Outra área.
2. **Quem a lê.** GRANT por coluna só ao `dspd_api_apontamento`; nenhum outro papel de aplicação, e `42501` do `dspd_api` provado no `.pg`.
3. **`search_path`.** A objeção da alternativa (b) da R4 não se aplica a view: os nomes são qualificados pelo esquema e resolvidos na criação, não na consulta.
4. **Vazamento por predicado.** Sem `security_barrier`, um predicado de quem consulta pode ser avaliado antes do filtro da view, mas ele só alcança as colunas de saída: sobre `pessoa_ref` revela o que o papel já lê, e `vigencia_ate` é agregado. O papel também não cria função (sem CREATE em esquema, TEMP revogado de PUBLIC no init) e só roda o SQL fixo do código. Pôr `WITH (security_barrier)` é endurecimento opcional, sem achado.
5. **Eliminação.** Apagar a linha de `dim_responsavel` tira a pessoa da view; nada novo a eliminar.
6. **Exceções nomeadas nos guardas.** `catalogo.pg.test.ts` e `migracoes.estatico.test.ts` isentam só o nome exato `apt_pessoa_time`; toda outra view continua obrigada a `security_invoker`, e a exceção prende a lista de colunas da view a `['pessoa_ref', 'vigencia_ate']` (coluna nova falha o teste). A isenção do `view_column_usage` é necessária porque a view usa `responsavel_id`; a trava contra saída nova é a lista de colunas. A isenção em `migracoes.estatico.test.ts` para `COLUNAS_PESSOA` é a mesma coluna de view, coberta pelo catálogo real.

Alternativas, se o arquiteto preferir não ter definer: (a) função `SECURITY DEFINER` com `SET search_path` fixo devolvendo o conjunto (mesmo modelo de privilégio, mais explícito, mais código); (b) marca "do time" calculada pelo coletor, que já lê `responsaveis`, numa projeção própria (sem definer, mas muda a trilha A e fica defasada até a próxima coleta). Nenhuma é exigida.

## Detalhe dos achados

### A1 (recomendado): a regra do pool não é fechada fora do módulo da aba
`noInlineConfig` (`server/eslint.config.js:38`) cobre `src/modulos/apontamento/**`, o que protege o módulo da aba contra importar a biblioteca do coletor, mas a regra que proíbe importar o pool fica em cada um dos outros módulos (`:29`), onde um `// eslint-disable-next-line no-restricted-imports` a desliga; e o bloco de `src/*.ts`, `src/plataforma/**` e `src/entradas/**` (`:40-46`) aceita o `index.js` de qualquer módulo, então uma entrada nova importaria `abrirPoolApontamento`. Caminho: só por erro de código que passasse no code review; mesmo assim, sem `PG_APONTAMENTO_URL` (que só a config da API carrega) o pool não abre, e o privilégio do papel continua o limite. Severidade baixa. Correção mínima: `linterOptions: { noInlineConfig: true }` em `src/**/*.ts` (hoje não há nenhum `eslint-disable` em `server/src`), ou um teste que recuse `eslint-disable` em `server/src`; e no bloco de fora dos módulos, proibir `**/modulos/apontamento/*` com `ignores` só para `src/app.ts`, `src/entradas/api.ts` e `src/entradas/openapi.ts`. Esforço P. Dono: node-backend.

### A2 (recomendado): a ADR 0020 R4-5 não descreve o que a branch concede
A lista fechada da R4-5 (`:140` no ramo do discovery) não cita `apt_pessoa_time` nem `ref_versao_criterio_metrica`, e a alternativa (b) (`:165`) diz que a view com o privilégio do dono foi preterida e que só valeria com revisão adicional da segurança. O código está certo; o texto da decisão é que ficou atrás, e o critério de reversão da R4 é lido contra ele. Correção mínima: acrescentar à R4-5 a view (`pessoa_ref` e `vigencia_ate`, GRANT por coluna só ao papel da aba, com este parecer como a revisão adicional) e `ref_versao_criterio_metrica` (`versao_id`, `metrica_id`), e ajustar a alternativa (b). Esforço P. Dono: software-architect, antes de a revisão 4 passar a vigente.

## Plano em cartões
- A1: node-backend, junto da próxima volta da rota ou no cartão de recomendados.
- A2: software-architect, na próxima edição da ADR 0020 no ramo do discovery.

## Riscos aceitos
Nenhum novo. Com o nome real ligado e `APONTAMENTO_REDE_LOCAL`, qualquer máquina da rede local lê a aba sem autenticação: consequência das decisões "C" e P-1 do dono (2026-11-01), registrada na R4-5, até o login pelo AD. `HOST=0.0.0.0` com `APONTAMENTO_PUBLICACAO_LOOPBACK=1` fora do contêiner é declaração do dono que a guarda não confere, como a R4-5 já diz.

## Ferramentas e lacunas
Leitura estática e `git grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação e não foram rodados; as varreduras ficam no CI do `devops-engineer`. A busca manual no diff por credencial achou só as senhas de desenvolvimento já usadas no padrão do projeto (`*_dev`) e chaves fictícias de teste; nenhuma dependência de produção nova. Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
