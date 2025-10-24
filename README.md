# 🎬 Titanio Studio Platform

> Plataforma de criação de conteúdo com IA e gestão automatizada de campanhas publicitárias

---

## 🚀 Visão Geral

A **Titanio Studio Platform** é uma solução completa que combina:
- **Chat Conversacional** para criação de conteúdo
- **Geração de Imagens** com IA (Nano Banana / Gemini)
- **Geração de Vídeos** com IA (Kling AI / Wan2.5)
- **Gestão Automatizada** de campanhas no Google Ads e Meta Ads
- **Sistema de Créditos** para controle de uso

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** - UI Library
- **Vite 7** - Build Tool
- **TailwindCSS 3** - Styling
- **tRPC** - Type-safe API client
- **TanStack Query** - Data fetching

### Backend
- **Node.js 22** - Runtime
- **Express 5** - Web framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database ORM
- **SQLite / Turso** - Database

### Integrações
- **OpenAI GPT-4o-mini** - Chat conversacional
- **Google Gemini (Nano Banana)** - Geração de imagens
- **Kling AI** - Geração de vídeos
- **Google Ads API** - Criação de campanhas
- **Meta Ads API** - Criação de campanhas

---

## 📦 Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/titanio-studio-platform.git
cd titanio-studio-platform

# Instalar dependências
pnpm install

# Gerar migrations do banco
pnpm db:generate

# Aplicar migrations
sqlite3 sqlite.db < drizzle/0000_hard_blue_shield.sql

# Iniciar em desenvolvimento
pnpm dev
```

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Google Gemini
GEMINI_API_KEY=AIza...

# Kling AI
KLING_API_KEY=...

# Database (Turso)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Google Ads
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_DEVELOPER_TOKEN=...

# Meta Ads
META_APP_ID=...
META_APP_SECRET=...
META_ACCESS_TOKEN=...
```

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor + cliente
pnpm dev:server       # Apenas servidor
pnpm dev:client       # Apenas cliente

# Build
pnpm build            # Build para produção

# Banco de Dados
pnpm db:generate      # Gerar migrations
pnpm db:migrate       # Aplicar migrations
pnpm db:studio        # Abrir Drizzle Studio
```

---

## 🎨 Funcionalidades

### ✅ Implementado

- [x] Interface de chat conversacional
- [x] Sistema de conversas e mensagens
- [x] Backend tRPC funcionando
- [x] Banco de dados estruturado
- [x] Design responsivo

### 🚧 Em Desenvolvimento

- [ ] Integração OpenAI (respostas reais)
- [ ] Sistema de autenticação
- [ ] Geração de imagens (Nano Banana)
- [ ] Geração de vídeos (Kling AI)
- [ ] Sistema de créditos
- [ ] Integração Google Ads API
- [ ] Integração Meta Ads API

---

## 📐 Arquitetura

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │ tRPC
┌────────▼────────┐
│   Backend       │
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│  DB  │  │  APIs │
│(SQL) │  │  (IA) │
└──────┘  └───────┘
```

---

## 🗄️ Schema do Banco

### Tabelas Principais

- **users** - Usuários da plataforma
- **conversations** - Conversas do chat
- **messages** - Mensagens das conversas
- **generations** - Gerações de conteúdo (imagem/vídeo)
- **credit_transactions** - Transações de créditos

---

## 🚀 Deploy

Consulte o arquivo [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instruções detalhadas de deploy no Vercel.

---

## 📊 Modelo de Negócio

### Planos

| Plano | Preço/mês | Créditos | Destaque |
|-------|-----------|----------|----------|
| Free | R$ 0 | 50 | Teste |
| Basic | R$ 49 | 500 | Pequenos negócios |
| Pro | R$ 149 | 2000 | Profissionais |
| Business | R$ 499 | 10000 | Agências |

### Consumo de Créditos

- Chat: Ilimitado (custo muito baixo)
- Imagem: 1-5 créditos
- Vídeo: 10-50 créditos
- Campanha: 5 créditos

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença ISC.

---

## 📞 Contato

**Titanio Films**
- Email: contact@titaniofilms.com
- Website: https://titaniofilms.com

---

**Desenvolvido com ❤️ pela equipe Titanio**

