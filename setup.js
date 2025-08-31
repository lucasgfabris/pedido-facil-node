#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🤖 WhatsApp Bulk Sender - Script de Configuração\n');

// Verificar se o Node.js tem versão adequada
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0]);

if (major < 16) {
  console.error('❌ Erro: Node.js 16+ é necessário. Versão atual:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js versão adequada:', nodeVersion);

// Verificar se as dependências estão instaladas
if (!fs.existsSync('node_modules')) {
  console.log('📦 Instalando dependências...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependências já instaladas');
}

// Criar arquivo .env se não existir
if (!fs.existsSync('.env')) {
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ Arquivo .env criado a partir do exemplo');
  } else {
    console.log('⚠️  Aviso: arquivo env.example não encontrado');
  }
} else {
  console.log('✅ Arquivo .env já existe');
}

// Criar diretório de sessões se não existir
const sessionsDir = './sessions';
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
  console.log('✅ Diretório de sessões criado');
} else {
  console.log('✅ Diretório de sessões já existe');
}

console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. npm run dev                  # Iniciar servidor em desenvolvimento');
console.log('2. Acesse http://localhost:3000/api-docs');
console.log('3. Execute POST /api/whatsapp/connect');
console.log('4. Escaneie o QR Code no console');
console.log('5. Teste com POST /api/whatsapp/send\n');

console.log('📖 Documentação: README.md');
console.log('📱 Collection Postman: WhatsApp_Bulk_Sender_API.postman_collection.json');
console.log('🌐 Swagger: http://localhost:3000/api-docs\n');

console.log('✨ Pronto para usar! Boa sorte!');
