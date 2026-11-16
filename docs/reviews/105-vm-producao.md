---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: d9f8bb9bbaeb5bad961e5c0da883a5d958660673
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: configuração de produção da VM (E7.270, volta 1 E7.276, volta 2 E7.291, review E7.292)

## Delta lido (volta 2)
`forge-check parecer delta docs/reviews/105-vm-producao.md`: intervalo `9c3c2eba..d9f8bb9b`, sem o que veio da develop (merge `809b067f` de `655029ad`). No domínio: `CHANGELOG.md` (só a posição da entrada da develop no merge; nenhuma linha nova da volta) e `deploy/systemd/metricas-referencias.service` (comentário). O commit da volta, `d9f8bb9b`, mexe em 2 arquivos, 7 linhas: o comentário do service e `docs/devops/105-implantacao-vm.md` (linhas 55, 106, 145, 146, 169 e 187), lidas contra `9000_grants.sql`, `grants.ts`, `usuarios.ts`, `eliminacao.ts`, as unidades systemd e a ADR 0022.

## O que foi conferido
- **A6 da volta 1 resolvido:** `metricas-referencias.service:11` cita `docker-compose.prod.yml`.
- **A3 do QA resolvido:** linhas 55 e 145 dizem que `PESSOA_ELIMINADA_SAL` está no `.env.example` (confirmado: 1 ocorrência).
- **A1 do QA, em parte:** linha 106 liga `metricas-referencias.timer` e a 169 lista os 4 timers (`OnCalendar=Sun 05:00` confere). A linha 146 ficou errada (A8).
- **A2 do QA, em parte:** linha 187 deixou de dizer que `dspd_api_apontamento` não lê coluna de pessoa, mas o texto novo é falso noutro ponto (A9).
- **A7 da volta 1:** virou cartão, como o pedido da volta registra; não volta ao review.
- **Ferramentas e CI:** só texto e comentário mudaram; sem código, teste nem shell no diff, nada a rodar. Sem PR para a branch: a suíte fica para o CI do PR; não afirmo CI verde neste head.
- **Segurança:** cito o parecer do `security-engineer` (`docs/security/105-vm-producao.md`); não o refaço.

## Achados
- A8 (bloqueante) docs/devops/105-implantacao-vm.md:146 · diz que os cinco comandos da seção 2.1 item 4 são manuais pela ADR 0022 item 4 e que o timer os chama; o service roda 4, o quinto segue manual e a ADR 0022 item 4 trata da carga inicial.
- A9 (bloqueante) docs/devops/105-implantacao-vm.md:187 · "já com o nome eliminado pelo sal" é falso: `dim_responsavel.responsavel_nome` guarda o nome real (`usuarios.ts:92`); o sal só faz o HMAC da supressão de quem pediu eliminação.
- A10 (recomendado) docs/devops/105-implantacao-vm.md:106 · `systemctl list-timers 'metricas-coleta-*'` não mostra o `metricas-referencias.timer` que a linha liga; usar `'metricas-*'`.

## Detalhe e sugestões
- A8: `metricas-referencias.service` tem 4 `ExecStart` (os ref-sync); `bm:criterios-classe-servico` segue manual (papel migrador, `CHANGELOG.md`); a ADR 0022 não menciona referências, e o título LACUNA não cabe mais. Texto sugerido: "- **Sincronização de referências:** o `metricas-referencias.timer` (domingo 05:00) roda as quatro primeiras sincronizações da seção 2.1, item 4 (`deploy/systemd/metricas-referencias.service`); o `bm:criterios-classe-servico` segue manual, uma vez, com o papel migrador."
- A9: o documento vai ao DBA e à infraestrutura e afirma uma pseudonimização que não existe; a eliminação a pedido (`eliminacao.ts:9-13`) apaga a linha da pessoa e grava o HMAC do `user_id`. A tabela é `dspd_bm.dim_responsavel`, não "do Apontamento". Texto sugerido: "`dspd_api_apontamento` lê `pessoa_ref` e o nome do responsável (`dim_responsavel.responsavel_nome`, em claro, de propósito, para a aba Apontamento; `grants.ts`); quem pede eliminação sai da tabela pelo `bm:eliminar-pessoa`." O GRANT não muda.

## Parecer
Reprovado por A8 e A9, dois erros de texto provados contra o código e as unidades; a correção é só de texto, nas duas linhas, com as sugestões acima. A10 fica a critério do autor. Na volta, leio só o delta destas linhas.
