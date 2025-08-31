const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Import routes
const whatsappRoutes = require('./routes/whatsapp.routes');

// Import services
const WhatsAppService = require('./services/whatsapp.service');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting - mais permissivo para permitir conexões do frontend
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50, // aumentado para 50 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Pular rate limit para algumas rotas essenciais
  skip: (req, res) => {
    return req.path === '/api/whatsapp/connect' || req.path === '/api/whatsapp/status';
  }
});

// CORS mais específico e permissivo
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de origins permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173', // Vite default
      'http://localhost:8080',
      'https://pedido-facil-react.vercel.app', // Substitua pela URL do seu frontend
      process.env.FRONTEND_URL
    ];
    
    // Permite qualquer origin em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));

// Log de debugging para requisições
app.use((req, res, next) => {
  console.log(`🔄 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'N/A'} - IP: ${req.ip}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware específico para requests OPTIONS (preflight CORS)
app.options('*', (req, res) => {
  console.log('🔄 Preflight OPTIONS request:', req.path);
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Apply rate limiting to most routes (mas não para connect/status)
app.use('/api/', limiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'WhatsApp Bulk Sender',
    version: '1.0.0',
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Teste de CORS
app.get('/api/test-cors', (req, res) => {
  console.log('🧪 Teste de CORS - Origin:', req.get('Origin'));
  res.json({
    success: true,
    message: 'CORS funcionando corretamente',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/whatsapp', whatsappRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err.message);
  console.error('📋 Stack trace completo:', err.stack);
  console.error('🌐 URL:', req.url);
  console.error('📍 Method:', req.method);
  console.error('📦 Body:', JSON.stringify(req.body, null, 2));
  
  // Verificar se é erro de CORS
  if (err.message.includes('CORS') || err.message.includes('origem')) {
    return res.status(403).json({
      success: false,
      error: 'Erro de CORS - Origem não permitida',
      details: `Origin '${req.get('Origin')}' não está na lista de origins permitidas`,
      code: 'CORS_ERROR',
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: err.message,
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'NOT_FOUND'
  });
});

// Initialize WhatsApp service
const whatsappService = new WhatsAppService();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📖 Documentação disponível em http://localhost:${PORT}/api-docs`);
  
  // Initialize WhatsApp connection
  whatsappService.initialize();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  Encerrando aplicação...');
  whatsappService.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  Encerrando aplicação...');
  whatsappService.disconnect();
  process.exit(0);
});

module.exports = app;
