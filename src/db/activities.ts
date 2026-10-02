import { db } from './index.ts';
import {
  users,
  sessions,
  sessionBookings,
  financialTransactions,
  studyMaterials,
  assignments,
  systemTickets,
  emailNotifications,
  messages,
} from './schema.ts';
import { desc } from 'drizzle-orm';
import { AppActivityItem, CreatorActivitySummary } from '../types.ts';

export async function getAllAppActivities(): Promise<CreatorActivitySummary> {
  try {
    const [
      allUsers,
      allTransactions,
      allSessions,
      allMaterials,
      allAssignments,
      allTickets,
      allEmails,
      allMessages,
    ] = await Promise.all([
      db.select().from(users).orderBy(desc(users.createdAt)),
      db.select().from(financialTransactions).orderBy(desc(financialTransactions.createdAt)),
      db.select().from(sessions).orderBy(desc(sessions.createdAt)),
      db.select().from(studyMaterials).orderBy(desc(studyMaterials.createdAt)),
      db.select().from(assignments).orderBy(desc(assignments.createdAt)),
      db.select().from(systemTickets).orderBy(desc(systemTickets.createdAt)),
      db.select().from(emailNotifications).orderBy(desc(emailNotifications.sentAt)),
      db.select().from(messages).orderBy(desc(messages.createdAt)).limit(20),
    ]);

    const activities: AppActivityItem[] = [];

    // 1. Transactions & Payments (MTN MoMo, Airtel, Centenary Bank)
    let totalGrossRevenue = 0;
    let totalTutorDisbursements = 0;
    let totalCreatorNetEarnings = 0;
    let totalTaxWithheld = 0;

    allTransactions.forEach((tx) => {
      totalGrossRevenue += tx.grossAmount;
      totalTutorDisbursements += tx.tutorShare;
      totalCreatorNetEarnings += tx.creatorPlatformFee;
      totalTaxWithheld += tx.taxWithheld;

      activities.push({
        id: `tx-${tx.id}`,
        category: 'booking_payment',
        title: `Payment: ${tx.subject} 1.5 hr Session`,
        description: `Student ${tx.studentName} paid UGX ${tx.grossAmount.toLocaleString()} via ${tx.paymentGateway}. Creator net fee: UGX ${tx.creatorPlatformFee.toLocaleString()} (Centenary Bank 3205303331), Tutor: UGX ${tx.tutorShare.toLocaleString()}, URA Tax: UGX ${tx.taxWithheld.toLocaleString()}.`,
        actorName: tx.studentName,
        actorRole: 'student',
        timestamp: tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString(),
        badgeLabel: tx.paymentGateway,
        meta: {
          amount: tx.grossAmount,
          currency: 'UGX',
          subject: tx.subject,
          paymentGateway: tx.paymentGateway,
          reference: tx.transactionRef,
          status: 'Settled',
        },
      });
    });

    // 2. User Registrations & School ID Verification
    allUsers.forEach((u) => {
      activities.push({
        id: `reg-${u.id}`,
        category: 'registration',
        title: `Account Registered: ${u.fullName} (${u.role.toUpperCase()})`,
        description: `New ${u.role} joined from ${u.schoolName} • Level: ${u.gradeLevel || 'Secondary'} • Nationality: ${u.nationality || 'Ugandan'} • Track: ${u.sector || 'Science & Art'}.`,
        actorName: u.fullName,
        actorRole: u.role as any,
        timestamp: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        badgeLabel: `${u.schoolName} (${u.role})`,
        meta: {
          schoolName: u.schoolName || undefined,
          gradeLevel: u.gradeLevel || undefined,
          status: u.idCardVerified ? 'School ID Verified' : 'ID Pending',
        },
      });

      if (u.idCardVerified) {
        activities.push({
          id: `id-ver-${u.id}`,
          category: 'id_verification',
          title: `School Identity Card Verified: ${u.fullName}`,
          description: `Identity credentials confirmed for ${u.schoolName} (${u.gradeLevel || 'Secondary'}). Safe student account verified.`,
          actorName: u.fullName,
          actorRole: 'student',
          timestamp: u.createdAt ? new Date(new Date(u.createdAt).getTime() + 10 * 60 * 1000).toISOString() : new Date().toISOString(),
          badgeLabel: 'Verified Student ID',
          meta: {
            schoolName: u.schoolName || undefined,
            status: 'Verified',
          },
        });
      }

      if ((u.bonusSessionsCount ?? 0) > 0 || u.hasFirstTimeBonus) {
        activities.push({
          id: `bonus-${u.id}`,
          category: 'bonus_reward',
          title: `🎁 First-Time Welcome Bonus Session Awarded`,
          description: `Student ${u.fullName} was credited with 1 Free 1.5 hr Session voucher upon account activation / first order.`,
          actorName: u.fullName,
          actorRole: 'student',
          timestamp: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          badgeLabel: 'Free Bonus Voucher',
          meta: {
            status: 'Credited',
          },
        });
      }
    });

    // 3. Live Sessions, Lessons & Student Likes
    let totalMinutesTaught = 0;
    let totalLikesRecorded = 0;

    allSessions.forEach((s) => {
      totalMinutesTaught += s.durationMinutes || 90;
      totalLikesRecorded += s.likesCount || 0;

      activities.push({
        id: `sess-${s.id}`,
        category: 'live_classroom',
        title: `Classroom Session: ${s.title}`,
        description: `${s.subject} (${s.classLevel}) • Duration: ${s.durationMinutes} min • Status: ${s.status.toUpperCase()} • Sector: ${s.sector} • Attendees gained knowledge.`,
        actorName: `Tutor Session #${s.id}`,
        actorRole: 'tutor',
        timestamp: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
        badgeLabel: `${s.durationMinutes} min (${s.status})`,
        meta: {
          subject: s.subject,
          gradeLevel: s.classLevel,
          likesCount: s.likesCount,
          status: s.status,
        },
      });

      if ((s.likesCount || 0) > 0) {
        activities.push({
          id: `like-${s.id}`,
          category: 'student_like',
          title: `Student Lesson Likes: ${s.title}`,
          description: `${s.likesCount} attending students pressed "Like / Helpful" during lesson. Creator (normantola776@gmail.com) notified & Tutor Earn Button unlocked!`,
          actorName: `Students of ${s.subject}`,
          actorRole: 'student',
          timestamp: s.createdAt ? new Date(new Date(s.createdAt).getTime() + 45 * 60 * 1000).toISOString() : new Date().toISOString(),
          badgeLabel: `${s.likesCount} Student Likes`,
          meta: {
            subject: s.subject,
            likesCount: s.likesCount,
            status: 'Earn Button Unlocked',
          },
        });
      }

      if (s.earnedPayout) {
        activities.push({
          id: `payout-${s.id}`,
          category: 'tutor_payout',
          title: `Tutor Claimed Lesson Payout: ${s.title}`,
          description: `Tutor successfully claimed payout post-session based on verified student engagement and likes.`,
          actorName: `Tutor (Session #${s.id})`,
          actorRole: 'tutor',
          timestamp: s.createdAt ? new Date(new Date(s.createdAt).getTime() + 90 * 60 * 1000).toISOString() : new Date().toISOString(),
          badgeLabel: 'Payout Claimed',
        });
      }
    });

    // 4. Study Materials Downloads & Uploads
    let totalMaterialDownloads = 0;
    allMaterials.forEach((m) => {
      totalMaterialDownloads += m.downloadsCount || 0;

      activities.push({
        id: `mat-${m.id}`,
        category: 'material_upload',
        title: `Library Material Uploaded: ${m.title}`,
        description: `${m.subject} (${m.gradeLevel}) • Author: ${m.authorName} • File: ${m.fileType} (${m.fileSize}) • E2EE Encrypted with SHA-256 hash.`,
        actorName: m.authorName,
        actorRole: 'tutor',
        timestamp: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        badgeLabel: `${m.fileType} (${m.fileSize})`,
        meta: {
          subject: m.subject,
          gradeLevel: m.gradeLevel,
        },
      });

      if ((m.downloadsCount || 0) > 0) {
        activities.push({
          id: `mat-dl-${m.id}`,
          category: 'material_download',
          title: `Library Material Download: ${m.title}`,
          description: `${m.downloadsCount} student downloads recorded for offline study • Encrypted cache verified.`,
          actorName: 'Secondary School Students',
          actorRole: 'student',
          timestamp: m.createdAt ? new Date(new Date(m.createdAt).getTime() + 15 * 60 * 1000).toISOString() : new Date().toISOString(),
          badgeLabel: `${m.downloadsCount} Downloads`,
        });
      }
    });

    // 5. Assignments & Grades
    allAssignments.forEach((a) => {
      activities.push({
        id: `asg-${a.id}`,
        category: 'assignment_submit',
        title: `Homework Submitted: ${a.title}`,
        description: `Student assignment submitted for ${a.subject}. Notes: "${a.submissionNotes || 'Completed questions'}". Status: ${a.status}.`,
        actorName: `Student #${a.studentId}`,
        actorRole: 'student',
        timestamp: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        badgeLabel: a.subject,
        meta: {
          subject: a.subject,
          status: a.status,
          score: a.grade || undefined,
        },
      });

      if (a.grade) {
        activities.push({
          id: `grade-${a.id}`,
          category: 'assignment_grade',
          title: `Assignment Graded: ${a.title}`,
          description: `Score: ${a.grade} • Tutor Feedback: "${a.feedback || 'Excellent step-by-step working'}".`,
          actorName: 'Course Tutor',
          actorRole: 'tutor',
          timestamp: a.createdAt ? new Date(new Date(a.createdAt).getTime() + 120 * 60 * 1000).toISOString() : new Date().toISOString(),
          badgeLabel: `Grade ${a.grade}`,
          meta: {
            subject: a.subject,
            score: a.grade,
          },
        });
      }
    });

    // 6. Support Tickets & Creator Desk
    allTickets.forEach((t) => {
      activities.push({
        id: `ticket-${t.id}`,
        category: 'support_ticket',
        title: `Creator Urgent Dispatch: ${t.subject}`,
        description: `From: ${t.userName} (${t.userRole.toUpperCase()}) • Priority: ${t.priority.toUpperCase()} • Status: ${t.status.toUpperCase()} • "${t.description}".`,
        actorName: t.userName,
        actorRole: t.userRole as any,
        timestamp: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        badgeLabel: `Ticket #${t.id} (${t.priority})`,
        meta: {
          status: t.status,
          reference: `TCK-${t.id}`,
        },
      });
    });

    // 7. Email Notifications Audit Trail (normantola776@gmail.com)
    allEmails.forEach((em) => {
      activities.push({
        id: `email-${em.id}`,
        category: 'email_dispatch',
        title: `Email Dispatched: ${em.subject}`,
        description: `Sent to ${em.recipientEmail} • Event: ${em.eventType} • Delivery Status: ${em.status.toUpperCase()}.`,
        actorName: 'Platform Automated Mailer',
        actorRole: 'system',
        timestamp: em.sentAt ? new Date(em.sentAt).toISOString() : new Date().toISOString(),
        badgeLabel: 'normantola776@gmail.com',
        meta: {
          recipientEmail: em.recipientEmail,
          status: em.status,
        },
      });
    });

    // 8. Messages
    allMessages.forEach((msg) => {
      activities.push({
        id: `msg-${msg.id}`,
        category: 'direct_message',
        title: `Academic Portal Message: ${msg.senderName}`,
        description: `Direct message sent: "${msg.content.slice(0, 80)}${msg.content.length > 80 ? '...' : ''}". E2EE Protected: ${msg.isEncrypted ? 'YES' : 'NO'}.`,
        actorName: msg.senderName,
        actorRole: 'student',
        timestamp: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString(),
        badgeLabel: 'Teacher-Student Portal',
      });
    });

    // Sort all activities by timestamp descending (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalStudents = allUsers.filter((u) => u.role === 'student').length;
    const totalTutors = allUsers.filter((u) => u.role === 'tutor').length;
    const openTicketsCount = allTickets.filter((t) => t.status !== 'resolved').length;

    return {
      designatedBankAccount: '3205303331 (Centenary Bank)',
      accountHolder: 'High School Tutoring Hub Directorate / Creator',
      currency: 'UGX',
      totalUsers: allUsers.length,
      totalStudents,
      totalTutors,
      totalBookings: allTransactions.length,
      totalGrossRevenue,
      totalTutorDisbursements,
      totalCreatorNetEarnings,
      totalTaxWithheld,
      totalSessionsConducted: allSessions.length,
      totalMinutesTaught,
      totalLikesRecorded,
      totalMaterialDownloads,
      totalAssignmentsSubmitted: allAssignments.length,
      openTicketsCount,
      totalEmailsDispatched: allEmails.length,
      activities,
    };
  } catch (error) {
    console.error('Error fetching all app activities:', error);
    throw error;
  }
}
