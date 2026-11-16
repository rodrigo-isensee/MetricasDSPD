---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: d9f8bb9bbaeb5bad961e5c0da883a5d958660673
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: configuração de produção da VM (105, E7.294)

Escopo: revalidação por delta `9c3c2eba..d9f8bb9b` (volta 2, E7.291), sem o que veio da develop 655029ad (`forge-check parecer delta`). No domínio, só o comentário de `deploy/systemd/metricas-referencias.service:11`; fora do domínio, lidos por tocarem acesso a dado pessoal: as linhas de `docs/devops/105-implantacao-vm.md` mudadas (A2, A1, A3 e A6 de `/home/rodrigoisensee/pedidos-assistente/prod-volta2.md`). Revisão estática; nada executado contra banco real nem contra a VM.

**Veredito: aprovado.** Nenhuma mudança de configuração, papel, GRANT ou unidade com efeito: `git diff 9c3c2eba d9f8bb9b -- migrations deploy/sql server/src/db` vazio. O texto dos grants agora diz a verdade sobre o `dspd_api_apontamento` (lê `responsavel_nome` e `pessoa_ref`), mas a explicação que acompanha está imprecisa (A2, recomendado). Aprovação anterior (9c3c2eba) segue de pé.

## Gatilhos
`R-SEGURANCA`: credenciais e papéis do banco, TLS ao banco, infraestrutura e acessos (grupo do motor de contêineres), dado pessoal em backup e acesso por coluna a dado de pessoa (LGPD).

## Achados
- A1 (recomendado) docker/postgres/init/01-databases-papeis.sh:7 · Fora do caminho de produção: o init do banco local e reparar-papeis.sh:15 ainda passam senhas por -v e criam webhook, automação e pesquisa com LOGIN. Só dado fictício; alinhar ao gerado (\getenv, NOLOGIN) quando mexerem no arquivo.
- A2 (recomendado) docs/devops/105-implantacao-vm.md:187 · "já com o nome eliminado pelo sal" sugere nome pseudonimizado; responsavel_nome é o nome real de todos, e só o titular que pediu eliminação some (HMAC do user_id na supressão, linha apagada). Escrever: lê o nome real (dado pessoal, ADR 0020 R4-5).

## Detalhe dos achados
**Delta no domínio.** `metricas-referencias.service:11`: o comentário passa de `docker-compose.yml` para `docker-compose.prod.yml`, coerente com `Environment=COMPOSE_FILE=docker-compose.prod.yml` (linha 13). Sem efeito de execução. Nenhum segredo nos arquivos do delta (busca por padrão de texto).

**Texto fora do domínio, conferido.** O GRANT por coluna não mudou: `deploy/sql/9000_grants.sql:403` (`fato_apontamento`, com `pessoa_ref`) e o de `dim_responsavel` (`pessoa_ref`, `responsavel_nome`), espelho de `server/src/plataforma/db/grants.ts:20`. A frase anterior ("`dspd_api_apontamento` sem coluna de pessoa") era falsa e saiu. `PESSOA_ELIMINADA_SAL` consta no `.env.example` (A3 do QA, só o nome, sem valor). Os quatro timers e o `enable` do `metricas-referencias.timer` não mudam postura: a unidade já tinha sido aprovada em 9c3c2eba (papel `dspd_ref`, falha fechada).

**A2.** Evidência: `docs/devops/105-implantacao-vm.md:187`; `server/src/modulos/businessmap/apontamento/eliminacao.ts:1-6` (o sal serve ao HMAC do `user_id` na lista de supressão; a eliminação apaga a linha de `dim_responsavel` e anula `pessoa_ref`, só para o titular que pediu); `server/src/modulos/apontamento/repositorio.ts:82-84` (a API do Apontamento lê o nome em claro). Caminho: o DBA ou o operador que lê o roteiro de implantação toma `responsavel_nome` por pseudônimo e o trata como não pessoal (inventário LGPD, concessão a outro papel, cópia ou backup sem a restrição de dado pessoal). Sem atacante externo; risco de erro de operação sobre dado pessoal. Severidade: baixa. Correção mínima (só texto, linha 187): "`dspd_api_apontamento` lê `pessoa_ref` e `responsavel_nome` (nome real, dado pessoal; ADR 0020 R4-5) do Apontamento; quem pediu eliminação não aparece (linha apagada e `pessoa_ref` anulada)". Esforço P. Dono: `devops-engineer`.

**A1.** Evidência: `docker/postgres/init/01-databases-papeis.sh:7-9`, `docker/postgres/reparar-papeis.sh:15`. Caminho: só na máquina do desenvolvedor ou na homologação local (portas em 127.0.0.1, dado fictício); quem lê a lista de processos do contêiner já tem o banco. Severidade: informativa. Correção mínima: reaproveitar o padrão `\getenv` e NOLOGIN do gerado. Esforço P. Dono: `devops-engineer`.

**Inconsistência de texto (não segurança, ao `tech-lead`):** `105-implantacao-vm.md:106` manda conferir com `systemctl list-timers 'metricas-coleta-*'`, padrão que não lista o `metricas-referencias.timer` recém-incluído; `'metricas-*'` cobre os quatro.

**Conferência do parecer anterior (9c3c2eba):** A1 segue aberto como recomendado, fora do caminho de produção. Os seis achados do parecer de 255d0250 e A1 a A8 de `docs/security/105-implantacao-vm.md` seguem fechados: o delta não toca Compose, roteiro de papéis, gerador nem unidades além do comentário.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI; este parecer não afirma CI verde. Varredura de segredos, de dependências, SAST e de imagem: ferramentas fora do PATH (lacuna); a busca por segredos foi por padrão de texto.
