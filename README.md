# Lara & Sophia

Projeto Next.js com App Router e JavaScript, preparado para publicação na Vercel.

## Rodar localmente

1. Instale as dependências com `npm ci`.
2. Copie `.env.example` para `.env.local` e preencha a URL e a chave **pública** do seu projeto Supabase.
3. Execute `npm run dev`.

Depois, abra http://localhost:3000.

## Login com Supabase

Use `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Se o painel forneceu uma chave `sb_publishable_`, use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em vez de `ANON_KEY`. Se ambas estiverem preenchidas, `PUBLISHABLE_KEY` tem prioridade. Nunca use `service_role` ou chave secreta.

Na Vercel, cadastre as mesmas variáveis no ambiente desejado e faça um novo deploy. Em Supabase → Authentication → URL Configuration, configure a Site URL com o endereço principal do site e adicione `https://seu-site.vercel.app/auth/callback` em Redirect URLs. Para desenvolvimento, adicione também `http://localhost:3000/auth/callback`.

O cadastro entra automaticamente quando a confirmação por e-mail está desativada. Se estiver ativada, a página pede para confirmar o e-mail e aceita o retorno pelo link no mesmo navegador. As senhas devem respeitar a política definida no Supabase (no mínimo 6 caracteres).

A página `/` verifica a usuária no servidor e redireciona visitantes para `/login`. O proxy renova os cookies de sessão; o botão Sair encerra a sessão neste navegador. A proteção das tabelas do banco continua dependendo das políticas RLS no Supabase.

## Verificação

Execute `npm run build`. Para validar o fluxo, crie uma conta de teste, saia, tente acessar `/` sem login, entre novamente e recarregue a página. Confirme que o e-mail aparece no topo e que uma senha incorreta produz uma mensagem em português.

## Dia 2 — Isso é golpe?

`desafio.js` define o título, os campos, o modelo, o prompt e `modoTeste`. A rota autenticada `POST /api/ia` recebe um objeto JSON com os campos, como `{ "mensagem": "texto recebido" }`, e responde com texto simples.

Com `modoTeste: true`, a rota retorna um exemplo fixo sem usar chave ou fazer chamadas à OpenRouter. O exemplo não é uma avaliação real da mensagem enviada. Análises bem-sucedidas, inclusive exemplos de teste, são salvas no histórico.

Para ativar a IA posteriormente, cadastre `OPENROUTER_API_KEY` somente no servidor (na Vercel ou em `.env.local`) e altere `modoTeste` para `false`. Não use o prefixo `NEXT_PUBLIC_` para essa chave. A rota usa `openrouter/free`, limita a resposta a 900 tokens e trata falhas em português. Publicar e ativar a IA são etapas posteriores à revisão.

Execute `npm test` para validar a configuração de autenticação, modo de teste, montagem do prompt e tratamento de erros da IA sem consumir chamadas reais.

## Dia 2 — Histórico privado

Após uma análise bem-sucedida, `/api/ia` insere `entrada` (todos os campos com seus rótulos) e `resposta` na tabela `respostas`, usando a sessão da pessoa logada. O `user_id` vem do default `auth.uid()` já definido na tabela; nenhum ID enviado pelo navegador é usado. A implementação não cria nem altera a tabela ou políticas RLS.

A página `/historico` exige login e consulta os registros da usuária verificada, com 20 análises por página, da mais recente para a mais antiga. Datas e horas aparecem em português, no fuso de São Paulo. Além do filtro no servidor, as políticas RLS existentes devem continuar protegendo SELECT e INSERT no Supabase, conforme a apostila.

Se a análise funcionar e a gravação falhar, a resposta continua visível com um aviso para copiá-la; a IA não é chamada novamente automaticamente. Falha de leitura do histórico mostra um erro, em vez de fingir que não há registros.

Para validar o banco real após a publicação: faça duas análises com a conta A e confira o histórico; em janela anônima, faça uma análise com a conta B. B deve ver apenas uma análise, e A apenas as duas dela. Depois saia e tente abrir `/historico`: o site deve redirecionar para `/login`. Os testes locais com serviços simulados não comprovam as políticas RLS do projeto real.
