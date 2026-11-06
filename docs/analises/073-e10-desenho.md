# 073 E10 (K-235): o reconhecimento do CA-8 e a versão de critério (T2.6)

Desenho curto (E10.1, software-architect), só leitura na develop `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD 8a789d43) e na branch do E3 `/home/rodrigoisensee/MetricasDSPD-052e`. Origem: R1 de `docs/reviews/056-coletor-f1-f2.md:109`, deixado fora do E3 (`073-e3-desenho.md` §5). Não muda o E3: o E10 entra depois dele, por cima do bloco CA-8 da 052e.

## 1. Como o reconhecimento funciona hoje
- Entrada: `server/src/entradas/coleta.ts:12` aceita `--reconhecer-mudanca`; `:27` passa `reconhecerMudanca` ao coletor (igual na 056d e na 052e).
- Develop (056d): `coletor.ts:206-211` compara `montarParametros` (`controle.ts:31-37`) com o último sucesso (`ultimoSucesso`, `controle.ts:45-51`, só lê `parametros`) pelas `CHAVES_COMPARADAS` (`controle.ts:22`); com a opção, nada é conferido. O "registro" é a linha de sucesso com os parâmetros novos (`coletor.ts:244-248`, `registrarSucesso` em `controle.ts:58-65`).
- Branch do E3 (052e): mesmo caminho em `coletor.ts:210-223`, agora com `recorte_sha256` e `vocabulario_sha256` (`controle.ts:22,31-53`); com a opção e recorte mudado, o incremental vira releitura (P-E3-2, `coletor.ts:216-222`). Gravação em `coletor.ts:255`.
- O comentário de `controle.ts:21` ("sem versão de critério reconhecida") e a mensagem de `erros.ts:28` prometem uma versão de critério que o código não confere.

## 2. Por que uma edição direta no banco passa
- O `ac:ref-sync` registra `ref_versao_criterio` com `referencia = 056:ref-dominio:<sha do arquivo>` quando a lista muda (`referencia/dominio-acelerato.ts:153,177-189`), mas é o único caminho que faz isso. Uma linha posta em `dspd_ac.ref_dominio` por SQL (papel `dspd_ref` ou dono do schema) muda o hash, a coleta recusa, e `--reconhecer-mudanca` libera sem olhar `ref_versao_criterio`. Fica uma quebra de critério sem data registrada (T2.6).
- Um UPDATE de `rotulo` no lugar (sobrescrita, proibida pela carga incremental) passa do mesmo jeito: muda o hash e não deixa vigência nova.
- Leitura possível sem grant novo: `dspd_coletor` já tem SELECT em todas as `ref_` do core (`plataforma/db/grants.ts:119,122`); `ref_versao_criterio` tem `vigente_desde`, `referencia` e `registrado_em` (migração 0010, `:12-14`).

## 3. Proposta (três opções; a escolha depende de P1)
Vale para as chaves de lista: `fluxo_sha256`, `recorte_sha256`, `vocabulario_sha256`. As de código (sql, colunas, campos) e de origem (host, banco, TLS) ficam para P3.
- **A. Exigir versão já registrada.** Com a opção e uma chave de lista mudada, a coleta procura versão `dominio = 'acelerato'`, `referencia LIKE '056:ref-dominio:%'`, com `registrado_em` depois do `finalizado_em` do último sucesso (`ultimoSucesso` passa a ler também essa coluna). Sem versão: novo código `reconhecimento-sem-versao` (ou `parametros-mudaram` com `coluna = 'versao_criterio'`), linha de falha sem marca d'água (ADR 0006), antes de abrir conexão.
  Prós: pequeno, sem migração, sem grant, mesmo molde do CA-8. Contras: não pega a edição direta feita depois de um `ac:ref-sync` legítimo na mesma janela; reverter o arquivo para um sha antigo não gera versão nova (`dominio-acelerato.ts:182`, uma versão por sha), então o reconhecimento seria recusado.
- **B. O reconhecimento registra a versão.** `--reconhecer-mudanca` passa a exigir descrição e motivo (texto da pessoa, validado como o `textoSeguro` do ref-sync) e grava `ref_versao_criterio` na mesma transação da linha de sucesso.
  Prós: toda liberação deixa rastro T2.6, inclusive a edição direta. Contras: o coletor ganha INSERT no core (mudança em `grants.ts`, gatilho de segurança, mistura de papéis com o `dspd_ref`); legitima a edição fora do arquivo versionado, que deixa de ser fonte única; texto livre novo na CLI.
- **C. Recusar edição feita fora do `ac:ref-sync`.** A mais A, a coleta confere que toda linha das listas comparadas com `vigente_de` ou `vigente_ate` depois da data do último sucesso tem uma versão `056:ref-dominio:%` com `vigente_desde` igual a essa data; e que hash mudado sem nenhuma vigência nova é sobrescrita (recusa com código próprio).
  Prós: pega a sobrescrita e a maior parte da edição direta; não muda grant nem tabela. Contras: a data é só dia (edição direta no mesmo dia do sync passa); mesma falha do revert de A; mais consulta na partida.
- Recomendação técnica, sujeita a P1: C (contém A). B só se P1 disser que a edição direta é caminho legítimo.
- Primeira coleta depois do deploy do E3: a linha anterior não tem `recorte_sha256`/`vocabulario_sha256` (chave nova, não mudança de lista). A e C precisam isentar a chave ausente na linha anterior, como a 052e já faz em `coletor.ts:216`; senão o reconhecimento da release seria recusado.

## 4. Impacto
- **Migração:** nenhuma em A e C. B exige grant novo do `dspd_coletor` no `core.ref_versao_criterio` (`grants.ts`) e a reaplicação dos grants no deploy.
- **Código (node-backend):** `controle.ts` (`ultimoSucesso` com `finalizado_em`; consulta de versão), `coletor.ts` (conferência dentro do ramo `reconhecerMudanca === true`, antes do desvio P-E3-2), `erros.ts` (código novo, se for o caso). O `ac:ref-sync` não muda em A e C, salvo a correção do revert (P4).
- **Testes:** unitário (lista mudada + opção sem versão recusa; com versão posterior passa; chave ausente na linha anterior passa; sobrescrita sem vigência nova recusa em C); `.pg`: `ac:ref-sync` seguido de reconhecimento passa, INSERT direto em `ref_dominio` seguido de reconhecimento recusa, UPDATE de `rotulo` recusa; nenhuma linha de staging ou de `ref_dominio` é apagada ou alterada. Novo CT no `docs/qa/056-coletor-plano-de-testes.md` ao lado do CT-34.
- **Roteiro de release:** se o E10 sair na mesma release do E3 e do L9-c, o reconhecimento único depois do deploy continua valendo (isenção da chave nova); se uma lista mudar no mesmo deploy, rodar o `ac:ref-sync` antes do reconhecimento.
- **Documentação:** ADR 0023 §6 (o reconhecimento exige versão), `docs/architecture/fontes/acelerato-listas.md` (editar lista só pelo `ac:ref-sync`), `controle.ts:21` e `erros.ts:28` passam a dizer a verdade.

## 5. Riscos
- **Carga incremental e histórico:** nenhuma opção apaga ou reescreve; a recusa só impede a carga. A sobrescrita em `ref_dominio` já é violação da regra de histórico: C a detecta, mas não a desfaz (correção é por vigência nova, pelo `ac:ref-sync`).
- **Versão sem marca nos gráficos:** a versão do `ac:ref-sync` não leva `ref_versao_criterio_metrica` (`dominio-acelerato.ts:157-158`) e `lerVersoes` só traz versão com métrica (`operacao/repositorio.ts:49-53`). Exigir a versão garante a data registrada, não a marca no gráfico; isso afeta também a decisão P-E3-1 ("marcada nos gráficos"). Ver P2.
- **Rotina de reconhecimento:** a opção segue manual e fora do agendador; a recusa nova não pode virar desculpa para automatizar.
- **Segurança:** toca controle de coleta e banco (B também grant): parecer do security-engineer por gatilho (`R-SEGURANCA`).
- **Mistura de fontes:** consulta só `dominio = 'acelerato'` e `dspd_ac`; o BusinessMap (sem CA-8) segue fora.

## 6. Perguntas ao dono (regra de negócio; não se decide no desenho)
- **P1:** editar `ref_dominio` direto no banco (fora do arquivo versionado e do `ac:ref-sync`) é um caminho aceito, por exemplo numa correção urgente? Se sim, o reconhecimento registra a versão com motivo (B); se não, a coleta recusa até a lista voltar pelo `ac:ref-sync` (A ou C).
- **P2:** quais métricas de sustentação são afetadas por mudança em cada grupo de lista (recorte, vocabulário, fluxo, `natureza_prefixo`)? Sem esse vínculo a versão fica registrada, mas não aparece como marca nos gráficos (T2.6).
- **P3:** o reconhecimento também deve exigir versão de critério para mudança de SQL, colunas e campos (código, R1 original), deixando a opção livre só para host, banco e TLS? Quem registra essa versão no deploy?
- **P4:** voltar uma lista a um estado anterior (mesmo arquivo de antes) é nova mudança de critério, com data nova? Hoje o `ac:ref-sync` não registra versão nova para um sha já visto.
