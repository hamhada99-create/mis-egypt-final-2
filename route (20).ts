import {NextRequest,NextResponse} from 'next/server';
export async function POST(req:NextRequest){
 const {message=''}=await req.json();
 if(!message.trim()) return NextResponse.json({ok:false,error:'اكتب سؤالك أولاً'},{status:400});
 return NextResponse.json({ok:true,reply:'مساعد ميس AI جاهز لشرح المفهوم وتقديم تدريب مشابه وتصحيح خطوات الحل.'});
}
