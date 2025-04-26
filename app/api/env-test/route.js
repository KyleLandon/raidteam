import { NextResponse } from 'next/server';

export async function GET() {
  // List all environment variables (but hide sensitive values)
  const envVars = Object.keys(process.env).reduce((acc, key) => {
    // Redact sensitive values but show that they exist
    const value = key.includes('URL') || key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN')
      ? '[REDACTED]'
      : process.env[key];
    
    acc[key] = value;
    return acc;
  }, {});
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    discordWebhookConfigured: !!process.env.DISCORD_WEBHOOK_URL,
    firstCharsOfWebhook: process.env.DISCORD_WEBHOOK_URL 
      ? `${process.env.DISCORD_WEBHOOK_URL.substring(0, 20)}...` 
      : 'Not configured',
    envVarCount: Object.keys(process.env).length,
    envVars
  });
} 