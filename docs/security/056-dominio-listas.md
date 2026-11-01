---
tipo: revisao-seguranca
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-dominio-listas
commit: 8865ee78da61d7f4e755ad732b090abdfd73b5a8
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Revisão de segurança: listas de domínio do Acelerato (056, E4.43, K-190)

Escopo: diff `origin/develop..8865ee7` (E4.42): `acelerato-dominio.json` (campos `etapa`, `prioridade` e `natureza_prefixo`), `acelerato-listas.md`, `normalizador.ts` (mapa D-12), `referencia.ts` e `projetor.ts` (falha fechada com lista vazia) e os testes. Revisão estática; nada foi conectado ao MySQL nem ao banco do dono, e o `.env` não foi aberto. Rodei só os testes unitários do diff (`dominio-acelerato-real`, `acelerato-normalizador` e `acelerato-projetor`: 3 arquivos, 75 testes ok); a suíte .pg fica com o QA (E4.45). Lacuna de ferramentas: `gitleaks`, `osv-scanner` e `semgrep` não estão no PATH (varredura fica no CI). Não há dependência nova.

## Gatilhos
Fronteira da allow-list do coletor (vocabulário que decide o que chega ao staging) e conteúdo de domínio vindo da fonte para arquivo versionado (R-SEGURANCA).

## Achados
- A1 (recomendado) server/src/modulos/acelerato/projetor.ts:40 · prefixo com rótulo fora de incidente e requisicao é descartado sem aviso quando há outro prefixo válido; o esquema do ac:ref-sync pode recusar esse rótulo. Qualidade de dado, sem caminho de ataque.

## Verificações
- Conteúdo do arquivo (`acelerato-dominio.json:24-103`): 44 nomes de etapa e status, 23 prioridades e 4 prefixos de natureza. Só nomes de domínio do workflow e das escalas; nenhum nome de pessoa, e-mail, `usuarioKey`, título, descrição de chamado, endereço de servidor nem organização cliente. "Aguardando Solicitante" e "Testes Integrados (Usuários)" são nomes de etapa, não pessoa. O recorte segue só com tipo `23`, organização `3` e equipes `7`, `9` e `332` (decisão b), sem mudança de chave.
- Validação na entrada do arquivo: os três campos já estavam no conjunto fechado `CAMPOS_DOMINIO` (dominio-acelerato.ts:17-18); todo valor passa por `textoSeguro` (sem controle, sem invisível, sem separador de linha, sem arroba, até 80/120 caracteres). O espaço final de `SSSC-I ` e `SSSC-R ` é aceito e é intencional.
- Falha fechada: `carregarListas` (referencia.ts:34-41) recusa com `listas-vazias` qualquer das sete listas vazias, e roda em coletor.ts:190 antes de abrir conexão com a origem; `carregarNaturezaPorPrefixo` (projetor.ts:41-42) recusa antes de gravar `ctl_coleta`, dentro da transação. O erro leva só o nome do campo (`coluna`), nunca valor, e a mensagem é fixa (erros.ts:23).
- Fronteira da allow-list: comparação por igualdade exata, sem normalizar acento ou caixa (allow-list.ts:110-111 e 133); valor fora vira nulo com contagem e sem o valor. A lista só amplia vocabulário de domínio: nenhuma coluna nova é lida da fonte, nenhum texto livre passa a entrar.
- Mapa D-12 (normalizador.ts:168-188): tabela constante por nome exato, sem expressão regular sobre entrada livre além da `ESCALA_P` já existente (ancorada, sem retrocesso); vazio e outras áreas ficam nulos, nunca inferidos.
- Testes (`dominio-acelerato-real.test.ts`): só nomes de domínio e chaves numéricas fictícias de chamado; nenhum dado de pessoa, nenhuma credencial, nenhuma linha real de chamado. O teste .pg usa a URL do contexto `./pg/ctx.js`.
- Regras invioláveis: nada é escrito no Acelerato, BusinessMap e Acelerato seguem separados (schema `dspd_ac`), o histórico do `ref_dominio` só cresce por vigência (T2.6, `versao_criterio` atualizada) e nenhuma métrica individual ou comparação entre times é criada (equipes só como filtro de recorte).

## Riscos aceitos
Nenhum.
