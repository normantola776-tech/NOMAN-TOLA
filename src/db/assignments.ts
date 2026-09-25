import { db } from './index.ts';
import { assignments, tutors, users } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getStudentAssignments(studentId: number) {
  try {
    const list = await db
      .select({
        id: assignments.id,
        studentId: assignments.studentId,
        tutorId: assignments.tutorId,
        title: assignments.title,
        subject: assignments.subject,
        description: assignments.description,
        dueDate: assignments.dueDate,
        status: assignments.status,
        grade: assignments.grade,
        feedback: assignments.feedback,
        submissionNotes: assignments.submissionNotes,
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .where(eq(assignments.studentId, studentId))
      .orderBy(desc(assignments.dueDate));

    return list;
  } catch (error) {
    console.error('Database query failed in getStudentAssignments:', error);
    throw new Error('Failed to fetch assignments', { cause: error });
  }
}

export async function submitAssignment(assignmentId: number, notes: string) {
  try {
    const updated = await db
      .update(assignments)
      .set({
        status: 'submitted',
        submissionNotes: notes,
      })
      .where(eq(assignments.id, assignmentId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database query failed in submitAssignment:', error);
    throw new Error('Failed to submit assignment', { cause: error });
  }
}

export async function gradeAssignment(assignmentId: number, grade: string, feedback: string) {
  try {
    const updated = await db
      .update(assignments)
      .set({
        status: 'graded',
        grade,
        feedback,
      })
      .where(eq(assignments.id, assignmentId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database query failed in gradeAssignment:', error);
    throw new Error('Failed to grade assignment', { cause: error });
  }
}
