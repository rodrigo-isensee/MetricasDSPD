# Pedido 100: release da develop para a main (bloqueios 9a e 9b, simulador desligado, K-272, K-270, CI)

- **Modo:** implementar
- **Objetivo:** levar à main o que está na develop desde a release 093: lotes 9a e 9b dos bloqueios (PRs 320 e 323), simulador desligado com a ADR 0030 (PR 322), Horas por tipo agrupado e o teste dele (PRs 321 e 324), passo de critérios lendo o .env (PR 319), correção da CI com o container do Playwright (PR 318) e os testes instáveis (PRs 316 e 317). Meta do dono: "amanha cedo com nada pendente e os prs pra main abertos".
- **Clareza:** 1 confirmado; 1 técnico; 0 suposição; 0 perguntas
- **Origem:** Jarvis, pela meta do dono, com a develop verde em 77c208a9 (run 43084376256).

## Escopo
- E1. Release develop para homolog para main, com CHANGELOG, pareceres de release e o PR de homolog para main aberto para o dono · `confirmado`

## Etapas
- E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h.
- E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release.
- E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release.
- E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono.
- E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono.
- E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono.
- E1.7 (agile-coach): retrospectiva curta.
- E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b.
- E1.9 (devops-engineer): limpar a fila do GitHub Actions, cancelando só as execuções em fila já substituídas por outra mais nova da mesma branch ou de branch já mesclada, para o CI da release andar.
- E1.10 (tech-lead): PR das retrospectivas do 093, 094, 095, 096 e 100 (branch docs/retros-2026-11-11c) para a develop, só documentação, e merge com os checks verdes.
- Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch.

## Fora do escopo
- Os trabalhos em curso dos pedidos 097 a 099 que ainda não estão na develop · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 16:25: pedido aberto pelo Jarvis com a develop verde em 77c208a9. Lição da retrospectiva do 093: PRs que entram na develop durante a release envelhecem os pareceres; o Jarvis pede ao dono para segurar novos merges na develop até o PR da main.
- 2026-11-11 16:27: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-1.md 467d9b10e20e9b79a09e2fcee7e654c3fd246067514ab13a706ff5e7e64e97b0
- 2026-11-11 16:31: E1.1 feita (CHANGELOG fc0f952a, review a71366af, aprovado): 10 PRs com review aprovado; develop verde no 77c208a9; contrato do 9b e ADR 0030 coerentes; sem migração nova. A1 e A2 (PRs 321 a 324 mesclados com checks rodando ou vermelhos) e A3 (o PR 315 também entra) recomendados, vão à retrospectiva. Próximo: E1.2 (segurança), depois E1.3 (QA).
- 2026-11-11 16:31: brief selado docs/briefs/100-release-bloqueios-simulador-security-engineer-1.md db85653269b237bb5d5e5f1fdf7045ae42f3c8695e338592c7edd212b2a8f608
- 2026-11-11 16:35: E1.2 segurança aprovada (aeba81a0): container do Playwright por digest, permissões só leitura, critérios sem imprimir o .env, simulador sem efeito no modo api, contrato do 9b fechado, sem dado de pessoa novo nem dependência nova; A1 (digest atualizado à mão), A2 (mock ainda no build api até L2 e L3) e A3 (recomendados do 096) recomendados; ferramentas de varredura ausentes (lacuna declarada). Próximo: E1.3 (QA).
- 2026-11-11 16:36: brief selado docs/briefs/100-release-bloqueios-simulador-qa-engineer-1.md 121fa5f65e70bffeb0badd8a68c5151d2f28091def5301d26a2dd7db8bd5f272
- 2026-11-11 16:37: o dono mesclou o PR 325 (K-271) na develop (c7c3e092) durante a release. DECISÃO TÉCNICA (Jarvis): a release segue com a develop atual; depois do QA, a branch docs/100-release recebe a develop por merge e review e segurança revalidam só o delta do K-271 (que já tem QA e review próprios); o CHANGELOG ganha a nota do 325.
- 2026-11-11 17:13: E1.3 QA da release aprovado, 0 bugs (17ffe670): pareceres de QA dos PRs do range aprovados; banco verde no CI da develop; pronto local com 8 timeouts por carga (server e web em paralelo com 2 workers), todos verdes sozinhos (A1 recomendado). Próximo: E1.4, com a develop (PR 325) e a nota dele no CHANGELOG.
- 2026-11-11 17:14: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-3.md b2e453545ce4b1d85316389797622b699d0583c6c4c539c2658fb7b65f7e24f2
- 2026-11-11 17:15: entrega conferida cab96b6138af3f30c7100e0fe57bd8d392f053b5
- 2026-11-11 17:16: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-5.md 41a1903ae85a03fa6164a487da4e92fe390747de2bee03bb714a6abd1abc71d6
- 2026-11-11 17:31: E1.4 PR 326 (CHANGELOG e pareceres da release) aberto pelo tech-lead (forge-check pr aprovado, classe T) e mesclado pelo dono na develop (27ac9064) com os checks ainda na fila. Próximo: E1.5, PR da develop para a homolog, depois de confirmar o CI da develop verde.
- 2026-11-11 17:31: a promoção para a homolog recusa os três pareceres da release como desatualizados (o K-271 do PR 325 entrou depois deles e não vem da base homolog) e pede parecer de devops (a release muda .github/actions/playwright/action.yml). DECISÃO TÉCNICA (Jarvis): volta da release na branch docs/100-release-b a partir da develop 27ac9064: review, segurança, QA e devops revalidam o delta (o K-271, que já tem review e QA próprios) e o devops dá o parecer da release; depois o PR de volta à develop e a promoção. Mesmo padrão das duas voltas do 093 (merge na develop durante a release).
- 2026-11-11 17:31: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-9.md e541f0164a2e84a034161fe06f5b03aee56096c72338e02e269bea015302ee70
- 2026-11-11 17:33: review da volta revalidado (d5d9d40b, docs/100-release-b): o código do K-271 mesclado é o mesmo que o review do 096 aprovou; A4 recomendado (merge do 325 depois dos pareceres). Próximo: segurança, QA e devops da volta.
- 2026-11-11 17:33: brief selado docs/briefs/100-release-bloqueios-simulador-security-engineer-3.md 6466831519fcdfc04cf44706817810172a76b5fd57605a68fac25860df16edf7
- 2026-11-11 17:34: brief selado docs/briefs/100-release-bloqueios-simulador-qa-engineer-3.md 056f1affa4d59eeb4a29104a39a9adbfe63e6ad9e67c82e0312cc4eecf777772
- 2026-11-11 17:34: brief selado docs/briefs/100-release-bloqueios-simulador-devops-engineer-1.md 790b0562e7b211fd2688fdfb7d566e5eb0de65bb52afad236f13975e54a2aab7
- 2026-11-11 17:35: segurança da volta revalidada (0c43e495): o K-271 fecha os A1 e A2 da segurança do 096; ficam A1 (digest à mão) e A2 (mock no build api) recomendados. Próximo: QA e devops da volta.
- 2026-11-11 17:37: QA da volta revalidado (b2c8e252): 8 testes do K-271 verdes; CI da develop no c7c3e092 verde; o run do 27ac9064 (só docs) ainda na fila (A2 recomendado, o tech-lead confere antes do PR). Próximo: devops da release.
- 2026-11-11 17:41: devops da release aprovado (2b85b70e): só a ação do Playwright, ci.yml e homolog.yml; nomes dos checks iguais; nenhum passo manual; A1 (o container roda pela primeira vez no portão da homolog) e A2 (Dependabot não vê o digest) recomendados. A conferência da volta recusa os três pareceres reescritos (fora do declarado); o Forge prevê o pedido <X>-REV para revalidação. DECISÃO TÉCNICA (Jarvis): o tech-lead diz o caminho de conformidade antes do PR, sem contornar.
- 2026-11-11 17:42: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-11.md f20d4f8995c4c68f55f1dfe1de37ba833bd26bf802da893ccace231a39e70a2f
- 2026-11-11 17:45: diagnóstico do tech-lead: o caminho que o Forge aceita para os três pareceres reescritos é o pedido 100-release-bloqueios-simulador-REV, com um brief por portão (tech-lead, security-engineer, qa-engineer) despachado de verdade; cada portão confirma o parecer pelo delta, sem commit se o delta for vazio. Gravar os briefs -REV sem despachar seria contorno. DECISÃO TÉCNICA (Jarvis): seguir esse caminho; depois, a conferência e o PR.
- 2026-11-11 17:48: entrega conferida 2b85b70ebc4db47dfe78bbd878663107abf55291
- 2026-11-11 17:48: os três portões confirmaram os pareceres sob o pedido 100-REV (delta vazio, sem commit); a conferência da volta passou (entrega conferida 2b85b70e). Próximo: PR da docs/100-release-b para a develop.
- 2026-11-11 17:48: DECLARAÇÃO DO DONO (literal): "estou saindo do micro as 18 vou deixar livre para voce,m pode usar bastante dos recursos". O teto de uso da máquina sobe depois das 18 h, enquanto o dono estiver fora; merges continuam com o dono.
- 2026-11-11 17:49: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-13.md 5e00cbadbca9916b9aa7bf886389dd7f9880dd368867667158bce05591e4f568
- 2026-11-11 17:51: DECISÃO DO DONO (literal): "voce pode fazer ate o merge da main, esse so eu faco o resto pode fazer". O tech-lead mescla na develop e na homolog (como o CLAUDE.md já prevê), só com o portão e os checks verdes, por merge sem --admin e com --match-head-commit; o merge da main continua só do dono. Se o hook ou o sistema de permissões recusar, o tech-lead para e relata (não se contorna).
- 2026-11-11 18:11: PR 327 (volta da release, docs/100-release-b) mesclado na develop em 1d697d6a. Próximo: develop para homolog (E1.5).
- 2026-11-11 18:21: brief selado docs/briefs/100-release-bloqueios-simulador-devops-engineer-9.md d74c62e5ddb0e36db8958ec2bf7d94db5cea5e552e6608112cf4bc9610785d6c
- 2026-11-11 18:21: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-14.md 213f0b5a119e6ed9570935e73796640d63ecd3c3efa9af2f0a81094cc853cbd8
- 2026-11-11 18:21: PR 327 mesclado pelo dono às 17:57 (1d697d6a, develop verde). Fila do Actions com cerca de 15 execuções em fila, quase todas de push já substituído, uma por vez. E1.9 (cancelar as substituídas) recusado pelo classificador de permissões (Interfere With Workloads): vira pergunta ao dono (PERGUNTA: Q-100-1). E1.5 (develop para homolog) delegado ao tech-lead, brief tech-lead-14.
- 2026-11-11 18:41: PR 328 (develop para homolog) mesclado às 18:40 (21:40Z, merge 50387f96), 20 checks verdes e 3 pulados; o prompt do gh pr merge foi aprovado pela sessão WSL ativação. Próximo: E1.6, PR homolog para main aberto para o dono, quando o portão da homolog ficar verde; a develop está liberada.
- 2026-11-11 18:43: Q-100-1 encerrada (relato da sessão WSL ativação): o dono liberou o cancelamento; as 15 execuções antigas estão presas em queued sem job e o GitHub recusa cancel e force-cancel (HTTP 409, has not been queued yet); não seguram a fila. DECISÃO DO DONO (relatada, palavras dele): "Deixar como estão". E1.9 não será executada; nada a cancelar de novo.
- 2026-11-11 18:57: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-15.md d47fb54af3c9963efc761c527fca3fd7acb12f427a345dfa04bf35e8a44c4a2c
- 2026-11-11 18:57: E1.5 concluída (tech-lead-14): PR 328 mesclado, portão Homologação verde no 50387f96 (run 43105079447) e CI do push verde. E1.6 delegada (tech-lead-15): PR da homolog para a main aberto para o dono, sem merge. Melhoria vista (retro): o laço da skill esperar-estado é recusado pelo hook R-CONFORMIDADE quando cita gh run ou homolog, e o R-CONTRIB recusa gh pr merge por número.
- 2026-11-11 18:59: E1.6 concluída: PR 332 (homolog para main) aberto para o dono, homolog-aprovada verde; a release muda a interface (coluna Bloqueado do O2, simulador desligado, AP-TIPO por categoria), então o corpo pede validação manual; dar Re-run jobs no homolog-aprovada logo antes do merge. Merge é do dono. Próximo: E1.7 retrospectiva.
- 2026-11-11 19:01: brief selado docs/briefs/100-release-bloqueios-simulador-agile-coach-0.md 1dbd6b230decac97c3e634a85d7df9f864abcf192901fe5e72b22de76f445b0f
- 2026-11-11 19:01: E1.7 retrospectiva delegada ao agile-coach (agile-coach-0), branch docs/retros-2026-11-11c.
- 2026-11-11 19:03: E1.7 retrospectiva gravada (docs/retrospectivas/2026-11-11-100-release-bloqueios-simulador.md, 2e910a6b, branch docs/retros-2026-11-11c): lead time 2 h 34 min até o PR 332; 1 volta da release pelo merge do PR 325 depois dos pareceres (segunda release seguida); 6 MELHORIA, 2 vão ao Forge. Pedido fecha quando o dono mesclar o PR 332 na main.
- 2026-11-11 19:09: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-16.md beedd1a24279c230a3dab4f12eff96e798c90b5f297ee987562d467a1ccd7ef9
- 2026-11-11 19:12: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-17.md 61d9811aaa2ef944a5efef6cec8db49aaba5382c7dea51fabbce0fb4be126a11
- 2026-11-11 19:12: E1.10: o forge-check pr da branch docs/retros-2026-11-11c pediu parecer de review (classe T) e a conferência de entrega do head; tech-lead-16 parou como manda o brief. ERRO-JARVIS: o brief do PR saiu sem o parecer e sem a conferência antes. Review das retrospectivas delegado (tech-lead-17); depois a conferência e o PR com merge.
- 2026-11-11 19:14: entrega conferida 0a6efe56d492b52b4c48e4eb2e8e256a21ead74a
- 2026-11-11 19:15: brief selado docs/briefs/100-release-bloqueios-simulador-tech-lead-18.md 36dbd706c55e29aa378f99db948f61ba3a6bcb0210a26d18b733a9fe712d96fe
- 2026-11-11 19:15: Review das retrospectivas aprovado (0a6efe56, sobre 2e910a6b): A1 link para docs/devops/093-runner-ubuntu26-dns.md não versionado, A2 e A3 de texto, recomendados. Entrega conferida no 0a6efe56. PR e merge delegados (tech-lead-18). Melhoria vista (retro): retrospectivas citam docs/pedidos/ e um relatório que não existem na develop.
