# 🤖 WhatsApp Bulk Sender API

Uma API robusta para envio de mensagens em lote via WhatsApp usando a biblioteca Baileys. Desenvolvida com foco em segurança e performance, sem armazenar histórico de conversas.

## 📋 Características Principais

- ✅ **Envio em Lote**: Até 100 mensagens por requisição
- ✅ **Mensagens Personalizadas**: Mensagem individual ou padrão
- ✅ **Sem Armazenamento**: Não carrega ou armazena histórico de conversas
- ✅ **Rate Limiting**: Proteção contra spam automático
- ✅ **Documentação Swagger**: API totalmente documentada
- ✅ **Validação Robusta**: Validação completa de números e mensagens
- ✅ **Logs Detalhados**: Sistema de logs com Pino
- ✅ **Reconexão Automática**: Reconecta automaticamente em caso de desconexão

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 16+ 
- NPM ou Yarn
- WhatsApp instalado no celular

### 1. Clone e Instale

```bash
# Clone o repositório
git clone <seu-repositorio>
cd whatsapp-bulk-sender

# Instale as dependências
npm install
```

### 2. Configuração de Ambiente

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite as configurações se necessário
nano .env
```

**Arquivo `.env`:**
```env
PORT=3000
NODE_ENV=development
WHATSAPP_SESSION_DIR=./sessions
WHATSAPP_TIMEOUT=30000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
LOG_LEVEL=info
```

### 3. Execute a Aplicação

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

## 📱 Primeira Conexão

1. **Inicie o servidor** e acesse a documentação em `http://localhost:3000/api-docs`

2. **Conecte o WhatsApp** usando o endpoint:
   ```bash
   POST http://localhost:3000/api/whatsapp/connect
   ```

3. **Escaneie o QR Code** que aparecerá no console do servidor com seu WhatsApp

4. **Verifique o status** da conexão:
   ```bash
   GET http://localhost:3000/api/whatsapp/status
   ```

## 🔌 Endpoints da API

### Status da Conexão
```http
GET /api/whatsapp/status
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "status": "connected",
    "qrCode": null,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Enviar Mensagem Única
```http
POST /api/whatsapp/send
Content-Type: application/json

{
  "number": "5511999999999",
  "message": "Olá! Esta é uma mensagem de teste."
}
```

### Enviar Mensagens em Lote
```http
POST /api/whatsapp/send-bulk
Content-Type: application/json

{
  "messages": [
    {
      "number": "5511999999999",
      "message": "Mensagem personalizada para João"
    },
    {
      "number": "5511888888888"
    },
    {
      "number": "5511777777777",
      "message": "Mensagem especial para Maria"
    }
  ],
  "defaultMessage": "Olá! Esta é uma mensagem automática."
}
```

**Resposta do Envio em Lote:**
```json
{
  "success": true,
  "message": "Envio em lote processado",
  "data": {
    "statistics": {
      "total": 3,
      "sent": 2,
      "errors": 1
    },
    "results": [
      {
        "number": "5511999999999",
        "status": "sent",
        "messageId": "3A123456789ABCDEF",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      {
        "number": "5511888888888",
        "status": "error",
        "error": "Número não existe no WhatsApp",
        "timestamp": "2024-01-15T10:30:02.000Z"
      }
    ]
  }
}
```

## 📖 Documentação Interativa

Acesse a documentação Swagger completa em:
```
http://localhost:3000/api-docs
```

A documentação inclui:
- 📝 Todos os endpoints disponíveis
- 🔍 Exemplos de requisição e resposta
- ✅ Teste interativo dos endpoints
- 📋 Esquemas de dados detalhados

## 🛡️ Segurança e Limites

### Rate Limiting
- **Limite**: 5 requisições por 15 minutos por IP
- **Aplicado a**: Todas as rotas da API (`/api/*`)
- **Resposta**: HTTP 429 com detalhes do limite

### Validações
- **Números**: Formato válido com 10-15 dígitos
- **Mensagens**: 1-4096 caracteres
- **Lote**: Máximo 100 mensagens por requisição
- **Delay**: 2 segundos automático entre envios

### Medidas de Segurança
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração de origem cruzada
- **Logs**: Registro detalhado de operações
- **Sanitização**: Validação e limpeza de dados

## 📁 Estrutura do Projeto

```
whatsapp-bulk-sender/
├── src/
│   ├── app.js                 # Aplicação principal
│   ├── config/
│   │   └── swagger.js         # Configuração Swagger
│   ├── controllers/
│   │   └── whatsapp.controller.js
│   ├── routes/
│   │   └── whatsapp.routes.js
│   ├── services/
│   │   └── whatsapp.service.js # Lógica do WhatsApp/Baileys
│   └── validators/
│       └── whatsapp.validator.js
├── sessions/                  # Dados de sessão do WhatsApp
├── package.json
├── env.example
└── README.md
```

## 🔧 Scripts Disponíveis

```bash
# Iniciar em desenvolvimento (nodemon)
npm run dev

# Iniciar em produção
npm start

# Executar testes (não implementado ainda)
npm test
```

## ❓ Problemas Comuns

### QR Code não aparece
- Verifique se o endpoint `/connect` foi chamado
- Confirme que não há sessão anterior em `./sessions`
- Reinicie o servidor se necessário

### Erro "WhatsApp não está conectado"
- Verifique o status com `GET /status`
- Reconecte usando `POST /connect`
- Aguarde alguns segundos após a conexão

### Mensagens não são entregues
- Confirme se os números estão no formato correto
- Verifique se os números existem no WhatsApp
- Respeite o rate limiting (2s entre mensagens)

### Rate Limit atingido
- Aguarde 15 minutos antes de tentar novamente
- Reduza a frequência de requisições
- Implemente retry com backoff exponencial

## 🚀 Deploy em Produção

### Variáveis de Ambiente
```env
NODE_ENV=production
PORT=3000
WHATSAPP_SESSION_DIR=/app/sessions
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=3
```

### Considerações
- Use um gerenciador de processos (PM2, Forever)
- Configure reverse proxy (Nginx)
- Implemente monitoramento de logs
- Configure backup das sessões
- Use HTTPS em produção

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## ⚠️ Aviso Legal

Este bot é destinado apenas para uso legítimo. Certifique-se de:
- Respeitar os Termos de Serviço do WhatsApp
- Obter consentimento antes de enviar mensagens
- Não fazer spam ou enviar conteúdo inadequado
- Seguir as leis locais de proteção de dados

---

💬 **Dúvidas?** Abra uma issue no repositório ou consulte a documentação Swagger.
