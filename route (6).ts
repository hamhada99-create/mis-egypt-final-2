import { NextResponse } from "next/server";

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

const bank = [
  { id: "q1", text: "أي الكسرين أكبر؟", options: ["1/2","3/4","1/4","2/5"], correctIndex: 1, points: 1 },
  { id: "q2", text: "الماء يمكن أن يوجد في أكثر من حالة.", options: ["صح","خطأ"], correctIndex: 0, points: 1 },
  { id: "q3", text: "في «العلمُ نافعٌ» ما المبتدأ؟", options: ["العلمُ","نافعٌ","في","لا يوجد"], correctIndex: 0, points: 1 },
  { id: "q4", text: "كم يساوي 12 × 5؟", options: ["50","60","70","55"], correctIndex: 1, points: 2 },
];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const count = Math.min(Math.max(Number(body.count) || 3, 1), bank.length);
  const questions = shuffle(bank).slice(0, count).map((q) => ({
    ...q,
    options: shuffle(q.options).map((text, i) => ({ text, originalIndex: q.options.indexOf(text) })),
  }));
  return NextResponse.json({
    exam: {
      id: `exam-${Date.now()}`,
      title: body.title ?? "اختبار تدريبي",
      durationSeconds: Number(body.durationSeconds) || 90,
      questions,
    }
  });
}
