import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';

const fallback = {
  summary: { mastered: 6, developing: 4, needsReview: 2, averageMastery: 74 },
  weakConcepts: [
    { id: 'demo-1', name: 'المقام المشترك', mastery: 48, lessonTitle: 'جمع الكسور', priority: 'high' },
    { id: 'demo-2', name: 'التبسيط', mastery: 61, lessonTitle: 'الكسور المتكافئة', priority: 'medium' },
  ],
  recommendations: [
    { id: 'r1', title: 'تدريب على المقام المشترك', reason: 'مفهوم يحتاج إلى مراجعة قبل الانتقال للدرس التالي.', href: '/learning', type: 'practice' },
    { id: 'r2', title: 'أعد اختبار الكسور المتكافئة', reason: 'رفع الإتقان فوق 80% سيفتح لك مسارًا أكثر تقدمًا.', href: '/exams', type: 'assessment' },
    { id: 'r3', title: 'أكمل درس جمع الكسور', reason: 'لديك أساس جيد ويمكنك متابعة المسار بعد تدريب قصير.', href: '/learning', type: 'lesson' },
  ]
};

export async function GET() {
  try {
    const user = getDemoUser('student');
    const weak = await dbQuery(`
      SELECT c.id, c.name_ar AS name, c.mastery_target,
             scm.mastery_percent AS mastery,
             l.title_ar AS lesson_title
      FROM student_concept_mastery scm
      JOIN concepts c ON c.id=scm.concept_id
      JOIN lessons l ON l.id=c.lesson_id
      WHERE scm.user_id=$1 AND scm.mastery_percent < c.mastery_target
      ORDER BY scm.mastery_percent ASC LIMIT 8
    `, [user.id]);

    const recent = await dbQuery(`
      SELECT id, title_ar AS title, reason_ar AS reason, action_url AS href, recommendation_type AS type
      FROM adaptive_recommendations
      WHERE user_id=$1 AND status='open'
      ORDER BY priority DESC, created_at DESC LIMIT 6
    `, [user.id]);

    const stats = await dbQuery(`
      SELECT COUNT(*) FILTER (WHERE mastery_percent >= 80) mastered,
             COUNT(*) FILTER (WHERE mastery_percent >= 50 AND mastery_percent < 80) developing,
             COUNT(*) FILTER (WHERE mastery_percent < 50) needs_review,
             COALESCE(ROUND(AVG(mastery_percent)::numeric,0),0) average_mastery
      FROM student_concept_mastery WHERE user_id=$1
    `, [user.id]);
    const s:any = stats[0] || {};
    return NextResponse.json({
      summary: { mastered:Number(s.mastered||0), developing:Number(s.developing||0), needsReview:Number(s.needs_review||0), averageMastery:Number(s.average_mastery||0) },
      weakConcepts: weak.map((x:any)=>({id:x.id,name:x.name,mastery:Number(x.mastery||0),lessonTitle:x.lesson_title,priority:Number(x.mastery||0)<50?'high':'medium'})),
      recommendations: recent.length ? recent : fallback.recommendations
    });
  } catch { return NextResponse.json(fallback); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = getDemoUser('student');
    const conceptId = body.conceptId;
    const score = Math.max(0, Math.min(100, Number(body.score || 0)));
    if (!conceptId) return NextResponse.json({ok:false,error:'conceptId is required'}, {status:400});
    await dbQuery(`
      INSERT INTO student_concept_mastery(user_id, concept_id, mastery_percent, attempts, correct_answers, last_score, last_attempt_at)
      VALUES($1,$2,$3,1,CASE WHEN $3>=50 THEN 1 ELSE 0 END,$3,now())
      ON CONFLICT(user_id,concept_id) DO UPDATE SET
        mastery_percent=ROUND((student_concept_mastery.mastery_percent*0.6 + EXCLUDED.mastery_percent*0.4)::numeric,2),
        attempts=student_concept_mastery.attempts+1,
        correct_answers=student_concept_mastery.correct_answers + EXCLUDED.correct_answers,
        last_score=EXCLUDED.last_score,last_attempt_at=now(),updated_at=now()
    `, [user.id, conceptId, score]);
    return NextResponse.json({ok:true});
  } catch { return NextResponse.json({ok:false,error:'Adaptive data is unavailable'}, {status:503}); }
}
