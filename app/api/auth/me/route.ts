import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
export async function GET(){const a=await getAdmin();if(!a)return NextResponse.json({authenticated:false},{status:401});return NextResponse.json({authenticated:true,email:a.email});}
