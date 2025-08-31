const { 
  default: makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.isConnected = false;
    this.qrCode = null;
    this.connectionStatus = 'disconnected';
    this.sessionDir = process.env.WHATSAPP_SESSION_DIR || './sessions';
    this.logger = pino({ level: process.env.LOG_LEVEL || 'info' });
    
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async initialize() {
    try {
      this.logger.info('🔄 Inicializando WhatsApp...');
      
      // Load authentication state
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
      
      // Create socket
      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: this.logger,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false, // Critical: Don't sync message history
        emitOwnEvents: false,   // Don't emit events for own messages
        getMessage: async () => {
          // Return empty to avoid loading message history
          return {};
        }
      });

      // Handle credentials update
      this.sock.ev.on('creds.update', saveCreds);

      // Handle connection updates
      this.sock.ev.on('connection.update', (update) => {
        this.handleConnectionUpdate(update);
      });

      // Handle QR code generation
      this.sock.ev.on('connection.update', (update) => {
        const { qr } = update;
        if (qr) {
          this.qrCode = qr;
          this.logger.info('📱 QR Code gerado. Escaneie com seu WhatsApp');
          qrcode.generate(qr, { small: true });
        }
      });

    } catch (error) {
      this.logger.error('❌ Erro ao inicializar WhatsApp:', error);
      throw error;
    }
  }

  handleConnectionUpdate(update) {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) ? 
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
        
      this.logger.info('⚠️  Conexão fechada. Reconectando:', shouldReconnect);
      
      if (shouldReconnect) {
        this.connectionStatus = 'reconnecting';
        setTimeout(() => {
          this.initialize();
        }, 3000);
      } else {
        this.connectionStatus = 'logged_out';
        this.isConnected = false;
      }
    } else if (connection === 'open') {
      this.logger.info('✅ WhatsApp conectado com sucesso!');
      this.isConnected = true;
      this.connectionStatus = 'connected';
      this.qrCode = null;
    } else if (connection === 'connecting') {
      this.connectionStatus = 'connecting';
      this.logger.info('🔄 Conectando ao WhatsApp...');
    }
  }

  async sendBulkMessages(messages) {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    const results = [];
    
    for (const message of messages) {
      try {
        const result = await this.sendMessage(message.number, message.text);
        results.push({
          number: message.number,
          status: 'sent',
          messageId: result.key.id,
          timestamp: new Date().toISOString()
        });
        
        // Delay between messages to avoid rate limiting
        await this.delay(2000);
        
      } catch (error) {
        this.logger.error(`❌ Erro ao enviar mensagem para ${message.number}:`, error);
        results.push({
          number: message.number,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  async sendMessage(number, text) {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      // Format number to WhatsApp format
      const formattedNumber = this.formatNumber(number);
      
      // Validate if number exists on WhatsApp (optional)
      const [result] = await this.sock.onWhatsApp(formattedNumber);
      if (!result?.exists) {
        throw new Error('Número não existe no WhatsApp');
      }

      // Send message
      const sentMessage = await this.sock.sendMessage(result.jid, { text });
      
      this.logger.info(`✅ Mensagem enviada para ${number}`);
      return sentMessage;

    } catch (error) {
      this.logger.error(`❌ Erro ao enviar mensagem para ${number}:`, error);
      throw error;
    }
  }

  formatNumber(number) {
    // Remove special characters and keep only digits
    let cleanNumber = number.replace(/\D/g, '');
    
    // Add country code if not present (Brazil default)
    if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
      cleanNumber = '55' + cleanNumber.substring(1);
    } else if (cleanNumber.length === 10) {
      cleanNumber = '55' + cleanNumber;
    } else if (cleanNumber.length === 11 && !cleanNumber.startsWith('55')) {
      cleanNumber = '55' + cleanNumber;
    }
    
    return cleanNumber + '@s.whatsapp.net';
  }

  async clearAllSessions() {
    try {
      this.logger.info('🗑️  Limpando todas as sessões...');
      
      // Se existir uma conexão ativa, desconecte primeiro
      if (this.sock) {
        await this.disconnect();
      }
      
      // Remove todos os arquivos da pasta sessions
      if (fs.existsSync(this.sessionDir)) {
        const files = fs.readdirSync(this.sessionDir);
        
        for (const file of files) {
          const filePath = `${this.sessionDir}/${file}`;
          try {
            fs.unlinkSync(filePath);
            this.logger.info(`🗑️  Arquivo removido: ${file}`);
          } catch (error) {
            this.logger.error(`❌ Erro ao remover ${file}:`, error.message);
          }
        }
        
        this.logger.info(`✅ ${files.length} arquivos de sessão removidos`);
      }
      
      // Reset internal state
      this.sock = null;
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.qrCode = null;
      
      this.logger.info('✅ Sessões limpas com sucesso');
      
    } catch (error) {
      this.logger.error('❌ Erro ao limpar sessões:', error);
      throw new Error(`Falha ao limpar sessões: ${error.message}`);
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      status: this.connectionStatus,
      qrCode: this.qrCode,
      timestamp: new Date().toISOString()
    };
  }

  async disconnect() {
    if (this.sock) {
      this.logger.info('🔌 Desconectando WhatsApp...');
      await this.sock.logout();
      this.sock = null;
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = WhatsAppService;
