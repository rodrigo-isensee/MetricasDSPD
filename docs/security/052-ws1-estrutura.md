---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-ws1-estrutura
commit: 22af8695311a303f81760fbaac79c307664760d5
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-30
---
# Review de segurança: script de diagnóstico da estrutura do BusinessMap (pedido 052, E1.16, K-185)

Propósito: parecer de segurança sobre o script de diagnóstico da WS1 (E1.15), gatilhos segredo (apikey do dono) e integração externa (R-SEGURANCA). Público: node-backend (dono do código), tech-lead (E1.17, em paralelo), qa-engineer (E1.18), Jarvis.

**Veredito: aprovado** em `22af869`. Os três achados da rodada 1 (A1 bloqueante, A2 e A3 recomendados) foram resolvidos na volta 1 da E1.15, sem regressão no resto. Revisão estática; nada foi executado contra o BusinessMap, o `.env` não foi lido.

## Revalidação (volta 1, intervalo c2f2038..22af869)
Delta conferido com `forge-check delta --parecer` (intervalo efetivo `27d32b2..22af869`; os commits intermediários `cee192d` e `c2f2038` são só pareceres). Arquivos tocados: `server/src/modulos/businessmap/diagnostico.ts`, `server/tests/diagnostico-businessmap.test.ts` e `docs/integracao/businessmap-api-configuracao.md` (linha 150).

- **A1 resolvido.** `urlSegura` (`diagnostico.ts:47-52`) aceita `https:` e `http:` só com `hostname` em `127.0.0.1`, `localhost` ou `[::1]`; aplicada por `refine` em `BUSINESSMAP_URL_BASE` (`diagnostico.ts:55`). Conferido o parser WHATWG: `http://[::1]:1` dá `hostname` `[::1]` (casa a lista), `http://LOCALHOST/` normaliza para `localhost`, e `http://127.0.0.1@evil.ex/` dá `evil.ex` (recusado, sem desvio por userinfo). A recusa sai por `lerConfig` com a mensagem que nomeia só a variável (código 2, antes de qualquer `fetch`). Teste em `diagnostico-businessmap.test.ts:302-312`: recusa `http://bm.exemplo`, `http://10.0.0.1` e `ftp://127.0.0.1`; aceita `https` e os três loopbacks.
- **A2 resolvido.** Teste em `diagnostico-businessmap.test.ts:290-298`: servidor falso responde 302 para um segundo servidor; o segundo registra zero requisições (logo, nem a chave), a seção diz `indisponivel` e a saída passa por `semChaveNemPessoa`. O controle continua em `diagnostico.ts:112` (`redirect: 'error'`).
- **A3 resolvido.** Cabeçalho do relatório (`diagnostico.ts:310`) agora diz "sem campos de pessoa" e pede conferir os nomes de quadro, coluna e raia antes de colar.
- **Sem regressão.** A mudança do 429 (`diagnostico.ts:136`, `151`, `173`) só troca o texto final da mensagem (`limite de 429 esgotado`), que segue passando por `limpar`; o número de tentativas e as esperas não mudam, nenhum dado da resposta entra na mensagem. O trecho do documento de integração descreve o comportamento e não traz valor de segredo. Nenhuma dependência nova.

## O que foi verificado na rodada 1 (27d32b2, continua valendo)
- **Chave fora de stdout, stderr, erro e URL:** a apikey só entra no cabeçalho `apikey`; a URL é `urlBase + caminho + ?page=<n>` montada no código; mensagens de erro citam só o caminho; erro do `fetch` vira mensagem própria sem `cause`; toda mensagem passa por `limpar`; `lerConfig` nomeia só a variável. O script não usa o pino (`server/src/plataforma/log.ts` não entra em jogo).
- **Só GET e lista fechada, recusa antes da rede:** `method: 'GET'` fixo; `PADRAO_CAMINHO` checado antes do primeiro `fetch`; id de quadro só se inteiro positivo. `/users`, `/cards` e `allowedValues` ficam fora.
- **Allow-list na saída (ADR 0020):** só escalares de `CAMPOS_PERMITIDOS`; campo customizado só com `field_id`, `name` e `type`; formato não reconhecido mostra só chaves de topo; texto saneado e cortado em 120.
- **Disponibilidade:** espaçamento pelo limite por minuto, 429 limitado, 3 tentativas em 5xx e rede, páginas limitadas a 50, timeout por pedido.
- **`scripts/bm-diagnostico.sh`:** sem `set -x`, carrega o `.env` sem ecoar valor.
- **Varreduras:** `gitleaks`, `osv-scanner` e `semgrep` não estão no PATH desta máquina (lacuna registrada; o diff não toca dependência). Busca manual: sem segredo literal (a chave dos testes é marcador fictício).

## Achados

## Plano em cartões
- Nenhum cartão novo. K-185 segue para o QA (E1.18).

## Riscos aceitos
Nenhum novo. Continua valendo a decisão do dono de 2026-10-29 de usar a própria chave (S-1 = Q-5 B), registrada no modelo de ameaças; o script respeita a mitigação (só GET, só https fora de loopback, sem seguir redirecionamento).
