---
tipo: revisao-seguranca
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-e10-l2-recusa
commit: 438ffc2c7c39663836640ed9a0d4e3b3a392b0df
parecer: aprovado
revisor: security-engineer
data: 2026-11-07
---

# Parecer de segurança: E10 Lote 2, recusa do reconhecimento sem versão ou com lista sobrescrita (pedido 073, E10.5, K-235)

## Resumo
Aprovado. O diff `8a4e2dd7...438ffc2c` (8 arquivos, estático) cumpre o foco do gatilho (controle de coleta; leitura nova do core pelo `dspd_coletor`). Não há achado bloqueante. O A1 do review (conferência por grupo e data) é avaliado abaixo e fica como recomendação com limite aceito.

## Verificado
- **Leitura do core:** a única referência nova ao core no módulo é `SELECT ... FROM ${S.core}.ref_versao_criterio ... WHERE dominio = 'acelerato'` (`controle.ts:87-91`), só leitura, com parâmetros ligados (`$1..$3`; os nomes de campo vêm de constantes do código, `controle.ts:71-75`, nunca da entrada). O `dspd_coletor` já tem `SELECT` em todas as `ref_*` do core (`grants.ts:122`): nenhum GRANT e nenhuma migração novos (o diff não toca `migrations/` nem `grants.ts`).
- **CT-37:** a exceção em `acelerato-estatico.test.ts:100-101` remove só o trecho literal `${S.core}.ref_versao_criterio v WHERE v.dominio = 'acelerato'`; qualquer outra referência a `S.core`, `dspd_core`, `S.bm` ou BusinessMap segue reprovando, e as asserções de escrita no módulo (só `dspd_ac`) não mudaram. A leitura é só do domínio acelerato: sem mistura com o BusinessMap.
- **Recusa sem efeito colateral:** `exigirVersaoDasListas` roda em `coletor.ts:217`, antes do desvio da P-E3-2 e de abrir o MySQL; só faz SELECT. A exceção cai no caminho de `registrarFalha`: linha de falha sem marca d'água (ADR 0006), sem tocar staging nem `ref_dominio` (o teste `.pg` confere as contagens de staging e de `ref_dominio` e o número de conexões).
- **Erro e e-mail de falha:** `ErroColeta` usa mensagem constante por código (`erros.ts:28-30`) e `coluna` só passa se bater o padrão de nome (`erros.ts:60`); a coluna é o nome da chave (`recorte_sha256` etc.), nunca o valor do hash nem o rótulo da lista. Os testes conferem que um valor "secreto" não aparece no erro serializado.
- **Pessoa e fonte:** nenhuma coluna de pessoa, nenhum campo novo na allow-list, nenhum texto livre lido; a consulta devolve só um booleano por data.
- **Caminho legítimo:** `ac:ref-sync` seguido de reconhecimento passa, e lista revertida pelo `ac:ref-sync` passa (P-E10-4), ambos cobertos nos `.pg`. O teste do L9-c grava a versão em teste (`acelerato-l9c.pg.test.ts:121-123`), por conexão do dono do teste, sem afetar código de produção.
- **Execução:** diff lido; a CI do push no head (run 42354744079, relatada no review) está verde, com `seguranca` e `banco` incluídos. Não rodei a suíte (D-5: do QA); os testes dos arquivos tocados foram rodados no review do tech-lead. Ferramentas locais (`gitleaks`, `semgrep`) não estão no PATH: lacuna registrada, as varreduras seguem no CI.

## Avaliação do A1 do review (conferência por grupo e data)
O limite é real e maior que o "mesmo dia" do plano: a conferência pergunta se cada data nova (`vigente_de` ou `vigente_ate` >= D) do grupo tem versão `056:ref-dominio:`, não se a mudança de cada linha tem versão. Dois casos passam: (a) `ac:ref-sync` legítimo em data >= D e, depois, um UPDATE de `rotulo` no mesmo grupo em outro dia; (b) a versão de um grupo cobre um INSERT de outro grupo na mesma data (a versão não carrega o grupo).

Caminho de ataque: quem escreve `ref_dominio` fora do `ac:ref-sync` precisa de papel que o projeto não entrega ao runtime. O UPDATE de `rotulo` não é permitido ao `dspd_ref` (só `UPDATE (vigente_ate)` e `INSERT`, `grants.ts:116-118`), então só o dono/superusuário do banco o faz; já o `dspd_ref`, que é papel do `ac:ref-sync`, também insere linhas em `ref_versao_criterio` e poderia fabricar a versão. Ou seja, o controle é guarda contra acidente e atalho de operador (editar a lista "na mão" e reconhecer), não contra quem tem esses papéis; o dono decidiu a opção C nesses termos (P-E10-1). Sem ator externo e sem ganho de dado ou de privilégio: a consequência é uma lista alterada sem versão, ou seja, um critério mudando sem a marca T2.6 nos gráficos, que o próprio hash de lista mais a versão de critério do deploy deixam rastreável nos registros de coleta. Severidade baixa; recomendação, não devolve.

Correção mínima (opcional, esforço M, dono node-backend): fechar o caso (a) fazendo o `ac:ref-sync` gravar na versão o grupo e o hash da lista, e a coleta comparar o hash da lista atual com o da versão; só vale se o dono quiser tratar o caso de operador com acesso de dono. O texto do limite deve entrar no `docs/architecture/fontes/acelerato-listas.md` (junto do A2 do review) para o dono saber o que o controle cobre.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/controle.ts:89 · Limite aceito: a conferência é por grupo e data; edição direta por papel de dono em outra data após um ac:ref-sync legítimo, ou versão de outro grupo na mesma data, passa. Só o dono do banco ou o dspd_ref alcança; é guarda contra acidente. Documentar o limite (esforço P).
- A2 (recomendado) docs/architecture/fontes/acelerato-listas.md:7 · Registrar o limite do A1 no texto do reconhecimento (o que a recusa cobre e o que não cobre), junto da atualização já pedida no A2 do review do tech-lead. Dono: node-backend (esforço P).

## Riscos aceitos
Nenhum que dependa do aceite do usuário: o limite do A1 já faz parte da decisão P-E10-1 (opção C) e do desenho do plano; sem aceite novo a registrar.
