export type UserRole = 'student' | 'tutor' | 'creator';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  gradeLevel: string;
  schoolName: string;
  nationality?: string;
  sector?: 'Science' | 'Art' | 'Both';
  bonusSessionsCount?: number;
  hasFirstTimeBonus?: boolean;
  ordersCount?: number;
  idCardVerified: boolean;
  idCardPhotoUrl?: string;
  bio?: string;
  avatar?: string;
}

export interface TutorReview {
  id: number;
  tutorId: number;
  studentId: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  durationMinutes: number; // 90 min (1 1/2 hr)
  subject: string;
  classLevel: string;
  sector: 'Science' | 'Art';
  lessonTopic: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface Tutor {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  subjects: string;
  academicExpertise: string;
  hourlyRate: number;
  rating: number; // 48 = 4.8
  reviewsCount: number;
  availableDays: string;
  nationality?: string;
  sector?: 'Science' | 'Art' | 'Both';
  timetable?: string; // JSON serialized TimetableSlot[]
  totalTimeSpentMinutes?: number;
  isVerified: boolean;
  schoolName: string;
  bio?: string;
  avatar?: string;
  idCardVerified: boolean;
  reviews?: TutorReview[];
}

export interface TutoringSession {
  id: number;
  title: string;
  subject: string;
  sector?: 'Science' | 'Art';
  tutorId: number;
  tutorName?: string;
  tutorAvatar?: string;
  tutorSchool?: string;
  scheduledAt: string;
  durationMinutes: number; // 90 mins = 1 1/2 hr
  price: number; // UGX 10,000 for science, 8,000 for arts (per 1 1/2 hr)
  sessionType: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  meetingRoomId: string;
  hasVideo: boolean;
  hasAudio: boolean;
  classLevel?: string;
  syllabusOverview?: string;
  likesCount?: number;
  earnedPayout?: boolean;
}

export interface SessionBooking {
  id: number;
  sessionId: number;
  studentId: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionRef: string;
  amount: number;
  accessCode: string;
  isBonusUsed?: boolean;
  firstOrderBonusGranted?: boolean;
  paidAt: string;
}

export interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  authorName: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  contentSummary: string;
  isEncrypted: boolean;
  encryptionHash?: string;
  offlineAvailable: boolean;
  downloadsCount: number;
  isDownloadedLocally?: boolean;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  content: string;
  isEncrypted: boolean;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Assignment {
  id: number;
  studentId: number;
  tutorId?: number;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  feedback?: string;
  submissionNotes?: string;
}

export interface FinancialTransaction {
  id: number;
  bookingId?: number;
  studentName: string;
  tutorName: string;
  subject: string;
  grossAmount: number;
  tutorShare: number;
  creatorPlatformFee: number;
  taxWithheld: number;
  paymentGateway: string;
  targetBankAccount: string;
  payoutStatus: string;
  transactionRef: string;
  createdAt: string;
}

export type ActivityCategory =
  | 'registration'
  | 'id_verification'
  | 'booking_payment'
  | 'bonus_reward'
  | 'live_classroom'
  | 'student_like'
  | 'tutor_payout'
  | 'material_download'
  | 'material_upload'
  | 'assignment_submit'
  | 'assignment_grade'
  | 'direct_message'
  | 'support_ticket'
  | 'email_dispatch';

export interface AppActivityItem {
  id: string;
  category: ActivityCategory;
  title: string;
  description: string;
  actorName: string;
  actorRole: 'student' | 'tutor' | 'system' | 'creator';
  timestamp: string;
  badgeLabel?: string;
  meta?: {
    amount?: number;
    currency?: string;
    schoolName?: string;
    gradeLevel?: string;
    subject?: string;
    paymentGateway?: string;
    status?: string;
    reference?: string;
    recipientEmail?: string;
    likesCount?: number;
    score?: string;
  };
}

export interface CreatorActivitySummary {
  designatedBankAccount: string;
  accountHolder: string;
  currency: string;
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalBookings: number;
  totalGrossRevenue: number;
  totalTutorDisbursements: number;
  totalCreatorNetEarnings: number;
  totalTaxWithheld: number;
  totalSessionsConducted: number;
  totalMinutesTaught: number;
  totalLikesRecorded: number;
  totalMaterialDownloads: number;
  totalAssignmentsSubmitted: number;
  openTicketsCount: number;
  totalEmailsDispatched: number;
  activities: AppActivityItem[];
}

export interface CreatorFinancialSummary {
  designatedBankAccount: string;
  accountHolder: string;
  currency: string;
  totalGrossRevenue: number;
  totalTutorDisbursements: number;
  totalCreatorNetEarnings: number;
  totalTaxWithheld: number;
  taxFilingStatus: string;
  recentTransactions: FinancialTransaction[];
}

export interface SystemTicket {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  category: string;
  subject: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium';
  status: 'open' | 'in_progress' | 'resolved';
  creatorNotes?: string;
  createdAt: string;
}

export interface PushNotification {
  id: string;
  type: 'session' | 'assignment' | 'grade' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Official Payment & Academic Pricing Standards
// Rule: Science sessions pay 10,000 UGX per 1 1/2 hr session; Arts sessions pay 8,000 UGX per 1 1/2 hr session.
export const OFFICIAL_PAYMENT_CONFIG = {
  mtnNumber: '+256773489862',
  airtelNumber: '+256731074878',
  centenaryAccount: '3205303331',
  scienceSessionPrice90Min: 10000, // UGX 10,000 per 1 1/2 hr (90 min)
  artsSessionPrice90Min: 8000,     // UGX 8,000 per 1 1/2 hr (90 min)
  scienceHourlyRate: 10000,        // Standard rate alias
  artsHourlyRate: 8000,            // Standard rate alias
  notificationEmail: 'normantola776@gmail.com',
} as const;

export function getStandardHourlyRate(subject: string): number {
  return isScienceSubject(subject) ? 10000 : 8000;
}

export interface BriefTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  libraryMarkSchemeReference: string;
}

export interface CrossSchoolBriefTest {
  id: string;
  schoolName: string;
  librarySource: string;
  subject: string;
  sector: 'Science' | 'Art';
  classLevel: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  questions: BriefTestQuestion[];
}

export const SECONDARY_CLASSES = [
  'Senior One',
  'Senior Two',
  'Senior Three',
  'Senior Four',
  'Senior Five',
  'Senior Six',
] as const;

export type SecondaryClass = typeof SECONDARY_CLASSES[number];

export const SCIENCE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Agriculture',
  'General Science',
];

export const ARTS_SUBJECTS = [
  'Literature',
  'Economics',
  'History',
  'Geography',
  'Fine Art',
  'Kiswahili',
  'Entrepreneurship',
  'French',
  'Swahili',
  'Divinity',
  'CRE',
  'Luganda',
];

export function isScienceSubject(subject: string): boolean {
  if (!subject) return true;
  const s = subject.toLowerCase();
  return SCIENCE_SUBJECTS.some((sci) => s.includes(sci.toLowerCase()));
}

export function getSubjectTrack(subject: string): 'Science' | 'Arts' {
  return isScienceSubject(subject) ? 'Science' : 'Arts';
}

export function getStandardSessionPrice(subject: string, durationMinutes: number = 90): number {
  const isSci = isScienceSubject(subject);
  if (durationMinutes === 90) {
    return isSci ? 10000 : 8000;
  }
  // Pro-rated calculation if non-standard duration
  return isSci
    ? Math.round((10000 / 90) * durationMinutes)
    : Math.round((8000 / 90) * durationMinutes);
}

export function calculateSessionPrice(subject: string, durationMinutes: number = 90): number {
  return getStandardSessionPrice(subject, durationMinutes);
}
