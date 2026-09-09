import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";

export async function GET(req:Request){
 try{
  const u=new URL(req.url), grade=u.searchParams.get("grade");
  const rows=await dbQuery(`SELECT g.id AS grade_id,g.name AS grade_name,s.id AS subject_id,s.name AS subject_name,
    u.id AS unit_id,u.name AS unit_name,l.id AS lesson_id,l.title AS lesson_title,l.order_index
    FROM grades g
    JOIN grade_subjects gs ON gs.grade_id=g.id
    JOIN subjects s ON s.id=gs.subject_id
    LEFT JOIN units u ON u.grade_id=g.id AND u.subject_id=s.id
    LEFT JOIN lessons l ON l.unit_id=u.id
    WHERE ($1::text IS NULL OR g.name=$1) ORDER BY g.id,s.id,u.id,l.order_index`,[grade]);
  const tree:any[]=[];
  for(const r of rows){
   let g=tree.find(x=>x.id===r.grade_id); if(!g){g={id:r.grade_id,name:r.grade_name,subjects:[]};tree.push(g)}
   let s=g.subjects.find((x:any)=>x.id===r.subject_id); if(!s){s={id:r.subject_id,name:r.subject_name,units:[]};g.subjects.push(s)}
   if(r.unit_id){let un=s.units.find((x:any)=>x.id===r.unit_id);if(!un){un={id:r.unit_id,name:r.unit_name,lessons:[]};s.units.push(un)}
    if(r.lesson_id) un.lessons.push({id:r.lesson_id,title:r.lesson_title,order:r.order_index});
   }
  }
  return NextResponse.json({grades:tree});
 }catch(e){return NextResponse.json({error:"Database query failed"},{status:503})}
}