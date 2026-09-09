import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";
export async function GET(req:Request){
 try{
  const id=new URL(req.url).searchParams.get("lessonId");
  if(!id)return NextResponse.json({error:"lessonId required"},{status:400});
  return NextResponse.json({questions:await dbQuery(`SELECT q.*,lq.sort_order FROM lesson_questions lq JOIN questions q ON q.id=lq.question_id WHERE lq.lesson_id=$1 ORDER BY lq.sort_order`,[id])});
 }catch(e){return NextResponse.json({error:"Database query failed"},{status:503})}
}
export async function POST(req:Request){
 try{
  const b=await req.json();
  await dbQuery(`INSERT INTO lesson_questions(lesson_id,question_id,sort_order) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,[b.lessonId,b.questionId,b.order||1]);
  return NextResponse.json({ok:true},{status:201});
 }catch(e){return NextResponse.json({error:"Database insert failed"},{status:503})}
}