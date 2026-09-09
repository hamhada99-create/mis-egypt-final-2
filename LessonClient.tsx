"use client";
import Link from "next/link";
import { useState } from "react";
import { Lesson } from "@/lib/data";
import { loadProgress, saveProgress } from "@/lib/progress";

export default function LessonClient({subjectId, lesson}:{subjectId:string,lesson:Lesson}) {
  const [done,setDone] = useState(false);
  function complete() {
    const p = loadProgress();
    if (!p.completedLessons.includes(lesson.id)) { p.completedLessons.push(lesson.id); p.xp += 20; saveProgress(p); }
    setDone(true);
  }
  return <div className="lesson">
    <h2>الشرح</h2><p>{lesson.content}</p>
    <h2>ماذا تعلمت؟</h2>
    <p className="muted">بعد قراءة الشرح، يمكنك الانتقال إلى الاختبار القصير.</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <button className="btn" onClick={complete}>{done ? "تم تسجيل الدرس ✓" : "إكمال الدرس +20 XP"}</button>
      <Link className="btn secondary" href={`/quiz/${subjectId}/${lesson.id}`}>ابدأ الاختبار</Link>
    </div>
  </div>;
}