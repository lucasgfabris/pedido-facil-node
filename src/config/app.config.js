/**
 * Configurações da aplicação
 */

const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Configurações do WhatsApp
  whatsapp: {
    sessionDir: process.env.WHATSAPP_SESSION_DIR || './sessions',
    timeout: parseInt(process.env.WHATSAPP_TIMEOUT) || 30000,
    qrTimeout: parseInt(process.env.WHATSAPP_QR_TIMEOUT) || 60000,
    reconnectAttempts: parseInt(process.env.WHATSAPP_RECONNECT_ATTEMPTS) || 3,
    messageDelay: parseInt(process.env.WHATSAPP_MESSAGE_DELAY) || 2000,
    maxBulkMessages: parseInt(process.env.WHATSAPP_MAX_BULK) || 100
  },

  // Configurações de Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    message: {
      error: 'Muitas tentativas. Tente novamente em alguns minutos.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // Configurações de Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  },

  // Configurações de validação
  validation: {
    phoneNumber: {
      minLength: 10,
      maxLength: 15,
      pattern: /^\+?[\d\s\-\(\)]+$/
    },
    message: {
      minLength: 1,
      maxLength: 4096
    }
  },

  // Configurações de segurança
  security: {
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false
    }
  }
};

// Validar configurações obrigatórias
const requiredEnvVars = [];

// Verificar se todas as variáveis obrigatórias estão definidas
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${envVar}`);
  }
});

// Definir configurações específicas por ambiente
if (config.server.env === 'production') {
  // Configurações de produção
  config.logging.level = 'warn';
  config.logging.prettyPrint = false;
  config.rateLimit.max = 3; // Mais restritivo em produção
  config.whatsapp.messageDelay = 3000; // Delay maior em produção
}

if (config.server.env === 'development') {
  // Configurações de desenvolvimento
  config.logging.level = 'debug';
  config.logging.prettyPrint = true;
}

if (config.server.env === 'test') {
  // Configurações de teste
  config.logging.level = 'silent';
  config.whatsapp.messageDelay = 100; // Delay menor para testes
  config.rateLimit.max = 100; // Sem rate limit para testes
}

module.exports = config;
