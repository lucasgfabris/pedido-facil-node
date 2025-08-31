# 🚀 Guia de Instalação Rápida

## Pré-requisitos
- Node.js 16+ instalado
- NPM ou Yarn
- WhatsApp no celular

## Instalação

### 1. Clone e instale dependências
```bash
git clone <seu-repositorio>
cd whatsapp-bulk-sender
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp env.example .env
```

### 3. Inicie o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 4. Primeira conexão
1. Acesse `http://localhost:3000/api-docs`
2. Execute `POST /api/whatsapp/connect`
3. Escaneie o QR Code do console com o WhatsApp
4. Verifique status em `GET /api/whatsapp/status`

## ✅ Teste Rápido

Envie uma mensagem de teste:
```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "message": "Teste de API!"
  }'
```

## 📖 Documentação Completa
- **Swagger UI**: http://localhost:3000/api-docs
- **README**: [README.md](README.md)
- **Postman**: Importe `WhatsApp_Bulk_Sender_API.postman_collection.json`

---
💡 **Dica**: Mantenha o console aberto para ver os logs e QR Code!
