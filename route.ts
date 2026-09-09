import {NextResponse} from "next/server";
import {dbQuery} from "@/lib/db";
export async function GET(){try{return NextResponse.json({subjects:await dbQuery(`SELECT * FROM subjects ORDER BY name`)})}catch(e){return NextResponse.json({error:"Database query failed"},{status:503})}}