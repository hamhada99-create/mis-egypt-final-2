import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Curriculum = {
  academicYear?: string;
  grades?: Array<{
    code: string;
    name: string;
    stage: string;
    subjects?: Array<{ code?: string; name: string; annualPeriods?: number }>;
  }>;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Curriculum;
  if (!body.academicYear || !Array.isArray(body.grades)) {
    return NextResponse.json({ ok: false, error: "ملف المنهج غير صالح." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const year = await client.query(
      `INSERT INTO academic_years (name, source_url)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET source_url = EXCLUDED.source_url
       RETURNING id`,
      [body.academicYear, "https://www.moe.gov.sa/ar/education/generaleducation/StudyPlans/Pages/Study-plans.aspx"]
    );

    let gradeCount = 0;
    let subjectCount = 0;
    let relationCount = 0;

    for (let i = 0; i < body.grades.length; i++) {
      const g = body.grades[i];
      const grade = await client.query(
        `INSERT INTO grades (code, name_ar, stage, grade_order)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (code) DO UPDATE SET name_ar=EXCLUDED.name_ar, stage=EXCLUDED.stage, grade_order=EXCLUDED.grade_order
         RETURNING id`,
        [g.code, g.name, g.stage, i + 1]
      );
      gradeCount++;

      for (let j = 0; j < (g.subjects ?? []).length; j++) {
        const s = g.subjects![j];
        const subjectCode = s.code ?? `${g.code}-subject-${j + 1}`;
        const subject = await client.query(
          `INSERT INTO subjects (code, name_ar)
           VALUES ($1,$2)
           ON CONFLICT (code) DO UPDATE SET name_ar=EXCLUDED.name_ar
           RETURNING id`,
          [subjectCode, s.name]
        );
        subjectCount++;

        await client.query(
          `INSERT INTO grade_subjects (academic_year_id, grade_id, subject_id, annual_periods, sort_order)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (academic_year_id, grade_id, subject_id)
           DO UPDATE SET annual_periods=EXCLUDED.annual_periods, sort_order=EXCLUDED.sort_order`,
          [year.rows[0].id, grade.rows[0].id, subject.rows[0].id, s.annualPeriods ?? null, j]
        );
        relationCount++;
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, academicYear: body.academicYear, gradeCount, subjectCount, relationCount });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json({ ok: false, error: "فشل استيراد الخطة إلى قاعدة البيانات." }, { status: 500 });
  } finally {
    client.release();
  }
}
