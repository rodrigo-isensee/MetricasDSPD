## Objetivo
Review do L1 do pedido 099 (desligar o simulador): branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, código em dec8924c79b0ea678d889272f68237c1c3f8dc48 (`web/src/app/App.tsx` usa `HttpFonteMetricas` sem o `FonteComSimulado`; dois testes novos), QA aprovado em 93309e3a, base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff eac38a64b0b580d7c920f4b2b501287f7fb56599 dec8924c79b0ea678d889272f68237c1c3f8dc48`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/099-l1-sem-simulador.md`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0030-sem-simulado-na-web.md` (a ADR que revoga a 0028, escrita no repositório principal, sem commit).

## Entregar
- "E2.3 (tech-lead): review do L1." (E2.3)
- (E2) (E2.3) Review: a web de uso diário fica sem número simulado; o modo homologação e a API não mudam; os testes provam a troca; a ADR 0030 está coerente com a mudança e diz quem troca o `Estado:` da 0028. Leve a ADR 0030 para a branch neste mesmo commit do parecer (copiar sem mudar o texto, do repositório principal) e troque só a linha `Estado:` da 0028 para "substituída pela ADR 0030", como a ADR pede. Rodar `web/src/app` com no máximo 2 workers (R-TETO). Parecer `docs/reviews/099-l1-sem-simulador.md` (novo) pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: fix/099-l1-sem-simulador`, `commit: dec8924c79b0ea678d889272f68237c1c3f8dc48` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/099-l1-sem-simulador.md, docs/architecture/adr/0030-sem-simulado-na-web.md, docs/architecture/adr/0028-simulado-por-cartao.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/fix/099-l1-sem-simulador:docs/reviews/099-l1-sem-simulador.md` · espera: contém 'branch: fix/099-l1-sem-simulador'
