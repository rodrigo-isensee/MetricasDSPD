---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-ws1-estrutura
commit: 27d32b26f346fdfd56d1ab45c5e38579d7c1018a
parecer: reprovado
revisor: forge:security-engineer
data: 2026-10-30
---
# Review de segurança: script de diagnóstico da estrutura do BusinessMap (pedido 052, E1.16, K-185)

Propósito: parecer de segurança sobre o script de diagnóstico da WS1 (E1.15), gatilhos segredo (apikey do dono) e integração externa (R-SEGURANCA). Público: node-backend (dono do código), tech-lead (E1.17, em paralelo), qa-engineer (E1.18), Jarvis.

**Veredito: reprovado**, um bloqueante (A1): o script aceita `BUSINESSMAP_URL_BASE` com `http://`, contra o requisito A7 e o caso de abuso CA-4 do modelo de ameaças (`docs/security/052-integracao-businessmap-ameacas.md`), que o próprio modelo põe antes de qualquer chamada real à API. O resto do intervalo está correto pelo lado da segurança. Revisão estática do intervalo `9aa6b29..27d32b2` (1 commit, 7 arquivos); nada foi executado, o `.env` não foi lido e nenhuma chamada ao BusinessMap foi feita.

## O que foi verificado
- **Chave fora de stdout, stderr, erro e URL:** a apikey só entra no cabeçalho `apikey` (`server/src/modulos/businessmap/diagnostico.ts:100-106`); a URL é `urlBase + caminho + consulta`, e a consulta é só `?page=<n>` montada no código (linha 224). Mensagens de erro citam só o caminho, nunca a consulta, os cabeçalhos ou o corpo da resposta (linhas 128-163); erro do `fetch` vira mensagem própria sem `cause`, com o código só se casar `^[A-Z_]{3,30}$` (linhas 152-160). Toda mensagem de seção e o erro final passam por `limpar` (linhas 163, 278, 310). `lerConfig` nomeia só a variável, nunca o valor (linhas 55-64). O script não usa o pino, então o `redact` do `server/src/plataforma/log.ts:5-16` não entra em jogo; não há log.
- **Só GET e lista fechada, recusa antes da rede:** `method: 'GET'` fixo (linha 101); `PADRAO_CAMINHO` (linha 16) é checado antes do primeiro `fetch` (linha 123); o id do quadro só entra no caminho se for inteiro positivo (linhas 257-260), então resposta forjada não injeta caminho. `/users`, `/cards` e `allowedValues` ficam fora.
- **Redirecionamento:** `redirect: 'error'` (linha 104) impede reenviar a chave a outro host. Falta só o teste (A2).
- **Allow-list na saída (ADR 0020):** `reduzir` copia só escalares das chaves de `CAMPOS_PERMITIDOS` (linhas 18-21) e só desce em `workflows`, `columns` e `lanes`; campo customizado sai só com `field_id`, `name` e `type` (linha 22); o formato não reconhecido mostra só até 10 chaves de topo `^\w{1,40}$` (linhas 201-202). Texto saneado contra quebra de linha, `|` e crase, com corte em 120 (linha 229). Nenhum campo de pessoa (e-mail, `realname`, `username`, `user_id`, `owner_user_id`, `description`) está na lista. Ressalva sobre nomes de estrutura em A3.
- **Disponibilidade:** espaçamento pelo limite por minuto, 429 com espera limitada a 120 s e no máximo 5 vezes, 3 tentativas em 5xx e rede, páginas limitadas a 50, `AbortSignal.timeout` (linhas 87-163, 210).
- **`scripts/bm-diagnostico.sh`:** `set -euo pipefail` sem `set -x`; carrega o `.env` com `set -a` e `.` sem ecoar valor; o comando seguinte é constante. Exporta todas as variáveis do `.env` ao processo filho (inclusive as do banco), que lê só as do BusinessMap; aceitável numa ferramenta local do dono.
- **Dependências:** nenhuma nova; `zod` já é dependência do `server` (`server/package.json:43`); o lockfile não muda; o `package.json` só ganha o script `bm:diagnostico`.
- **Testes (`server/tests/diagnostico-businessmap.test.ts`):** cobrem recusa antes da rede (linhas 130-137), só GET, chave só no cabeçalho e fora da URL e da saída, campos de pessoa descartados (139-160), 401/403 com a chave no corpo da resposta (181-190), 5xx, rede, timeout e erro com a chave na mensagem (192-245), 429 (255-287), mensagens de configuração sem valor (289-306). Faltam os casos de A1 e A2.
- **Varreduras:** `gitleaks`, `osv-scanner` e `semgrep` não estão no PATH desta máquina (lacuna; o diff não toca dependência). Busca manual no diff: sem segredo literal (a chave dos testes é marcador fictício).

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/diagnostico.ts:47 · `z.string().url()` aceita `http://`: com URL errada no `.env`, a chave do dono vai em claro na rede. Exigir `https:` (`http:` só em 127.0.0.1, localhost, ::1) e testar a recusa (A7, CA-4). Dono: node-backend.
- A2 (recomendado) server/tests/diagnostico-businessmap.test.ts:139 · falta o teste do CA-4: servidor falso com 302 para outro host; o segundo host não recebe pedido nem chave e a seção diz indisponivel. O controle existe (diagnostico.ts:104). Dono: node-backend ou QA (E1.18).
- A3 (recomendado) server/src/modulos/businessmap/diagnostico.ts:300 · nome de raia, coluna ou quadro pode ser de pessoa; o cabeçalho promete "sem pessoas". Trocar por aviso de que nomes de estrutura saem como estão e o dono confere antes de colar (E1.20). Dono: node-backend.

## Detalhe dos achados
**A1.** Evidência: `diagnostico.ts:47` (`BUSINESSMAP_URL_BASE: z.string().url()`), e o teste `diagnostico-businessmap.test.ts:308-310` aceita `https://`, mas nenhum teste recusa `http://`. Caminho de ataque: o dono copia a URL sem o `s` (ou de um exemplo antigo); o primeiro GET sai em claro, com o cabeçalho `apikey`, antes de qualquer redirecionamento do servidor para `https` (o `redirect: 'error'` só barra o segundo salto). Quem está no caminho (rede corporativa, Wi-Fi, proxy que registra) lê a chave, que é a do dono e tem poder de escrita (A1 do modelo, risco aceito só com o freio do cliente só GET, que não vale para quem tem a chave). Severidade: média (exige erro de configuração e posição na rede; impacto alto). Correção mínima: em `esquemaEnv`, `refine` que aceita `protocol === 'https:'`, ou `http:` só com `hostname` em `127.0.0.1`, `localhost` ou `[::1]` (os testes usam servidor falso em `http://127.0.0.1`); mensagem `variável inválida: BUSINESSMAP_URL_BASE`, sem o valor; teste com `http://x.exemplo/api/v2` esperando código 2 e nenhuma requisição. Esforço: P.

**A2.** O controle está no código; o teste protege contra regressão (alguém trocar `redirect` ou o cliente HTTP). Esforço: P.

**A3.** Proporcionalidade: o script roda só na máquina do dono, a saída vai para o terminal dele e ele a confere antes de colar (E1.20); nada é gravado. Não é vulnerabilidade, é promessa imprecisa no relatório. Esforço: P.

## Plano em cartões
- K-185 (node-backend): A1 e A3 num commit `fix(server)`; A2 no mesmo commit ou no plano do QA (E1.18). Revalidação deste parecer pelo delta.

## Riscos aceitos
Nenhum novo. Continua valendo a decisão do dono de 2026-10-29 de usar a própria chave (S-1 = Q-5 B), registrada no modelo de ameaças; o script respeita a mitigação (só GET).
