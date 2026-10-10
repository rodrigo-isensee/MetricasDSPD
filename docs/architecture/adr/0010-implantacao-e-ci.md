# 0010 - Implantação, ambientes e CI
- Status: **substituída pela ADR 0013** (2026-10-10): hospedagem na AWS (S3 + CloudFront, API Gateway, Lambda, RDS, CDK); saem imagem Docker, nginx, registro e runner interno (I-1, I-9, I-10 deixam de valer). **Continuam valendo** os jobs `check`, `db`, `e2e`, `openapi`, migrações compatíveis com a versão anterior e os alertas.
- Status anterior: proposta (hospedagem e runner dependiam de I-1, I-9, I-10)
- Data: 2026-10-09
- Relacionadas: ADR 0003 (o que bloqueia), ADR 0005 (migrações), ADR 0006 (processos), praticas §7, ata D15

## Contexto
Monorepo npm (ADR 0002), três processos de servidor (ADR 0006), SPA estático, MySQL 8, `main` protegida (pedido 005). O MySQL do Acelerato e a base ficam na rede interna; o GitHub está fora dela.

## Decisão
**Ambientes**
| Ambiente | Onde | Dados | Autenticação |
|---|---|---|---|
| local | `docker compose` (MySQL 8.4) + `npm run dev` | seed do mock | autenticador falso |
| CI | GitHub Actions, MySQL 8.4 como `services` | seed do mock | autenticador falso |
| homologação | infra Unifique (I-1) | coletas reais (somente leitura) + automações em `modo=simulacao` | IdP corporativo |
| produção | infra Unifique (I-1) | coletas reais; automações ativas após T4.1 | IdP corporativo |

**Artefatos:** uma imagem Docker do servidor (entradas `api`, `worker`, `automacoes`) e uma imagem nginx com o `web/dist` que também faz proxy de `/api` e `/auth` (mesma origem, ADR 0009). Tag = SHA do commit. Configuração só por variáveis de ambiente validadas com zod na partida; segredos em `.env` no host com permissão restrita ou cofre (I-11), nunca no repositório nem no GitHub além do necessário para publicar a imagem.

**Pipeline (GitHub Actions)**
| Job | Gatilho | Passos |
|---|---|---|
| `check` | todo PR e push | `npm ci`, lint (inclui fronteiras), `tsc -b`, testes unitários `TZ=UTC`, bundle (F6/F8/F9) |
| `db` | todo PR que toca `server/` ou `packages/` | MySQL 8.4 em serviço; migrações `up` → `down` → `up`; diff de `tipos.gen.ts`; teste de esquema (sem coluna de pessoa no analítico, sem objeto que junte `dspd_bm` e `dspd_ac`); seed; integração; paridade mock × MySQL; tempos A1/M1 com limite folgado |
| `e2e` | PR para `develop`/`main` | Playwright projetos `mock` e `api` (D15) + axe; Lighthouse CI |
| `openapi` | todo PR | gerado = versionado |
| `imagem` | merge em `main` | build e push para o registro (I-10) |
| `deploy` | manual (`workflow_dispatch`) para homologação; aprovação para produção | runner **self-hosted na rede interna** (I-9): `migrar` (job único, usuário migrador), `ref:sync`, troca das imagens, verificação de `/health/ready` |

**Migrações em produção:** aplicadas antes da troca de versão, por um job dedicado; só migrações compatíveis com a versão anterior (expandir → migrar → contrair em releases separados). Backup lógico antes de cada migração em produção.

**Observabilidade:** logs JSON no stdout (pino) coletados pela ferramenta da infra (I-8); `/health/ready` nos três processos; alerta por falha ou atraso de coleta (sem `sucesso` em 26 h), divergência de reconciliação > 1 %, erro 5xx > 1 % em 5 min.

**Backup:** dump diário da base + binlog para recuperação pontual (responsabilidade da infra, I-14). O staging é o registro de origem: perdê-lo é perder histórico que a ferramenta já não devolve (arquivados, excluídos).

## Alternativas consideradas
- **Deploy por runner hospedado com SSH para a rede interna**: sem runner próprio. Contras: abrir SSH para a internet. Descartado em favor de runner interno ou deploy por *pull* (a máquina busca a imagem nova).
- **Kubernetes**: se a Unifique já opera, é a opção (Deployment para `api`, CronJob ou Deployment para `worker`). Sem cluster existente, VM com Docker Compose é suficiente.
- **Migração automática na partida da API**: simples. Contras: várias instâncias concorrendo, usuário da API com DDL. Descartado.

## Consequências
- Mais fácil: o mesmo `docker compose` reproduz o CI localmente; deploy reversível trocando a tag.
- Mais difícil: manter runner interno; migrações em duas fases para mudanças incompatíveis.
- Riscos: sem runner interno nem *pull*, o deploy vira manual (aceitável no início, com script único).
