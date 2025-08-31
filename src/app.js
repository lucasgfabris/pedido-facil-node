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
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // máximo 5 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'WhatsApp Bulk Sender'
  });
});

// Routes
app.use('/api/whatsapp', whatsappRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR'
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
