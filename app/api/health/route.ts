import { NextResponse } from 'next/server';

export async function GET() {
  const apiKeySet = !!process.env.GEMINI_API_KEY;
  const nodeEnv = process.env.NODE_ENV;
  
  return NextResponse.json({
    status: 'ok',
    apiKeyConfigured: apiKeySet,
    nodeEnv,
    timestamp: new Date().toISOString(),
  });
}
