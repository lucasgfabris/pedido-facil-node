# Pedido Facil Node

![GitHub repo size](https://img.shields.io/github/repo-size/lucasgfabris/pedido-facil-node?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/lucasgfabris/pedido-facil-node?style=for-the-badge)

> API para envio de mensagens em lote via WhatsApp usando a biblioteca Baileys. Suporta ate 100 mensagens por requisicao com rate limiting, reconexao automatica e documentacao Swagger.

<img src="imagem.png" alt="Pedido Facil Node">

## Pre-requisitos

Antes de comecar, verifique se voce atendeu aos seguintes requisitos:

- Node.js 16 ou superior
- npm ou yarn
- WhatsApp instalado no celular (para escanear o QR Code)

## Instalando

Para instalar o Pedido Facil Node, siga estas etapas:

```bash
git clone https://github.com/lucasgfabris/pedido-facil-node.git
cd pedido-facil-node
npm install
cp env.example .env
```

### Configuracao

Edite o arquivo `.env`:

```env
PORT=3000
NODE_ENV=development
WHATSAPP_SESSION_DIR=./sessions
WHATSAPP_TIMEOUT=30000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
LOG_LEVEL=info
```

## Usando

Para usar o Pedido Facil Node, siga estas etapas:

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Producao
npm start
```

### Primeira Conexao

1. Inicie o servidor e acesse `http://localhost:3000/api-docs`
2. Chame o endpoint `POST /api/whatsapp/connect`
3. Escaneie o QR Code que aparecera no console com seu WhatsApp
4. Verifique o status com `GET /api/whatsapp/status`

### Endpoints da API

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | /api/whatsapp/status | Status da conexao |
| POST | /api/whatsapp/connect | Inicia conexao (gera QR Code) |
| POST | /api/whatsapp/send | Envia mensagem unica |
| POST | /api/whatsapp/send-bulk | Envia mensagens em lote |

### Exemplo de Envio em Lote

```json
{
  "messages": [
    {
      "number": "5511999999999",
      "message": "Mensagem personalizada para Joao"
    },
    {
      "number": "5511888888888"
    }
  ],
  "defaultMessage": "Ola! Esta e uma mensagem automatica."
}
```

### Limites e Validacoes

| Parametro | Limite |
|-----------|--------|
| Mensagens por requisicao | 100 |
| Caracteres por mensagem | 1-4096 |
| Formato de numero | 10-15 digitos |
| Delay entre envios | 2 segundos |
| Rate limit | 5 requisicoes / 15 min |

## Tecnologias

| Categoria | Tecnologias |
|-----------|-------------|
| Runtime | Node.js |
| Framework | Express |
| WhatsApp | @whiskeysockets/baileys |
| Seguranca | Helmet, CORS, express-rate-limit |
| Validacao | Joi |
| Documentacao | Swagger |
| Logs | Pino |

## Estrutura do Projeto

```
pedido-facil-node/
├── src/
│   ├── app.js                 # Aplicacao principal
│   ├── config/
│   │   └── swagger.js         # Configuracao Swagger
│   ├── controllers/
│   │   └── whatsapp.controller.js
│   ├── routes/
│   │   └── whatsapp.routes.js
│   ├── services/
│   │   └── whatsapp.service.js # Logica do WhatsApp/Baileys
│   └── validators/
│       └── whatsapp.validator.js
└── sessions/                  # Dados de sessao do WhatsApp
```

## Contribuindo

Para contribuir com Pedido Facil Node, siga estas etapas:

1. Bifurque este repositorio.
2. Crie um branch: `git checkout -b <nome_branch>`.
3. Faca suas alteracoes e confirme-as: `git commit -m '<mensagem_commit>'`
4. Envie para o branch original: `git push origin <nome_branch>`
5. Crie a solicitacao de pull.

## Aviso Legal

Este bot e destinado apenas para uso legitimo. Certifique-se de:
- Respeitar os Termos de Servico do WhatsApp
- Obter consentimento antes de enviar mensagens
- Nao fazer spam ou enviar conteudo inadequado
- Seguir as leis locais de protecao de dados

## Licenca

Esse projeto esta sob licenca MIT.
