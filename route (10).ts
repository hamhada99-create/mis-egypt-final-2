import { NextResponse } from "next/server";
import { dbQuery, getPool } from "@/lib/db";

export async function GET() {
  try {
    const attempts = await dbQuery(`
      SELECT a.id,a.user_id,a.exam_id,a.score,a.percentage,
        CASE WHEN a.percentage IS NOT NULL AND a.percentage >= e.pass_percentage THEN true ELSE false END AS passed,
        a.status,a.started_at,a.submitted_at,e.title_ar AS exam_title,u.full_name AS student_name
      FROM attempts a
      JOIN exams e ON e.id=a.exam_id
      JOIN users u ON u.id=a.user_id
      ORDER BY a.submitted_at DESC NULLS LAST, a.started_at DESC LIMIT 100`);
    return NextResponse.json({ attempts });
  } catch {
    return NextResponse.json({ error: "Database query failed" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { examId, userId, answers } = body;
  if (!examId || !userId || !Array.isArray(answers)) return NextResponse.json({ error: "examId, userId and answers are required" }, { status: 400 });

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const exam = (await client.query(`SELECT id, pass_percentage FROM exams WHERE id=$1 AND is_published=true`, [examId])).rows[0];
    if (!exam) { await client.query("ROLLBACK"); return NextResponse.json({ error: "Exam not found or not published" }, { status: 404 }); }
    const qs = (await client.query(`
      SELECT q.id,q.points, COALESCE(json_agg(json_build_object('order',qo.option_order,'correct',qo.is_correct)
      ORDER BY qo.option_order) FILTER (WHERE qo.id IS NOT NULL),'[]') options
      FROM exam_questions eq JOIN questions q ON q.id=eq.question_id
      LEFT JOIN question_options qo ON qo.question_id=q.id
      WHERE eq.exam_id=$1 GROUP BY q.id`, [examId])).rows;
    const attempt = (await client.query(`INSERT INTO attempts(exam_id,user_id,status) VALUES($1,$2,'in_progress') RETURNING id,started_at`, [examId,userId])).rows[0];
    let earned = 0, total = 0;
    for (const q of qs) {
      const points = Number(q.points || 1); total += points;
      const answer = answers.find((a: any) => a.questionId === q.id);
      const selected = answer?.selectedIndex == null ? null : Number(answer.selectedIndex);
      const correct = selected != null && q.options.some((o: any) => Number(o.order) === selected && o.correct === true);
      if (correct) earned += points;
      await client.query(`INSERT INTO attempt_answers(attempt_id,question_id,answer,is_correct,points_awarded) VALUES($1,$2,$3,$4,$5)`, [attempt.id,q.id,JSON.stringify({selectedIndex:selected}),correct,correct?points:0]);
    }
    const percentage = total ? Math.round((earned / total) * 10000) / 100 : 0;
    const updated = (await client.query(`UPDATE attempts SET score=$1,percentage=$2,status='submitted',submitted_at=now() WHERE id=$3 RETURNING *`, [earned,percentage,attempt.id])).rows[0];
    await client.query("COMMIT");
    return NextResponse.json({ ok:true, attempt:{...updated, passed: percentage >= Number(exam.pass_percentage)} });
  } catch {
    await client.query("ROLLBACK").catch(()=>{});
    return NextResponse.json({ error: "Could not submit attempt" }, { status: 500 });
  } finally { client.release(); }
}
