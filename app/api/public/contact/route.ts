import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/schema';
import { createRateLimiter } from '@/lib/rate-limit';

// Rate limiter: 3 submissions per minute per IP
const limiter = createRateLimiter('contact', { max: 3, windowMs: 60_000 });

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const limited = limiter.check(request);
  if (limited) return limited;

  try {
    const body = (await request.json()) as ContactPayload;

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, message' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert contact submission
    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for contacting us. We will respond within 24-48 hours.',
        submission_id: submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
