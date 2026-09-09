import { NextResponse } from "next/server";

const questions = [
  { id: "q1", grade: 5, subject: "الرياضيات", unit: "الكسور", lesson: "مقارنة الكسور", type: "mcq", difficulty: "easy", points: 1,
    text: "أي الكسرين أكبر؟", options: ["1/2", "3/4", "1/4", "2/5"], correctIndex: 1 },
  { id: "q2", grade: 5, subject: "العلوم", unit: "المادة", lesson: "حالات المادة", type: "true_false", difficulty: "easy", points: 1,
    text: "الماء يمكن أن يوجد في أكثر من حالة.", options: ["صح", "خطأ"], correctIndex: 0 },
  { id: "q3", grade: 5, subject: "اللغة العربية", unit: "النحو", lesson: "الجملة الاسمية", type: "mcq", difficulty: "medium", points: 1,
    text: "في جملة «العلمُ نافعٌ» ما المبتدأ؟", options: ["العلمُ", "نافعٌ", "في", "لا يوجد"], correctIndex: 0 },
  { id: "q4", grade: 5, subject: "الرياضيات", unit: "العمليات", lesson: "الضرب", type: "mcq", difficulty: "medium", points: 2,
    text: "كم يساوي 12 × 5؟", options: ["50", "60", "70", "55"], correctIndex: 1 },
];

export async function GET() {
  return NextResponse.json({ questions, total: questions.length });
}

export async function POST(req: Request) {
  const body = await req.json();
  const question = { id: `q-${Date.now()}`, ...body };
  return NextResponse.json({ ok: true, question }, { status: 201 });
}
