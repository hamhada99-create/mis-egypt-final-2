import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";
export async function POST(req:Request){
 try{
  const b=await req.json();
  await dbQuery(`INSERT INTO student_progress(user_id,lesson_id,progress_percent,completed,updated_at) VALUES($1,$2,$3,$4,now())
   ON CONFLICT(user_id,lesson_id) DO UPDATE SET progress_percent=EXCLUDED.progress_percent,completed=EXCLUDED.completed,updated_at=now()`,
   [b.userId,b.lessonId,Math.max(0,Math.min(100,Number(b.progressPercent)||0)),!!b.completed]);
  return NextResponse.json({ok:true});
 }catch(e){return NextResponse.json({error:"Progress save failed"},{status:503})}
}