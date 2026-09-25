import { db } from './index.ts';
import { sessions, sessionBookings, tutors, users, financialTransactions } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export async function getSessions(subject?: string, classLevel?: string) {
  try {
    const conditions = [];
    if (subject && subject !== 'all') {
      conditions.push(eq(sessions.subject, subject));
    }
    if (classLevel && classLevel !== 'all') {
      conditions.push(eq(sessions.classLevel, classLevel));
    }

    const query = db
      .select({
        id: sessions.id,
        title: sessions.title,
        subject: sessions.subject,
        tutorId: sessions.tutorId,
        scheduledAt: sessions.scheduledAt,
        durationMinutes: sessions.durationMinutes,
        price: sessions.price,
        sessionType: sessions.sessionType,
        status: sessions.status,
        meetingRoomId: sessions.meetingRoomId,
        hasVideo: sessions.hasVideo,
        hasAudio: sessions.hasAudio,
        classLevel: sessions.classLevel,
        syllabusOverview: sessions.syllabusOverview,
        tutorName: users.fullName,
        tutorAvatar: users.avatar,
        tutorSchool: users.schoolName,
      })
      .from(sessions)
      .innerJoin(tutors, eq(sessions.tutorId, tutors.id))
      .innerJoin(users, eq(tutors.userId, users.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(sessions.scheduledAt));
    }

    return await query.orderBy(desc(sessions.scheduledAt));
  } catch (error) {
    console.error('Database query failed in getSessions:', error);
    throw new Error('Failed to fetch special sessions', { cause: error });
  }
}

export async function checkSessionAccess(sessionId: number, studentId: number) {
  try {
    const booking = await db
      .select()
      .from(sessionBookings)
      .where(
        and(
          eq(sessionBookings.sessionId, sessionId),
          eq(sessionBookings.studentId, studentId),
          eq(sessionBookings.paymentStatus, 'completed')
        )
      )
      .limit(1);

    return {
      hasAccess: booking.length > 0,
      booking: booking[0] || null,
    };
  } catch (error) {
    console.error('Database query failed in checkSessionAccess:', error);
    throw new Error('Failed to verify session access permission', { cause: error });
  }
}

export async function bookAndPaySession(data: {
  sessionId: number;
  studentId: number;
  studentName: string;
  paymentMethod: string; // 'MTN Mobile Money', 'Airtel Money', 'Centenary Bank', 'Card'
  amount: number;
  accountNumberOrPhone: string;
}) {
  try {
    // Fetch session and tutor details
    const sessionRecord = await db
      .select({
        session: sessions,
        tutor: tutors,
        tutorUser: users,
      })
      .from(sessions)
      .innerJoin(tutors, eq(sessions.tutorId, tutors.id))
      .innerJoin(users, eq(tutors.userId, users.id))
      .where(eq(sessions.id, data.sessionId))
      .limit(1);

    if (sessionRecord.length === 0) {
      throw new Error('Requested tutoring session not found');
    }

    const { session, tutorUser } = sessionRecord[0];
    const txnRef = `TXN-${data.paymentMethod.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const accessCode = `ACC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 1. Record booking
    const newBooking = await db
      .insert(sessionBookings)
      .values({
        sessionId: data.sessionId,
        studentId: data.studentId,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'completed',
        transactionRef: txnRef,
        amount: data.amount,
        accessCode,
      })
      .returning();

    // 2. Automated Financial Split & Tax Breakdown
    // Tutor: 75%, Platform/Creator: 20%, Withholding Tax (WHT): 5%
    const gross = data.amount;
    const tutorShare = Math.round(gross * 0.75);
    const creatorPlatformFee = Math.round(gross * 0.20);
    const taxWithheld = gross - tutorShare - creatorPlatformFee; // remaining 5%

    // 3. Connect to Creator Financial Account: 3205303331 (Centenary Bank)
    await db.insert(financialTransactions).values({
      bookingId: newBooking[0].id,
      studentName: data.studentName,
      tutorName: tutorUser.fullName,
      subject: session.subject,
      grossAmount: gross,
      tutorShare,
      creatorPlatformFee,
      taxWithheld,
      paymentGateway: data.paymentMethod,
      targetBankAccount: '3205303331 (Centenary Bank)',
      payoutStatus: 'settled',
      transactionRef: txnRef,
    });

    return {
      booking: newBooking[0],
      transactionRef: txnRef,
      accessCode,
      roomDetails: {
        roomId: session.meetingRoomId,
        hasVideo: session.hasVideo,
        hasAudio: session.hasAudio,
        title: session.title,
        scheduledAt: session.scheduledAt,
      },
    };
  } catch (error) {
    console.error('Database query failed in bookAndPaySession:', error);
    throw new Error('Failed to process payment and book session', { cause: error });
  }
}

export async function createSpecialSession(data: {
  title: string;
  subject: string;
  tutorId: number;
  scheduledAt: Date;
  durationMinutes: number;
  price: number;
  classLevel?: string;
  syllabusOverview?: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
}) {
  try {
    const roomId = `room-${data.subject.toLowerCase().substring(0, 4)}-${Date.now().toString().slice(-4)}`;
    const newSession = await db.insert(sessions).values({
      title: data.title,
      subject: data.subject,
      tutorId: data.tutorId,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes,
      price: data.price,
      classLevel: data.classLevel || 'Senior 4',
      meetingRoomId: roomId,
      hasVideo: data.hasVideo ?? true,
      hasAudio: data.hasAudio ?? true,
      syllabusOverview: data.syllabusOverview,
    }).returning();
    return newSession[0];
  } catch (error) {
    console.error('Database query failed in createSpecialSession:', error);
    throw new Error('Failed to create new special session', { cause: error });
  }
}
