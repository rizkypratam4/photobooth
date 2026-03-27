// app/api/frames/route.ts
// GET  /api/frames        → ambil semua frame
// POST /api/frames        → simpan frame baru (dari editor)

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET — fetch semua frame dari database
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("frames")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Ubah snake_case dari database ke camelCase untuk frontend
  const frames = data.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    imageUrl: f.image_url,
    canvasWidth: f.canvas_width,
    canvasHeight: f.canvas_height,
    slots: f.slots,
  }));

  return NextResponse.json(frames);
}

// POST — simpan frame baru dari Frame Editor
export async function POST(request: Request) {
  const body = await request.json();
  const { id, name, category, imageUrl, canvasWidth, canvasHeight, slots } =
    body;

  if (!id || !name || !imageUrl || !slots) {
    return NextResponse.json(
      { error: "Data frame tidak lengkap" },
      { status: 400 },
    );
  }

  // Kalau imageUrl adalah base64 (dari upload lokal), upload dulu ke Supabase Storage
  let finalImageUrl = imageUrl;

  if (imageUrl.startsWith("data:image/png;base64,")) {
    const base64Data = imageUrl.replace("data:image/png;base64,", "");
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `${id}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("frames")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Ambil public URL dari Supabase Storage
    const { data: urlData } = supabaseAdmin.storage
      .from("frames")
      .getPublicUrl(fileName);

    finalImageUrl = urlData.publicUrl;
  }

  // Simpan metadata ke database
  const { error: dbError } = await supabaseAdmin.from("frames").upsert({
    id,
    name,
    category,
    image_url: finalImageUrl,
    canvas_width: canvasWidth,
    canvas_height: canvasHeight,
    slots,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, imageUrl: finalImageUrl });
}
