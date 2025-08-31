const Joi = require('joi');

const phoneNumberSchema = Joi.string()
  .pattern(/^\+?[\d\s\-\(\)]+$/)
  .min(10)
  .max(15)
  .required()
  .messages({
    'string.pattern.base': 'Número de telefone deve conter apenas dígitos, espaços, parênteses e hífens',
    'string.min': 'Número de telefone deve ter pelo menos 10 dígitos',
    'string.max': 'Número de telefone deve ter no máximo 15 dígitos',
    'any.required': 'Número de telefone é obrigatório'
  });

const messageSchema = Joi.string()
  .min(1)
  .max(4096)
  .required()
  .messages({
    'string.min': 'Mensagem não pode estar vazia',
    'string.max': 'Mensagem deve ter no máximo 4096 caracteres',
    'any.required': 'Mensagem é obrigatória'
  });

const singleMessageSchema = Joi.object({
  number: phoneNumberSchema,
  message: messageSchema
});

const bulkMessageSchema = Joi.object({
  messages: Joi.array()
    .items(
      Joi.object({
        number: phoneNumberSchema,
        message: Joi.string()
          .min(1)
          .max(4096)
          .optional()
          .messages({
            'string.min': 'Mensagem personalizada não pode estar vazia',
            'string.max': 'Mensagem personalizada deve ter no máximo 4096 caracteres'
          })
      })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'Deve haver pelo menos 1 mensagem para enviar',
      'array.max': 'Máximo de 100 mensagens por lote',
      'any.required': 'Lista de mensagens é obrigatória'
    }),
  
  defaultMessage: Joi.string()
    .min(1)
    .max(4096)
    .optional()
    .messages({
      'string.min': 'Mensagem padrão não pode estar vazia',
      'string.max': 'Mensagem padrão deve ter no máximo 4096 caracteres'
    })
}).custom((value, helpers) => {
  const { messages, defaultMessage } = value;
  
  // Check if all messages have individual message or if there's a default message
  const hasAllIndividualMessages = messages.every(msg => msg.message);
  
  if (!hasAllIndividualMessages && !defaultMessage) {
    return helpers.error('custom.missingMessage');
  }
  
  return value;
}).messages({
  'custom.missingMessage': 'Deve haver uma mensagem padrão ou todas as mensagens devem ter texto individual'
});

const validateSingleMessage = (data) => {
  return singleMessageSchema.validate(data, { abortEarly: false });
};

const validateBulkMessage = (data) => {
  return bulkMessageSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateSingleMessage,
  validateBulkMessage,
  phoneNumberSchema,
  messageSchema
};
