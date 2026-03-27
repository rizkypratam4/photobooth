import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  const { error: storageError } = await supabaseAdmin.storage
    .from("frames")
    .remove([`${id}.png`]);

  if (storageError) {
    console.error("Storage delete error:", storageError.message);
  }

  const { error: dbError } = await supabaseAdmin
    .from("frames")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
