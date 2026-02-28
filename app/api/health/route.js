import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - start;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: 'connected', latencyMs: dbLatency },
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: 'disconnected', error: error.message },
        },
      },
      { status: 503 }
    );
  }
}
