import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';

const demo = {
  overview: { average: 82, lessons: 18, completed: 12, xp: 540, streak: 7, attempts: 14 },
  subjects: [
    { name: 'الرياضيات', percentage: 88, progress: 76 },
    { name: 'العلوم', percentage: 79, progress: 64 },
    { name: 'اللغة العربية', percentage: 91, progress: 83 },
    { name: 'اللغة الإنجليزية', percentage: 70, progress: 58 },
  ],
  recommendations: [
    { title: 'مراجعة الكسور', reason: 'انخفاض الأداء في آخر محاولتين', href: '/learning' },
    { title: 'أكمل درس الطاقة', reason: 'الدرس التالي في مسارك', href: '/learning' },
  ],
  recent: [
    { title: 'اختبار الرياضيات', percentage: 88, date: 'اليوم' },
    { title: 'اختبار العلوم', percentage: 76, date: 'أمس' },
  ],
};

export async function GET() {
  try {
    const user = getDemoUser('student');
    const overviewRows = await dbQuery(`
      SELECT
        COALESCE(ROUND(AVG(a.percentage)::numeric,0),0) AS average,
        COUNT(a.id) FILTER (WHERE a.submitted_at IS NOT NULL) AS attempts,
        COALESCE(SUM(sp.xp),0) AS xp,
        COALESCE(MAX(sp.streak_days),0) AS streak,
        COUNT(sp.id) FILTER (WHERE sp.completed = true) AS completed,
        COUNT(sp.id) AS lessons
      FROM users u
      LEFT JOIN attempts a ON a.user_id = u.id
      LEFT JOIN student_progress sp ON sp.user_id = u.id
      WHERE u.id = $1
    `, [user.id]);

    const subjects = await dbQuery(`
      SELECT s.name_ar AS name,
        COALESCE(ROUND(AVG(a.percentage)::numeric,0),0) AS percentage,
        COALESCE(ROUND(AVG(sp.progress_percent)::numeric,0),0) AS progress
      FROM student_progress sp
      LEFT JOIN subjects s ON s.id = sp.subject_id
      LEFT JOIN attempts a ON a.user_id = sp.user_id
      WHERE sp.user_id = $1 AND s.id IS NOT NULL
      GROUP BY s.id, s.name_ar
      ORDER BY s.name_ar
    `, [user.id]);

    const recent = await dbQuery(`
      SELECT e.title_ar AS title, a.percentage, a.submitted_at AS date
      FROM attempts a JOIN exams e ON e.id = a.exam_id
      WHERE a.user_id = $1 AND a.submitted_at IS NOT NULL
      ORDER BY a.submitted_at DESC LIMIT 5
    `, [user.id]);

    const o = overviewRows[0] ?? {};
    return NextResponse.json({
      overview: { average: Number(o.average||0), lessons: Number(o.lessons||0), completed: Number(o.completed||0), xp: Number(o.xp||0), streak: Number(o.streak||0), attempts: Number(o.attempts||0) },
      subjects: subjects.map((s:any)=>({name:s.name, percentage:Number(s.percentage||0), progress:Number(s.progress||0)})),
      recommendations: [], recent: recent.map((r:any)=>({title:r.title, percentage:Number(r.percentage||0), date:r.date})),
    });
  } catch {
    return NextResponse.json(demo);
  }
}
