import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: folderId } = await params;
    const supabase = getServiceSupabase();


    const { data: files } = await supabase.from("files").select("storage_path").eq("folder_id", folderId);
    
    if (files && files.length > 0) {
      const paths = files.map((f: any) => f.storage_path);
      const { error: storageError } = await supabase.storage.from("driveportal_files").remove(paths);
      if (storageError) {
        console.error("Storage delete error for folder contents:", storageError);
      }
    }


    // We will delete explicitly just in case CASCADE isn't set up
    if (files && files.length > 0) {
      await supabase.from("files").delete().eq("folder_id", folderId);
    }
    
    // Also delete permissions
    await supabase.from("permissions").delete().eq("target_id", folderId).eq("target_type", "FOLDER");

    const { error: folderError } = await supabase.from("folders").delete().eq("id", folderId);

    if (folderError) {
      console.error("DB Error deleting folder:", folderError);
      return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
    }

    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
