import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";

export async function POST(req:Request){
 try{
  const b=await req.json(); const gradeId=b.gradeId,subjectId=b.subjectId;
  if(!gradeId||!subjectId)return NextResponse.json({error:"gradeId and subjectId required"},{status:400});
  const unit=await dbQuery<{id:string}>(`INSERT INTO units(grade_id,subject_id,name,order_index) VALUES($1,$2,$3,$4) RETURNING id`,[gradeId,subjectId,b.unitName||"وحدة جديدة",b.order||1]);
  const lesson=await dbQuery<{id:string}>(`INSERT INTO lessons(unit_id,title,order_index) VALUES($1,$2,$3) RETURNING id`,[unit[0].id,b.lessonTitle||"درس جديد",1]);
  return NextResponse.json({ok:true,unitId:unit[0].id,lessonId:lesson[0].id},{status:201});
 }catch(e){return NextResponse.json({error:"Database insert failed"},{status:503})}
}