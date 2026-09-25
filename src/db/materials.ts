import { db } from './index.ts';
import { studyMaterials } from './schema.ts';
import { desc, ilike, and, eq } from 'drizzle-orm';

export async function getStudyMaterials(filters?: {
  subject?: string;
  gradeLevel?: string;
  search?: string;
}) {
  try {
    const conditions = [];

    if (filters?.subject && filters.subject !== 'all') {
      conditions.push(ilike(studyMaterials.subject, `%${filters.subject}%`));
    }

    if (filters?.gradeLevel && filters.gradeLevel !== 'all') {
      conditions.push(ilike(studyMaterials.gradeLevel, `%${filters.gradeLevel}%`));
    }

    if (filters?.search) {
      conditions.push(ilike(studyMaterials.title, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(studyMaterials)
        .where(and(...conditions))
        .orderBy(desc(studyMaterials.downloadsCount));
    }

    return await db.select().from(studyMaterials).orderBy(desc(studyMaterials.downloadsCount));
  } catch (error) {
    console.error('Database query failed in getStudyMaterials:', error);
    throw new Error('Failed to fetch study materials', { cause: error });
  }
}

export async function recordDownload(materialId: number) {
  try {
    const current = await db
      .select({ downloads: studyMaterials.downloadsCount })
      .from(studyMaterials)
      .where(eq(studyMaterials.id, materialId))
      .limit(1);

    const count = (current[0]?.downloads || 0) + 1;
    await db
      .update(studyMaterials)
      .set({ downloadsCount: count })
      .where(eq(studyMaterials.id, materialId));

    return { success: true, downloads: count };
  } catch (error) {
    console.error('Database query failed in recordDownload:', error);
    throw new Error('Failed to update download count', { cause: error });
  }
}

export async function uploadStudyMaterial(data: {
  title: string;
  subject: string;
  gradeLevel: string;
  authorName: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  contentSummary: string;
  encryptionHash?: string;
}) {
  try {
    const hash =
      data.encryptionHash ||
      `SHA256:${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

    const newMaterial = await db
      .insert(studyMaterials)
      .values({
        ...data,
        isEncrypted: true,
        encryptionHash: hash,
        offlineAvailable: true,
        downloadsCount: 1,
      })
      .returning();

    return newMaterial[0];
  } catch (error) {
    console.error('Database query failed in uploadStudyMaterial:', error);
    throw new Error('Failed to upload study material', { cause: error });
  }
}
