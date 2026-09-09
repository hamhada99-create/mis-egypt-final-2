import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';

const fallback = { students: 32, exams: 14, questions: 486, average: 81, atRisk: 8, weakTopics: ['الكسور', 'المحيط والمساحة', 'الطاقة'] };
export async function GET() {
  try {
    const user = getDemoUser('teacher');
    const r = await dbQuery(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='student') students,
        (SELECT COUNT(*) FROM exams) exams,
        (SELECT COUNT(*) FROM questions) questions,
        (SELECT COALESCE(ROUND(AVG(percentage)::numeric,0),0) FROM attempts WHERE submitted_at IS NOT NULL) average
    `);
    const x:any = r[0] || {};
    return NextResponse.json({ ...fallback, students:Number(x.students||0), exams:Number(x.exams||0), questions:Number(x.questions||0), average:Number(x.average||0), teacherId:user.id });
  } catch { return NextResponse.json(fallback); }
}
