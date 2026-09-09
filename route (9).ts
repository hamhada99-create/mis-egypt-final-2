import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

export async function GET() {
  try {
    const exams = await dbQuery(`
      SELECT e.*, COUNT(eq.question_id)::int AS linked_questions
      FROM exams e LEFT JOIN exam_questions eq ON eq.exam_id=e.id
      GROUP BY e.id ORDER BY e.created_at DESC`);
    return NextResponse.json({ exams });
  } catch {
    return NextResponse.json({ error: "Database query failed" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const rows = await dbQuery(`
      INSERT INTO exams(title_ar, exam_type, duration_seconds, question_count, pass_percentage, is_published)
      VALUES($1,$2,$3,$4,$5,false) RETURNING *`, [
      b.title || "اختبار جديد", b.examType || "practice", Number(b.durationSeconds || 1800),
      Number(b.count || 10), Number(b.passPercentage || 60)
    ]);
    return NextResponse.json({ ok: true, exam: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database insert failed" }, { status: 503 });
  }
}
