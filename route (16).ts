import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";

export async function GET(req:Request){
 try{
  const id=new URL(req.url).searchParams.get("lessonId");
  if(!id)return NextResponse.json({error:"lessonId required"},{status:400});
  return NextResponse.json({activities:await dbQuery(`SELECT * FROM lesson_activities WHERE lesson_id=$1 ORDER BY order_index`,[id])});
 }catch(e){return NextResponse.json({error:"Database query failed"},{status:503})}
}
export async function POST(req:Request){
 try{
  const b=await req.json();
  const r=await dbQuery<{id:string}>(`INSERT INTO lesson_activities(lesson_id,title,type,content,order_index) VALUES($1,$2,$3,$4,$5) RETURNING id`,
   [b.lessonId,b.title,b.type||"practice",b.content||"",b.order||1]);
  return NextResponse.json({ok:true,id:r[0].id},{status:201});
 }catch(e){return NextResponse.json({error:"Database insert failed"},{status:503})}
}