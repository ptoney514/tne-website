import Anthropic from '@anthropic-ai/sdk';

// Validation constants
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES_COUNT = 20;

// TNE United Express context for the AI assistant
const SYSTEM_PROMPT = `You are a friendly and helpful AI assistant for TNE United Express, a premier youth basketball program in Omaha, Nebraska. You help parents, players, and community members with questions about the program.

## About TNE United Express
- Founded in 2012, with 13+ years of developing young basketball players
- Serves ages 8-18 (3rd grade through high school)
- Located in Omaha, Nebraska
- 60%+ of players come from underserved communities
- 37+ alumni have gone on to play Division 1 college basketball
- Over 150 players developed through the program

## Leadership
- Alvin Mitchell - Executive Director (amitch2am@gmail.com, 402-510-4919)
- Tyler Moseman - Director of Basketball Operations

## Program Structure
- **TNE Prep** - High school level elite training
- **Elite Teams** - Competitive travel teams (7th-8th grade)
- **Development Teams** - Building fundamentals (3rd-6th grade)

## Key Information
- **Tryouts**: Contact the program for current tryout dates
- **Registration fees**: Various tiers from $25 tryout fee to full season registration
- **Practice locations**: Contact program for current locations
- **Tournament schedule**: Teams compete in regional and national tournaments

## Contact Information
- Email: amitch2am@gmail.com
- Phone: (402) 510-4919
- Location: Omaha, Nebraska

## Response Guidelines
1. Be warm, welcoming, and enthusiastic about the program
2. Keep responses concise but helpful (2-3 paragraphs max)
3. For specific schedule questions, direct users to check the website or contact the program
4. For registration/payment questions, mention the Payments page or suggest contacting Alvin directly
5. If you don't know specific details, encourage them to contact the program directly
6. Never make up specific dates, times, or prices - suggest they check the website or contact the program
7. Emphasize the program's values: player development, community, and excellence`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');
    return res.status(500).json({
      error: 'Chat service is not configured',
      message: "I'm sorry, the chat service is currently unavailable. Please contact us directly at amitch2am@gmail.com or (402) 510-4919."
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Validate message count (prevent conversation abuse)
    if (messages.length > MAX_MESSAGES_COUNT) {
      return res.status(400).json({
        error: 'Too many messages',
        message: 'Conversation is too long. Please start a new chat.',
      });
    }

    // Validate individual message lengths
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== 'string') {
        return res.status(400).json({ error: 'Invalid message format' });
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
          error: 'Message too long',
          message: `Messages must be ${MAX_MESSAGE_LENGTH} characters or less.`,
        });
      }
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey,
    });

    // Create message with Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Extract text content from response
    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return res.status(200).json({ message: content });
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle rate limiting
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limited',
        message: "We're experiencing high demand. Please try again in a moment.",
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: 'Internal server error',
      message: "I'm having trouble processing your request. Please try again or contact us directly at amitch2am@gmail.com.",
    });
  }
}
