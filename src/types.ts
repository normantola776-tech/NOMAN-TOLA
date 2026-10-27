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

export const PROFILES: Record<'student' | 'tutor' | 'creator', UserProfile> = {
  student: {
    id: 2,
    uid: 'student-demo-2',
    email: 'joel.mukasa@budo.ac.ug',
    fullName: 'Joel Mukasa',
    role: 'student',
    gradeLevel: 'Senior 4',
    schoolName: "King's College Budo",
    nationality: 'Ugandan',
    sector: 'Science',
    hasFirstTimeBonus: true,
    bonusSessionsCount: 1, // 1 Free bonus session credited for first-time orders!
    ordersCount: 1,
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    bio: 'Aspiring engineer preparing for UNEB UCE and Cambridge IGCSE examinations.',
  },
  tutor: {
    id: 1,
    uid: 'tutor-demo-1',
    email: 'kigozi.mark@budo.ac.ug',
    fullName: 'Dr. Mark Kigozi',
    role: 'tutor',
    gradeLevel: 'Senior 4 - Senior 6 (A-Level)',
    schoolName: "King's College Budo",
    nationality: 'Ugandan',
    sector: 'Science',
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    bio: 'Lead Physics and Pure Mathematics instructor with 12 years of distinction coaching.',
  },
  creator: {
    id: 3,
    uid: 'creator-admin-3',
    email: 'normantola776@gmail.com',
    fullName: 'Edura Platform Directorate',
    role: 'creator',
    gradeLevel: 'Administrative Board',
    schoolName: 'Centenary Payout Operations',
    nationality: 'Ugandan',
    sector: 'Both',
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Platform financial management & tax compliance officer. Direct notifications: normantola776@gmail.com',
  },
};

export interface RoleCredentialsInfo {
  role: 'student' | 'tutor' | 'creator';
  title: string;
  subtitle: string;
  badge: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  specialFieldKey: string;
  specialFieldLabel: string;
  specialFieldValue: string;
  specialFieldHint: string;
  demoEmail: string;
  demoPassword: string;
  demoName: string;
  institution: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  highlights: string[];
}

export const ROLE_CREDENTIALS_MAP: Record<'student' | 'tutor' | 'creator', RoleCredentialsInfo> = {
  student: {
    role: 'student',
    title: 'Student Portal Login',
    subtitle: 'Uganda Secondary Education (O-Level & A-Level)',
    badge: 'Secondary School Student',
    emailPlaceholder: 'joel.mukasa@budo.ac.ug',
    passwordPlaceholder: 'budo2026',
    specialFieldKey: 'indexNumber',
    specialFieldLabel: 'School Index / Student ID',
    specialFieldValue: 'U0025/512',
    specialFieldHint: 'Issued by School Directorate or UNEB Examination Centre',
    demoEmail: 'joel.mukasa@budo.ac.ug',
    demoPassword: 'budo2026',
    demoName: 'Joel Mukasa',
    institution: "King's College Budo • Senior 4 (Science)",
    accentBg: 'bg-blue-600',
    accentText: 'text-blue-600',
    accentBorder: 'border-blue-500',
    highlights: [
      '1 Free First-Order Bonus Masterclass Voucher credited',
      'Science (UGX 10k) & Arts (UGX 8k) 90-min sessions',
      'Gemma AI Study Assistant & Homework Solver',
      'Offline encrypted past papers and study notes',
    ],
  },
  tutor: {
    role: 'tutor',
    title: 'Educator & Tutor Portal',
    subtitle: 'UNEB & Cambridge Certified Specialist Faculty',
    badge: 'Certified Faculty Instructor',
    emailPlaceholder: 'kigozi.mark@budo.ac.ug',
    passwordPlaceholder: 'physics2026',
    specialFieldKey: 'trnNumber',
    specialFieldLabel: 'Teacher Registration No. (TRN)',
    specialFieldValue: 'TRN-BUDO-8842',
    specialFieldHint: 'Ministry of Education & Sports / School TRN registry',
    demoEmail: 'kigozi.mark@budo.ac.ug',
    demoPassword: 'physics2026',
    demoName: 'Dr. Mark Kigozi',
    institution: "King's College Budo • Physics & Pure Math",
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-600',
    accentBorder: 'border-emerald-500',
    highlights: [
      'Interactive 90-min timetable scheduler & room creator',
      'Student Like-gated earnings payouts system',
      'Live audio & video classroom host privileges',
      'Student assignment review & grade publisher',
    ],
  },
  creator: {
    role: 'creator',
    title: 'Platform Directorate & Treasury',
    subtitle: 'Centenary Payout Operations & Audit Board',
    badge: 'Directorate & Financial Audit',
    emailPlaceholder: 'normantola776@gmail.com',
    passwordPlaceholder: 'centenary320530',
    specialFieldKey: 'securityPin',
    specialFieldLabel: 'Centenary Directorate Security PIN',
    specialFieldValue: '320530',
    specialFieldHint: 'Confidential 6-digit PIN linked to Centenary Account 3205303331',
    demoEmail: 'normantola776@gmail.com',
    demoPassword: 'centenary320530',
    demoName: 'Edura Platform Directorate',
    institution: 'Centenary Payout Operations (Uganda)',
    accentBg: 'bg-slate-900',
    accentText: 'text-slate-900',
    accentBorder: 'border-slate-800',
    highlights: [
      'Real-time transaction ledgers & activity audit feeds',
      'Centenary Bank disbursement batch manager (#CENT-2026-904)',
      'URA tax withholding statements & financial ledgers',
      'Emergency support ticket dispatch & platform controls',
    ],
  },
};

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

export const DEFAULT_TUTORS: Tutor[] = [
  {
    id: 1,
    userId: 1,
    subjects: 'Physics, Mathematics',
    academicExpertise: 'Electromagnetism, Mechanics, Pure Math (UNEB & Cambridge)',
    hourlyRate: 25000,
    rating: 49,
    reviewsCount: 18,
    availableDays: 'Mon, Wed, Fri, Sat',
    isVerified: true,
    fullName: 'Dr. Mark Kigozi',
    email: 'kigozi.mark@budo.ac.ug',
    schoolName: "King's College Budo",
    bio: 'Lead Physics and Pure Mathematics instructor with 12 years of distinction coaching.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    idCardVerified: true,
  },
  {
    id: 2,
    userId: 4,
    subjects: 'Chemistry, Biology',
    academicExpertise: 'Organic Chemistry, UNEB Practical Volumetric Analysis, Cell Biology',
    hourlyRate: 22000,
    rating: 48,
    reviewsCount: 14,
    availableDays: 'Tue, Thu, Sat, Sun',
    isVerified: true,
    fullName: 'Sarah Namubiru',
    email: 's.namubiru@gayaza.sc.ug',
    schoolName: 'Gayaza High School',
    bio: 'Senior Chemistry & Biology educator specializing in UNEB practicals and organic synthesis.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    idCardVerified: true,
  },
  {
    id: 3,
    userId: 5,
    subjects: 'Computer Science, Mathematics',
    academicExpertise: 'Algorithms, Python Programming, Statistics & ICT Paper 2',
    hourlyRate: 20000,
    rating: 47,
    reviewsCount: 9,
    availableDays: 'Mon, Tue, Thu, Fri',
    isVerified: true,
    fullName: 'Peter Ochieng',
    email: 'ochieng.peter@smack.ac.ug',
    schoolName: "St. Mary's College Kisubi (SMACK)",
    bio: 'Computer Science, ICT, and Applied Mathematics coach with national robotics honors.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    idCardVerified: true,
  },
];

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
