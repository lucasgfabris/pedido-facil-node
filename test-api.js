#!/usr/bin/env node

/**
 * Script para testar a API do WhatsApp na VPS
 * Use: node test-api.js
 */

const axios = require('axios');

// Configurações
const API_BASE = 'http://72.60.54.168:3001';
const FRONTEND_ORIGIN = 'https://seu-frontend.vercel.app'; // Substitua pela URL real

async function testAPI() {
  console.log('🧪 Iniciando testes da API WhatsApp...\n');

  // Teste 1: Health Check
  try {
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health OK:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health falhou:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 2: CORS Test
  try {
    console.log('2️⃣ Testando CORS...');
    const corsResponse = await axios.get(`${API_BASE}/api/test-cors`, {
      headers: {
        'Origin': FRONTEND_ORIGIN
      }
    });
    console.log('✅ CORS OK:', corsResponse.data);
  } catch (error) {
    console.log('❌ CORS falhou:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 3: WhatsApp Status
  try {
    console.log('3️⃣ Testando Status do WhatsApp...');
    const statusResponse = await axios.get(`${API_BASE}/api/whatsapp/status`, {
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Status OK:', statusResponse.data);
  } catch (error) {
    console.log('❌ Status falhou:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 4: WhatsApp Connect (O que está falhando)
  try {
    console.log('4️⃣ Testando WhatsApp Connect...');
    const connectResponse = await axios.post(`${API_BASE}/api/whatsapp/connect`, {}, {
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Connect OK:', connectResponse.data);
  } catch (error) {
    console.log('❌ Connect falhou:', error.response?.data || error.message);
    console.log('🔍 Status Code:', error.response?.status);
    console.log('🔍 Headers:', error.response?.headers);
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🏁 Testes concluídos!');
}

// Executar testes
testAPI().catch(console.error);
