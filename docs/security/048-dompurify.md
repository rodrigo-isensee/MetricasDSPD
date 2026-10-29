---
tipo: revisao-seguranca
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-dompurify
commit: a48aacb53e3a852e410590b87f1327f679a69712
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-29
---
# Review de segurança: 048-dompurify (K-178, alerta Dependabot #12)

## Gatilhos
Cadeia de suprimentos: dependência com alerta crítico e mudança de lockfile e de override (`pnpm-workspace.yaml`). Sem toque em código, dado pessoal, credencial ou pipeline.

## Achados

## Detalhe dos achados
Nenhum achado. Recomendações, não bloqueantes:
- Impacto do alerta #12 (bypass do `SAFE_FOR_TEMPLATES`): o dompurify é só transitivo. Não há import dele nem uso de `SAFE_FOR_TEMPLATES` em `server/`, `web/`, `packages/` nem `e2e/` (busca sem `node_modules`, sem resultado). Entra por três pacotes: `jspdf@4.2.1` (`pnpm-lock.yaml:9084-9092`, como `optionalDependencies`; dependência direta do `web/package.json:28`), `mermaid@12.1.0` (`pnpm-lock.yaml:9356-9371`) e `@zenuml/core` (`pnpm-lock.yaml:7385-7394`); os dois últimos vêm de `@mermaid-js/mermaid-cli`, devDependency do `e2e/package.json:29`, ferramenta de geração de diagramas fora do build de produção.
- Caminho até a produção: só o jsPDF, e o `web/src/features/exportar/desenhista.ts` usa apenas `new jsPDF` e desenho de texto, sem chamar `.html()` (única API do jsPDF que sanitiza HTML; busca de `.html(` em `web/src/features/exportar` sem resultado). O código vulnerável, portanto, não é alcançado com entrada do usuário; o alerta é de risco baixo aqui, mas a correção é barata e correta.
- Review do E6.1: o override fixa a versão exata `3.4.17` (`pnpm-workspace.yaml:15-16`) com comentário do alerta, e o lockfile ficou com uma só versão (`pnpm-lock.yaml:13, 2993, 8143`), com integridade sha512 presente; sem versão 3.4.16 remanescente. Recomendação: remover o override quando jspdf e mermaid exigirem a faixa corrigida, para não ficar fixo para sempre (dono: tech-lead, no próximo ciclo do Dependabot).
- `legacy-javascript` 0.0.3 para 0.0.4 (`pnpm-lock.yaml:3790, 6063, 9122`): transitivo de `@paulirish/trace_engine@0.0.53`, usado pelo lighthouse (ferramenta de medição, fora do build); sem dependências próprias e sem script de instalação no lockfile. Reresolução por faixa, sem override; risco baixo. Procedência do pacote (mantenedor e publicação) não verificada, por não haver rede nesta revisão passiva; fica como lacuna.

## Riscos aceitos e ferramentas
Sem riscos aceitos. Ferramentas: leitura estática do diff e do lockfile e busca por texto. `osv-scanner` e `gitleaks` não estão no PATH (lacuna); a varredura de dependências roda no CI e pelo Dependabot, que deve fechar o alerta #12 após o merge.
