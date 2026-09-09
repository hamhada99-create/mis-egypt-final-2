import { NextRequest, NextResponse } from 'next/server';
const items=[
 {type:'درس',title:'الكسور الاعتيادية',grade:'الصف الخامس',subject:'رياضيات'},
 {type:'درس',title:'دورة الماء',grade:'الصف الرابع',subject:'علوم'},
 {type:'وحدة',title:'القيم الإسلامية',grade:'الصف السادس',subject:'الدراسات الإسلامية'},
 {type:'مفهوم',title:'المحيط والمساحة',grade:'الصف السادس',subject:'رياضيات'}
];
export async function GET(req:NextRequest){
 const q=(new URL(req.url).searchParams.get('q')||'').trim();
 return NextResponse.json({ok:true,results:q?items.filter(x=>Object.values(x).some(v=>v.includes(q))):items});
}
