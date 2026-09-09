import {NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({ok:true,tests:[{id:'lesson-2',title:'اختبار الدرس 3',type:'lesson',questions:10,durationMinutes:10},{id:'unit-2',title:'اختبار الوحدة 2',type:'unit',questions:25,durationMinutes:25},{id:'subject-math',title:'اختبار الرياضيات',type:'subject',questions:40,durationMinutes:45}]})}
