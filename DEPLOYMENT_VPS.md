# 🚀 Guia de Deployment na VPS

## Problemas Corrigidos

✅ **CORS configurado** para aceitar requisições do frontend
✅ **Rate Limiting ajustado** para ser menos restritivo  
✅ **Porta alterada** de 3000 para 3001 (conforme esperado pelo frontend)
✅ **Logs detalhados** adicionados para debug
✅ **Middleware OPTIONS** para preflight CORS

## 📋 Instruções de Deploy

### 1. Configure as Variáveis de Ambiente

Na sua VPS, crie um arquivo `.env` com:

```bash
# Configurações da Aplicação para Produção
PORT=3001
NODE_ENV=production

# URL do Frontend (IMPORTANTE: substituir pela URL real)
FRONTEND_URL=https://seu-frontend-dominio.com
CORS_ORIGIN=https://seu-frontend-dominio.com

# Configurações do WhatsApp
WHATSAPP_SESSION_DIR=./sessions
WHATSAPP_TIMEOUT=45000
WHATSAPP_QR_TIMEOUT=90000
WHATSAPP_RECONNECT_ATTEMPTS=5
WHATSAPP_MESSAGE_DELAY=3000
WHATSAPP_MAX_BULK=50

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 2. Comandos de Deploy

```bash
# 1. Atualizar o código
git pull origin main

# 2. Instalar dependências
npm install --production

# 3. Reiniciar o serviço
pm2 restart pedido-facil-api
# OU se usando systemctl:
sudo systemctl restart pedido-facil-api

# 4. Verificar logs
pm2 logs pedido-facil-api
# OU
journalctl -f -u pedido-facil-api
```

### 3. Verificações de Firewall

Certifique-se de que a porta 3001 está aberta:

```bash
# Ubuntu/Debian
sudo ufw allow 3001

# CentOS/RHEL
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload
```

### 4. Teste a API

```bash
# Teste de saúde
curl http://72.60.54.168:3001/health

# Teste de status do WhatsApp
curl http://72.60.54.168:3001/api/whatsapp/status

# Teste de conexão (este que está falhando)
curl -X POST http://72.60.54.168:3001/api/whatsapp/connect
```

## 🔧 Debug de Problemas

### Logs Detalhados Agora Incluem:

- ✅ Origem da requisição (CORS debug)
- ✅ User-Agent para identificar cliente
- ✅ Timestamp em todas as respostas
- ✅ Stack traces completos em erros
- ✅ Status detalhado do WhatsApp

### Verificações Adicionais:

1. **Proxy/Nginx**: Se usando proxy reverso, configure headers:
   ```nginx
   proxy_set_header Origin $http_origin;
   proxy_set_header Host $host;
   proxy_set_header X-Real-IP $remote_addr;
   ```

2. **SSL/TLS**: Se o frontend usar HTTPS, a API também precisa
3. **Domínio**: Atualize `FRONTEND_URL` no .env com a URL real

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| CORS | Frontend não listado em allowedOrigins | Adicionar URL no .env |
| 500 | Erro no serviço WhatsApp | Verificar logs detalhados |
| Timeout | Rate limiting | Aguardar ou aumentar limites |
| 404 | Rota incorreta | Verificar se é POST /api/whatsapp/connect |

## 📞 Suporte

Se o erro persistir, verifique os logs agora mais detalhados:
- Eles mostrarão exatamente qual origem está sendo bloqueada
- Stack traces completos para debug
- Status do WhatsApp em tempo real
