import { db } from './index.ts';
import { systemTickets } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export async function createSystemTicket(data: {
  userId: number;
  userName: string;
  userRole: string;
  category: string;
  subject: string;
  description: string;
  priority?: string;
}) {
  try {
    const ticket = await db
      .insert(systemTickets)
      .values({
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority || 'urgent',
        status: 'open',
      })
      .returning();

    return ticket[0];
  } catch (error) {
    console.error('Database query failed in createSystemTicket:', error);
    throw new Error('Failed to dispatch urgent question to creator', { cause: error });
  }
}

export async function getSystemTickets() {
  try {
    return await db.select().from(systemTickets).orderBy(desc(systemTickets.createdAt));
  } catch (error) {
    console.error('Database query failed in getSystemTickets:', error);
    throw new Error('Failed to fetch creator system tickets', { cause: error });
  }
}

export async function updateTicketStatus(ticketId: number, status: string, notes?: string) {
  try {
    const updated = await db
      .update(systemTickets)
      .set({
        status,
        ...(notes ? { creatorNotes: notes } : {}),
      })
      .where(eq(systemTickets.id, ticketId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateTicketStatus:', error);
    throw new Error('Failed to update ticket status', { cause: error });
  }
}
