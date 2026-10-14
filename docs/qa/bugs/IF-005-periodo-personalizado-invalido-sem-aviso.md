# IF-005 - Período personalizado inválido no link é descartado em silêncio, sem o aviso de filtros ignorados
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: main @ 0af552a, `vite preview`, Chromium 1248, 1280x800

## Passos para reproduzir
Abrir cada link:
1. `/operacional?periodo=custom` (sem datas)
2. `/operacional?periodo=custom&de=2026-08-31&ate=2026-06-01` (invertido)
3. `/sustentacao?periodo=custom&de=2026-02-30&ate=2026-03-31` (data impossível)
4. `/sustentacao?periodo=custom&de=ontem&ate=hoje`

## Resultado esperado
Spec 2.6: o valor inválido é ignorado (vale o período padrão) **e** o aviso "... foram ignorados" aparece, como já acontece com `periodo=99`, com intervalo menor que 7 dias, com data futura e com data anterior à base.

## Resultado obtido
A URL é limpa (`periodo`, `de` e `ate` somem) e o painel abre no padrão, mas **sem aviso**: quem recebeu um link quebrado lê "Últimas 12 semanas" sem saber que o recorte pedido foi descartado.

## Causa provável
Em `useFiltros`, antes de as opções de filtro chegarem, a validação de reserva já reprova estas datas e o período efetivo cai no padrão; o ramo "período válido, mas fora das opções do painel (não aplicável)" da normalização trata `bruto === 'custom'` com efetivo = padrão como não aplicável e apaga `periodo/de/ate` em silêncio. Quando as opções chegam, não há mais nada a avisar.

## Evidência
`e2e/tests/intensivo-filtros-bordas.spec.ts` IF-B09, IF-B10, IF-B16 e IF-B17: `getByTestId('aviso-filtros-invalidos')` não encontrado. IF-B11, IF-B12, IF-B13 e IF-B15 (inválidos só pelo histórico) mostram o aviso.

## Correção
- Correção: 935e51a (fix(web): filtros na URL partem do estado vigente, URL canônica e aviso de período inválido)
