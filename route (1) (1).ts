import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    exams: [
      { id: 'demo-1', title: 'اختبار مراجعة قصير', type: 'lesson', durationSeconds: 90, questionCount: 3, passPercentage: 60 }
    ]
  });
}
