# Siegard (zig999/siegard2): análise e auditoria de segurança

Data: 2026-10-11 · Decisão do usuário: **instalar o plugin como está (opção A)**, com **auto-update ligado** (decisões 1 e 2 em `docs/alinhamentos/2026-10-11-siegard.md`).

## Fatos
- Repositório público do autor `zig999`, **sem licença** (todos os direitos reservados por padrão): **não copiar código nem texto dele para este repositório**; reimplementar ideias é permitido.
- Criado em 2026-07-29, 0 estrelas, 1 autor. Plugin `siegard` **5.19.0**, commit auditado `fe46a6b`.

- O autor é o gerente e amigo do usuário (confiança informada pelo usuário em 2026-10-11); o repositório continua **sem licença** até o autor definir uma.

## Auditoria estática (leitura de ~15 mil linhas de Python do plugin; não é auditoria completa)
| Ponto | Resultado |
|---|---|
| Rede | Nenhum módulo de rede importado |
| `eval`/`exec` | Nenhum |
| Hook de início de sessão (`hooks/drift.py`) | Só executa o próprio `bin/project.py` |
| Execução de comandos (`bin/run.py`) | Roda os passos que o projeto declara em `siegard.json` |
| Telemetria (`bin/telemetry.py`) | **Lê `~/.claude/projects` (transcrições de todos os projetos da máquina)**, só sob demanda, gera arquivos locais. **Proibido usar** neste projeto |
| Remoções (`bin/spec.py`) | Apaga apenas arquivos antigos que ele mesmo gerou |

## Condições
1. Escopo de projeto (`.claude/settings.json`), instalado por PR revisável.
2. **Auto-update ligado** pelo usuário (`/plugin` → Marketplaces → Enable auto-update). Como o código muda sozinho, **reauditar a cada mudança de versão maior (6.x)** e ao ver comportamento novo.
3. O plugin só injeta regras e roda hooks em projeto com `siegard.json`; esta instalação **não** cria esse arquivo (decisão futura).
4. Nunca invocar `/siegard-telemetry`.
