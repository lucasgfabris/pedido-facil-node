const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Bulk Sender API',
      version: '1.0.0',
      description: `
        API para envio de mensagens em lote via WhatsApp usando Baileys.
        
        ## Características Principais
        - ✅ Envio de mensagens individuais e em lote
        - ✅ Não armazena histórico de conversas
        - ✅ Rate limiting para evitar spam
        - ✅ Validação de números e mensagens
        - ✅ Status da conexão em tempo real
        
        ## Como Usar
        1. **Conectar**: Use \`POST /api/whatsapp/connect\` para inicializar
        2. **Status**: Verifique \`GET /api/whatsapp/status\` para ver se está conectado
        3. **Enviar**: Use os endpoints de envio quando conectado
        
        ## Importante
        - O QR Code aparece no console da aplicação
        - Máximo de 100 mensagens por lote
        - Rate limiting: 5 requests por 15 minutos
        - Delay automático de 2s entre mensagens
      `,
      contact: {
        name: 'Suporte API WhatsApp',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://sua-api.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Servidor de Produção' : 'Servidor Local'
      },
    ],
    tags: [
      {
        name: 'WhatsApp',
        description: 'Operações relacionadas ao WhatsApp'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/routes/*.js', // Caminho para os arquivos de rotas
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
