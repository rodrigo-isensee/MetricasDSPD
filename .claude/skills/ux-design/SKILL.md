---
name: ux-design
description: Padrões de UX/UI do projeto - formato de especificação de telas, checklist de acessibilidade (WCAG 2.2 AA), heurísticas de usabilidade e microcopy. Use ao desenhar ou revisar telas e fluxos.
---

# UX Design

## Formato da especificação (`docs/ux/<feature>.md`)

```markdown
# <Nome da feature>

## Objetivo
Problema do usuário e resultado esperado (1-3 frases).

## Personas / contexto de uso
Quem usa, em que dispositivo, com que frequência.

## Fluxo
1. Passo a passo da jornada principal.
2. Fluxos alternativos e de erro.

## Telas
### <Tela>
- Wireframe (ASCII ou descrição estruturada da hierarquia)
- Componentes usados (reaproveitar os existentes)
- Estados: carregando | vazio | erro | sucesso | sem permissão
- Interações: o que acontece em cada clique/submit
- Validações de formulário e mensagens

## Necessidades de dados
O que a tela precisa ler/gravar (para o back-end).

## Microcopy
Textos de botões, títulos, mensagens de erro e confirmação.

## Critérios de aceite
Lista verificável usada pelo front-end e pelos testes.
```

## Checklist de acessibilidade (WCAG 2.2 AA)
- Contraste mínimo 4.5:1 para texto, 3:1 para texto grande e elementos de UI.
- Tudo operável por teclado; foco visível; ordem de foco lógica.
- Alvos de toque ≥ 24×24px (ideal 44×44px).
- Todo campo tem label visível; erros associados ao campo e anunciados.
- Não depender só de cor para transmitir informação.
- Imagens informativas com texto alternativo.
- Respeitar `prefers-reduced-motion`.

## Heurísticas (Nielsen)
Visibilidade do status · correspondência com o mundo real · controle e liberdade · consistência · prevenção de erros · reconhecer em vez de lembrar · flexibilidade · design minimalista · ajudar a recuperar de erros · ajuda e documentação.

## Microcopy
- Português do Brasil, tom direto e cordial, voz ativa.
- Botões com verbo de ação ("Salvar alterações", não "OK").
- Mensagens de erro dizem o que aconteceu e como resolver; nunca culpam o usuário.
- Ações destrutivas pedem confirmação nomeando o que será afetado.

## Layout
- Mobile-first; breakpoints: 640, 768, 1024, 1280px.
- Espaçamento em múltiplos de 4px.
- Uma ação primária por tela/seção.
