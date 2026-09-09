import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const grade = url.searchParams.get("grade");
    const subject = url.searchParams.get("subject");
    const rows = await dbQuery(`
      SELECT q.id, q.prompt, q.question_type, q.difficulty, q.points, q.explanation,
        COALESCE(json_agg(json_build_object('id',qo.id,'text',qo.label,'order',qo.option_order)
          ORDER BY qo.option_order) FILTER (WHERE qo.id IS NOT NULL),'[]') AS options
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id=q.id
      WHERE ($1::text IS NULL OR q.metadata->>'grade'=$1)
        AND ($2::text IS NULL OR q.metadata->>'subject'=$2)
      GROUP BY q.id ORDER BY q.created_at DESC`, [grade, subject]);
    return NextResponse.json({ questions: rows });
  } catch {
    return NextResponse.json({ error: "Database query failed" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.prompt && !b.text) return NextResponse.json({ error: "prompt required" }, { status: 400 });
    const prompt = b.prompt ?? b.text;
    const options = Array.isArray(b.options) ? b.options : [];
    const q = await dbQuery<{ id: string }>(`
      INSERT INTO questions(prompt, question_type, difficulty, points, explanation, metadata)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING id`, [
      prompt, b.type || "mcq", b.difficulty || "medium", Number(b.points ?? 1),
      b.explanation || null,
      JSON.stringify({ grade: b.grade ?? null, subject: b.subject ?? null, unit: b.unit ?? null, lesson: b.lesson ?? null })
    ]);
    for (let i = 0; i < options.length; i++) {
      const value = typeof options[i] === "string" ? options[i] : (options[i]?.text ?? options[i]?.label ?? "");
      await dbQuery(
        `INSERT INTO question_options(question_id, option_order, label, is_correct) VALUES($1,$2,$3,$4)`,
        [q[0].id, i, value, i === Number(b.correctIndex)]
      );
    }
    return NextResponse.json({ ok: true, id: q[0].id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database insert failed" }, { status: 503 });
  }
}
