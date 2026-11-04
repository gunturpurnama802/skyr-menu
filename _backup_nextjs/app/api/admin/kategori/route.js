import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

function slugify(s){
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}

export async function GET(){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const data = await prisma.menuKategori.findMany({
      orderBy: [{ urutan: 'asc' }, { nama: 'asc' }],
      include: { _count: { select: { menus: true } } }
    });
    return NextResponse.json({ success:true, data });
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}

export async function POST(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { nama, slug, deskripsi } = await request.json();
    if(!nama || !nama.trim()) return NextResponse.json({success:false, error:"Nama wajib"},{status:400});
    const s = slug ? slugify(slug) : slugify(nama);
    const max = await prisma.menuKategori.aggregate({ _max:{ urutan:true }});
    const nextUrutan = (max._max.urutan ?? -1) + 1;
    const data = await prisma.menuKategori.create({
      data: { nama: nama.trim(), slug: s, deskripsi: deskripsi || null, urutan: nextUrutan }
    });
    return NextResponse.json({success:true, data},{status:201});
  }catch(e){
    if(e.code === 'P2002') return NextResponse.json({success:false, error:"Nama/slug sudah ada"},{status:400});
    return NextResponse.json({success:false, error:e.message},{status:500});
  }
}

export async function PUT(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { id, nama, slug, deskripsi, urutan } = await request.json();
    if(!id) return NextResponse.json({success:false, error:"id wajib"},{status:400});
    const data = {};
    if(nama !== undefined) data.nama = nama.trim();
    if(slug !== undefined) data.slug = slugify(slug);
    else if(nama !== undefined) data.slug = slugify(nama);
    if(deskripsi !== undefined) data.deskripsi = deskripsi || null;
    if(urutan !== undefined) data.urutan = parseInt(urutan);
    const updated = await prisma.menuKategori.update({ where:{ id }, data });
    return NextResponse.json({success:true, data: updated});
  }catch(e){
    if(e.code === 'P2002') return NextResponse.json({success:false, error:"Nama/slug sudah ada"},{status:400});
    return NextResponse.json({success:false, error:e.message},{status:500});
  }
}

export async function DELETE(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json().catch(()=>({}));
    const finalId = id || body.id;
    if(!finalId) return NextResponse.json({success:false, error:"id wajib"},{status:400});
    // Cek apakah kategori masih dipakai menu (multi-kategori)
    const k = await prisma.menuKategori.findUnique({
      where: { id: finalId },
      include: { _count: { select: { menus: true } } }
    });
    if(!k) return NextResponse.json({success:false, error:"Kategori tidak ditemukan"},{status:404});
    if((k._count?.menus ?? 0) > 0){
      return NextResponse.json({success:false, error:`Tidak bisa hapus kategori "${k.nama}" karena masih dipakai ${k._count.menus} menu. Hapus atau pindahkan menu terlebih dahulu.`},{status:400});
    }
    await prisma.menuKategori.delete({ where:{ id: finalId }});
    return NextResponse.json({success:true});
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}
