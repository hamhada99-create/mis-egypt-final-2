import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";
export async function GET(){
 try { const rows=await dbQuery<{ok:number}>("SELECT 1 AS ok"); return NextResponse.json({ok:true,database:rows[0]?.ok===1});}
 catch(e){return NextResponse.json({ok:false,error:"Database unavailable"},{status:503});}
}