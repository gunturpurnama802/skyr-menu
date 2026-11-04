import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const KEY = "chat_link";

export async function GET(){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const s = await prisma.setting.findUnique({ where:{ key: KEY }});
    return NextResponse.json({ success:true, url: s?.value || null });
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}

export async function PUT(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { url } = await request.json();
    const value = typeof url === "string" ? url.trim() : "";
    if(!/^https?:\/\/\S+$/i.test(value)){
      return NextResponse.json({success:false, error:"Link harus diawali http:// atau https://"},{status:400});
    }
    await prisma.setting.upsert({
      where:{ key: KEY },
      update:{ value },
      create:{ key: KEY, value },
    });
    return NextResponse.json({ success:true, url: value });
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}

export async function DELETE(){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    await prisma.setting.deleteMany({ where:{ key: KEY }});
    return NextResponse.json({ success:true });
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}
