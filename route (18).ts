import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const answers = body.answers ?? [];
  const questions = body.questions ?? [];
  let earned = 0;
  let total = 0;

  const result = questions.map((q: any) => {
    const answer = answers.find((a: any) => a.questionId === q.id);
    const correct = answer?.selectedIndex === q.correctIndex;
    total += Number(q.points ?? 1);
    if (correct) earned += Number(q.points ?? 1);
    return { questionId: q.id, selectedIndex: answer?.selectedIndex ?? null, correct };
  });

  const percentage = total ? Math.round((earned / total) * 100) : 0;
  return NextResponse.json({
    ok: true,
    attempt: { id: `attempt-${Date.now()}`, earned, total, percentage, passed: percentage >= 60, result }
  }, { status: 201 });
}
