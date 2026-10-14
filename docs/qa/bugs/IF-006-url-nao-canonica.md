# IF-006 - A URL nem sempre fica canônica: padrão explícito, de/ate soltos, todas as opções, maiúsculas e parâmetro repetido
- Severidade: baixa
- Responsável sugerido: react-frontend
- Ambiente: main @ 0af552a, `vite preview`, Chromium 1248, 1280x800

## Passos para reproduzir e resultado obtido
| Link aberto | Tela | URL depois de abrir |
|---|---|---|
| `/operacional?periodo=12s` | 12 semanas (padrão) | continua `periodo=12s` |
| `/estrategico?periodo=12m` | 12 meses (padrão) | continua `periodo=12m` |
| No Operacional escolher 12 meses e clicar em "Estratégico" no menu | 12 meses (padrão) | o próprio link do menu gera `/estrategico?periodo=12m` |
| `/operacional?de=2026-06-01&ate=2026-08-31` | 12 semanas | `de` e `ate` ficam |
| `/operacional?equipe=<as 6 equipes>` | "Equipe: Todas" | as 6 equipes ficam na URL |
| `/operacional?equipe=%20FLUIG%20,fluig,Dados` | "Equipe: 2 selecionadas" | continua ` FLUIG ,fluig,Dados` |
| `/operacional?equipe=fluig&equipe=dados` | "Equipe: Fluig" (só o primeiro) | as duas ocorrências ficam |

## Resultado esperado
Spec 2.5: "Só valores fora do padrão entram na URL... em minúsculas e sem acento"; a URL é a fonte da verdade, então deveria descrever exatamente o estado da tela (mesma regra que já remove o parâmetro quando se marcam todas as opções pela interface, FIL-04). O caso do parâmetro repetido é o mais enganoso: a URL diz Fluig e Dados, a tela filtra só Fluig.

## Evidência
`e2e/tests/intensivo-filtros-bordas.spec.ts` IF-B21, IF-B22, IF-B42, IF-B43, IF-B44, IF-B45 e IF-B46 (asserções de URL canônica). Nenhum desses casos quebra o painel nem gera erro de console (IF-B23 a IF-B28 passam).

## Correção
- Correção: 935e51a (fix(web): filtros na URL partem do estado vigente, URL canônica e aviso de período inválido)
