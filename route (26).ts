import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';
const fallback={student:'طالب تجريبي',average:79,completed:68,studyTime:'12س 40د',streak:7,subjects:[['الرياضيات',82,'قوي'],['العلوم',74,'جيد'],['اللغة العربية',91,'ممتاز'],['اللغة الإنجليزية',68,'يحتاج متابعة']],recent:[['رياضيات',88],['علوم',76],['لغة عربية',94]]};
export async function GET(){try{const parent=getDemoUser('parent');const r=await dbQuery(`SELECT COALESCE(ROUND(AVG(a.percentage)::numeric,0),0) average, COUNT(sp.id) FILTER (WHERE sp.completion_percentage>=100) completed FROM users p LEFT JOIN users s ON s.role='student' LEFT JOIN attempts a ON a.user_id=s.id AND a.submitted_at IS NOT NULL LEFT JOIN student_progress sp ON sp.user_id=s.id WHERE p.id=$1`,[parent.id]);const x:any=r[0]||{};return NextResponse.json({...fallback,average:Number(x.average||0),completed:Number(x.completed||0)});}catch{return NextResponse.json(fallback);}}
