const WhatsAppService = require('../services/whatsapp.service');
const { validateBulkMessage, validateSingleMessage } = require('../validators/whatsapp.validator');

class WhatsAppController {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  async getStatus(req, res) {
    try {
      const status = this.whatsappService.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao obter status do WhatsApp',
        details: error.message
      });
    }
  }

  async sendBulkMessages(req, res) {
    try {
      // Validate request body
      const { error, value } = validateBulkMessage(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.details.map(detail => detail.message)
        });
      }

      const { messages, defaultMessage } = value;
      
      // Prepare messages for sending
      const messagesToSend = messages.map(msg => ({
        number: msg.number,
        text: msg.message || defaultMessage
      }));

      // Send messages
      const results = await this.whatsappService.sendBulkMessages(messagesToSend);
      
      // Calculate statistics
      const stats = {
        total: results.length,
        sent: results.filter(r => r.status === 'sent').length,
        errors: results.filter(r => r.status === 'error').length
      };

      res.json({
        success: true,
        message: 'Envio em lote processado',
        data: {
          statistics: stats,
          results: results
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar mensagens em lote',
        details: error.message
      });
    }
  }

  async sendSingleMessage(req, res) {
    try {
      // Validate request body
      const { error, value } = validateSingleMessage(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.details.map(detail => detail.message)
        });
      }

      const { number, message } = value;
      
      // Send message
      const result = await this.whatsappService.sendMessage(number, message);

      res.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: {
          messageId: result.key.id,
          number: number,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar mensagem',
        details: error.message
      });
    }
  }

  async initializeConnection(req, res) {
    try {
      await this.whatsappService.initialize();
      
      res.json({
        success: true,
        message: 'Inicialização do WhatsApp iniciada',
        data: {
          status: 'initializing',
          message: 'Verifique o console para o QR Code ou aguarde a conexão'
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao inicializar WhatsApp',
        details: error.message
      });
    }
  }

  async disconnect(req, res) {
    try {
      await this.whatsappService.disconnect();
      
      res.json({
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao desconectar WhatsApp',
        details: error.message
      });
    }
  }

  async resetAndClearSessions(req, res) {
    try {
      // Primeiro desconecta
      await this.whatsappService.disconnect();
      
      // Depois limpa as sessões
      await this.whatsappService.clearAllSessions();
      
      res.json({
        success: true,
        message: 'WhatsApp desconectado e sessões limpas com sucesso'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao limpar sessões do WhatsApp',
        details: error.message
      });
    }
  }
}

// Create a single instance to be shared
const whatsappController = new WhatsAppController();

module.exports = {
  getStatus: (req, res) => whatsappController.getStatus(req, res),
  sendBulkMessages: (req, res) => whatsappController.sendBulkMessages(req, res),
  sendSingleMessage: (req, res) => whatsappController.sendSingleMessage(req, res),
  initializeConnection: (req, res) => whatsappController.initializeConnection(req, res),
  disconnect: (req, res) => whatsappController.disconnect(req, res),
  resetAndClearSessions: (req, res) => whatsappController.resetAndClearSessions(req, res)
};
