import { db } from './index.ts';
import { sessions, sessionBookings, tutors, users, financialTransactions, emailNotifications } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export async function getSessions(subject?: string, classLevel?: string) {
  try {
    const conditions = [];
    if (subject && subject !== 'all' && subject !== 'All') {
      conditions.push(eq(sessions.subject, subject));
    }
    if (classLevel && classLevel !== 'all' && classLevel !== 'All') {
      conditions.push(eq(sessions.classLevel, classLevel));
    }

    const query = db
      .select({
        id: sessions.id,
        title: sessions.title,
        subject: sessions.subject,
        sector: sessions.sector,
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
        likesCount: sessions.likesCount,
        earnedPayout: sessions.earnedPayout,
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
    return [];
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
    return { hasAccess: false, booking: null };
  }
}

export async function bookAndPaySession(data: {
  sessionId: number;
  studentId: number;
  studentName: string;
  paymentMethod: string;
  amount: number;
  accountNumberOrPhone?: string;
  payerPhone?: string;
  useBonusSession?: boolean;
}) {
  try {
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

    // Check student booking history for first-order bonus
    const studentPriorBookings = await db
      .select({ id: sessionBookings.id })
      .from(sessionBookings)
      .where(eq(sessionBookings.studentId, data.studentId));

    const isFirstOrder = studentPriorBookings.length === 0;
    const isBonusUsed = !!data.useBonusSession;
    const finalAmount = isBonusUsed ? 0 : data.amount;

    // 1. Record booking
    const newBooking = await db
      .insert(sessionBookings)
      .values({
        sessionId: data.sessionId,
        studentId: data.studentId,
        paymentMethod: isBonusUsed ? 'First-Time Bonus Voucher' : data.paymentMethod,
        paymentStatus: 'completed',
        transactionRef: txnRef,
        amount: finalAmount,
        accessCode,
        isBonusUsed,
        firstOrderBonusGranted: isFirstOrder,
      })
      .returning();

    // 2. Grant first-time order bonus session
    if (isFirstOrder) {
      await db
        .update(users)
        .set({
          hasFirstTimeBonus: true,
          bonusSessionsCount: 1,
          ordersCount: 1,
        })
        .where(eq(users.id, data.studentId));
    } else if (isBonusUsed) {
      const studentRow = await db.select().from(users).where(eq(users.id, data.studentId)).limit(1);
      const currentCount = studentRow[0]?.bonusSessionsCount || 1;
      await db
        .update(users)
        .set({ bonusSessionsCount: Math.max(0, currentCount - 1) })
        .where(eq(users.id, data.studentId));
    }

    // 3. Automated Financial Split & Tax Breakdown
    const gross = finalAmount;
    const tutorShare = Math.round(gross * 0.75);
    const creatorPlatformFee = Math.round(gross * 0.20);
    const taxWithheld = gross - tutorShare - creatorPlatformFee;

    // 4. Record to Centenary Bank ledger if paid
    if (gross > 0) {
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
    }

    // 5. Send Notification to creator email (normantola776@gmail.com)
    await db.insert(emailNotifications).values({
      recipientEmail: 'normantola776@gmail.com',
      subject: `[Edura High] New Session Order: ${session.title} (UGX ${finalAmount.toLocaleString()})`,
      body: `New session order registered.\n\nStudent: ${data.studentName}\nSession: ${session.title}\nSector: ${session.sector || 'Science'} (UGX ${session.price.toLocaleString()} per 1 1/2 hr)\nMethod: ${data.paymentMethod}\nAmount: UGX ${finalAmount.toLocaleString()}\nAccess Pass: ${accessCode}\nFirst-Order Bonus Granted: ${isFirstOrder ? 'Yes (1 Free Bonus Session)' : 'No'}\nTransaction Ref: ${txnRef}`,
      eventType: 'session_booking',
      status: 'delivered',
    });

    return {
      booking: newBooking[0],
      transactionRef: txnRef,
      accessCode,
      firstOrderBonusGranted: isFirstOrder,
      isBonusUsed,
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

export async function claimTutorEarnings(data: {
  sessionId: number;
  tutorId: number;
  tutorName: string;
  amount: number;
  subject: string;
  sector?: string;
  likesCount: number;
}) {
  try {
    if (data.likesCount <= 0) {
      throw new Error('The Earn button is locked: Student like required before claiming payout');
    }

    await db
      .update(sessions)
      .set({ earnedPayout: true })
      .where(eq(sessions.id, data.sessionId));

    // Update tutor time spent (+90 mins = 1.5 hr)
    const tutorRow = await db.select().from(tutors).where(eq(tutors.id, data.tutorId)).limit(1);
    if (tutorRow.length > 0) {
      const currentMinutes = tutorRow[0].totalTimeSpentMinutes || 0;
      await db
        .update(tutors)
        .set({ totalTimeSpentMinutes: currentMinutes + 90 })
        .where(eq(tutors.id, data.tutorId));
    }

    // Email notification to normantola776@gmail.com
    await db.insert(emailNotifications).values({
      recipientEmail: 'normantola776@gmail.com',
      subject: `[Edura High] Tutor Payout Claimed: UGX ${data.amount.toLocaleString()} - ${data.tutorName}`,
      body: `Tutor ${data.tutorName} has claimed payout for session ID ${data.sessionId} (${data.subject}).\n\nVerified by ${data.likesCount} student like(s).\nAmount: UGX ${data.amount.toLocaleString()}.\nDispatched to Mobile Money / Centenary Bank account 3205303331.`,
      eventType: 'tutor_payout',
      status: 'delivered',
    });

    return { success: true, amount: data.amount, earnedPayout: true };
  } catch (error) {
    console.error('Error in claimTutorEarnings:', error);
    throw new Error('Failed to claim tutor earnings', { cause: error });
  }
}

export async function recordSessionLike(sessionId: number, studentName?: string) {
  try {
    const sessionRow = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
    if (sessionRow.length === 0) return { likesCount: 1 };

    const newLikes = (sessionRow[0].likesCount || 0) + 1;
    await db
      .update(sessions)
      .set({ likesCount: newLikes })
      .where(eq(sessions.id, sessionId));

    await db.insert(emailNotifications).values({
      recipientEmail: 'normantola776@gmail.com',
      subject: `[Edura High] Student Liked Session: ${sessionRow[0].title}`,
      body: `A student (${studentName || 'Student'}) pressed the like button confirming the session was helpful.\nSession: "${sessionRow[0].title}".\nTotal Likes: ${newLikes}.\nThe tutor's Earn button is now ACTIVE.`,
      eventType: 'student_like',
      status: 'delivered',
    });

    return { likesCount: newLikes };
  } catch (error) {
    console.error('Error in recordSessionLike:', error);
    return { likesCount: 1 };
  }
}

export async function createSpecialSession(data: {
  title: string;
  subject: string;
  sector?: 'Science' | 'Art';
  tutorId: number;
  scheduledAt: Date;
  durationMinutes?: number;
  price?: number;
  classLevel?: string;
  syllabusOverview?: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
}) {
  try {
    const roomId = `room-${data.subject.toLowerCase().substring(0, 4)}-${Date.now().toString().slice(-4)}`;
    const isSci = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Computer Science', 'Agriculture'].includes(data.subject);
    const resolvedSector = data.sector || (isSci ? 'Science' : 'Art');
    const resolvedPrice = data.price || (resolvedSector === 'Science' ? 10000 : 8000);

    const newSession = await db
      .insert(sessions)
      .values({
        title: data.title,
        subject: data.subject,
        sector: resolvedSector,
        tutorId: data.tutorId,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes || 90, // Standard 90 min (1 1/2 hr)
        price: resolvedPrice,
        classLevel: data.classLevel || 'Senior 4',
        meetingRoomId: roomId,
        hasVideo: data.hasVideo ?? true,
        hasAudio: data.hasAudio ?? true,
        syllabusOverview: data.syllabusOverview,
        likesCount: 0,
        earnedPayout: false,
      })
      .returning();
    return newSession[0];
  } catch (error) {
    console.error('Database query failed in createSpecialSession:', error);
    throw new Error('Failed to create new special session', { cause: error });
  }
}
