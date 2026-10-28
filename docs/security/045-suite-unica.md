---
tipo: revisao-seguranca
contrato: 1
pedido: 045-suite-unica-com-trava
branch: feature/045-suite-unica
commit: b03159ce0f7795da5686c29ce6f72403c8fb17fd
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-28
---
# Review de segurança: trava de suíte única (pedido 045, E1.3 e E3)

Propósito: parecer de segurança sobre `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh` e os scripts do `package.json` que passam a chamá-lo (gatilho: script de shell que cria arquivo em `/tmp` compartilhado entre worktrees, `R-SEGURANCA`). Público: tech-lead, qa-engineer, node-backend.

**Veredito: aprovado**, sem bloqueante. Revisão estática do diff `d7c74b4..b03159c` (4 arquivos); nada foi executado, nenhuma varredura rodada (o diff não toca dependência nem lockfile; `gitleaks` e `osv-scanner` não foram invocados). A trava é ferramenta de desenvolvimento local em estação de um usuário só; não há entrada externa nem dado de pessoa. Os achados são de robustez e endurecimento.

## O que foi verificado
- **Arquivo de trava em `/tmp` (`suite-unica.sh:18-22`):** caminho fixo e previsível, aberto em modo append (`9>>`), sem truncar e sem gravar conteúdo; o arquivo só serve de alvo do `flock`. Link simbólico: o teste `-L` (linha 20) é verificação-e-uso (TOCTOU) e o `9>>` segue link; mas o abrir só cria/abre, não escreve, e o kernel com `fs.protected_symlinks` (padrão em distribuições comuns; não pude ler o valor aqui, permissão negada) barra o seguimento em `/tmp` com sticky bit. Pior caso sem a proteção: criação de um arquivo vazio no destino de um link pendente, no nome do próprio usuário. Sem ganho de confidencialidade nem integridade. Dono e permissão: o arquivo nasce com a umask do usuário (em geral 0644), então outro usuário local consegue abri-lo para leitura e segurar o `flock` (negação de serviço da trava); numa estação de um usuário (WSL) não há esse ator (A1).
- **Condição de corrida na criação:** `9>>` cria atomicamente (`O_CREAT`); duas chamadas simultâneas abrem o mesmo arquivo e o `flock` decide. O teste (`suite-unica.test.sh:102-113`) cobre a serialização. Sem janela de criação explorável além do TOCTOU acima.
- **Citação:** `"$@"` (linhas 13 e 30), `"$TRAVA"`, `"$#"` e os testes do `.test.sh` estão entre aspas; sem `eval`, sem `sh -c` com concatenação, sem expansão de argumento em comando. `TRAVA` vem de `METRICAS_DSPD_SUITE_LOCK`, variável do ambiente do próprio usuário (usada pelo teste); quem controla o ambiente já executa código como o usuário.
- **Repasse do comando:** o script executa o que recebe por design; os chamadores (`package.json`) passam argumentos constantes (`pnpm -r --if-present test`, `bash scripts/test-pg.sh`, `pnpm run pronto:interno`), sem dado externo. Sem escalada: roda com o mesmo usuário. O código de saída é preservado (linha 31; teste 3).
- **Variável de não aninhar (`METRICAS_DSPD_SUITE_SEGURA`, linhas 12 e 28):** é marca no ambiente, não prova de posse da trava. Quem a exporta pula a trava (A3). Não é fronteira de segurança, só coordenação entre cooperantes; o `pronto` aninhado (`pronto` para `pronto:interno` para `test`) evita o deadlock como desejado (teste 2).
- **`package.json`:** só reencaminha scripts existentes pelo lançador; sem hook de instalação novo, sem `overrides`, sem dependência, sem leitura do `.env`, sem `curl`/`wget`.
- **Teste (`suite-unica.test.sh`):** usa `mktemp -d` com `trap` de limpeza, sobrescreve a trava para dentro dele (não toca `/tmp/metricas-dspd-suite.lock`), heredoc com aspas (sem expansão), `timeout 10` contra deadlock.

## Achados
- A1 (recomendado) scripts/suite-unica.sh:18 · trava em `/tmp` com nome fixo e umask do usuário: em máquina multiusuário, outro usuário pode pré-criar o arquivo (falha de abertura) ou segurar o `flock` (espera indefinida), e o `-L` da linha 20 é TOCTOU. Sem ator na estação atual (WSL, um usuário). Correção mínima: preferir `${XDG_RUNTIME_DIR:-/tmp}` com nome com o UID (`metricas-dspd-suite-$(id -u).lock`) ou diretório 0700; vale só se a trava vier a ser usada em máquina compartilhada. Dono: node-backend.
- A2 (recomendado) scripts/suite-unica.sh:25 · o retorno do `flock 9` de espera não é verificado (sem `set -e`): se falhar (sistema de arquivos sem suporte a `flock`, interrupção), o script segue e roda a suíte sem trava, em silêncio (falha aberta, perde só a garantia de "uma suíte por vez"). Correção mínima: `flock 9 || { echo ... >&2; exit 1; }`. Dono: node-backend.
- A3 (recomendado) scripts/suite-unica.sh:12 · `METRICAS_DSPD_SUITE_SEGURA=1` exportada no shell do usuário (ou deixada em um perfil) desliga a trava para sempre, sem aviso; e um processo filho que sobrevive ao comando (servidor deixado em segundo plano) herda o fd 9 e mantém a trava presa depois do fim da suíte. Correção mínima: documentar o sintoma em `praticas.md` (como ver quem segura, `fuser`, já está documentado) e avisar para não exportar a variável; opcional, o script poder limpar a marca de entrada quando não vier de si mesmo (por exemplo, a marca carregar o caminho da trava). Dono: node-backend.
- A4 (informativo) scripts/suite-unica.sh:13 · `exec "$@"` e `"$@"` tratam um primeiro argumento começando com `-` como opção do `exec`; os chamadores só passam comandos fixos, sem efeito. Sem ação.

## Plano em cartões
Nenhum obrigatório. A1 a A3 são opcionais, a critério do node-backend; não devolvem a entrega.

## Riscos aceitos
Nenhum. O parecer é `aprovado`, sem depender de aceite do usuário.
