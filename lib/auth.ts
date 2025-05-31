import { prisma } from './prisma';

export async function verifyApiKey(apiKey: string): Promise<{ isValid: boolean, plan?: string }> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        apiKey,
        status: 'active',
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        plan: true,
      }
    });

    if (subscription) {
      return { isValid: true, plan: subscription.plan };
    } else {
      return { isValid: false };
    }
  } catch (error) {
    console.error('Error verifying API key:', error);
    return { isValid: false };
  }
} 