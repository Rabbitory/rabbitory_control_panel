import { initializeAllMonitoring } from '@/utils/RabbitMQ/monitorMetrics';
import { NextResponse } from 'next/server';

let initialized = false;

export async function GET() {
  if (!initialized) {
    await initializeAllMonitoring();
    initialized = true;
  }
  return NextResponse.json({ status: 'initialized' });
}
