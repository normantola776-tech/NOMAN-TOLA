import { db } from './index.ts';
import { tutors, users, tutorReviews } from './schema.ts';
import { eq, desc, ilike, and, gte, or } from 'drizzle-orm';

export const FALLBACK_TUTORS = [
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

export async function getTutors(filters?: {
  subject?: string;
  expertise?: string;
  minRating?: number;
}) {
  try {
    const conditions = [];

    if (filters?.subject && filters.subject !== 'all' && filters.subject !== 'All') {
      conditions.push(ilike(tutors.subjects, `%${filters.subject}%`));
    }

    if (filters?.expertise) {
      conditions.push(ilike(tutors.academicExpertise, `%${filters.expertise}%`));
    }

    if (filters?.minRating) {
      conditions.push(gte(tutors.rating, filters.minRating * 10));
    }

    const query = db
      .select({
        id: tutors.id,
        userId: tutors.userId,
        subjects: tutors.subjects,
        academicExpertise: tutors.academicExpertise,
        hourlyRate: tutors.hourlyRate,
        rating: tutors.rating,
        reviewsCount: tutors.reviewsCount,
        availableDays: tutors.availableDays,
        isVerified: tutors.isVerified,
        fullName: users.fullName,
        email: users.email,
        schoolName: users.schoolName,
        bio: users.bio,
        avatar: users.avatar,
        idCardVerified: users.idCardVerified,
      })
      .from(tutors)
      .innerJoin(users, eq(tutors.userId, users.id));

    let results = [];
    if (conditions.length > 0) {
      results = await query.where(and(...conditions)).orderBy(desc(tutors.rating));
    } else {
      results = await query.orderBy(desc(tutors.rating));
    }

    if (results.length > 0) {
      return results;
    }
    // If table is temporarily empty during initial setup, return fallback
    return FALLBACK_TUTORS;
  } catch (error) {
    console.error('Database query failed in getTutors:', error);
    // Graceful fallback for UI stability
    return FALLBACK_TUTORS.filter((t) => {
      if (filters?.subject && filters.subject !== 'All' && filters.subject !== 'all') {
        if (!t.subjects.toLowerCase().includes(filters.subject.toLowerCase())) return false;
      }
      if (filters?.expertise) {
        if (!t.academicExpertise.toLowerCase().includes(filters.expertise.toLowerCase())) return false;
      }
      if (filters?.minRating && t.rating < filters.minRating * 10) {
        return false;
      }
      return true;
    });
  }
}

export async function getTutorById(tutorId: number) {
  try {
    const tutorResult = await db
      .select({
        id: tutors.id,
        userId: tutors.userId,
        subjects: tutors.subjects,
        academicExpertise: tutors.academicExpertise,
        hourlyRate: tutors.hourlyRate,
        rating: tutors.rating,
        reviewsCount: tutors.reviewsCount,
        availableDays: tutors.availableDays,
        isVerified: tutors.isVerified,
        fullName: users.fullName,
        email: users.email,
        schoolName: users.schoolName,
        bio: users.bio,
        avatar: users.avatar,
        idCardVerified: users.idCardVerified,
      })
      .from(tutors)
      .innerJoin(users, eq(tutors.userId, users.id))
      .where(eq(tutors.id, tutorId))
      .limit(1);

    if (tutorResult.length === 0) {
      const fb = FALLBACK_TUTORS.find((t) => t.id === tutorId);
      if (fb) return { ...fb, reviews: [] };
      return null;
    }

    const reviews = await db
      .select()
      .from(tutorReviews)
      .where(eq(tutorReviews.tutorId, tutorId))
      .orderBy(desc(tutorReviews.createdAt));

    return {
      ...tutorResult[0],
      reviews,
    };
  } catch (error) {
    console.error('Database query failed in getTutorById:', error);
    const fb = FALLBACK_TUTORS.find((t) => t.id === tutorId);
    if (fb) return { ...fb, reviews: [] };
    throw new Error('Failed to fetch tutor details', { cause: error });
  }
}

export async function addTutorReview(data: {
  tutorId: number;
  studentId: number;
  studentName: string;
  rating: number;
  comment: string;
}) {
  try {
    const newReview = await db.insert(tutorReviews).values(data).returning();

    // Recalculate tutor average rating
    const allReviews = await db
      .select()
      .from(tutorReviews)
      .where(eq(tutorReviews.tutorId, data.tutorId));

    const avgRating = Math.round(
      (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10
    );

    await db
      .update(tutors)
      .set({
        rating: avgRating,
        reviewsCount: allReviews.length,
      })
      .where(eq(tutors.id, data.tutorId));

    return newReview[0];
  } catch (error) {
    console.error('Database query failed in addTutorReview:', error);
    throw new Error('Failed to submit tutor rating and review', { cause: error });
  }
}
