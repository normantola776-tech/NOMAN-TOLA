import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(userData: {
  uid: string;
  email: string;
  fullName?: string;
  role?: string;
  gradeLevel?: string;
  schoolName?: string;
  nationality?: string;
  sector?: string;
  avatar?: string;
}) {
  try {
    const result = await db.insert(users)
      .values({
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName || userData.email.split('@')[0],
        role: userData.role || 'student',
        gradeLevel: userData.gradeLevel || 'Senior 4',
        schoolName: userData.schoolName || 'High School',
        nationality: userData.nationality || 'Ugandan',
        sector: userData.sector || 'Both',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: userData.email,
          ...(userData.fullName ? { fullName: userData.fullName } : {}),
          ...(userData.schoolName ? { schoolName: userData.schoolName } : {}),
          ...(userData.gradeLevel ? { gradeLevel: userData.gradeLevel } : {}),
          ...(userData.nationality ? { nationality: userData.nationality } : {}),
          ...(userData.sector ? { sector: userData.sector } : {}),
          ...(userData.avatar ? { avatar: userData.avatar } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to retrieve or synchronize user profile', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Failed to fetch user by UID', { cause: error });
  }
}

export async function updateSchoolIdVerification(userId: number, idCardPhotoUrl: string, schoolName?: string, gradeLevel?: string) {
  try {
    const result = await db.update(users)
      .set({
        idCardVerified: true,
        idCardPhotoUrl,
        ...(schoolName ? { schoolName } : {}),
        ...(gradeLevel ? { gradeLevel } : {}),
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in updateSchoolIdVerification:', error);
    throw new Error('Failed to verify school ID card', { cause: error });
  }
}
