export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  enrollmentCode?: string;
  courseState?: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  calendarId?: string;
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  submissionModificationMode?: string;
  materials?: Array<{
    link?: { url: string; title?: string };
    driveFile?: { driveFile: { id: string; title: string; alternateLink: string } };
    youtubeVideo?: { id: string; title: string; alternateLink: string };
  }>;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  creatorUserId?: string;
}

export interface ClassroomUserProfile {
  id: string;
  name: {
    givenName: string;
    familyName: string;
    fullName: string;
  };
  emailAddress?: string;
  photoUrl?: string;
}

const BASE_URL = 'https://classroom.googleapis.com/v1';

export async function listCourses(accessToken: string): Promise<ClassroomCourse[]> {
  const res = await fetch(`${BASE_URL}/courses?courseStates=ACTIVE`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Google Classroom courses (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.courses || [];
}

export async function listCourseWork(accessToken: string, courseId: string): Promise<ClassroomCourseWork[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/courseWork`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch coursework (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.courseWork || [];
}

export async function listAnnouncements(accessToken: string, courseId: string): Promise<ClassroomAnnouncement[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/announcements`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch announcements (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.announcements || [];
}

export async function listTeachers(accessToken: string, courseId: string): Promise<ClassroomUserProfile[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/teachers`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return (data.teachers || []).map((t: any) => t.profile);
}

export async function listStudents(accessToken: string, courseId: string): Promise<ClassroomUserProfile[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/students`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return (data.students || []).map((s: any) => s.profile);
}

export async function createCourse(accessToken: string, course: {
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
}): Promise<ClassroomCourse> {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...course,
      ownerId: 'me',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create course in Google Classroom (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function createCourseWork(accessToken: string, courseId: string, work: {
  title: string;
  description?: string;
  maxPoints?: number;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
}): Promise<ClassroomCourseWork> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/courseWork`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...work,
      state: 'PUBLISHED',
      workType: 'ASSIGNMENT',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create assignment in Google Classroom (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function createAnnouncement(accessToken: string, courseId: string, text: string): Promise<ClassroomAnnouncement> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      state: 'PUBLISHED',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to post announcement to Google Classroom (${res.status}): ${errorText}`);
  }

  return await res.json();
}
