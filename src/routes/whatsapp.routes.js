const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     SingleMessage:
 *       type: object
 *       required:
 *         - number
 *         - message
 *       properties:
 *         number:
 *           type: string
 *           description: Número do telefone (com ou sem código do país)
 *           example: "5511999999999"
 *         message:
 *           type: string
 *           description: Mensagem a ser enviada
 *           example: "Olá! Esta é uma mensagem de teste."
 *       example:
 *         number: "5511999999999"
 *         message: "Olá! Esta é uma mensagem de teste."
 *
 *     BulkMessage:
 *       type: object
 *       required:
 *         - messages
 *       properties:
 *         messages:
 *           type: array
 *           description: Lista de mensagens para envio
 *           items:
 *             type: object
 *             required:
 *               - number
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número do telefone
 *                 example: "5511999999999"
 *               message:
 *                 type: string
 *                 description: Mensagem personalizada (opcional se defaultMessage for fornecida)
 *                 example: "Mensagem personalizada para este número"
 *         defaultMessage:
 *           type: string
 *           description: Mensagem padrão para números sem mensagem personalizada
 *           example: "Esta é a mensagem padrão"
 *       example:
 *         messages:
 *           - number: "5511999999999"
 *             message: "Olá João! Como vai?"
 *           - number: "5511888888888"
 *           - number: "5511777777777"
 *             message: "Mensagem especial para você"
 *         defaultMessage: "Olá! Esta é uma mensagem automática."
 *
 *     WhatsAppStatus:
 *       type: object
 *       properties:
 *         connected:
 *           type: boolean
 *           description: Se o WhatsApp está conectado
 *         status:
 *           type: string
 *           enum: [connected, connecting, disconnected, reconnecting, logged_out]
 *           description: Status atual da conexão
 *         qrCode:
 *           type: string
 *           description: QR Code para autenticação (quando disponível)
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp do status
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         error:
 *           type: string
 *         details:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /api/whatsapp/status:
 *   get:
 *     summary: Obter status da conexão WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Status obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WhatsAppStatus'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/status', whatsappController.getStatus);

/**
 * @swagger
 * /api/whatsapp/send:
 *   post:
 *     summary: Enviar mensagem única
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SingleMessage'
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         messageId:
 *                           type: string
 *                         number:
 *                           type: string
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro ao enviar mensagem
 */
router.post('/send', whatsappController.sendSingleMessage);

/**
 * @swagger
 * /api/whatsapp/send-bulk:
 *   post:
 *     summary: Enviar mensagens em lote
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkMessage'
 *     responses:
 *       200:
 *         description: Lote processado (mesmo com alguns erros)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         statistics:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             sent:
 *                               type: integer
 *                             errors:
 *                               type: integer
 *                         results:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               number:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                                 enum: [sent, error]
 *                               messageId:
 *                                 type: string
 *                               error:
 *                                 type: string
 *                               timestamp:
 *                                 type: string
 *                                 format: date-time
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro ao processar lote
 */
router.post('/send-bulk', whatsappController.sendBulkMessages);

/**
 * @swagger
 * /api/whatsapp/connect:
 *   post:
 *     summary: Inicializar conexão WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Inicialização iniciada
 *       500:
 *         description: Erro ao inicializar
 */
router.post('/connect', whatsappController.initializeConnection);

/**
 * @swagger
 * /api/whatsapp/disconnect:
 *   post:
 *     summary: Desconectar WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Desconectado com sucesso
 *       500:
 *         description: Erro ao desconectar
 */
router.post('/disconnect', whatsappController.disconnect);

/**
 * @swagger
 * /api/whatsapp/reset:
 *   post:
 *     summary: Desconectar e limpar todas as sessões
 *     tags: [WhatsApp]
 *     description: Desconecta o WhatsApp e remove todos os arquivos de sessão para uma reconexão limpa
 *     responses:
 *       200:
 *         description: Sessões limpas e WhatsApp desconectado com sucesso
 *       500:
 *         description: Erro ao limpar sessões
 */
router.post('/reset', whatsappController.resetAndClearSessions);

module.exports = router;
