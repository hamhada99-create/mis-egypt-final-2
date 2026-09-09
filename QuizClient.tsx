"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Lesson } from "@/lib/data";
import { loadProgress, saveProgress } from "@/lib/progress";

export default function QuizClient({lesson}:{lesson:Lesson}) {
  const [index,setIndex]=useState(0);
  const [selected,setSelected]=useState<number|null>(null);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [seconds,setSeconds]=useState(Math.max(60,lesson.questions.length*30));

  useEffect(()=> {
    if(done) return;
    const id=setInterval(()=>setSeconds(s=> {
      if(s<=1){ clearInterval(id); setDone(true); return 0; }
      return s-1;
    }),1000);
    return ()=>clearInterval(id);
  },[done]);

  function next() {
    if(selected===null) return;
    if(selected===lesson.questions[index].answer) setScore(x=>x+1);
    if(index===lesson.questions.length-1) setDone(true);
    else { setIndex(x=>x+1); setSelected(null); }
  }

  useEffect(()=>{
    if(done){
      const p=loadProgress();
      p.attempts += 1;
      const finalScore=Math.round((score/lesson.questions.length)*100);
      p.bestScore=Math.max(p.bestScore,finalScore);
      p.xp += finalScore >= 70 ? 30 : 10;
      saveProgress(p);
    }
  },[done]); // final score is captured from the current attempt

  if(done){
    const finalScore=Math.round((score/lesson.questions.length)*100);
    return <section className="quiz card">
      <span className="badge">النتيجة</span>
      <h1>{finalScore}%</h1>
      <p>أجبت بشكل صحيح عن {score} من {lesson.questions.length}.</p>
      <p className="muted">يمكنك العودة للدرس أو إعادة المحاولة.</p>
      <div style={{display:"flex",gap:10}}><button className="btn" onClick={()=>location.reload()}>إعادة الاختبار</button><Link className="btn secondary" href="/dashboard">لوحة الطالب</Link></div>
    </section>;
  }

  const q=lesson.questions[index];
  return <section className="quiz">
    <div className="card">
      <span className="badge">السؤال {index+1} من {lesson.questions.length}</span>
      <p className="muted">الوقت المتبقي: {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</p>
      <h2>{q.text}</h2>
      {q.options.map((o,i)=><button key={o} className={`option ${selected===i?"selected":""}`} onClick={()=>setSelected(i)}>{o}</button>)}
      <button className="btn" onClick={next} disabled={selected===null}>التالي</button>
    </div>
  </section>;
}