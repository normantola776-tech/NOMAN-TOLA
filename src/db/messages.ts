import { db } from './index.ts';
import { messages } from './schema.ts';
import { eq, or, and, asc } from 'drizzle-orm';

export async function getConversation(userAId: number, userBId: number) {
  try {
    const list = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userAId), eq(messages.receiverId, userBId)),
          and(eq(messages.senderId, userBId), eq(messages.receiverId, userAId))
        )
      )
      .orderBy(asc(messages.createdAt));

    return list;
  } catch (error) {
    console.error('Database query failed in getConversation:', error);
    throw new Error('Failed to load conversation messages', { cause: error });
  }
}

export async function sendMessage(data: {
  senderId: number;
  receiverId: number;
  senderName: string;
  content: string;
  attachmentUrl?: string;
  isEncrypted?: boolean;
}) {
  try {
    const msg = await db
      .insert(messages)
      .values({
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderName: data.senderName,
        content: data.content,
        attachmentUrl: data.attachmentUrl,
        isEncrypted: data.isEncrypted ?? true,
        isRead: false,
      })
      .returning();

    return msg[0];
  } catch (error) {
    console.error('Database query failed in sendMessage:', error);
    throw new Error('Failed to send encrypted message', { cause: error });
  }
}
