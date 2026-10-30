---
tipo: revisao-seguranca
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-coletor-acelerato
commit: 11141d7516b7a71418b3ec069473e3449453fe81
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-30
---
# Revisão de segurança antes do código: listas fechadas e driver MySQL (056, E4.2)

Escopo: revisão de documento, sem código do coletor. O commit acima é a base da worktree 056c; o plano, o modelo de ameaças e o review citados estão na worktree 056 (branch de discovery, ainda não mesclada). Nada foi instalado, conectado ao MySQL nem lido do `.env`. A ADR 0023 e as listas da E4.1 ainda não existem em disco: a conferência final das listas contra a constante de código fica para o review da F1 (E4.5).

## Gatilhos
Dado pessoal e texto livre na fronteira, credencial externa nova, banco, dependência nova, consulta SQL escrita pelo projeto e mudança de regra do `CLAUDE.md` (R-SEGURANCA).

## Achados
- A1 (recomendado) CLAUDE.md:23 · Acrescentar à regra: conexão com TLS e certificado verificado (CA ou impressão fixada) e filtro da população na origem por lista fechada. Texto proposto no Detalhe. Aplicar antes do PR de código (E4.7).
- A2 (recomendado) docs/architecture/features/056-acelerato-mysql.md:224 · mysql2 liga LOCAL_FILES por padrão. O plano pede "sem LOCAL INFILE": exigir `flags: ['-LOCAL_FILES']` no cliente e o teste CA-6 provando que o arquivo não é lido.
- A3 (recomendado) docs/architecture/features/056-acelerato-mysql.md:216 · Fixar mysql2 em versão exata (3.24.6 ou superior, nunca abaixo de 3.23.1), sem intervalo, com lockfile e instalação congelada. Registrar na ADR 0023 a versão mínima e os avisos já corrigidos.
- A4 (recomendado) docs/architecture/features/056-acelerato-mysql.md:117 · Campo de etapa só entra com `tipo` lista confirmado. Sem tipo confirmado, o campo fica fora (negar por padrão). Para texto livre, o booleano sai do SQL (valor preenchido), sem o texto chegar à memória.
- A5 (recomendado) docs/architecture/features/056-acelerato-mysql.md:79 · Colunas varchar de classificação (`categoria`, `status`, `equipe`, `organizacao`, `prioridade`) entram só por domínio fechado ou forma curta; valor fora vira nulo com contagem, sem o texto no log.
- A6 (recomendado) docs/security/056-acelerato-mysql-ameacas.md:88 · Sobre o A3 do review: manter `com_agente` derivado no SELECT (plano:85 e 220). O id não sai do MySQL. Alinhar o modelo de ameaças (linhas 88 e 90) ao plano na próxima edição.

## Detalhe dos achados

### (a) Listas fechadas da §2 e da §2.1: conferência
Resultado: as listas deixam fora tudo o que a delegação pede.
- Nome, e-mail e login: colunas 15, 16, 17 e 18 barradas. Coluna 44 (`solicitantes`) e coluna 48 (`raw`) barradas por inteiro. Pessoa em `campos_personalizados` e `_etapa` fica fora porque só entra nome da §2.1 (negar por padrão). Nenhum dos 12 nomes da §2.1 é de pessoa.
- `usuarioKey`: só existe dentro de `raw`, `solicitantes` e `estatisticas.impedimentos`. Os três ficam fora (47 só por caminho `workflow.etapas[]` com 5 chaves).
- Ids de agente e solicitante: `agente_key` (14) só como booleano derivado no SQL. Não há coluna de id de solicitante na lista de 50 colunas.
- Título (4), URL (30), origem (20) e tempo de workflow (43) barrados. Descrição só existe em `raw`, barrado.
- Contagem conferida: 11 barradas (4, 15, 16, 17, 18, 20, 30, 36, 43, 44, 48), 1 derivada (14), 3 `json` (45, 46, 47) e 35 lidas, total 50.
- Os filtros de origem (colunas 2, 10 e 12) são chaves numéricas por placeholder, sem texto livre. O filtro não vem do `.env` (M5, M11).
- Pontos que viram recomendação (A4 e A5): valores de colunas varchar da população e campos "se lista". Nenhum caminho de ataque direto hoje; o risco é um campo de texto livre ser promovido a lista sem prova.
- Sugestão ao QA (E4.3): incluir como marcadores de fixture também os campos de texto livre citados no modelo de ameaças M4 ("Informe abaixo:", "Público afetado:", benefícios e objetivos), que o plano não lista em "nunca" mas ficam fora por padrão.

### (b) Driver `mysql2` (cadeia de suprimentos)
Fonte: `pnpm view` e consulta à base de avisos do GitHub (leitura). Lacuna: `osv-scanner`, `gitleaks` e `semgrep` não estão no PATH desta máquina; a varredura de dependência roda no CI.
- Versão atual: 3.24.6, publicada em 2026-10-13, com atestado de procedência SLSA no registro. Licença MIT. Engines `node >= 8`.
- Mantenedor: um só (sidorares). Risco de fator ônibus, mitigado por projeto antigo (2013) e uso amplo. Sem script de instalação (nenhum `install` ou `postinstall`).
- Dependências diretas (7): `long` (Apache-2.0, 1 mantenedor), `lru.min` (MIT), `iconv-lite` (MIT, 3 mantenedores), `sql-escaper` (MIT, 2), `aws-ssl-profiles` (MIT), `generate-function` (MIT, 1 mantenedor, última publicação em 2022, depende de `is-property`), `named-placeholders` (MIT). Todas permissivas, sem script de instalação. `generate-function` é a origem de código gerado em tempo de execução, o mesmo mecanismo das falhas de 2024.
- Avisos publicados contra `mysql2`: GHSA-3f6p-5ww8-9rcr (alta, rebaixamento de plugin de autenticação para texto puro, corrigido em 3.22.0); GHSA-rgwj-5xj2-c3m3 (média, bomba de descompressão no protocolo comprimido, corrigido em 3.23.1); e cinco de 2024 (duas críticas, execução de código e injeção, corrigidas em 3.9.4 e 3.9.7; outras de poluição de protótipo e de cache, corrigidas até 3.9.8). A 3.24.6 está acima de todas as correções.
- Aviso relevante para este desenho: o rebaixamento para texto puro (GHSA-3f6p) é a classe de ataque do M3 (servidor falso); com a versão corrigida, TLS fixado por impressão e sem compressão, o risco fica coberto. Não ligar `compress`.
- Pontos de configuração obrigatórios (conferidos no review da F1, não aqui): `ssl` sempre presente com `rejectUnauthorized: true` e `checkServerIdentity` próprio por impressão SHA-256 (certificado autogerado, sem CA); `multipleStatements: false`; `flags: ['-LOCAL_FILES']`; `execute` com placeholders; erro do driver nunca propagado cru (M2).
- Alternativas: `mariadb` (LGPL, outro conector) e `mysql` (sem manutenção) não melhoram o quadro. `mysql2` é a escolha aceitável.
- Parecer do driver: aceito, com as condições A2 e A3. A conferência de `pnpm audit` e do lockfile fica para o review da F1, quando a dependência entrar.

### (c) A1 do review (CLAUDE.md:23)
Decisão: promover a exigência a texto da regra, como recomendação. Não é bloqueante: o modelo de ameaças M3 e M11 já a obrigam no código e na ADR 0023, e um texto no `CLAUDE.md` sem o código não cria defesa. Mas a regra é o que o próximo agente lê primeiro, e hoje ela só cita a allow-list. Trecho sugerido, a inserir depois de "(nada é escrito no MySQL nem no Acelerato)":

> A conexão exige TLS com o certificado do servidor verificado (CA ou impressão digital fixada, nunca desligado), e a consulta filtra a população (tipo, organizações e equipes) na origem, por lista fechada.

Dono da edição: tech-lead (o Jarvis leva ao dono, R-DECISAO, por ser mudança de regra inviolável). Esforço: P.

### (d) A3 do review (`com_agente`)
Posição: derivar no SELECT, como o plano. Motivo: o id de agente é dado de pessoa (ADR 0020); o que não sai do MySQL não vaza para memória, log nem erro (M8). A forma "em memória" do modelo de ameaças (linhas 88 e 90) é mais fraca e deve ceder. O teste CA-13 vale nas duas formas, com `agente_key` de marcador na fixture e a asserção de que o SELECT não pede a coluna. Esforço: P; dono: security-engineer, na próxima edição do modelo (esta entrega não o toca).

## Riscos aceitos e ferramentas
Nenhum risco novo aceito. O R-1 (conta compartilhada, host aberto) segue o registro do modelo de ameaças §8; o aceite formal do dono, ligado ao parecer do commit final da F1 e da F2, continua pendente e será pedido ao Jarvis quando esse parecer existir. Ferramentas: `pnpm view` e `gh api` (leitura da base de avisos). Faltaram no PATH: `osv-scanner`, `gitleaks`, `semgrep`.
