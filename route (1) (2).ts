import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [years, grades, subjects, lessons, questions] = await Promise.all([
      pool.query("SELECT count(*)::int AS count FROM academic_years"),
      pool.query("SELECT count(*)::int AS count FROM grades"),
      pool.query("SELECT count(*)::int AS count FROM subjects"),
      pool.query("SELECT count(*)::int AS count FROM lessons"),
      pool.query("SELECT count(*)::int AS count FROM questions"),
    ]);
    return NextResponse.json({
      ok: true,
      counts: {
        academicYears: years.rows[0].count,
        grades: grades.rows[0].count,
        subjects: subjects.rows[0].count,
        lessons: lessons.rows[0].count,
        questions: questions.rows[0].count,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "قاعدة البيانات غير متصلة أو لم يتم تشغيل schema.sql بعد." },
      { status: 500 }
    );
  }
}
