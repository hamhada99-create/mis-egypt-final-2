import {NextRequest,NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({ok:true,student:{xp:740,level:8,overall:68,streak:7,completedLessons:24,bestScore:94}})}
export async function POST(req:NextRequest){const body=await req.json();return NextResponse.json({ok:true,saved:true,progress:body})}
