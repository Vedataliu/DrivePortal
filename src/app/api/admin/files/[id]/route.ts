import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: fileId } = await params;
    const supabase = getServiceSupabase();


    const { data: file, error: fetchError } = await supabase.from("files").select("storage_path").eq("id", fileId).single();
    
    if (fetchError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }


    const { error: storageError } = await supabase.storage.from("driveportal_files").remove([file.storage_path]);
    
    if (storageError) {
      console.error("Storage delete error:", storageError);


    }


    await supabase.from("permissions").delete().eq("target_id", fileId).eq("target_type", "FILE");


    const { error: deleteError } = await supabase.from("files").delete().eq("id", fileId);

    if (deleteError) {
      console.error("DB Error deleting file:", deleteError);
      return NextResponse.json({ error: "Failed to delete file from DB" }, { status: 500 });
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
