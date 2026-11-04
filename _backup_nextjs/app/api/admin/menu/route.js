import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { searchParams } = new URL(request.url);
    const kategoriId = searchParams.get("kategoriId");
    const q = searchParams.get("q") || searchParams.get("search");
    const where = {};
    if(kategoriId) {
      // multi-kategori: filter menu yang memiliki kategori tersebut
      where.kategoris = { some: { id: kategoriId } };
    }
    if(q) where.OR = [
      { nama: { contains: q, mode: 'insensitive' } },
      { deskripsi: { contains: q, mode: 'insensitive' } },
    ];
    const data = await prisma.menu.findMany({
      where,
      orderBy: [{ urutan: 'asc' }, { createdAt: 'asc' }],
      include: { kategoris: { select:{ id:true, nama:true, slug:true, urutan:true } } }
    });
    return NextResponse.json({success:true, data});
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}

export async function POST(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { nama, deskripsi, deskripsiPanjang, harga, gambar, tersedia, kategoriId, kategoriIds } = await request.json();
    // support both single kategoriId dan array kategoriIds
    let ids = [];
    if(Array.isArray(kategoriIds)) ids = kategoriIds.filter(Boolean);
    else if(kategoriId) ids = [kategoriId];
    if(!nama || ids.length===0) return NextResponse.json({success:false, error:"nama & kategori wajib (minimal 1)"},{status:400});
    if(harga===undefined || harga==="") return NextResponse.json({success:false, error:"harga wajib"},{status:400});
    const max = await prisma.menu.aggregate({ _max:{ urutan:true }});
    const nextUrutan = (max._max.urutan ?? -1) + 1;
    const data = await prisma.menu.create({
      data: {
        nama: nama.trim(),
        deskripsi: deskripsi || "",
        deskripsiPanjang: deskripsiPanjang || deskripsi || null,
        harga: parseInt(String(harga).replace(/[^0-9]/g,'')) || 0,
        gambar: gambar && gambar.trim() !== "" ? gambar.trim() : null,
        tersedia: tersedia !== undefined ? Boolean(tersedia) : true,
        urutan: nextUrutan,
        kategoris: { connect: ids.map(id=>({ id })) },
      },
      include: { kategoris: true }
    });
    return NextResponse.json({success:true, data},{status:201});
  }catch(e){
    if(e.code === 'P2025') return NextResponse.json({success:false, error:"Salah satu kategori tidak ditemukan"},{status:400});
    return NextResponse.json({success:false, error:e.message},{status:500})
  }
}

export async function PUT(request){
  const ok = await isAuthenticated();
  if(!ok) return NextResponse.json({success:false, error:"Unauthorized"},{status:401});
  try{
    const { id, nama, deskripsi, deskripsiPanjang, harga, gambar, tersedia, kategoriId, kategoriIds, urutan } = await request.json();
    if(!id) return NextResponse.json({success:false, error:"id wajib"},{status:400});
    const data = {};
    if(nama !== undefined) data.nama = nama.trim();
    if(deskripsi !== undefined) data.deskripsi = deskripsi;
    if(deskripsiPanjang !== undefined) data.deskripsiPanjang = deskripsiPanjang || null;
    if(harga !== undefined) data.harga = parseInt(String(harga).replace(/[^0-9]/g,'')) || 0;
    if(gambar !== undefined) data.gambar = gambar && gambar.trim()!=="" ? gambar.trim() : null;
    if(tersedia !== undefined) data.tersedia = Boolean(tersedia);
    if(urutan !== undefined) data.urutan = parseInt(urutan);
    // handle kategori update
    let ids = null;
    if(Array.isArray(kategoriIds)) ids = kategoriIds.filter(Boolean);
    else if(kategoriId) ids = [kategoriId];
    if(ids !== null){
      if(ids.length===0) return NextResponse.json({success:false, error:"Minimal 1 kategori"},{status:400});
      data.kategoris = { set: ids.map(id=>({ id })) };
    }
    const updated = await prisma.menu.update({ where:{ id }, data, include:{ kategoris:true }});
    return NextResponse.json({success:true, data: updated});
  }catch(e){
    if(e.code === 'P2025') return NextResponse.json({success:false, error:"Kategori tidak ditemukan"},{status:400});
    return NextResponse.json({success:false, error:e.message},{status:500})
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
    await prisma.menu.delete({ where:{ id: finalId }});
    return NextResponse.json({success:true});
  }catch(e){ return NextResponse.json({success:false, error:e.message},{status:500})}
}
