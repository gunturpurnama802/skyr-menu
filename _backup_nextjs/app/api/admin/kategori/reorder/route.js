import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { orderedIds } = await request.json();
    if(!Array.isArray(orderedIds)) return NextResponse.json({success:false, error:"orderedIds harus array"},{status:400});
    // transactional update urutan
    await prisma.$transaction(
      orderedIds.map((id, idx) => prisma.menuKategori.update({ where:{ id }, data:{ urutan: idx }}))
    );
    return NextResponse.json({success:true});
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}
