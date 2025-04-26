// Test script for Discord webhook
const fs = require('fs');
const path = require('path');
const https = require('https');

// Try to load the webhook URL from .env.local
let webhookUrl = '';
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const match = envFile.match(/DISCORD_WEBHOOK_URL=(.+)/);
  if (match && match[1]) {
    webhookUrl = match[1].trim();
    console.log('Found webhook URL in .env.local');
  }
} catch (err) {
  console.error('Error reading .env.local file:', err.message);
}

if (!webhookUrl) {
  console.error('No webhook URL found. Please provide it as an argument:');
  console.error('node test-discord-webhook.js WEBHOOK_URL');
  process.exit(1);
}

// Test payload
const testPayload = {
  content: "**TEST MESSAGE**\nThis is a test of the Discord webhook integration.",
  embeds: [
    {
      title: "Test Embed",
      description: "If you can see this, the webhook is working correctly!",
      color: 5814783, // Blue color
      fields: [
        {
          name: "Test Field",
          value: "Test Value",
          inline: true
        }
      ],
      footer: {
        text: "Test Footer"
      }
    }
  ]
};

console.log('Sending test message to Discord webhook...');

// Parse the URL
const webhookUrlObj = new URL(webhookUrl);

// Setup the request options
const options = {
  hostname: webhookUrlObj.hostname,
  port: 443,
  path: webhookUrlObj.pathname + webhookUrlObj.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

// Make the request
const req = https.request(options, (res) => {
  console.log(`Response status code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 204) {
      console.log('✅ SUCCESS: Test message sent to Discord webhook!');
    } else {
      console.log('❌ ERROR: Discord webhook response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR sending request:', error);
});

// Send the payload
req.write(JSON.stringify(testPayload));
req.end();

console.log('Request sent. Waiting for response...'); 