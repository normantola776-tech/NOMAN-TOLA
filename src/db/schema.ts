import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users Table (Students, Tutors, Creator)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('student'), // 'student', 'tutor', 'creator'
  gradeLevel: text('grade_level').default('Senior 4 (Grade 10)'),
  schoolName: text('school_name').default('High School'),
  idCardVerified: boolean('id_card_verified').default(false),
  idCardPhotoUrl: text('id_card_photo_url'),
  bio: text('bio'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Tutors Profile
export const tutors = pgTable('tutors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  subjects: text('subjects').notNull(), // Comma-delimited list e.g. "Mathematics, Physics, Chemistry"
  academicExpertise: text('academic_expertise').notNull(), // e.g. "Pure Math & Mechanics, Olympiad Coach"
  hourlyRate: integer('hourly_rate').notNull().default(25000), // UGX / local currency unit
  rating: integer('rating').notNull().default(48), // e.g. 48 = 4.8 / 5.0
  reviewsCount: integer('reviews_count').notNull().default(0),
  availableDays: text('available_days').default('Mon, Wed, Fri, Sat'),
  isVerified: boolean('is_verified').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Tutor Reviews
export const tutorReviews = pgTable('tutor_reviews', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').references(() => tutors.id).notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  studentName: text('student_name').notNull(),
  rating: integer('rating').notNull(), // 1 - 5
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Tutoring & Special Study Sessions (Live Video/Audio Room)
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  tutorId: integer('tutor_id').references(() => tutors.id).notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  price: integer('price').notNull().default(15000),
  sessionType: text('session_type').notNull().default('special_session'), // 'special_session', 'one_on_one', 'workshop'
  status: text('status').notNull().default('upcoming'), // 'upcoming', 'live', 'completed', 'cancelled'
  meetingRoomId: text('meeting_room_id').notNull(),
  hasVideo: boolean('has_video').default(true),
  hasAudio: boolean('has_audio').default(true),
  classLevel: text('class_level').notNull().default('Senior 4'), // 'Senior 1', 'Senior 2', 'Senior 3', 'Senior 4'
  syllabusOverview: text('syllabus_overview'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Session Bookings (Payments via MTN, Airtel, Centenary Bank)
export const sessionBookings = pgTable('session_bookings', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => sessions.id).notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  paymentMethod: text('payment_method').notNull(), // 'MTN Mobile Money', 'Airtel Money', 'Centenary Bank', 'Card'
  paymentStatus: text('payment_status').notNull().default('completed'), // 'completed', 'pending'
  transactionRef: text('transaction_ref').notNull(),
  amount: integer('amount').notNull(),
  accessCode: text('access_code').notNull(),
  paidAt: timestamp('paid_at').defaultNow(),
});

// 6. Study Resources (PDFs, Notes, E2EE Encrypted Materials, Offline Cachable)
export const studyMaterials = pgTable('study_materials', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  gradeLevel: text('grade_level').notNull(),
  authorName: text('author_name').notNull(),
  fileType: text('file_type').notNull().default('PDF'),
  fileSize: text('file_size').notNull().default('2.4 MB'),
  downloadUrl: text('download_url').notNull(),
  contentSummary: text('content_summary').notNull(),
  isEncrypted: boolean('is_encrypted').default(true),
  encryptionHash: text('encryption_hash'),
  offlineAvailable: boolean('offline_available').default(true),
  downloadsCount: integer('downloads_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Real-time Messages & Secure Portal
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  senderName: text('sender_name').notNull(),
  content: text('content').notNull(),
  isEncrypted: boolean('is_encrypted').default(true),
  attachmentUrl: text('attachment_url'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Classroom Assignments & Academic Progress
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  tutorId: integer('tutor_id').references(() => tutors.id),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'submitted', 'graded'
  grade: text('grade'), // e.g. "94%", "A+"
  feedback: text('feedback'),
  submissionNotes: text('submission_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Confidential Creator Financial Transactions & Bank Account 3205303331 (Centenary Bank)
export const financialTransactions = pgTable('financial_transactions', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id'),
  studentName: text('student_name').notNull(),
  tutorName: text('tutor_name').notNull(),
  subject: text('subject').notNull(),
  grossAmount: integer('gross_amount').notNull(),
  tutorShare: integer('tutor_share').notNull(),
  creatorPlatformFee: integer('creator_platform_fee').notNull(),
  taxWithheld: integer('tax_withheld').notNull(), // Automated tax calculation
  paymentGateway: text('payment_gateway').notNull(), // 'MTN Mobile Money', 'Airtel Money', 'Centenary Bank'
  targetBankAccount: text('target_bank_account').notNull().default('3205303331 (Centenary Bank)'),
  payoutStatus: text('payout_status').notNull().default('settled'),
  transactionRef: text('transaction_ref').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Urgent Creator Dispatch / System Error Tickets
export const systemTickets = pgTable('system_tickets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  category: text('category').notNull(), // 'system_error', 'urgent_question', 'payment_dispute', 'session_link'
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull().default('urgent'), // 'urgent', 'high', 'medium'
  status: text('status').notNull().default('open'), // 'open', 'in_progress', 'resolved'
  creatorNotes: text('creator_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  tutorProfile: one(tutors, {
    fields: [users.id],
    references: [tutors.userId],
  }),
  bookings: many(sessionBookings),
  assignments: many(assignments),
  tickets: many(systemTickets),
}));

export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  user: one(users, {
    fields: [tutors.userId],
    references: [users.id],
  }),
  sessions: many(sessions),
  reviews: many(tutorReviews),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  tutor: one(tutors, {
    fields: [sessions.tutorId],
    references: [tutors.id],
  }),
  bookings: many(sessionBookings),
}));
