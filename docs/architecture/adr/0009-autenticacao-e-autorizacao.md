# 0009 - Autenticação e autorização
- Status: proposta (depende da pergunta I-3: provedor de identidade da Unifique)
- Data: 2026-10-09

## Contexto
Painéis internos do DSPD, autenticação corporativa exigida (pedido 002, item 9). Todos os usuários veem os mesmos dados (não há escopo por equipe nem visão individual), então autorização é grossa. Nenhum dado de pessoa precisa ser guardado para o produto funcionar.

## Decisão
- **OIDC Authorization Code + PKCE feito pelo servidor** (padrão backend-for-frontend): `/auth/login` → IdP corporativo → `/auth/callback`; o servidor cria **sessão em cookie** `httpOnly`, `Secure`, `SameSite=Lax`, assinado e cifrado (`@fastify/secure-session`), validade de 8 h com renovação deslizante. O SPA nunca vê token.
- Sessão guarda só: `sub` do IdP em forma de **HMAC** (para auditoria de acesso sem nome), papéis e expiração. Nome e e-mail não são persistidos nem logados.
- **Papéis** vindos de grupo do IdP: `leitor` (todos os painéis e rotas `GET`). Não há papel de administração na API: critérios (T2.6), calendário e domínios de referência entram por arquivo versionado no repositório e comando `ref:sync` no deploy (governança por PR).
- Mesma origem para web e API (SPA servido atrás do mesmo proxy), o que dispensa CORS; mudanças de estado (`/auth/logout`) exigem cabeçalho anti-CSRF.
- Webhook e health ficam fora da sessão (webhook por segredo, ADR 0006).
- Interface `Autenticador` injetável: em dev e no E2E `api`, um autenticador falso com usuário fixo, habilitado só por variável de ambiente e proibido quando `NODE_ENV=production`.

## Alternativas consideradas
- **JWT de curta duração + refresh no navegador**: API sem estado. Contras: tokens no JS (XSS), refresh e revogação para gerir; sem ganho com uma API e poucos usuários.
- **LDAP/AD com formulário próprio**: funciona sem OIDC. Contras: a aplicação manipula senha corporativa. Alternativa se a Unifique só tiver AD (I-3), com bind de serviço e rate limit.
- **Autenticação no proxy reverso** (oauth2-proxy, cabeçalho confiável): aplicação mais simples. Contras: segurança depende de a API só aceitar tráfego do proxy. Alternativa aceitável se a infra já opera esse padrão.
- **Sem autenticação na intranet**: descartado pelo pedido.

## Consequências
- Mais fácil: sem senha nem token no front; nenhuma tabela de usuários.
- Mais difícil: precisa de registro da aplicação no IdP (URLs de callback por ambiente).
- Risco: sem resposta de I-3 a fase API real não vai a produção; homologação pode usar o autenticador falso atrás da VPN.
