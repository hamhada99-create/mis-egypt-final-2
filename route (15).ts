import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";

export async function POST(req:Request){
 try{
  const b=await req.json();
  if(b.type==="unit"){
   const r=await dbQuery<{id:string}>(`INSERT INTO units(grade_id,subject_id,name,description,order_index) VALUES($1,$2,$3,$4,$5) RETURNING id`,
    [b.gradeId,b.subjectId,b.name,b.description||null,b.order||1]);
   return NextResponse.json({ok:true,type:"unit",id:r[0].id},{status:201});
  }
  if(b.type==="lesson"){
   const r=await dbQuery<{id:string}>(`INSERT INTO lessons(unit_id,title,content,summary,learning_objectives,order_index) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
    [b.unitId,b.title,b.content||"",b.summary||"",JSON.stringify(b.objectives||[]),b.order||1]);
   return NextResponse.json({ok:true,type:"lesson",id:r[0].id},{status:201});
  }
  if(b.type==="concept"){
   const r=await dbQuery<{id:string}>(`INSERT INTO concepts(lesson_id,name,description) VALUES($1,$2,$3) RETURNING id`,
    [b.lessonId,b.name,b.description||null]);
   return NextResponse.json({ok:true,type:"concept",id:r[0].id},{status:201});
  }
  return NextResponse.json({error:"Unsupported content type"},{status:400});
 }catch(e){return NextResponse.json({error:"Database insert failed"},{status:503})}
}